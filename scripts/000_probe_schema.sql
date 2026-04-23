-- Inspect existing schema before migration
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;

select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in ('settings','items','bundles','contact_methods','admin_auth')
order by table_name, ordinal_position;

select extname from pg_extension where extname in ('pgcrypto','citext');
