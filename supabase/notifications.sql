-- ============================================================
-- Notifications + reminders schema. Run in Supabase SQL Editor
-- AFTER schema.sql and security.sql. Safe to re-run.
-- ============================================================

-- ----------------------------------------------------------------
-- 1. preferred_locale on profiles (for localized emails)
-- ----------------------------------------------------------------
alter table public.profiles
  add column if not exists preferred_locale text not null default 'en'
    check (preferred_locale in ('en', 'ar'));

-- ----------------------------------------------------------------
-- 2. reminder_sent_at on appointments (idempotency for the cron)
-- ----------------------------------------------------------------
alter table public.appointments
  add column if not exists reminder_sent_at timestamptz;

-- ----------------------------------------------------------------
-- 3. notifications table — one row per in-app notification
-- ----------------------------------------------------------------
create table if not exists public.notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  type            text not null check (type in (
    'appointment_pending',
    'appointment_confirmed',
    'appointment_cancelled',
    'appointment_reminder'
  )),
  title           text not null,
  body            text,
  link            text,
  appointment_id  uuid references public.appointments(id) on delete cascade,
  read_at         timestamptz,
  created_at      timestamptz default now()
);

create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

-- ----------------------------------------------------------------
-- 4. RLS — patients see/update their own; admins see all.
--    INSERTs always come from the service-role client (server actions
--    or cron), which bypasses RLS — so no INSERT policy is needed.
-- ----------------------------------------------------------------
alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------
-- 5. Enable Supabase Realtime on notifications so the bell updates live
-- ----------------------------------------------------------------
alter publication supabase_realtime add table public.notifications;
