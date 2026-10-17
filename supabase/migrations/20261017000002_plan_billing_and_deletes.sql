-- Plans can be priced per lesson or per month, like contracts.
-- list_price_cents stays the monthly list price (projected for per-lesson plans).
alter table public.plans
  add column billing_type public.billing_type not null default 'monthly',
  add column lesson_price_cents int check (lesson_price_cents >= 0),
  add constraint plans_lesson_price_required
    check (billing_type = 'monthly' or lesson_price_cents is not null);

-- Deleting a student removes their contracts and lessons in one statement.
-- RESTRICT is checked row by row and would block that; NO ACTION is checked
-- at the end of the statement, so it still stops deleting a contract that
-- has lessons, but lets the student cascade.
alter table public.lessons drop constraint lessons_contract_id_student_id_fkey;
alter table public.lessons
  add constraint lessons_contract_id_student_id_fkey
  foreign key (contract_id, student_id) references public.contracts (id, student_id) on delete no action;
