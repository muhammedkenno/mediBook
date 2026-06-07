-- ============================================================
-- Security hardening — run once in the Supabase SQL Editor
-- (after schema.sql). Safe to re-run.
-- ============================================================

-- Previously, patients could UPDATE their own appointment rows, which means a
-- patient could mark their own appointment "confirmed". Status changes are an
-- administrative action, so restrict UPDATE to admins only. Patients keep
-- INSERT (booking) and SELECT (viewing their own) from schema.sql.
drop policy if exists "appts_update" on public.appointments;
create policy "appts_update"
  on public.appointments for update
  using (public.is_admin());

-- triage_logs are now written server-side via the service-role key (which
-- bypasses RLS), so no client INSERT path is needed. Keep SELECT restricted to
-- the owning patient or an admin (unchanged), and drop the client INSERT policy.
drop policy if exists "triage_insert" on public.triage_logs;

-- PRIVILEGE-ESCALATION FIX: the original trigger copied `role` from the
-- client-supplied sign-up metadata, so a user could register themselves as
-- 'admin'. Always create new users as 'patient'; admins are promoted manually
-- in the Table Editor.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'patient'
  );
  return new;
end;
$$;

-- Also prevent patients from promoting themselves by UPDATEing their own
-- profile row's role. Replace the broad self-update policy with one that
-- forbids changing role unless you are already an admin.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and (role = 'patient' or public.is_admin()));
