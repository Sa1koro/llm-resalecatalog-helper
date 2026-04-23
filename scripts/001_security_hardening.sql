-- =============================================================
-- ResaleBox security hardening (idempotent, safe to re-run)
-- =============================================================
-- What this script does:
--   1. Enable the pgcrypto extension (for bcrypt via crypt()).
--   2. Create a dedicated `admin_auth` table holding a bcrypt
--      password hash. One row, id = 1.
--   3. If the old plaintext `settings.admin_password` column
--      still exists, migrate its value into admin_auth as a
--      bcrypt hash, then DROP the column. If no plaintext value
--      is available, seed with the default 'resale2026'.
--   4. Enable Row Level Security on all public tables.
--   5. Add SELECT-only policies for anon / authenticated so the
--      storefront can still read the catalog with the anon key,
--      but CANNOT insert/update/delete anything. All writes
--      must now go through the service-role key on the server.
--   6. Provide two SECURITY DEFINER RPCs
--      (verify_admin_password, set_admin_password) and revoke
--      their EXECUTE privilege from anon/authenticated so only
--      the service role can call them.
-- =============================================================

-- 1. pgcrypto
create extension if not exists pgcrypto;

-- 2. admin_auth table ----------------------------------------------------
create table if not exists public.admin_auth (
  id           integer primary key check (id = 1),
  password_hash text not null,
  updated_at    timestamptz not null default now()
);

-- 3. Migrate any existing plaintext password and drop the column ---------
do $$
declare
  has_col   boolean;
  old_pw    text;
begin
  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'settings'
      and column_name  = 'admin_password'
  ) into has_col;

  if has_col then
    execute 'select admin_password from public.settings limit 1' into old_pw;
  end if;

  -- If admin_auth is empty, seed it
  if not exists (select 1 from public.admin_auth where id = 1) then
    insert into public.admin_auth (id, password_hash)
    values (1, crypt(coalesce(nullif(old_pw, ''), 'resale2026'), gen_salt('bf', 10)));
  end if;

  -- Drop the plaintext column if it still exists
  if has_col then
    execute 'alter table public.settings drop column admin_password';
  end if;
end $$;

-- 4. Enable RLS on all public tables -------------------------------------
alter table public.settings         enable row level security;
alter table public.contact_methods  enable row level security;
alter table public.items            enable row level security;
alter table public.bundles          enable row level security;
alter table public.admin_auth       enable row level security;

-- 5. Public-read policies (drop & recreate so the script is idempotent) --
drop policy if exists "public_read_settings"        on public.settings;
drop policy if exists "public_read_contact_methods" on public.contact_methods;
drop policy if exists "public_read_items"           on public.items;
drop policy if exists "public_read_bundles"         on public.bundles;

create policy "public_read_settings"
  on public.settings for select
  to anon, authenticated
  using (true);

create policy "public_read_contact_methods"
  on public.contact_methods for select
  to anon, authenticated
  using (true);

create policy "public_read_items"
  on public.items for select
  to anon, authenticated
  using (true);

create policy "public_read_bundles"
  on public.bundles for select
  to anon, authenticated
  using (true);

-- Note: admin_auth has RLS ON and NO policies -> anon/authenticated
-- cannot access it at all. The service role bypasses RLS, so the
-- server can still read/write it.

-- 6. RPC helpers for password verification/rotation ----------------------
create or replace function public.verify_admin_password(pw text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_auth
    where id = 1
      and password_hash = crypt(pw, password_hash)
  );
$$;

create or replace function public.set_admin_password(pw text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.admin_auth (id, password_hash, updated_at)
  values (1, crypt(pw, gen_salt('bf', 10)), now())
  on conflict (id) do update
    set password_hash = excluded.password_hash,
        updated_at    = now();
$$;

-- Lock down execution: only service role can call these
revoke all on function public.verify_admin_password(text) from public;
revoke all on function public.set_admin_password(text)    from public;
revoke execute on function public.verify_admin_password(text) from anon, authenticated;
revoke execute on function public.set_admin_password(text)    from anon, authenticated;
grant  execute on function public.verify_admin_password(text) to service_role;
grant  execute on function public.set_admin_password(text)    to service_role;
