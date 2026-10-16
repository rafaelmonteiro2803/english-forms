# Prompt: English Forms, from prototype to web app

> Use this in **Claude Code**, not in Claude Design. Claude Design makes prototypes. A real app with a database and login needs a code environment. Attach the prototype folder (or the Claude Code handoff package) along with this prompt.

---

## Prompt

You are going to build **English Forms**, a web platform for managing and tracking executive English students. The attached HTML/JSX prototype is the **visual and functional reference**: follow its layout, components, colors (`tokens.css`), typography and flows. Don't copy the prototype's code. Rewrite it as a real, production-quality app.

### Principles
- Simple, readable code that any developer can maintain. Few dependencies, no premature abstractions.
- A light, fast app: server-rendered pages, minimal client JavaScript, instant navigation.
- Strict TypeScript. Short, well-named files. Comments only where something isn't obvious.

### Stack
- **Next.js 15 (App Router) + TypeScript**
- **Tailwind CSS**, with the prototype's tokens moved into `tailwind.config` (colors, radius, Inter and IBM Plex Mono fonts)
- **Supabase**: Postgres, Auth and Row Level Security
- **Zod** for form validation, and **Server Actions** for mutations
- **Recharts** for the charts (line, radar, bars). Write the heatmap and gauge as simple components.
- Deploy on **Vercel**

### Authentication and roles
- Supabase Auth with email/password and **Google** sign-in.
- Roles: `admin`, `teacher`, `student`, stored in the `profiles` table.
- RLS on every table: a teacher sees only their own students, a student sees only their own data, an admin sees everything.
- Route protection through middleware. The login screen follows the prototype's `screen_login.jsx`.

### Data model (Supabase SQL migrations)
- `profiles` (id → auth.users, role, name, email, avatar_url)
- `students` (id, teacher_id, name, email, whatsapp, company, role_title, cefr_level, city, start_date, status: active|paused, linkedin_url, linkedin_headline, linkedin_synced_at, notes)
- `plans` (id, name, lessons_per_month, list_price_cents, color, description)
- `contracts` (id, student_id, plan_id, lessons_per_month, price_cents, start_date, renewal_date, status: active|paused|ending)
- `lessons` (id, teacher_id, student_id, contract_id **NOT NULL**, starts_at, duration_min, status: scheduled|done|cancelled, google_event_id, meet_url)
- `google_accounts` (teacher_id, email, refresh_token encrypted, sync_token, last_synced_at)
- `assessments` (id, student_id, lesson_id, grammar, vocabulary, pronunciation, fluency, listening, confidence, overall, created_at), which feed the dashboards and reports
- Rule enforced in the database: a lesson can only be created if the `contract` belongs to that student and is `active` (use a trigger or a check in the Server Action plus a constraint).
- "Lessons used this month" is calculated from `lessons` with status `done`. Don't store it.
- Seed with the prototype's data (`data.jsx` and `mgmt_core.jsx`).

### Screens, in delivery order
1. **Login**
2. **Management → Students**: list with search and filters, the student profile, and the add/edit form. WhatsApp button through a `https://wa.me/<number>?text=` link.
3. **Management → Services**: the plan catalog, a contracts table with usage for the month, the agreed value against the list price, renewals, and pause/resume.
4. **Management → Calendar**: week view. Each lesson is required to have a student and an active service.
5. **Student dashboard, Lesson Report, Proficiency, Teacher View, Admin**, using real data from `assessments`, `lessons` and `contracts`.
6. **AI Simulator and Live Class**: in this phase, only the visual interface with mock data, isolated behind a feature flag. The voice/AI integration comes in a later phase.

### Integrations
- **Google Calendar**: the teacher connects their Google account (OAuth, scope `calendar.events`). Two-way sync:
  - When a lesson is created, edited or cancelled in the app → create/update/delete the event in Google, with a Meet link (`conferenceData`).
  - Incremental sync using `syncToken` (manual button plus cron every 10 min through a Vercel Cron route).
  - Events created directly in Google that have no matching lesson go to a "Needs linking" list, as in the prototype.
- **LinkedIn**: "Sign in with LinkedIn" (OpenID Connect) to capture name, photo and profile URL. Note: the public LinkedIn API **does not return role or company** without partner approval. Keep `role_title` and `company` as editable fields, show the LinkedIn link on the profile, and leave a `syncLinkedIn()` function ready to be extended later.
- **WhatsApp**: `wa.me` links only (no API in this phase).

### Quality
- Loading and error states, plus empty states that match the prototype's style.
- Accessibility: labels on every input, visible focus, AA contrast.
- A README with the setup steps (env vars, Supabase migrations, Google OAuth credentials) and how to run it locally.
- Tests: Zod schemas plus the "lesson requires an active contract" rule.

Start by proposing the folder structure and the SQL schema. Wait for my approval, then implement in the order above, committing after each screen.
