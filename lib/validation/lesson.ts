import { z } from 'zod';
import { day, id } from './form';

export const DURATIONS = [30, 45, 60, 90] as const;
export const DAY_START_MIN = 7 * 60;
export const DAY_END_MIN = 21 * 60;

export const lessonSchema = z.object({
  student_id: id,
  contract_id: z.guid({ error: 'Pick an active service' }),
  day,
  start_min: z.coerce.number().int().min(DAY_START_MIN, { error: 'Pick a start time' }).max(DAY_END_MIN - 30).multipleOf(15),
  duration_min: z.coerce.number().refine((n) => (DURATIONS as readonly number[]).includes(n), { error: 'Pick a duration' }),
  /** set when turning an unlinked Google event into a lesson */
  google_event_id: z.string().max(1024).optional(),
});

export type LessonInput = z.infer<typeof lessonSchema>;
