'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { ActionForm, useActionDone } from '@/components/ui/ActionForm';
import { ConfirmButton } from '@/components/ui/ConfirmButton';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { SubmitButton } from '@/components/ui/SubmitButton';
import type { Plan } from '@/types/database';
import { deletePlan, savePlan } from './actions';
import { BillingFields } from './BillingFields';

export function PlanForm({ plan, inUse = 0, closeHref }: { plan?: Plan; inUse?: number; closeHref: string }) {
  const [state, action, isPending] = useActionState(savePlan, {});
  useActionDone(state);
  const v = state.values;
  const e = state.fieldErrors ?? {};
  const formId = 'plan-form';
  return (
    <Modal title={plan ? `Edit ${plan.name}` : 'New plan'} sub="Catalog price and monthly lessons. Existing contracts keep their agreed values." closeHref={closeHref}
      footer={<>
        {plan && (
          <ActionForm action={deletePlan} className="mr-auto">
            <input type="hidden" name="id" value={plan.id} />
            <ConfirmButton className="btn-danger" pendingLabel="Deleting…" disabled={inUse > 0}
              title={inUse ? `Used by ${inUse} contract${inUse === 1 ? '' : 's'}` : undefined}
              confirm={`Delete the plan "${plan.name}"? This cannot be undone.`}>
              <Icon name="x" size={14} />Delete
            </ConfirmButton>
          </ActionForm>
        )}
        <Link href={closeHref} scroll={false} className="btn-ghost">Cancel</Link>
        <SubmitButton form={formId} pending={isPending}><Icon name="check" size={15} />Save plan</SubmitButton>
      </>}>
      <form id={formId} action={action} noValidate className="flex flex-col gap-3.5">
        {plan && <input type="hidden" name="id" value={plan.id} />}
        <Field label="Name" error={e.name}>
          {(p) => <input className="input" name="name" defaultValue={v?.name ?? plan?.name} {...p} />}
        </Field>
        <BillingFields errors={e} monthlyLabel="List price / month (R$)" initial={{
          billing_type: (v?.billing_type ?? plan?.billing_type) === 'per_lesson' ? 'per_lesson' : 'monthly',
          lessons: v?.lessons_per_month ?? String(plan?.lessons_per_month ?? 4),
          price: v?.price ?? (plan ? String(plan.list_price_cents / 100) : ''),
          lesson_price: v?.lesson_price ?? (plan?.lesson_price_cents != null ? String(plan.lesson_price_cents / 100) : ''),
        }} />
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-[120px_1fr]">
          <Field label="Color" error={e.color}>
            {(p) => <input className="input h-[38px] p-1" type="color" name="color" defaultValue={v?.color ?? plan?.color ?? '#3b82f6'} {...p} />}
          </Field>
          <Field label="Description" error={e.description}>
            {(p) => <input className="input" name="description" defaultValue={v?.description ?? plan?.description ?? ''} {...p} />}
          </Field>
        </div>
        {plan && inUse > 0 && <p className="text-[11px] text-ink-3">Used by {inUse} contract{inUse === 1 ? '' : 's'}, so it can’t be deleted.</p>}
        {state.error && <p role="alert" className="text-[12.5px] text-risk">{state.error}</p>}
      </form>
    </Modal>
  );
}
