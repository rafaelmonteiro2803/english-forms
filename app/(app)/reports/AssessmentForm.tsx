'use client';

import { useActionDone } from '@/components/ui/ActionForm';
import { useActionState } from 'react';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { SKILLS } from '@/lib/scores';
import type { Assessment } from '@/types/database';
import { saveAssessment } from './actions';

export function AssessmentForm({ lessonId, studentId, current }: { lessonId: string; studentId: string; current?: Assessment | null }) {
  const [state, action] = useActionState(saveAssessment, {});
  useActionDone(state);
  const v = state.values;
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} noValidate className="card p-5">
      <input type="hidden" name="lesson_id" value={lessonId} />
      <input type="hidden" name="student_id" value={studentId} />
      <h2 className="card-title mb-1"><Icon name="edit" size={14} className="text-brand-bright" />{current ? 'Edit assessment' : 'Score this lesson'}</h2>
      <p className="mb-4 text-xs text-ink-3">Six skills from 0 to 100. The overall score is their average.</p>
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3">
        {SKILLS.map((s) => (
          <Field key={s.key} label={s.label} error={e[s.key]}>
            {(p) => <input className="input mono" type="number" inputMode="numeric" min={0} max={100} name={s.key} defaultValue={v?.[s.key] ?? current?.[s.key] ?? ''} required {...p} />}
          </Field>
        ))}
        <Field label="Notes for the student" error={e.notes} span>
          {(p) => <textarea className="input h-20 py-2" name="notes" defaultValue={v?.notes ?? current?.notes ?? ''} {...p} />}
        </Field>
      </div>
      {state.error && <p role="alert" className="mt-3 text-[12.5px] text-risk">{state.error}</p>}
      <div className="mt-4 flex justify-end"><SubmitButton><Icon name="check" size={15} />Save assessment</SubmitButton></div>
    </form>
  );
}
