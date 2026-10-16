'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { fmtDate, fmtMoney } from '@/lib/format';
import type { Contract, Plan } from '@/types/database';
import { updateContract } from './actions';

export function EditContractForm({ contract: c, plan, studentName, closeHref }: { contract: Contract; plan: Plan; studentName: string; closeHref: string }) {
  const [state, action] = useActionState(updateContract, {});
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
        <Field label="Lessons per month" error={e.lessons_per_month}>
          {(p) => <input className="input mono" type="number" min={1} name="lessons_per_month" defaultValue={v?.lessons_per_month ?? c.lessons_per_month} {...p} />}
        </Field>
        <Field label="Agreed value / month (R$)" error={e.price}>
          {(p) => <input className="input mono" type="number" min={0} step="0.01" name="price" defaultValue={v?.price ?? c.price_cents / 100} {...p} />}
        </Field>
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
