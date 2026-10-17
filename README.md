# English Forms

A platform for managing and tracking executive English students: students, contracted services, a Google-synced lesson calendar, lesson assessments and progress dashboards.

The visual and functional reference is the prototype in `design/prototype/`.

**Stack:** Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS · Supabase (Postgres, Auth, RLS) · Zod + Server Actions · Recharts · Vercel.

## Screens

| Route | Who | What |
|---|---|---|
| `/login` | everyone | Email/password, Google and LinkedIn sign-in, password reset |
| `/management/students` | teacher, admin | List with search and filters, profile, add/edit, WhatsApp (`wa.me`) |
| `/management/services` | teacher, admin | Plan catalog, contracts with usage this month, renew, pause/resume |
| `/management/calendar` | teacher, admin | Week view, lessons, Google Calendar sync, "Needs linking" |
| `/dashboard` | everyone | Student performance dashboard (teachers pick a student) |
| `/reports`, `/reports/[lessonId]` | everyone | Lesson reports; teachers score lessons here |
| `/proficiency` | everyone | CEFR ladder, projection, exam equivalence |
| `/teacher` | teacher, admin | Cohort ranking, students at risk |
| `/admin` | admin | School KPIs |
| `/labs/simulator`, `/labs/live-class` | everyone | UI previews with sample data, only when `FEATURE_AI_LABS=true` |

## Run it locally

You need Node 20+ and Docker (for the local Supabase stack).

```bash
npm install
cp .env.example .env.local
npm run db:start        # starts Supabase locally, applies migrations and seed.sql
```

`db:start` prints the local API URL, anon key and service role key. Put them in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
GOOGLE_TOKEN_KEY=<output of: openssl rand -base64 32>
```

Then:

```bash
npm run dev             # http://localhost:3000
```

The seed loads the prototype's data. All demo accounts use the password `englishforms`:

| Email | Role |
|---|---|
| `admin@englishforms.com` | admin |
| `sofia.reyes@englishforms.com` | teacher (owns all seven students) |
| `marina@bancoatlas.com` | student (Marina Albuquerque) |

Useful scripts:

| Script | What it does |
|---|---|
| `npm run db:reset` | Recreates the local database from migrations + seed |
| `npm run db:types` | Regenerates `types/supabase.ts` from the local database |
| `npm test` | Vitest: Zod schemas, the lesson rule, dates, scoring |
| `npm run test:db` | SQL tests for the lesson trigger and RLS against a throwaway database (`DATABASE_URL` must point at a Postgres server you can create databases on) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |

## Data model

Migrations live in `supabase/migrations/`:

- `profiles` (one per auth user, `role` = admin | teacher | student), `students`, `plans`, `contracts`, `lessons`, `assessments`, `google_accounts`, `google_unlinked_events`.
- **RLS on every table.** Admins see everything, teachers see their own students and everything attached to them, and students see only their own record, contracts, lessons and assessments. Users can edit their own name and photo, but not their role.
- **A lesson needs a running contract of the same student.** A composite foreign key `(contract_id, student_id)` guarantees ownership. The `lessons_enforce_contract` trigger rejects new lessons (or lessons moved to another contract) when the contract is paused, or when the teacher doesn't teach that student. Server Actions run the same check first (`lib/rules/lesson.ts`) so the form can explain why. A contract marked "Renewal due" (`ending`) is still in force and accepts lessons.
- **"Lessons used this month" is never stored.** It is counted from `lessons` with status `done` in the current month (`lib/data/usage.ts`), using `NEXT_PUBLIC_APP_TIMEZONE`.
- **Student logins:** when someone signs up with an email that matches a student record, the two are linked automatically.
- **Promoting a user:** new users start as `student`. An admin promotes a teacher or admin in the Supabase dashboard (or SQL): `update profiles set role = 'teacher' where email = '…';`

## Authentication setup (Supabase)

1. Create a Supabase project and link it: `npx supabase link --project-ref <ref>`, then `npx supabase db push` to apply the migrations. Don't run `seed.sql` in production.
2. **Authentication → URL Configuration:** set the Site URL to your production URL and add `https://<your-domain>/auth/callback` to the redirect URLs.
3. **Google sign-in:** in Google Cloud Console, create an OAuth client (type "Web application"). Add `https://<project-ref>.supabase.co/auth/v1/callback` as an authorized redirect URI, then paste the client ID and secret into Supabase → Authentication → Providers → Google.
4. **LinkedIn sign-in:** create an app at linkedin.com/developers, add the product "Sign In with LinkedIn using OpenID Connect", use the same Supabase callback URL, and enable the **LinkedIn (OIDC)** provider in Supabase.

To test the providers locally, set `enabled = true` for them in `supabase/config.toml` and export the env vars named there.

### About LinkedIn data

LinkedIn's public OpenID Connect API returns only name, photo and email. It does not return the headline, role, company or profile URL without partner approval. So `role_title`, `company`, `linkedin_url` and `linkedin_headline` stay editable fields. When a student signs in with LinkedIn, their name and photo are copied over and `linkedin_synced_at` is set. `syncLinkedIn()` in `lib/linkedin.ts` is the place to extend once more access is granted.

## Google Calendar integration

This is separate from Google sign-in: each teacher connects their calendar from the Calendar screen, which needs an offline refresh token with the `calendar.events` scope.

1. In the same (or another) Google Cloud project, enable the **Google Calendar API**.
2. Configure the OAuth consent screen and add the scope `.../auth/calendar.events`. Until the app is verified, add teachers as test users.
3. Create an OAuth client (Web application) with the authorized redirect URI `https://<your-domain>/api/google/callback` (and `http://localhost:3000/api/google/callback` for local use).
4. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `GOOGLE_TOKEN_KEY` (32 random bytes, base64). Refresh tokens are stored encrypted with AES-256-GCM.

How the sync works (`lib/google/`):

- **App → Google:** creating, editing or cancelling a lesson creates, updates or deletes its event. The student is added as an attendee, and a Google Meet link is added when "Add Google Meet links" is on.
- **Google → App:** incremental sync with `syncToken`. Lessons moved or deleted in Google are moved or cancelled in the app. Timed events with no matching lesson go to **Needs linking**, where the teacher links them to a student and an active service or ignores them.
- **When it runs:** on the "Sync now" button and through the Vercel Cron route `/api/cron/google-sync` (`vercel.json`). The schedule is daily at 09:00 UTC (06:00 in São Paulo) because Vercel's Hobby plan only allows daily crons; on Pro, change it to `*/10 * * * *` for a sync every 10 minutes. The route requires `Authorization: Bearer $CRON_SECRET`, which Vercel sends automatically when `CRON_SECRET` is set.

## Deploy on Vercel

1. Import the repository in Vercel (framework: Next.js).
2. Add the environment variables from `.env.example`. `NEXT_PUBLIC_SITE_URL` must be the production URL, and `CRON_SECRET` must be set.
3. Deploy, then update the Supabase and Google redirect URLs to the production domain.

## Project layout

```
app/                      routes (Server Components, Server Actions next to each screen)
  (app)/                  signed-in area: management/, dashboard/, reports/, proficiency/, teacher/, admin/, labs/
  api/google/, api/cron/  Google OAuth and the sync cron
components/ui, shell, charts, labs
lib/                      auth, dates, formatting, validation (Zod), rules, data loaders, google/, scores
supabase/                 migrations, seed.sql, SQL tests, local config
tests/                    Vitest
types/                    generated Supabase types + friendly aliases
design/prototype/         the reference prototype
```
