import { z } from 'zod';
import { id, optionalText } from './form';

const score = z.coerce.number({ error: 'Enter a score' }).int({ error: 'Whole numbers only' }).min(0, { error: '0–100' }).max(100, { error: '0–100' });

export const SKILLS = ['grammar', 'vocabulary', 'pronunciation', 'fluency', 'listening', 'confidence'] as const;
export type Skill = (typeof SKILLS)[number];

export const assessmentSchema = z.object({
  student_id: id,
  lesson_id: z.guid().optional(),
  grammar: score,
  vocabulary: score,
  pronunciation: score,
  fluency: score,
  listening: score,
  confidence: score,
  notes: optionalText(2000),
});

export type AssessmentInput = z.infer<typeof assessmentSchema>;
