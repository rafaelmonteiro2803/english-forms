-- English Forms · business rules enforced by the database

-- A contract can take lessons while it is running: 'active', or 'ending'
-- (renewal due, still in force). 'paused' contracts cannot.
create function public.contract_is_schedulable(s public.contract_status) returns boolean
language sql immutable as $$ select s in ('active', 'ending') $$;

-- Every lesson needs a student and a running contract of that same student.
-- The composite foreign key guarantees ownership; this trigger checks status
-- and that the lesson's teacher is the student's teacher.
create function public.enforce_lesson_contract() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  c_status   public.contract_status;
  s_teacher  uuid;
begin
  select teacher_id into s_teacher from public.students where id = new.student_id;
  if s_teacher is distinct from new.teacher_id then
    raise exception 'This student belongs to another teacher' using errcode = 'P0001';
  end if;

  -- Only new lessons, or lessons moved to another contract, need a running
  -- contract. Past lessons stay editable after a contract is paused.
  if tg_op = 'INSERT' or new.contract_id is distinct from old.contract_id then
    select status into c_status from public.contracts
     where id = new.contract_id and student_id = new.student_id;
    if c_status is null then
      raise exception 'The contract does not belong to this student' using errcode = 'P0001';
    end if;
    if not public.contract_is_schedulable(c_status) then
      raise exception 'A lesson requires an active contract' using errcode = 'P0001';
    end if;
  end if;

  return new;
end $$;

create trigger lessons_enforce_contract
  before insert or update of contract_id, student_id, teacher_id on public.lessons
  for each row execute function public.enforce_lesson_contract();

-- Link a new student record to an existing login with the same email.
create function public.link_student_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.profile_id is null then
    select id into new.profile_id from public.profiles
     where lower(email) = lower(new.email) and role = 'student'
     limit 1;
  end if;
  return new;
end $$;

create trigger students_link_profile
  before insert on public.students
  for each row execute function public.link_student_profile();
