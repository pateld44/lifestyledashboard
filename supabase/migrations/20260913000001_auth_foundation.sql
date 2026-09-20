-- Phase 1: auth foundation — profiles + invite allowlist

create table if not exists allowed_emails (
  email text primary key,
  invited_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "select own profile" on profiles
  for select using (auth.uid() = id);

create policy "update own profile" on profiles
  for update using (auth.uid() = id);

-- Reject signup for any email not present in allowed_emails.
create or replace function public.enforce_allowed_email()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  if not exists (select 1 from allowed_emails where email = new.email) then
    raise exception 'signup not allowed for this email';
  end if;
  return new;
end;
$$;

drop trigger if exists before_user_created on auth.users;
create trigger before_user_created
  before insert on auth.users
  for each row execute procedure public.enforce_allowed_email();

-- Auto-create a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
