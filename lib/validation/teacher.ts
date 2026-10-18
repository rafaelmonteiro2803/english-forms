import { z } from 'zod';

const password = z.string().min(8, { error: 'Use at least 8 characters' }).max(72);

export const teacherSchema = z.object({
  name: z.string({ error: 'Name is required' }).min(2, { error: 'Name is required' }).max(120),
  email: z.email({ error: 'Enter a valid email' }).transform((v) => v.toLowerCase()),
  /** required for a new login; on edit, only set when changing it */
  password: password.optional(),
});

export type TeacherInput = z.infer<typeof teacherSchema>;
