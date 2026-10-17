'use client';

import Link from 'next/link';
import { useActionDone } from '@/components/ui/ActionForm';
import { useActionState } from 'react';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { fmtDate, fmtMoney } from '@/lib/format';
import type { Contract, Plan } from '@/types/database';
import { updateContract } from './actions';
import { BillingFields } from './BillingFields';

export function EditContractForm({ contract: c, plan, studentName, closeHref }: { contract: Contract; plan: Plan; studentName: string; closeHref: string }) {
  const [state, action] = useActionState(updateContract, {});
  useActionDone(state);
  const v = state.values;
  const e = state.fieldErrors ?? {};
  const formId = 'edit-contract-form';
  return (
    <Modal title={`${plan.name} · ${studentName}`} sub={`Started ${fmtDate(c.start_date)} · list price ${fmtMoney(plan.list_price_cents)}`} closeHref={closeHref}
      footer={<>
        <Link href={closeHref} scroll={false} className="btn-ghost">Cancel</Link>
        <SubmitButton form={formId}><Icon name="check" size={15} />Save contract</SubmitButton>
      </>}>
      <form id={formId} action={action} noValidate className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <input type="hidden" name="id" value={c.id} />
        <div className="col-span-full flex flex-col gap-3.5">
          <BillingFields errors={e} listPerLessonCents={Math.round(plan.list_price_cents / plan.lessons_per_month)} initial={{
            billing_type: (v?.billing_type ?? c.billing_type) === 'per_lesson' ? 'per_lesson' : 'monthly',
            lessons: v?.lessons_per_month ?? String(c.lessons_per_month),
            price: v?.price ?? String(c.price_cents / 100),
            lesson_price: v?.lesson_price ?? (c.lesson_price_cents != null ? String(c.lesson_price_cents / 100) : ''),
          }} />
        </div>
        <Field label="Renewal date" error={e.renewal_date}>
          {(p) => <input className="input" type="date" name="renewal_date" defaultValue={v?.renewal_date ?? c.renewal_date} {...p} />}
        </Field>
        <Field label="Status" error={e.status} hint="Renewal due keeps lessons running">
          {(p) => (
            <select className="input" name="status" defaultValue={v?.status ?? c.status} {...p}>
              <option value="active">Active</option>
              <option value="ending">Renewal due</option>
              <option value="paused">Paused</option>
            </select>
          )}
        </Field>
        {state.error && <p role="alert" className="col-span-full text-[12.5px] text-risk">{state.error}</p>}
      </form>
    </Modal>
  );
}
