'use client';

import Link from 'next/link';
import { useActionDone } from '@/components/ui/ActionForm';
import { useActionState } from 'react';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { SubmitButton } from '@/components/ui/SubmitButton';
import type { Plan } from '@/types/database';
import { savePlan } from './actions';

export function PlanForm({ plan, closeHref }: { plan?: Plan; closeHref: string }) {
  const [state, action] = useActionState(savePlan, {});
  useActionDone(state);
  const v = state.values;
  const e = state.fieldErrors ?? {};
  const formId = 'plan-form';
  return (
    <Modal title={plan ? `Edit ${plan.name}` : 'New plan'} sub="Catalog price and monthly lessons. Existing contracts keep their agreed values." closeHref={closeHref}
      footer={<>
        <Link href={closeHref} scroll={false} className="btn-ghost">Cancel</Link>
        <SubmitButton form={formId}><Icon name="check" size={15} />Save plan</SubmitButton>
      </>}>
      <form id={formId} action={action} noValidate className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {plan && <input type="hidden" name="id" value={plan.id} />}
        <Field label="Name" error={e.name} span>
          {(p) => <input className="input" name="name" defaultValue={v?.name ?? plan?.name} {...p} />}
        </Field>
        <Field label="Lessons per month" error={e.lessons_per_month}>
          {(p) => <input className="input mono" type="number" min={1} name="lessons_per_month" defaultValue={v?.lessons_per_month ?? plan?.lessons_per_month ?? 8} {...p} />}
        </Field>
        <Field label="List price / month (R$)" error={e.list_price}>
          {(p) => <input className="input mono" type="number" min={0} step="0.01" name="list_price" defaultValue={v?.list_price ?? (plan ? plan.list_price_cents / 100 : '')} {...p} />}
        </Field>
        <Field label="Color" error={e.color}>
          {(p) => <input className="input h-[38px] p-1" type="color" name="color" defaultValue={v?.color ?? plan?.color ?? '#3b82f6'} {...p} />}
        </Field>
        <Field label="Description" error={e.description}>
          {(p) => <input className="input" name="description" defaultValue={v?.description ?? plan?.description ?? ''} {...p} />}
        </Field>
        {state.error && <p role="alert" className="col-span-full text-[12.5px] text-risk">{state.error}</p>}
      </form>
    </Modal>
  );
}
