'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { addMonths } from '@/lib/dates';
import { redirectWithToast } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { contractSchema, contractUpdateSchema, planSchema } from '@/lib/validation/contract';
import { formObject, invalid, type FormState } from '@/lib/validation/form';

const PATH = '/management/services';

export async function createContract(_: FormState, fd: FormData): Promise<FormState> {
  await requireRole('teacher', 'admin');
  const raw = formObject(fd);
  const parsed = contractSchema.safeParse(raw);
  if (!parsed.success) return invalid(parsed.error, raw);

  const supabase = await createClient();
  const { data: student } = await supabase.from('students').select('name').eq('id', parsed.data.student_id).single();
  if (!student) return { error: 'Student not found.', values: raw };

  const { error } = await supabase.from('contracts').insert(parsed.data);
  if (error) return { error: 'Could not create the contract. Please try again.', values: raw };
  revalidatePath(PATH);
  redirectWithToast(PATH, `Contract created for ${student.name}`);
}

export async function updateContract(_: FormState, fd: FormData): Promise<FormState> {
  await requireRole('teacher', 'admin');
  const raw = formObject(fd);
  const parsed = contractUpdateSchema.safeParse(raw);
  if (!parsed.success) return invalid(parsed.error, raw);
  const { id, ...values } = parsed.data;

  const supabase = await createClient();
  const { data: current } = await supabase.from('contracts').select('start_date').eq('id', id).single();
  if (!current) return { error: 'Contract not found.', values: raw };
  if (values.renewal_date <= current.start_date) {
    return { error: 'Please check the highlighted fields.', fieldErrors: { renewal_date: ['Must be after the start date'] }, values: raw };
  }
  const { error } = await supabase.from('contracts').update(values).eq('id', id);
  if (error) return { error: 'Could not save the contract.', values: raw };
  revalidatePath(PATH);
  redirectWithToast(PATH, 'Contract updated');
}

export async function setContractStatus(fd: FormData) {
  await requireRole('teacher', 'admin');
  const id = String(fd.get('id'));
  const status = fd.get('status') === 'paused' ? 'paused' : 'active';
  const back = String(fd.get('back') || PATH);
  const supabase = await createClient();
  const { error } = await supabase.from('contracts').update({ status }).eq('id', id);
  if (error) redirectWithToast(back, 'Could not update the contract', 'error');
  revalidatePath(PATH);
  redirectWithToast(back, status === 'paused' ? 'Contract paused' : 'Contract resumed');
}

/** Extends a contract by 12 months from its current renewal date. */
export async function renewContract(fd: FormData) {
  await requireRole('teacher', 'admin');
  const id = String(fd.get('id'));
  const back = String(fd.get('back') || PATH);
  const supabase = await createClient();
  const { data: c } = await supabase.from('contracts').select('renewal_date').eq('id', id).single();
  if (!c) redirectWithToast(back, 'Contract not found', 'error');
  const renewal_date = addMonths(c.renewal_date, 12);
  const { error } = await supabase.from('contracts').update({ renewal_date, status: 'active' }).eq('id', id);
  if (error) redirectWithToast(back, 'Could not renew the contract', 'error');
  revalidatePath(PATH);
  redirectWithToast(back, 'Contract renewed for 12 months');
}

export async function savePlan(_: FormState, fd: FormData): Promise<FormState> {
  await requireRole('admin');
  const raw = formObject(fd);
  const parsed = planSchema.safeParse(raw);
  if (!parsed.success) return invalid(parsed.error, raw);
  const supabase = await createClient();
  const { error } = raw.id
    ? await supabase.from('plans').update(parsed.data).eq('id', raw.id)
    : await supabase.from('plans').insert(parsed.data);
  if (error) return { error: 'Could not save the plan.', values: raw };
  revalidatePath(PATH);
  redirectWithToast(PATH, raw.id ? 'Plan updated' : 'Plan created');
}
