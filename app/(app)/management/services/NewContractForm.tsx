'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useActionDone } from '@/components/ui/ActionForm';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { addMonths } from '@/lib/dates';
import { fmtDate, fmtMoney } from '@/lib/format';
import { TERMS } from '@/lib/validation/contract';
import type { Plan } from '@/types/database';
import { createContract } from './actions';
import { BillingFields } from './BillingFields';

type Props = {
  students: { id: string; name: string; company: string | null }[];
  plans: Plan[];
  studentId?: string;
  today: string;
  closeHref: string;
  /** admins can create the first plan from here */
  newPlanHref?: string;
};

export function NewContractForm({ students, plans, studentId, today, closeHref, newPlanHref }: Props) {
  const [state, action, isPending] = useActionState(createContract, {});
  useActionDone(state);
  const v = state.values;
  const e = state.fieldErrors ?? {};
  const [planId, setPlanId] = useState(v?.plan_id ?? plans[0]?.id ?? '');
  const plan = plans.find((p) => p.id === planId);
  const [start, setStart] = useState(v?.start_date ?? today);
  const [term, setTerm] = useState(v?.term_months ?? '12');
  const renewal = /^\d{4}-\d{2}-\d{2}$/.test(start) ? addMonths(start, Number(term)) : null;
  const formId = 'contract-form';

  // after a failed submit keep what was typed; after picking a plan start from its defaults
  const typed = v && v.plan_id === planId;
  const lessonsDefault = String(plan?.lessons_per_month ?? 4);
  const billingInitial = {
    billing_type: (typed ? v.billing_type : plan?.billing_type) === 'per_lesson' ? ('per_lesson' as const) : ('monthly' as const),
    lessons: typed ? v.lessons_per_month ?? '' : lessonsDefault,
    price: typed ? v.price ?? '' : String((plan?.list_price_cents ?? 0) / 100),
    lesson_price: typed ? v.lesson_price ?? '' : plan ? String((plan.lesson_price_cents ?? Math.round(plan.list_price_cents / plan.lessons_per_month)) / 100) : '',
  };

  return (
    <Modal title="New contract" sub="Link a service to a student" closeHref={closeHref}
      footer={<>
        <Link href={closeHref} scroll={false} className="btn-ghost">Cancel</Link>
        <SubmitButton form={formId} pending={isPending} disabled={!plans.length || !students.length}><Icon name="check" size={15} />Create contract</SubmitButton>
      </>}>
      <form id={formId} action={action} noValidate className="flex flex-col gap-3.5">
        <Field label="Student" error={e.student_id}>
          {(p) => (
            <select className="input" name="student_id" defaultValue={v?.student_id ?? studentId} {...p}>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}{s.company ? ` · ${s.company}` : ''}</option>)}
            </select>
          )}
        </Field>
        <fieldset>
          <legend className="mb-1.5 text-[11px] font-semibold tracking-[0.02em] text-ink-2">Service</legend>
          <input type="hidden" name="plan_id" value={planId} />
          {plans.length ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Service">
              {plans.map((p) => {
                const on = p.id === planId;
                return (
                  <button key={p.id} type="button" role="radio" aria-checked={on} onClick={() => setPlanId(p.id)}
                    className="flex items-center gap-2.5 rounded-[9px] border px-3 py-2.5 text-left"
                    style={{ background: on ? p.color + '1a' : '#0b1120', borderColor: on ? p.color : 'rgba(255,255,255,0.07)' }}>
                    <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: p.color }} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-semibold text-ink-hi">{p.name}</span>
                      <span className="mono text-[10.5px] text-ink-3">{p.lessons_per_month}/mo · {p.billing_type === 'per_lesson' && p.lesson_price_cents != null ? `${fmtMoney(p.lesson_price_cents)}/lesson` : fmtMoney(p.list_price_cents)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="rounded-[9px] border border-warning/30 bg-warning/[0.07] px-3 py-2.5 text-xs text-warning">
              The plan catalog is empty. {newPlanHref
                ? <Link href={newPlanHref} scroll={false} className="font-semibold underline">Create the first plan</Link>
                : 'Ask an admin to create the plans first.'}
            </p>
          )}
          {e.plan_id && <p className="mt-1.5 text-[11px] text-risk">{e.plan_id[0]}</p>}
        </fieldset>
        <BillingFields key={planId} initial={billingInitial} listPerLessonCents={plan ? Math.round(plan.list_price_cents / plan.lessons_per_month) : undefined} errors={e} />
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Start date" error={e.start_date}>
            {(p) => <input className="input" type="date" name="start_date" value={start} onChange={(ev) => setStart(ev.target.value)} {...p} />}
          </Field>
          <Field label="Term" error={e.term_months} hint={renewal ? `Renews ${fmtDate(renewal)}` : undefined}>
            {(p) => (
              <select className="input" name="term_months" value={term} onChange={(ev) => setTerm(ev.target.value)} {...p}>
                {TERMS.map((n) => <option key={n} value={n}>{n} months</option>)}
              </select>
            )}
          </Field>
        </div>
        {state.error && <p role="alert" className="text-[12.5px] text-risk">{state.error}</p>}
      </form>
    </Modal>
  );
}
