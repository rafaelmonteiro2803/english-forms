-- English Forms · row level security
-- admin sees everything · teacher sees their own students · student sees their own data

create function public.auth_role() returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.auth_role() = 'admin', false)
$$;

-- the current user teaches this student (or is an admin)
create function public.can_manage_student(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin()
      or exists (select 1 from public.students s where s.id = sid and s.teacher_id = auth.uid())
$$;

-- the current user teaches this student, is this student, or is an admin
create function public.can_see_student(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin()
      or exists (
        select 1 from public.students s
         where s.id = sid and (s.teacher_id = auth.uid() or s.profile_id = auth.uid())
      )
$$;

alter table public.profiles               enable row level security;
alter table public.students               enable row level security;
alter table public.plans                  enable row level security;
alter table public.contracts              enable row level security;
alter table public.lessons                enable row level security;
alter table public.google_accounts        enable row level security;
alter table public.google_unlinked_events enable row level security;
alter table public.assessments            enable row level security;

-- profiles: yourself, your teacher, your students' logins; admins see all
create policy profiles_select on public.profiles for select to authenticated using (
  id = auth.uid()
  or public.is_admin()
  or exists (select 1 from public.students s where s.profile_id = auth.uid() and s.teacher_id = profiles.id)
  or exists (select 1 from public.students s where s.teacher_id = auth.uid() and s.profile_id = profiles.id)
);
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
-- users may edit their name and photo; only admins (through the service role) change roles
revoke update on public.profiles from authenticated;
grant update (name, avatar_url) on public.profiles to authenticated;

-- students
create policy students_select on public.students for select to authenticated
  using (public.is_admin() or teacher_id = auth.uid() or profile_id = auth.uid());
create policy students_insert on public.students for insert to authenticated
  with check (public.is_admin() or (teacher_id = auth.uid() and public.auth_role() = 'teacher'));
create policy students_update on public.students for update to authenticated
  using (public.is_admin() or teacher_id = auth.uid())
  with check (public.is_admin() or teacher_id = auth.uid());
create policy students_delete on public.students for delete to authenticated
  using (public.is_admin() or teacher_id = auth.uid());

-- plans: a shared catalog
create policy plans_select on public.plans for select to authenticated using (true);
create policy plans_write on public.plans for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- contracts
create policy contracts_select on public.contracts for select to authenticated
  using (public.can_see_student(student_id));
create policy contracts_write on public.contracts for all to authenticated
  using (public.can_manage_student(student_id)) with check (public.can_manage_student(student_id));

-- lessons
create policy lessons_select on public.lessons for select to authenticated
  using (public.can_see_student(student_id));
create policy lessons_write on public.lessons for all to authenticated
  using (public.is_admin() or teacher_id = auth.uid())
  with check (public.is_admin() or teacher_id = auth.uid());

-- assessments
create policy assessments_select on public.assessments for select to authenticated
  using (public.can_see_student(student_id));
create policy assessments_write on public.assessments for all to authenticated
  using (public.can_manage_student(student_id)) with check (public.can_manage_student(student_id));

-- Google: each teacher only touches their own account; the sync cron uses the service role
create policy google_accounts_own on public.google_accounts for all to authenticated
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy google_unlinked_own on public.google_unlinked_events for all to authenticated
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
