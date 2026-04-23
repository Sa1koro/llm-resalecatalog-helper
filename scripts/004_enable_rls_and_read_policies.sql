-- Enable RLS for all public tables used by the app.
alter table public.items enable row level security;
alter table public.bundles enable row level security;
alter table public.contact_methods enable row level security;
alter table public.settings enable row level security;

-- Clean up previously created read policies if they exist.
drop policy if exists "anon_select_items" on public.items;
drop policy if exists "anon_select_bundles" on public.bundles;
drop policy if exists "anon_select_contact_methods" on public.contact_methods;
drop policy if exists "anon_select_settings" on public.settings;

-- Public storefront remains readable with anon key.
create policy "anon_select_items"
on public.items
for select
to anon
using (true);

create policy "anon_select_bundles"
on public.bundles
for select
to anon
using (true);

create policy "anon_select_contact_methods"
on public.contact_methods
for select
to anon
using (true);

create policy "anon_select_settings"
on public.settings
for select
to anon
using (true);

-- Remove any temporary anon write policies if they were used earlier.
drop policy if exists "temp_anon_insert_items" on public.items;
drop policy if exists "temp_anon_update_items" on public.items;
drop policy if exists "temp_anon_delete_items" on public.items;

drop policy if exists "temp_anon_insert_bundles" on public.bundles;
drop policy if exists "temp_anon_update_bundles" on public.bundles;
drop policy if exists "temp_anon_delete_bundles" on public.bundles;

drop policy if exists "temp_anon_insert_contact_methods" on public.contact_methods;
drop policy if exists "temp_anon_update_contact_methods" on public.contact_methods;
drop policy if exists "temp_anon_delete_contact_methods" on public.contact_methods;

drop policy if exists "temp_anon_insert_settings" on public.settings;
drop policy if exists "temp_anon_update_settings" on public.settings;
drop policy if exists "temp_anon_delete_settings" on public.settings;
