import 'server-only';

// Thin wrapper over the Google Calendar v3 REST API (primary calendar).

const API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

export type GoogleEvent = {
  id: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  hangoutLink?: string;
  extendedProperties?: { private?: Record<string, string> };
};

export type EventInput = {
  summary: string;
  description: string;
  start: Date;
  end: Date;
  timeZone: string;
  attendeeEmail: string;
  lessonId: string;
  addMeet: boolean;
};

export class GoogleApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function call<T>(token: string, url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers },
    cache: 'no-store',
  });
  if (!res.ok) throw new GoogleApiError(res.status, `Google Calendar ${init.method ?? 'GET'} failed (${res.status})`);
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

function body(e: EventInput, withConference: boolean) {
  return {
    summary: e.summary,
    description: e.description,
    start: { dateTime: e.start.toISOString(), timeZone: e.timeZone },
    end: { dateTime: e.end.toISOString(), timeZone: e.timeZone },
    attendees: [{ email: e.attendeeEmail }],
    extendedProperties: { private: { efLessonId: e.lessonId } },
    ...(withConference && {
      conferenceData: { createRequest: { requestId: `ef-${e.lessonId}`, conferenceSolutionKey: { type: 'hangoutsMeet' } } },
    }),
  };
}

export function insertEvent(token: string, e: EventInput) {
  return call<GoogleEvent>(token, `${API}?conferenceDataVersion=1&sendUpdates=all`, {
    method: 'POST',
    body: JSON.stringify(body(e, e.addMeet)),
  });
}

/** Updates time, title and attendee; adds a Meet link only if asked and missing. */
export function patchEvent(token: string, eventId: string, e: EventInput) {
  return call<GoogleEvent>(token, `${API}/${encodeURIComponent(eventId)}?conferenceDataVersion=1&sendUpdates=all`, {
    method: 'PATCH',
    body: JSON.stringify(body(e, e.addMeet)),
  });
}

export async function deleteEvent(token: string, eventId: string) {
  try {
    await call(token, `${API}/${encodeURIComponent(eventId)}?sendUpdates=all`, { method: 'DELETE' });
  } catch (err) {
    // already gone in Google: nothing to do
    if (!(err instanceof GoogleApiError && (err.status === 404 || err.status === 410))) throw err;
  }
}

/**
 * Incremental sync. With a sync token, returns only what changed since then;
 * without one, lists everything and returns the first token.
 * Throws GoogleApiError(410) when the token expired: the caller starts over.
 */
export async function listChanges(token: string, syncToken: string | null) {
  const events: GoogleEvent[] = [];
  let pageToken: string | undefined;
  let nextSyncToken: string | undefined;
  do {
    const q = new URLSearchParams({ maxResults: '250', showDeleted: 'true', singleEvents: 'true' });
    if (syncToken) q.set('syncToken', syncToken);
    else q.set('timeMin', new Date(Date.now() - 30 * 86400000).toISOString());
    if (pageToken) q.set('pageToken', pageToken);
    const page = await call<{ items?: GoogleEvent[]; nextPageToken?: string; nextSyncToken?: string }>(token, `${API}?${q}`);
    events.push(...(page.items ?? []));
    pageToken = page.nextPageToken;
    nextSyncToken = page.nextSyncToken ?? nextSyncToken;
  } while (pageToken);
  return { events, nextSyncToken: nextSyncToken ?? null };
}
