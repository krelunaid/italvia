create table if not exists property_valuations (
  property_id text primary key,
  show_to_buyer boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into property_valuations (property_id, show_to_buyer) values
  ('scalea', true),
  ('catania', true),
  ('ostuni', true),
  ('scanno', true),
  ('tropea', false),
  ('viareggio', false),
  ('sirmione', false),
  ('levanto', false)
on conflict (property_id) do nothing;
