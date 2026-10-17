-- Contracts can be charged per month (fixed value) or per lesson.
-- price_cents stays the monthly value: for per-lesson contracts it is the
-- projection lesson_price_cents × lessons_per_month, kept in sync by the app.

create type public.billing_type as enum ('monthly', 'per_lesson');

alter table public.contracts
  add column billing_type public.billing_type not null default 'monthly',
  add column lesson_price_cents int check (lesson_price_cents >= 0),
  add constraint contracts_lesson_price_required
    check (billing_type = 'monthly' or lesson_price_cents is not null);
