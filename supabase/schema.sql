-- ============================================================
-- Run this entire file in the Supabase SQL Editor once.
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Profiles — extends auth.users with role
-- ----------------------------------------------------------------
create table if not exists public.profiles (
  id        uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  role      text not null check (role in ('patient', 'admin')) default 'patient',
  created_at timestamptz default now()
);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'patient')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------
-- 2. Doctors
-- ----------------------------------------------------------------
create table if not exists public.doctors (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null,
  specialty      text not null,
  available_days text[] default array['Monday','Tuesday','Wednesday','Thursday','Friday'],
  bio            text,
  created_at     timestamptz default now()
);

-- ----------------------------------------------------------------
-- 3. Appointments
-- ----------------------------------------------------------------
create table if not exists public.appointments (
  id               uuid primary key default gen_random_uuid(),
  patient_id       uuid references public.profiles(id) on delete cascade,
  doctor_id        uuid references public.doctors(id) on delete set null,
  appointment_date date not null,
  appointment_time time not null,
  status           text not null check (status in ('pending','confirmed','cancelled')) default 'pending',
  notes            text,
  created_at       timestamptz default now()
);

-- ----------------------------------------------------------------
-- 4. Triage logs
-- ----------------------------------------------------------------
create table if not exists public.triage_logs (
  id                    uuid primary key default gen_random_uuid(),
  patient_id            uuid references public.profiles(id) on delete cascade,
  appointment_id        uuid references public.appointments(id) on delete set null,
  symptoms              text not null,
  predicted_disease     text,
  recommended_specialty text,
  is_emergency          boolean default false,
  is_infectious         boolean default false,
  created_at            timestamptz default now()
);

-- ================================================================
-- Row Level Security
-- ================================================================

alter table public.profiles      enable row level security;
alter table public.doctors       enable row level security;
alter table public.appointments  enable row level security;
alter table public.triage_logs   enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles: own row only, or admin sees all
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own"   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own"   on public.profiles for update using (id = auth.uid());

-- doctors: public read, admin write
drop policy if exists "doctors_select_all"   on public.doctors;
drop policy if exists "doctors_admin_insert" on public.doctors;
drop policy if exists "doctors_admin_update" on public.doctors;
drop policy if exists "doctors_admin_delete" on public.doctors;
create policy "doctors_select_all"    on public.doctors  for select using (true);
create policy "doctors_admin_insert"  on public.doctors  for insert with check (public.is_admin());
create policy "doctors_admin_update"  on public.doctors  for update using (public.is_admin());
create policy "doctors_admin_delete"  on public.doctors  for delete using (public.is_admin());

-- appointments: patients see own, admins see all
drop policy if exists "appts_select" on public.appointments;
drop policy if exists "appts_insert" on public.appointments;
drop policy if exists "appts_update" on public.appointments;
create policy "appts_select"   on public.appointments for select using (patient_id = auth.uid() or public.is_admin());
create policy "appts_insert"   on public.appointments for insert with check (patient_id = auth.uid());
create policy "appts_update"   on public.appointments for update using (patient_id = auth.uid() or public.is_admin());

-- triage_logs: patients see own, admins see all
drop policy if exists "triage_select" on public.triage_logs;
drop policy if exists "triage_insert" on public.triage_logs;
create policy "triage_select"  on public.triage_logs  for select using (patient_id = auth.uid() or public.is_admin());
create policy "triage_insert"  on public.triage_logs  for insert with check (patient_id = auth.uid());

-- ================================================================
-- Seed: sample doctors
-- ================================================================
insert into public.doctors (full_name, specialty, available_days, bio) values
  ('Dr. Sarah Mitchell',   'Cardiology',       array['Monday','Wednesday','Friday'],      'Specialist in heart disease and hypertension.'),
  ('Dr. James Okafor',     'Neurology',        array['Tuesday','Thursday'],               'Expert in neurological disorders and strokes.'),
  ('Dr. Priya Sharma',     'Respiratory',      array['Monday','Tuesday','Wednesday'],     'Pulmonologist with focus on asthma and COPD.'),
  ('Dr. Ahmed Al-Rashid',  'Gastroenterology', array['Wednesday','Thursday','Friday'],    'Digestive health specialist.'),
  ('Dr. Emily Chen',       'General Practice', array['Monday','Tuesday','Wednesday','Thursday','Friday'], 'Primary care physician.'),
  ('Dr. Carlos Rivera',    'Dermatology',      array['Monday','Thursday'],                'Skin, hair, and nail disorders.'),
  ('Dr. Fatima Hassan',    'Infectious Disease', array['Tuesday','Friday'],               'Specialist in infectious and tropical diseases.'),
  ('Dr. Michael Thompson', 'Emergency',        array['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 'Emergency medicine specialist — 24/7 urgent care.'),
  ('Dr. Aisha Nwosu',      'Orthopedics',      array['Monday','Wednesday'],               'Bone and joint specialist.'),
  ('Dr. Liu Wei',          'Endocrinology',    array['Tuesday','Thursday','Friday'],      'Diabetes and hormonal disorder expert.')
on conflict do nothing;
