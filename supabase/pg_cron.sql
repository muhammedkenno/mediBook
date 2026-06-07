-- ============================================================
-- Schedule the reminders cron via pg_cron + pg_net.
-- Run AFTER notifications.sql. One-time setup.
--
-- BEFORE running, replace the two placeholders below:
--   <YOUR_APP_URL>    e.g. https://medibook.vercel.app  (or your tunnel URL)
--   <YOUR_CRON_SECRET> the same value as CRON_SECRET in frontend/.env.local
-- ============================================================

-- 1. Make sure the extensions are enabled (Supabase usually has them ready).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2. Drop any prior schedule so this file is re-runnable.
select cron.unschedule('medibook-reminders') where exists (
  select 1 from cron.job where jobname = 'medibook-reminders'
);

-- 3. Schedule: every 15 minutes, POST to the Next.js reminder route.
select cron.schedule(
  'medibook-reminders',
  '*/15 * * * *',
  $$
  select net.http_post(
    url     := '<YOUR_APP_URL>/api/cron/send-reminders',
    headers := jsonb_build_object(
                 'Authorization', 'Bearer <YOUR_CRON_SECRET>',
                 'Content-Type',  'application/json'
               ),
    body    := '{}'::jsonb
  );
  $$
);

-- 4. Inspect / debug:
--   select * from cron.job;                          -- see active schedules
--   select * from cron.job_run_details order by start_time desc limit 5;
--   select cron.unschedule('medibook-reminders');    -- pause it
