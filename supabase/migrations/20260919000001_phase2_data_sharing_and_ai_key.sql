-- Phase 2: dated history for habits/vitals/finance, cross-user visibility for
-- habits & vitals only (never finance), profile pictures, and encrypted
-- per-user Anthropic API key storage via Supabase Vault.

-- ---------------------------------------------------------------------------
-- Profiles: avatar + Anthropic key reference, visible to any invited user
-- ---------------------------------------------------------------------------

alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists anthropic_key_secret_id uuid;

-- Habits/vitals are meant to be visible across the invite-only user base
-- (see "connect with other users"), so any signed-in user needs to be able
-- to read basic profile info (name + avatar) for everyone, not just themselves.
drop policy if exists "select own profile" on profiles;
create policy "select any profile" on profiles
  for select using (true);

-- ---------------------------------------------------------------------------
-- Habits + daily completion history (shared/visible)
-- ---------------------------------------------------------------------------

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

alter table habits enable row level security;

create policy "select any habit" on habits
  for select using (true);

create policy "manage own habits" on habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  done boolean not null default true,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

alter table habit_logs enable row level security;

create policy "select any habit log" on habit_logs
  for select using (true);

create policy "manage own habit logs" on habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Vitals, one row per user per day (shared/visible)
-- ---------------------------------------------------------------------------

create table if not exists vitals_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  sleep_hours numeric,
  water_glasses integer,
  steps integer,
  worked_out boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, log_date)
);

alter table vitals_logs enable row level security;

create policy "select any vitals" on vitals_logs
  for select using (true);

create policy "manage own vitals" on vitals_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Budgets + expenses — strictly private, never visible to other users
-- ---------------------------------------------------------------------------

create table if not exists budgets (
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null, -- first day of the month this budget applies to
  monthly_budget numeric not null default 0,
  primary key (user_id, month)
);

alter table budgets enable row level security;

create policy "manage own budgets" on budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  label text not null,
  amount numeric not null,
  category text not null default 'general',
  created_at timestamptz not null default now()
);

alter table expenses enable row level security;

create policy "manage own expenses" on expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Profile pictures: public storage bucket, folder-scoped write access
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar images are publicly accessible" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "users can upload their own avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can update their own avatar" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can delete their own avatar" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Per-user Anthropic API key, encrypted via Supabase Vault.
-- The plaintext key is only ever readable by service_role (used exclusively
-- by the quick-entry Edge Function), never by the authenticated/anon roles
-- the browser uses — satisfying "never sent to or stored in the browser
-- after initial entry."
-- ---------------------------------------------------------------------------

create or replace function public.set_my_anthropic_key(new_key text)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  existing_id uuid;
begin
  select anthropic_key_secret_id into existing_id from profiles where id = auth.uid();

  if existing_id is not null then
    perform vault.update_secret(existing_id, new_key);
  else
    update profiles
      set anthropic_key_secret_id = vault.create_secret(new_key, 'anthropic_key_' || auth.uid()::text)
      where id = auth.uid();
  end if;
end;
$$;

revoke all on function public.set_my_anthropic_key(text) from public;
grant execute on function public.set_my_anthropic_key(text) to authenticated;

create or replace function public.has_anthropic_key()
returns boolean
language sql
security definer
set search_path = public
as $$
  select anthropic_key_secret_id is not null from profiles where id = auth.uid();
$$;

revoke all on function public.has_anthropic_key() from public;
grant execute on function public.has_anthropic_key() to authenticated;

create or replace function public.clear_my_anthropic_key()
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  existing_id uuid;
begin
  select anthropic_key_secret_id into existing_id from profiles where id = auth.uid();

  if existing_id is not null then
    perform vault.delete_secret(existing_id);
    update profiles set anthropic_key_secret_id = null where id = auth.uid();
  end if;
end;
$$;

revoke all on function public.clear_my_anthropic_key() from public;
grant execute on function public.clear_my_anthropic_key() to authenticated;

-- Service-role only — called from the quick-entry Edge Function, never from the browser.
create or replace function public.get_decrypted_anthropic_key(target_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  secret_id uuid;
  decrypted text;
begin
  select anthropic_key_secret_id into secret_id from profiles where id = target_user_id;
  if secret_id is null then
    return null;
  end if;

  select decrypted_secret into decrypted from vault.decrypted_secrets where id = secret_id;
  return decrypted;
end;
$$;

revoke all on function public.get_decrypted_anthropic_key(uuid) from public, authenticated, anon;
grant execute on function public.get_decrypted_anthropic_key(uuid) to service_role;
