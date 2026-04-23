-- =========================================================================
-- Security hardening migration
--
-- What this does:
--   1. Enables pgcrypto (provides bcrypt-compatible crypt()/gen_salt('bf'))
--   2. Creates a single-row admin_auth table with a bcrypt password_hash
--   3. Migrates any existing plaintext settings.admin_password into it
--   4. Drops the plaintext admin_password column from settings
--   5. Enables RLS on all public tables
--   6. Grants anon/authenticated roles SELECT-only access on public data
--   7. Adds two server-only RPC helpers for password verify / update
--
-- After this migration:
--   - The anon key (shipped to the browser) can ONLY read public catalog data.
--   - It CANNOT read admin_auth, CANNOT insert/update/delete anything.
--   - All writes must go through /api/admin/* routes using the
--     SUPABASE_SERVICE_ROLE_KEY on the server.
-- =========================================================================

create extension if not exists pgcrypto;

-- -------------------------------------------------------------------------
-- 1. admin_auth: single-row table holding the bcrypt-hashed admin password
-- -------------------------------------------------------------------------
create table if not exists public.admin_auth (
  id integer primary key default 1,
  password_hash text not null,
  updated_at timestamptz not null default now(),
  constraint admin_auth_single_row check (id = 1)
);

-- -------------------------------------------------------------------------
-- 2. Migrate current plaintext password (if any) into admin_auth as bcrypt.
--    Fallback to the original default 'resale2026' if the settings row is
--    empty or the column no longer exists.
-- -------------------------------------------------------------------------
do $$
declare
  existing_password text := null;
  has_column boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'settings'
      and column_name = 'admin_password'
  ) into has_column;

  if has_column then
    execute 'select admin_password from public.settings where admin_password is not null and admin_password <> '''' limit 1'
      into existing_password;
  end if;

  if existing_password is null then
    existing_password := 'resale2026';
  end if;

  insert into public.admin_auth (id, password_hash)
  values (1, crypt(existing_password, gen_salt('bf', 10)))
  on conflict (id) do nothing;
end $$;

-- -------------------------------------------------------------------------
-- 3. Drop plaintext column so it can never be read by the browser again
-- -------------------------------------------------------------------------
alter table public.settings drop column if exists admin_password;

-- -------------------------------------------------------------------------
-- 4. Enable Row Level Security on every public table
-- -------------------------------------------------------------------------
alter table public.settings          enable row level security;
alter table public.contact_methods   enable row level security;
alter table public.items             enable row level security;
alter table public.bundles           enable row level security;
alter table public.admin_auth        enable row level security;

-- -------------------------------------------------------------------------
-- 5. Policies: anon + authenticated can SELECT public catalog data only.
--    No INSERT/UPDATE/DELETE policies -> writes are blocked for these roles.
--    admin_auth has NO policies -> completely invisible to anon.
--    The service_role key bypasses RLS, so server API routes still work.
-- -------------------------------------------------------------------------
drop policy if exists "Public read settings"         on public.settings;
drop policy if exists "Public read contact_methods"  on public.contact_methods;
drop policy if exists "Public read items"            on public.items;
drop policy if exists "Public read bundles"          on public.bundles;

create policy "Public read settings"
  on public.settings for select
  to anon, authenticated
  using (true);

create policy "Public read contact_methods"
  on public.contact_methods for select
  to anon, authenticated
  using (true);

create policy "Public read items"
  on public.items for select
  to anon, authenticated
  using (true);

create policy "Public read bundles"
  on public.bundles for select
  to anon, authenticated
  using (true);

-- -------------------------------------------------------------------------
-- 6. Server-only RPC helpers (service_role still bypasses RLS/grants,
--    but we REVOKE from anon/authenticated as defense in depth)
-- -------------------------------------------------------------------------
create or replace function public.verify_admin_password(input_password text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.admin_auth
    where id = 1
      and crypt(input_password, password_hash) = password_hash
  );
$$;

create or replace function public.set_admin_password(new_password text)
returns void
language plpgsql
as $$
declare
  new_hash text;
begin
  if new_password is null or length(new_password) < 6 then
    raise exception 'password too short';
  end if;

  new_hash := crypt(new_password, gen_salt('bf', 10));

  insert into public.admin_auth (id, password_hash)
  values (1, new_hash)
  on conflict (id) do update
    set password_hash = new_hash,
        updated_at   = now();
end;
$$;

revoke all on function public.verify_admin_password(text) from public;
revoke all on function public.verify_admin_password(text) from anon, authenticated;

revoke all on function public.set_admin_password(text) from public;
revoke all on function public.set_admin_password(text) from anon, authenticated;
