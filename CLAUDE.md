# CLAUDE.md — MediBook (Hospital Appointment & Disease Prediction System)

## What this is

**MediBook** — an AI-powered hospital appointment booking system built as a graduation project.
Patients describe their symptoms, the AI predicts the likely disease and recommends the correct
medical specialty, and the patient can immediately book an appointment with the right doctor.
Admins (hospital staff) manage appointments from a protected dashboard.

The repo has three independently runnable parts:

- `AI_Engine_Ready/` — pre-trained scikit-learn models + hybrid triage engine (do NOT modify)
- `ai-service/` — FastAPI microservice wrapping the AI engine → `http://localhost:8000`
- `frontend/` — Next.js 16 (App Router) + Tailwind + Shadcn UI → `http://localhost:3000`

Database + auth is handled by **Supabase** (hosted PostgreSQL). The SQL schema lives in
`supabase/schema.sql`.

## Commands

Run from the project root. You need **three terminals** for full local dev.

```bash
# Terminal 1 — AI microservice (Python)
cd ai-service
py -m uvicorn app.main:app --reload --port 8000

# Terminal 2 — Next.js frontend
# IMPORTANT: use the junction path to avoid Node.js path-escape bugs
#   caused by '&' and '\n'/'\t' sequences in the real directory name.
cd C:\medibook-frontend
npm run dev

# (One-time junction setup if medibook-frontend doesn't exist)
# Run in PowerShell as admin:
# cmd /c "mklink /J C:\medibook-frontend ""C:\AI-Based Hospital Appointment & Disease Prediction System\frontend"""
```

## Testing

```bash
# Frontend unit tests (Vitest + Testing Library) — run via the junction path
cd C:\medibook-frontend
npm test               # vitest run
npm run test:watch     # watch mode
npm run test:e2e       # Playwright E2E (needs: npx playwright install chromium once)

# AI service tests (pytest)
cd ai-service
py -m pytest -q
```

- **Vitest** uses `happy-dom` and `resolve.preserveSymlinks` (the real path's `&` breaks Vite's
  file:// loader, so tests must run through the `C:\medibook-frontend` junction). Pure logic lives in
  `src/lib/specialty.ts` and `src/lib/validation.ts` so it's testable without mocking Supabase/next-intl.
- **Playwright** smoke specs live in `frontend/e2e/`; the config auto-reuses a running `npm run dev`.
- **pytest** specs in `ai-service/tests/` use FastAPI's `TestClient` (triggers model loading via lifespan).

## Architecture

**AI triage flow:**
1. Patient submits symptoms (free text) via the Next.js frontend
2. Frontend calls `POST http://localhost:8000/predict`
3. FastAPI loads models once at startup, runs hybrid inference (ML + rule-based emergency detection)
4. Returns: `predicted_disease`, `recommended_specialty`, `is_emergency`, `is_infectious`
5. If emergency → show urgent warning, no booking allowed
6. Otherwise → redirect to `/book?specialty=<recommended>` for appointment booking

**Auth flow (Supabase):**
- Email/password via Supabase Auth
- On sign-up, a `profiles` row is auto-created by a Postgres trigger with `role = 'patient'`
- Admin role is set manually in the Supabase table editor
- `src/proxy.ts` (Next.js 16 middleware) guards `/admin/*` routes
- Server components use `supabase-server.ts`; client components use `supabase-client.ts`

**Database tables:** `profiles`, `doctors`, `appointments`, `triage_logs` — all with RLS policies.

## Security model

- **AI service is not browser-facing.** The Next.js client never calls FastAPI directly. It calls
  the `predictSymptoms` **server action** (`frontend/src/lib/actions/triage.ts`), which calls
  FastAPI server-side with an `X-API-Key` header. FastAPI rejects requests without the matching key
  (`AI_SERVICE_API_KEY`) and rate-limits `/predict` (slowapi).
- **Triage logging.** The same server action writes every prediction to `triage_logs` via the
  service-role client, so the admin "Emergency flags" metric is accurate even for anonymous checks.
- **Admin mutations are server-verified.** Appointment status changes go through the
  `updateAppointmentStatus` server action (`frontend/src/lib/actions/appointments.ts`), which
  re-checks the caller's admin role server-side before using the service-role client. RLS also
  restricts `appointments` UPDATE to admins (`supabase/security.sql`).
- **No self-promotion to admin.** The `handle_new_user` trigger ignores client-supplied `role` and
  always assigns `patient`; a profiles UPDATE policy forbids changing your own `role`. New role
  grants happen manually in the Supabase Table Editor. (Applied by `supabase/security.sql`.)
- **Service-role key** (`frontend/src/lib/supabase-admin.ts`) is `import "server-only"` — never
  import it from a client component.
- Security headers (X-Frame-Options, HSTS, etc.) are set in `next.config.ts`.

> **Run order in Supabase SQL Editor:** `schema.sql` first, then `security.sql`.

## Environment

`frontend/.env.local` (copy from `.env.local.example` and fill in real values):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-or-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-or-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Server-side only (no NEXT_PUBLIC prefix) — AI service is called from server code:
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=must-match-ai-service
```

`ai-service/.env` (copy from `.env.example`):
```
MODEL_DIR=../AI_Engine_Ready
FRONTEND_URL=http://localhost:3000
AI_SERVICE_API_KEY=must-match-frontend
```

## Key files

| File | Purpose |
|---|---|
| `AI_Engine_Ready/triage_engine.py` | Original inference logic (reference only) |
| `ai-service/app/main.py` | FastAPI app — loads models at startup, `/predict` endpoint |
| `ai-service/app/schemas.py` | Pydantic request/response models |
| `supabase/schema.sql` | Full DB schema + RLS + seed doctors — run once in Supabase SQL editor |
| `frontend/src/proxy.ts` | Auth guard (Next.js 16 proxy/middleware) |
| `frontend/src/lib/supabase-client.ts` | Browser Supabase client (client components) |
| `frontend/src/lib/supabase-server.ts` | Server Supabase client (server components) |
| `frontend/src/lib/triage.ts` | Fetch wrapper for the AI service |
| `frontend/src/app/check-symptoms/page.tsx` | Symptom checker UI |
| `frontend/src/app/book/booking-client.tsx` | Doctor list + booking flow |
| `frontend/src/app/admin/` | Admin dashboard + appointments table |

## Windows path note

The project directory name `C:\AI-Based Hospital Appointment & Disease Prediction System` contains
`&` (shell command separator) and `\n`/`\t` sequences (Node.js escape chars). Running `npm` directly
from this path will fail. Always use the junction `C:\medibook-frontend` for running npm commands.
