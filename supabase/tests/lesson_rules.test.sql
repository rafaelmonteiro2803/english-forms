-- Business rules and RLS checks. Each block raises if an expectation fails.
-- Failures use SQLSTATE EF001 so they are never mistaken for the rule errors (P0001).
-- Runs against the seed data (see scripts/test-db.sh).

\set teacher '''00000000-0000-0000-0000-000000000002'''
\set marina_user '''00000000-0000-0000-0000-000000000003'''

-- a lesson on a paused contract is rejected
do $$ begin
  insert into public.lessons (teacher_id, student_id, contract_id, starts_at)
  values ('00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000005',
          '30000000-0000-0000-0000-000000000007', '2026-10-20 10:00-03');
  raise exception 'FAIL: lesson accepted on a paused contract' using errcode = 'EF001';
exception when sqlstate 'P0001' then
  if sqlerrm not like '%active contract%' then raise; end if;
end $$;

-- a lesson on another student's contract is rejected
do $$ begin
  insert into public.lessons (teacher_id, student_id, contract_id, starts_at)
  values ('00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002',
          '30000000-0000-0000-0000-000000000001', '2026-10-20 10:00-03');
  raise exception 'FAIL: lesson accepted on another student''s contract' using errcode = 'EF001';
exception when foreign_key_violation or sqlstate 'P0001' then null;
end $$;

-- a lesson by a teacher who doesn't teach the student is rejected
do $$ begin
  insert into public.lessons (teacher_id, student_id, contract_id, starts_at)
  values ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
          '30000000-0000-0000-0000-000000000001', '2026-10-20 10:00-03');
  raise exception 'FAIL: lesson accepted for another teacher' using errcode = 'EF001';
exception when sqlstate 'P0001' then null;
end $$;

-- active and renewal-due contracts accept lessons
insert into public.lessons (teacher_id, student_id, contract_id, starts_at) values
  ('00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '2026-10-21 10:00-03'),
  ('00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', '2026-10-21 11:00-03');

-- past lessons stay editable after their contract is paused
do $$ begin
  update public.contracts set status = 'paused' where id = '30000000-0000-0000-0000-000000000006';
  update public.lessons set status = 'cancelled'
   where contract_id = '30000000-0000-0000-0000-000000000006' and status = 'done';
  update public.contracts set status = 'active' where id = '30000000-0000-0000-0000-000000000006';
end $$;

-- the seed reproduces the prototype's usage (5 of 8 for Marina's Executive 1:1)
do $$ declare n int; begin
  select count(*) into n from public.lessons
   where contract_id = '30000000-0000-0000-0000-000000000001' and status = 'done'
     and starts_at >= '2026-10-01 00:00-03' and starts_at < '2026-11-01 00:00-03';
  if n <> 5 then raise exception 'FAIL: expected 5 lessons used, got %', n using errcode = 'EF001'; end if;
end $$;

-- RLS: a student only sees their own record and lessons
set role authenticated;
set request.jwt.claim.sub = :marina_user;
do $$ declare n int; begin
  select count(*) into n from public.students;
  if n <> 1 then raise exception 'FAIL: student sees % student rows', n using errcode = 'EF001'; end if;
  select count(*) into n from public.lessons where student_id <> '20000000-0000-0000-0000-000000000001';
  if n <> 0 then raise exception 'FAIL: student sees other students'' lessons' using errcode = 'EF001'; end if;
  select count(*) into n from public.assessments;
  if n <> 12 then raise exception 'FAIL: student sees % assessments, expected 12', n using errcode = 'EF001'; end if;
end $$;

-- RLS: a student cannot create lessons or change their role
do $$ begin
  insert into public.lessons (teacher_id, student_id, contract_id, starts_at)
  values ('00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001',
          '30000000-0000-0000-0000-000000000001', '2026-10-22 10:00-03');
  raise exception 'FAIL: student created a lesson' using errcode = 'EF001';
exception when insufficient_privilege then null;
end $$;
do $$ begin
  update public.profiles set role = 'admin' where id = auth.uid();
  raise exception 'FAIL: student changed their role' using errcode = 'EF001';
exception when insufficient_privilege then null;
end $$;

-- RLS: a teacher sees their seven students; an admin-only write is refused
set request.jwt.claim.sub = :teacher;
do $$ declare n int; begin
  select count(*) into n from public.students;
  if n <> 7 then raise exception 'FAIL: teacher sees % students, expected 7', n using errcode = 'EF001'; end if;
  update public.plans set name = 'x';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: teacher edited plans' using errcode = 'EF001'; end if;
end $$;
reset role;
