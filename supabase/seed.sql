-- English Forms · demo data (from the prototype's data.jsx and mgmt_core.jsx)
-- Local logins, all with the password "englishforms":
--   admin@englishforms.com · sofia.reyes@englishforms.com (teacher) · marina@bancoatlas.com (student)

-- users ---------------------------------------------------------------------
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select id::uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', email,
       extensions.crypt('englishforms', extensions.gen_salt('bf')), now(),
       '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', name), now(), now(),
       '', '', '', ''
from (values
  ('00000000-0000-0000-0000-000000000001', 'admin@englishforms.com',       'Ana Admin'),
  ('00000000-0000-0000-0000-000000000002', 'sofia.reyes@englishforms.com', 'Sofia Reyes'),
  ('00000000-0000-0000-0000-000000000003', 'marina@bancoatlas.com',        'Marina Albuquerque')
) as u(id, email, name);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), id, id::text, jsonb_build_object('sub', id::text, 'email', email), 'email', now(), now(), now()
from auth.users
where id in ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');

update public.profiles set role = 'admin'   where id = '00000000-0000-0000-0000-000000000001';
update public.profiles set role = 'teacher' where id = '00000000-0000-0000-0000-000000000002';

-- plans ---------------------------------------------------------------------
insert into public.plans (id, name, lessons_per_month, list_price_cents, color, description) values
  ('10000000-0000-0000-0000-000000000001', 'Executive 1:1',      8,  240000, '#3b82f6', 'Private 60-min lessons'),
  ('10000000-0000-0000-0000-000000000002', 'Business Intensive', 12, 330000, '#2dd4a7', '3× per week, 60 min'),
  ('10000000-0000-0000-0000-000000000003', 'AI Simulator Pro',   4,  165000, '#9b8cff', '4 lessons + unlimited simulations'),
  ('10000000-0000-0000-0000-000000000004', 'Exam Prep · IELTS',  8,  220000, '#e7b35c', 'Exam-focused coaching'),
  ('10000000-0000-0000-0000-000000000005', 'Corporate Group',    4,  95000,  '#2dd4d4', 'Up to 6 seats · price per seat');

-- students ------------------------------------------------------------------
insert into public.students (id, teacher_id, name, email, whatsapp, company, role_title, cefr_level, city, start_date, status, linkedin_url, linkedin_headline, linkedin_synced_at) values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Marina Albuquerque', 'marina@bancoatlas.com',       '+55 11 98412-3307', 'Banco Atlas',    'VP of Operations',    'B2', 'São Paulo',      '2025-03-10', 'active', 'https://linkedin.com/in/marinaalbuquerque', 'VP of Operations at Banco Atlas · Ex-McKinsey', '2026-10-16 08:12-03'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Carlos Menezes',     'carlos.menezes@vinci.com.br', '+55 11 99231-4410', 'Vinci Partners', 'CFO',                 'C1', 'São Paulo',      '2024-08-02', 'active', 'https://linkedin.com/in/carlosmenezes',      'CFO & Partner at Vinci Partners',               '2026-10-15 18:00-03'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Aline Ferraz',       'aline.ferraz@itau.com.br',    '+55 21 99876-1123', 'Itaú Unibanco',  'Director, Treasury',  'C1', 'Rio de Janeiro', '2025-01-15', 'active', 'https://linkedin.com/in/alineferraz',        'Director, Treasury at Itaú Unibanco',           '2026-10-16 07:40-03'),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'Rafael Pinto',       'rafael.pinto@localiza.com',   '+55 31 98455-2290', 'Localiza',       'Product Manager',     'B2', 'Belo Horizonte', '2025-06-01', 'active', null, null, null),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'Bruno Caldas',       'bruno.caldas@nubank.com.br',  '+55 11 97654-8812', 'Nubank',         'Engineering Lead',    'B1', 'São Paulo',      '2025-02-20', 'paused', 'https://linkedin.com/in/brunocaldas',        'Engineering Lead at Nubank',                    '2026-10-04 10:00-03'),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 'Patrícia Lemos',     'patricia.lemos@xpi.com.br',   '+55 11 98123-6654', 'XP Inc.',        'Investment Analyst',  'B1', 'São Paulo',      '2025-07-08', 'active', null, null, null),
  ('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002', 'Thiago Rocha',       'thiago.rocha@ambev.com.br',   '+55 11 99345-7781', 'Ambev',          'Commercial Director', 'B2', 'São Paulo',      '2024-11-11', 'active', 'https://linkedin.com/in/thiagorocha',        'Commercial Director at Ambev',                  '2026-10-16 09:02-03');

-- contracts -----------------------------------------------------------------
insert into public.contracts (id, student_id, plan_id, lessons_per_month, price_cents, start_date, renewal_date, status) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 8,  240000, '2025-03-10', '2026-11-10', 'active'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 4,  165000, '2026-02-01', '2027-02-01', 'active'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 12, 330000, '2024-10-28', '2026-10-28', 'ending'),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 8,  228000, '2025-01-15', '2027-01-15', 'active'),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 8,  220000, '2026-08-01', '2026-12-01', 'active'),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', 4,  95000,  '2025-06-01', '2026-12-01', 'active'),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 8,  240000, '2025-02-20', '2027-02-20', 'paused'),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000005', 4,  95000,  '2025-07-08', '2027-01-08', 'active'),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', 12, 315000, '2024-11-11', '2026-11-11', 'active'),
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 4,  150000, '2026-05-01', '2026-10-31', 'ending');

-- lessons: the prototype's week of Mon Oct 12 2026 (times in São Paulo) ------
insert into public.lessons (teacher_id, student_id, contract_id, starts_at, duration_min, status)
select '00000000-0000-0000-0000-000000000002', ('20000000-0000-0000-0000-00000000000' || s)::uuid,
       ('30000000-0000-0000-0000-0000000000' || lpad(c::text, 2, '0'))::uuid,
       ('2026-10-12 00:00-03'::timestamptz + make_interval(days => d) + make_interval(mins => (h * 60)::int)),
       (dur * 60)::int,
       case when d < 4 then 'done' else 'scheduled' end::public.lesson_status
from (values
  (0, 8,    1,    1, 1), (0, 10,   1,    2, 3), (0, 14,   1,    3, 4), (0, 17,   1,    7, 9),
  (1, 9,    1,    4, 6), (1, 11,   1,    2, 3), (1, 15,   1.5,  3, 5), (1, 18,   1,    6, 8),
  (2, 8,    1,    1, 1), (2, 10,   1,    2, 3), (2, 13,   0.75, 7, 10), (2, 16.5, 1,   3, 4),
  (3, 9,    1,    1, 2), (3, 11,   1,    7, 9),
  (4, 8,    1,    1, 1), (4, 10.5, 1.5,  3, 5), (4, 14,   1,    7, 9), (4, 16,   1,    4, 6),
  (5, 10,   1,    6, 8)
) as e(d, h, dur, s, c);

-- earlier lessons this month, so usage matches the prototype
insert into public.lessons (teacher_id, student_id, contract_id, starts_at, duration_min, status)
select '00000000-0000-0000-0000-000000000002', ('20000000-0000-0000-0000-00000000000' || s)::uuid,
       ('30000000-0000-0000-0000-0000000000' || lpad(c::text, 2, '0'))::uuid,
       (days[i] || ' ' || h || ':00-03')::timestamptz, 60, 'done'
from (values (1, 1, 3, 8), (2, 3, 6, 10), (3, 4, 4, 14), (7, 9, 5, 17), (4, 6, 1, 9), (3, 5, 2, 15), (7, 10, 2, 13), (1, 2, 1, 11)) as x(s, c, n, h),
     lateral generate_series(1, n) as i,
     (select array['2026-10-01', '2026-10-02', '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09'] as days) as cal;

-- an event created directly in Google that still needs linking
insert into public.google_unlinked_events (google_event_id, teacher_id, summary, starts_at, ends_at) values
  ('seed-unlinked-1', '00000000-0000-0000-0000-000000000002', 'Call with Thiago — contract', '2026-10-15 12:30-03', '2026-10-15 13:30-03');

-- assessments: one per month for the last 12 months --------------------------
-- order of the arrays: grammar, vocabulary, pronunciation, fluency, listening, confidence
insert into public.assessments (student_id, grammar, vocabulary, pronunciation, fluency, listening, confidence, created_at)
select ('20000000-0000-0000-0000-00000000000' || s)::uuid,
       v[1], v[2], v[3], v[4], v[5], v[6],
       '2025-11-14 12:00-03'::timestamptz + make_interval(months => i)
from (values
  (1, array[58, 68, 56, 60, 66, 58], array[79, 92, 78, 84, 88, 81]),
  (2, array[78, 86, 76, 80, 84, 78], array[88, 96, 86, 91, 93, 89]),
  (3, array[74, 84, 72, 76, 82, 74], array[85, 93, 83, 88, 91, 85]),
  (4, array[70, 79, 68, 73, 77, 71], array[71, 80, 69, 75, 78, 71]),
  (5, array[71, 80, 69, 75, 78, 71], array[66, 75, 64, 70, 73, 66]),
  (6, array[62, 71, 60, 66, 69, 62], array[62, 71, 60, 66, 69, 62]),
  (7, array[66, 76, 64, 70, 74, 66], array[77, 86, 75, 81, 84, 77])
) as a(s, v0, v1),
lateral generate_series(0, 11) as i,
lateral (
  select array_agg(
           least(100, greatest(0,
             round(v0[k] + (v1[k] - v0[k]) * i / 11.0
                   + case when i in (0, 11) then 0 else 2 * sin(i * 1.7 + k + s) end)))::smallint
           order by k) as v
  from generate_series(1, 6) as k
) as vals;

-- the latest assessment of each student belongs to their latest finished lesson
update public.assessments a
   set lesson_id = l.id, created_at = l.starts_at + make_interval(mins => l.duration_min)
  from (
    select distinct on (student_id) id, student_id, starts_at, duration_min
      from public.lessons where status = 'done'
     order by student_id, starts_at desc
  ) l
 where a.student_id = l.student_id
   and a.created_at = (select max(created_at) from public.assessments x where x.student_id = a.student_id);
