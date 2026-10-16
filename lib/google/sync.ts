import 'server-only';
import { decrypt } from '@/lib/crypto';
import { APP_TZ } from '@/lib/dates';
import { createAdminClient } from '@/lib/supabase/admin';
import { deleteEvent, GoogleApiError, insertEvent, listChanges, patchEvent, type GoogleEvent } from './calendar';
import { accessToken, googleConfigured } from './oauth';

// Two-way sync between lessons and the teacher's Google Calendar.
// Runs with the service role: callers must check permissions first.

type Admin = ReturnType<typeof createAdminClient>;

async function connection(admin: Admin, teacherId: string) {
  if (!googleConfigured()) return null;
  const { data } = await admin.from('google_accounts').select('*').eq('teacher_id', teacherId).maybeSingle();
  if (!data) return null;
  return { account: data, token: await accessToken(decrypt(data.refresh_token)) };
}

export type PushResult = 'synced' | 'skipped' | 'failed';

/** App → Google: creates, updates or deletes the event for one lesson. */
export async function pushLesson(lessonId: string): Promise<PushResult> {
  const admin = createAdminClient();
  const { data: lesson } = await admin.from('lessons').select('*').eq('id', lessonId).single();
  if (!lesson) return 'skipped';
  try {
    const conn = await connection(admin, lesson.teacher_id);
    if (!conn) return 'skipped';

    if (lesson.status === 'cancelled') {
      if (lesson.google_event_id) {
        await deleteEvent(conn.token, lesson.google_event_id);
        await admin.from('lessons').update({ google_event_id: null, meet_url: null }).eq('id', lesson.id);
      }
      return 'synced';
    }

    const [{ data: student }, { data: contract }] = await Promise.all([
      admin.from('students').select('name, email').eq('id', lesson.student_id).single(),
      admin.from('contracts').select('plans(name)').eq('id', lesson.contract_id).single(),
    ]);
    const start = new Date(lesson.starts_at);
    const input = {
      summary: `English lesson · ${student?.name ?? 'Student'}`,
      description: `${contract?.plans?.name ?? 'Lesson'}\nScheduled in English Forms.`,
      start,
      end: new Date(start.getTime() + lesson.duration_min * 60000),
      timeZone: APP_TZ,
      attendeeEmail: student?.email ?? '',
      lessonId: lesson.id,
      addMeet: conn.account.add_meet && !lesson.meet_url,
    };
    const event = lesson.google_event_id
      ? await patchEvent(conn.token, lesson.google_event_id, input)
      : await insertEvent(conn.token, input);
    await admin.from('lessons').update({ google_event_id: event.id, meet_url: event.hangoutLink ?? lesson.meet_url }).eq('id', lesson.id);
    return 'synced';
  } catch (err) {
    console.error('Google push failed', lessonId, err);
    return 'failed';
  }
}

const KEEP_UNLINKED_DAYS = 60;

/** Google → App for one teacher. Returns how many events changed. */
export async function syncTeacher(teacherId: string): Promise<number> {
  const admin = createAdminClient();
  const conn = await connection(admin, teacherId);
  if (!conn) return 0;

  let changes;
  try {
    changes = await listChanges(conn.token, conn.account.sync_token);
  } catch (err) {
    if (!(err instanceof GoogleApiError && err.status === 410)) throw err;
    // the sync token expired: start a full sync again
    changes = await listChanges(conn.token, null);
  }

  for (const event of changes.events) await applyEvent(admin, teacherId, event);

  await admin.from('google_accounts')
    .update({ sync_token: changes.nextSyncToken, last_synced_at: new Date().toISOString() })
    .eq('teacher_id', teacherId);
  return changes.events.length;
}

async function applyEvent(admin: Admin, teacherId: string, event: GoogleEvent) {
  const lessonId = event.extendedProperties?.private?.efLessonId;
  const { data: lesson } = await admin.from('lessons').select('id, status, starts_at, duration_min, google_event_id')
    .or(`google_event_id.eq.${event.id}${lessonId && /^[0-9a-f-]{36}$/i.test(lessonId) ? `,id.eq.${lessonId}` : ''}`)
    .eq('teacher_id', teacherId)
    .maybeSingle();

  if (event.status === 'cancelled') {
    await admin.from('google_unlinked_events').delete().eq('google_event_id', event.id);
    if (lesson?.status === 'scheduled') {
      await admin.from('lessons').update({ status: 'cancelled', google_event_id: null, meet_url: null }).eq('id', lesson.id);
    }
    return;
  }

  const start = event.start?.dateTime;
  const end = event.end?.dateTime;
  if (!start || !end) return; // all-day events are not lessons

  if (lesson) {
    // moved in Google → move the lesson (only while it is still scheduled)
    const duration = Math.round((Date.parse(end) - Date.parse(start)) / 60000);
    const moved = Date.parse(lesson.starts_at) !== Date.parse(start) || lesson.duration_min !== duration;
    if (lesson.status === 'scheduled' && (moved || lesson.google_event_id !== event.id) && duration >= 15 && duration <= 240) {
      await admin.from('lessons').update({ starts_at: new Date(start).toISOString(), duration_min: duration, google_event_id: event.id }).eq('id', lesson.id);
    }
    return;
  }

  const horizon = Date.now() + KEEP_UNLINKED_DAYS * 86400000;
  if (Date.parse(start) > horizon || Date.parse(end) < Date.now() - 30 * 86400000) {
    await admin.from('google_unlinked_events').delete().eq('google_event_id', event.id);
    return;
  }
  await admin.from('google_unlinked_events').upsert({
    google_event_id: event.id,
    teacher_id: teacherId,
    summary: event.summary ?? '(no title)',
    starts_at: new Date(start).toISOString(),
    ends_at: new Date(end).toISOString(),
    updated_at: new Date().toISOString(),
  });
}

/** Cron entry point: every connected teacher, one at a time. */
export async function syncAll() {
  const admin = createAdminClient();
  const { data } = await admin.from('google_accounts').select('teacher_id');
  const results: { teacherId: string; changed?: number; error?: string }[] = [];
  for (const { teacher_id } of data ?? []) {
    try {
      results.push({ teacherId: teacher_id, changed: await syncTeacher(teacher_id) });
    } catch (err) {
      results.push({ teacherId: teacher_id, error: err instanceof Error ? err.message : 'failed' });
    }
  }
  return results;
}
