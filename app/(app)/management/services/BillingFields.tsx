'use client';

import { useState } from 'react';
import { Field } from '@/components/ui/Field';
import { fmtMoney } from '@/lib/format';

type Billing = 'monthly' | 'per_lesson';

type Props = {
  initial: { billing_type: Billing; lessons: string; price: string; lesson_price: string };
  /** the plan's list price per lesson, for the discount hint */
  listPerLessonCents?: number;
  errors: Record<string, string[] | undefined>;
};

const OPTIONS: [Billing, string, string][] = [
  ['per_lesson', 'Per lesson', 'Price per lesson × lessons'],
  ['monthly', 'Per month', 'Fixed monthly value'],
];

/** Lessons per month + how the contract is charged. Per lesson projects the monthly value. */
export function BillingFields({ initial, listPerLessonCents, errors }: Props) {
  const [billing, setBilling] = useState<Billing>(initial.billing_type);
  const [lessons, setLessons] = useState(initial.lessons);
  const [price, setPrice] = useState(initial.price);
  const [lessonPrice, setLessonPrice] = useState(initial.lesson_price);

  const n = Math.max(0, Math.floor(Number(lessons) || 0));
  const monthlyCents = billing === 'per_lesson' ? Math.round((Number(lessonPrice) || 0) * 100) * n : Math.round((Number(price) || 0) * 100);
  const perLessonCents = n ? Math.round(monthlyCents / n) : 0;
  // compare per lesson, so a contract with fewer lessons than the plan isn't shown as a discount
  const discount = listPerLessonCents && perLessonCents ? Math.round((1 - perLessonCents / listPerLessonCents) * 100) : 0;
  const vsList = !listPerLessonCents || !perLessonCents ? '' : discount > 0 ? `${discount}% below list price per lesson` : discount < 0 ? `${-discount}% above list price per lesson` : 'List price';

  return (
    <>
      <fieldset>
        <legend className="mb-1.5 text-[11px] font-semibold tracking-[0.02em] text-ink-2">Charge</legend>
        <input type="hidden" name="billing_type" value={billing} />
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Charge">
          {OPTIONS.map(([value, label, hint]) => {
            const on = billing === value;
            return (
              <button key={value} type="button" role="radio" aria-checked={on} onClick={() => setBilling(value)}
                className={`rounded-[9px] border px-3 py-2.5 text-left ${on ? 'border-brand bg-brand/10' : 'border-line bg-input hover:bg-hover'}`}>
                <span className="block text-[12.5px] font-semibold text-ink-hi">{label}</span>
                <span className="block text-[10.5px] text-ink-3">{hint}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field label="Lessons per month" error={errors.lessons_per_month}>
          {(p) => <input className="input mono" type="number" min={1} name="lessons_per_month" value={lessons} onChange={(e) => setLessons(e.target.value)} {...p} />}
        </Field>
        {billing === 'per_lesson' ? (
          <Field label="Price per lesson (R$)" error={errors.lesson_price}>
            {(p) => <input className="input mono" type="number" min={0} step="0.01" name="lesson_price" value={lessonPrice} onChange={(e) => setLessonPrice(e.target.value)} {...p} />}
          </Field>
        ) : (
          <Field label="Agreed value / month (R$)" error={errors.price} hint={n && monthlyCents ? `≈ ${fmtMoney(perLessonCents)} per lesson` : undefined}>
            {(p) => <input className="input mono" type="number" min={0} step="0.01" name="price" value={price} onChange={(e) => setPrice(e.target.value)} {...p} />}
          </Field>
        )}
      </div>
      <div className="flex items-center justify-between rounded-[9px] border border-line bg-input px-3 py-2.5" aria-live="polite">
        <span className="text-[11.5px] text-ink-2">{billing === 'per_lesson' ? `Projected monthly value (${n} × lesson)` : 'Monthly value'}</span>
        <span className="text-right">
          <span className="mono block text-sm font-bold text-ink-hi">{fmtMoney(monthlyCents)}</span>
          {vsList && <span className={`block text-[10.5px] ${discount > 0 ? 'text-warning' : 'text-ink-3'}`}>{vsList}</span>}
        </span>
      </div>
    </>
  );
}
