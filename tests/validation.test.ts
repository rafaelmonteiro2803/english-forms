import { describe, expect, it } from 'vitest';
import { assessmentSchema } from '@/lib/validation/assessment';
import { signInSchema, newPasswordSchema } from '@/lib/validation/auth';
import { contractSchema } from '@/lib/validation/contract';
import { formObject } from '@/lib/validation/form';
import { lessonSchema } from '@/lib/validation/lesson';
import { studentSchema } from '@/lib/validation/student';

const ID = '20000000-0000-0000-0000-000000000001';
const ID2 = '30000000-0000-0000-0000-000000000001';

describe('formObject', () => {
  it('trims values and turns blanks into undefined', () => {
    const fd = new FormData();
    fd.set('name', '  Marina ');
    fd.set('company', '   ');
    expect(formObject(fd)).toEqual({ name: 'Marina', company: undefined });
  });
});

describe('signInSchema', () => {
  it('requires a valid email and a password', () => {
    expect(signInSchema.safeParse({ email: 'marina@bancoatlas.com', password: 'x' }).success).toBe(true);
    expect(signInSchema.safeParse({ email: 'marina', password: 'x' }).success).toBe(false);
    expect(signInSchema.safeParse({ email: 'marina@bancoatlas.com' }).success).toBe(false);
  });

  it('checks that the new passwords match', () => {
    const r = newPasswordSchema.safeParse({ password: 'longenough', confirm: 'different1' });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(['confirm']);
  });
});

describe('studentSchema', () => {
  const base = { name: 'Juliana Martins', email: 'Juliana@Company.com', whatsapp: '+55 11 98412-3307', cefr_level: 'B1', start_date: '2026-10-16' };

  it('accepts a minimal student and normalizes the email', () => {
    const r = studentSchema.parse(base);
    expect(r.email).toBe('juliana@company.com');
    expect(r.status).toBe('active');
  });

  it('requires a WhatsApp number with country and area code', () => {
    expect(studentSchema.safeParse({ ...base, whatsapp: '98412-3307' }).success).toBe(false);
    expect(studentSchema.safeParse({ ...base, whatsapp: 'call me' }).success).toBe(false);
  });

  it('only accepts LinkedIn profile links and adds https', () => {
    expect(studentSchema.parse({ ...base, linkedin_url: 'linkedin.com/in/juliana' }).linkedin_url).toBe('https://linkedin.com/in/juliana');
    expect(studentSchema.parse({ ...base, linkedin_url: 'https://www.linkedin.com/in/juliana' }).linkedin_url).toBe('https://www.linkedin.com/in/juliana');
    expect(studentSchema.safeParse({ ...base, linkedin_url: 'https://evil.com/linkedin.com' }).success).toBe(false);
  });

  it('rejects unknown CEFR levels', () => {
    expect(studentSchema.safeParse({ ...base, cefr_level: 'D1' }).success).toBe(false);
  });
});

describe('contractSchema', () => {
  const base = { student_id: ID, plan_id: ID2, lessons_per_month: '8', price: '2280', start_date: '2026-10-19', term_months: '12' };

  it('converts the price to cents and computes the renewal date', () => {
    expect(contractSchema.parse(base)).toMatchObject({ lessons_per_month: 8, price_cents: 228000, renewal_date: '2027-10-19' });
  });

  it('rejects zero lessons, negative prices and unknown terms', () => {
    expect(contractSchema.safeParse({ ...base, lessons_per_month: '0' }).success).toBe(false);
    expect(contractSchema.safeParse({ ...base, price: '-1' }).success).toBe(false);
    expect(contractSchema.safeParse({ ...base, term_months: '5' }).success).toBe(false);
  });
});

describe('lessonSchema', () => {
  const base = { student_id: ID, contract_id: ID2, day: '2026-10-16', start_min: '900', duration_min: '60' };

  it('accepts a lesson inside the working day', () => {
    expect(lessonSchema.parse(base)).toMatchObject({ start_min: 900, duration_min: 60 });
  });

  it('requires a contract', () => {
    const r = lessonSchema.safeParse({ ...base, contract_id: undefined });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe('Pick an active service');
  });

  it('rejects odd durations and times outside 07:00–21:00', () => {
    expect(lessonSchema.safeParse({ ...base, duration_min: '50' }).success).toBe(false);
    expect(lessonSchema.safeParse({ ...base, start_min: '300' }).success).toBe(false);
    expect(lessonSchema.safeParse({ ...base, start_min: '907' }).success).toBe(false);
  });
});

describe('assessmentSchema', () => {
  const scores = { grammar: '79', vocabulary: '92', pronunciation: '78', fluency: '84', listening: '88', confidence: '81' };

  it('accepts six scores between 0 and 100', () => {
    expect(assessmentSchema.parse({ student_id: ID, ...scores }).vocabulary).toBe(92);
  });

  it('rejects out-of-range or missing scores', () => {
    expect(assessmentSchema.safeParse({ student_id: ID, ...scores, grammar: '101' }).success).toBe(false);
    expect(assessmentSchema.safeParse({ student_id: ID, ...scores, fluency: undefined }).success).toBe(false);
  });
});

describe('contractUpdateSchema and planSchema', () => {
  it('updates a contract and converts the price', async () => {
    const { contractUpdateSchema } = await import('@/lib/validation/contract');
    expect(contractUpdateSchema.parse({ id: ID2, lessons_per_month: '12', price: '3150.5', renewal_date: '2027-11-11', status: 'ending' }))
      .toMatchObject({ price_cents: 315050, status: 'ending' });
    expect(contractUpdateSchema.safeParse({ id: ID2, lessons_per_month: '12', price: '10', renewal_date: '2027-11-11', status: 'done' }).success).toBe(false);
  });

  it('validates plan colors and prices', async () => {
    const { planSchema } = await import('@/lib/validation/contract');
    expect(planSchema.parse({ name: 'Executive 1:1', lessons_per_month: '8', list_price: '2400', color: '#3b82f6' }))
      .toMatchObject({ list_price_cents: 240000, description: null });
    expect(planSchema.safeParse({ name: 'X1', lessons_per_month: '8', list_price: '2400', color: 'blue' }).success).toBe(false);
  });
});
