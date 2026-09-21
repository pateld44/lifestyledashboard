-- Phase 6: open access via Supabase anonymous auth (no login screen), and a
-- per-user To-Do calendar table to replace the earlier localStorage-only
-- version now that every visitor has a real (possibly anonymous) user_id.

-- ---------------------------------------------------------------------------
-- Allow anonymous sign-ins to bypass the invite allowlist. Anonymous users
-- have no email, so the old check (`email = new.email`) always failed for
-- them and blocked every anonymous signup with "signup not allowed for this
-- email" -- exempt is_anonymous rows instead.
--
-- Requires "Allow anonymous sign-ins" to ALSO be enabled in the Supabase
-- dashboard (Authentication -> Sign In / Providers -> Anonymous). This
-- migration alone does not turn that feature on.
-- ---------------------------------------------------------------------------

create or replace function public.enforce_allowed_email()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  if new.is_anonymous then
    return new;
  end if;

  if not exists (select 1 from allowed_emails where email = new.email) then
    raise exception 'signup not allowed for this email';
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- To-Do calendar: one row per item, scoped to its owner only. Unlike
-- habits/vitals this is never shared with other users -- there's no reason
-- another visitor needs to see someone else's to-do list, and there's no
-- curated invite group to share it with anymore in open/anonymous mode.
-- ---------------------------------------------------------------------------

create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  text text not null check (char_length(text) between 1 and 200),
  done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table todos enable row level security;

create policy "manage own todos" on todos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- See 20260920000001_grant_authenticated_table_access.sql -- RLS alone is
-- not sufficient, the base table grant is required too or every operation
-- fails with "permission denied" before RLS is ever evaluated.
grant select, insert, update, delete on todos to authenticated;
