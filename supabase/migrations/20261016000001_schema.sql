-- English Forms · core schema

create type public.user_role       as enum ('admin', 'teacher', 'student');
create type public.student_status  as enum ('active', 'paused');
create type public.contract_status as enum ('active', 'paused', 'ending');
create type public.lesson_status   as enum ('scheduled', 'done', 'cancelled');

create table public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  role       public.user_role not null default 'student',
  name       text not null default '',
  email      text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.students (
  id                 uuid primary key default gen_random_uuid(),
  teacher_id         uuid not null references public.profiles on delete restrict,
  -- the student's own login, linked by email on sign-up
  profile_id         uuid unique references public.profiles on delete set null,
  name               text not null,
  email              text not null,
  whatsapp           text,
  company            text,
  role_title         text,
  cefr_level         text not null default 'B1' check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  city               text,
  start_date         date not null default current_date,
  status             public.student_status not null default 'active',
  linkedin_url       text,
  linkedin_headline  text,
  linkedin_synced_at timestamptz,
  notes              text,
  created_at         timestamptz not null default now()
);
create index students_teacher_idx on public.students (teacher_id);
create unique index students_email_idx on public.students (lower(email));

create table public.plans (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  lessons_per_month int not null check (lessons_per_month > 0),
  list_price_cents  int not null check (list_price_cents >= 0),
  color             text not null check (color ~ '^#[0-9a-fA-F]{6}$'),
  description       text
);

create table public.contracts (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null references public.students on delete cascade,
  plan_id           uuid not null references public.plans on delete restrict,
  lessons_per_month int not null check (lessons_per_month > 0),
  price_cents       int not null check (price_cents >= 0),
  start_date        date not null,
  renewal_date      date not null,
  status            public.contract_status not null default 'active',
  created_at        timestamptz not null default now(),
  check (renewal_date > start_date),
  -- target of the composite foreign key on lessons
  unique (id, student_id)
);
create index contracts_student_idx on public.contracts (student_id);

create table public.lessons (
  id              uuid primary key default gen_random_uuid(),
  teacher_id      uuid not null references public.profiles on delete restrict,
  student_id      uuid not null references public.students on delete cascade,
  contract_id     uuid not null,
  starts_at       timestamptz not null,
  duration_min    int not null default 60 check (duration_min between 15 and 240),
  status          public.lesson_status not null default 'scheduled',
  google_event_id text unique,
  meet_url        text,
  created_at      timestamptz not null default now(),
  -- the contract must belong to this same student
  foreign key (contract_id, student_id) references public.contracts (id, student_id) on delete restrict
);
create index lessons_teacher_time_idx on public.lessons (teacher_id, starts_at);
create index lessons_contract_idx on public.lessons (contract_id, status, starts_at);
create index lessons_student_idx on public.lessons (student_id, starts_at);

create table public.google_accounts (
  teacher_id     uuid primary key references public.profiles on delete cascade,
  email          text not null,
  -- AES-256-GCM ciphertext (see lib/crypto.ts), never plaintext
  refresh_token  text not null,
  sync_token     text,
  add_meet       boolean not null default true,
  last_synced_at timestamptz
);

-- events created directly in Google with no matching lesson ("Needs linking")
create table public.google_unlinked_events (
  google_event_id text primary key,
  teacher_id      uuid not null references public.profiles on delete cascade,
  summary         text not null default '',
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  updated_at      timestamptz not null default now()
);
create index google_unlinked_teacher_idx on public.google_unlinked_events (teacher_id, starts_at);

create table public.assessments (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.students on delete cascade,
  lesson_id     uuid unique references public.lessons on delete set null,
  grammar       smallint not null check (grammar between 0 and 100),
  vocabulary    smallint not null check (vocabulary between 0 and 100),
  pronunciation smallint not null check (pronunciation between 0 and 100),
  fluency       smallint not null check (fluency between 0 and 100),
  listening     smallint not null check (listening between 0 and 100),
  confidence    smallint not null check (confidence between 0 and 100),
  overall       smallint generated always as (
    ((grammar + vocabulary + pronunciation + fluency + listening + confidence) / 6)::smallint
  ) stored,
  notes         text,
  created_at    timestamptz not null default now()
);
create index assessments_student_idx on public.assessments (student_id, created_at);

-- Create a profile for every new auth user. If the email matches a student
-- record, link it and make the user a student; otherwise the user starts as
-- a student with no record until an admin promotes them.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );

  update public.students
     set profile_id = new.id
   where lower(email) = lower(new.email) and profile_id is null;

  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
