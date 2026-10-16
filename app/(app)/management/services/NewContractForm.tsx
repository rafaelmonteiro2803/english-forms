'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { addMonths } from '@/lib/dates';
import { fmtDate, fmtMoney } from '@/lib/format';
import { TERMS } from '@/lib/validation/contract';
import type { Plan } from '@/types/database';
import { createContract } from './actions';

type Props = {
  students: { id: string; name: string; company: string | null }[];
  plans: Plan[];
  studentId?: string;
  today: string;
  closeHref: string;
};

export function NewContractForm({ students, plans, studentId, today, closeHref }: Props) {
  const [state, action] = useActionState(createContract, {});
  const v = state.values;
  const e = state.fieldErrors ?? {};
  const [planId, setPlanId] = useState(v?.plan_id ?? plans[0]?.id ?? '');
  const plan = plans.find((p) => p.id === planId);
  const [lessons, setLessons] = useState(v?.lessons_per_month ?? String(plan?.lessons_per_month ?? 8));
  const [price, setPrice] = useState(v?.price ?? String((plan?.list_price_cents ?? 0) / 100));
  const [start, setStart] = useState(v?.start_date ?? today);
  const [term, setTerm] = useState(v?.term_months ?? '12');

  const pick = (p: Plan) => { setPlanId(p.id); setLessons(String(p.lessons_per_month)); setPrice(String(p.list_price_cents / 100)); };
  const discount = plan && plan.list_price_cents > 0 ? Math.round((1 - (Number(price) * 100) / plan.list_price_cents) * 100) : 0;
  const renewal = /^\d{4}-\d{2}-\d{2}$/.test(start) ? addMonths(start, Number(term)) : null;
  const formId = 'contract-form';

  return (
    <Modal title="New contract" sub="Link a service to a student" closeHref={closeHref}
      footer={<>
        <Link href={closeHref} scroll={false} className="btn-ghost">Cancel</Link>
        <SubmitButton form={formId}><Icon name="check" size={15} />Create contract</SubmitButton>
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Service">
            {plans.map((p) => {
              const on = p.id === planId;
              return (
                <button key={p.id} type="button" role="radio" aria-checked={on} onClick={() => pick(p)}
                  className="flex items-center gap-2.5 rounded-[9px] border px-3 py-2.5 text-left"
                  style={{ background: on ? p.color + '1a' : '#0b1120', borderColor: on ? p.color : 'rgba(255,255,255,0.07)' }}>
                  <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: p.color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-semibold text-ink-hi">{p.name}</span>
                    <span className="mono text-[10.5px] text-ink-3">{p.lessons_per_month}/mo · {fmtMoney(p.list_price_cents)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Lessons per month" error={e.lessons_per_month}>
            {(p) => <input className="input mono" type="number" min={1} name="lessons_per_month" value={lessons} onChange={(ev) => setLessons(ev.target.value)} {...p} />}
          </Field>
          <Field label="Agreed value / month (R$)" error={e.price} hint={discount > 0 ? `${discount}% below list price` : discount < 0 ? `${-discount}% above list price` : 'List price'}>
            {(p) => <input className="input mono" type="number" min={0} step="0.01" name="price" value={price} onChange={(ev) => setPrice(ev.target.value)} {...p} />}
          </Field>
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
