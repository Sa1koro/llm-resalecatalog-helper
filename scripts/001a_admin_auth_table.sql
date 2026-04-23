-- Step 1: create pgcrypto + admin_auth table, migrate plaintext password,
-- then drop the plaintext column from settings.

create extension if not exists pgcrypto;

create table if not exists public.admin_auth (
  id integer primary key default 1,
  password_hash text not null,
  updated_at timestamptz not null default now(),
  constraint admin_auth_single_row check (id = 1)
);

do $$
declare
  existing_password text := null;
  has_column boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'settings'
      and column_name  = 'admin_password'
  ) into has_column;

  if has_column then
    execute 'select admin_password
             from public.settings
             where admin_password is not null and admin_password <> '''' 
             limit 1'
      into existing_password;
  end if;

  if existing_password is null or existing_password = '' then
    existing_password := 'resale2026';
  end if;

  insert into public.admin_auth (id, password_hash)
  values (1, crypt(existing_password, gen_salt('bf', 10)))
  on conflict (id) do nothing;
end $$;

alter table public.settings drop column if exists admin_password;
