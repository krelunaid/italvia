create table if not exists profiles (
  user_id text primary key,
  role text not null default 'buyer',
  display_name text,
  purpose text,
  budget_eur integer,
  cash_available_eur integer,
  financing text,
  setting text,
  condition text,
  preferred_airport text,
  polish_city text,
  visit_periods text,
  rental_interest text,
  min_rooms integer,
  wants_terrace boolean not null default false,
  sea_max_km numeric,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists favorites (
  user_id text not null,
  property_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);
create index if not exists favorites_user_idx on favorites (user_id);

create table if not exists compare_items (
  user_id text not null,
  property_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

create table if not exists conversations (
  id text primary key,
  user_id text not null,
  property_id text,
  title text,
  last_at timestamptz not null default now()
);
create index if not exists conversations_user_idx on conversations (user_id);

create table if not exists messages (
  id text primary key,
  conversation_id text not null,
  user_id text not null,
  sender_role text not null,
  body_original text not null,
  body_translated text,
  original_lang text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists messages_conv_idx on messages (conversation_id, created_at);

create table if not exists documents (
  id text primary key,
  user_id text not null,
  property_id text,
  title text not null,
  kind text not null,
  lang text not null default 'it',
  translation_kind text not null default 'original',
  locked boolean not null default false,
  summary text,
  created_at timestamptz not null default now()
);
create index if not exists documents_user_idx on documents (user_id);

create table if not exists journey_steps (
  user_id text not null,
  step_id text not null,
  status text not null default 'pending',
  actor text,
  note_pl text,
  note_it text,
  due_label text,
  updated_at timestamptz not null default now(),
  primary key (user_id, step_id)
);

create table if not exists video_visits (
  id text primary key,
  user_id text not null,
  property_id text not null,
  scheduled_at timestamptz not null,
  status text not null default 'requested',
  questions text,
  summary_pl text,
  unanswered text,
  created_at timestamptz not null default now()
);
create index if not exists video_visits_user_idx on video_visits (user_id);

create table if not exists visit_trips (
  id text primary key,
  user_id text not null,
  date_label text not null,
  meeting_point text,
  property_ids text not null,
  created_at timestamptz not null default now()
);

create table if not exists check_overrides (
  property_id text not null,
  check_key text not null,
  status text not null,
  professional_name text,
  professional_role text,
  verified_on text,
  note_it text,
  updated_by text,
  updated_at timestamptz not null default now(),
  primary key (property_id, check_key)
);

create table if not exists service_requests (
  id text primary key,
  user_id text not null,
  kind text not null,
  status text not null default 'open',
  note text,
  created_at timestamptz not null default now()
);

create table if not exists activity_log (
  id text primary key,
  user_id text not null,
  action text not null,
  meta text,
  created_at timestamptz not null default now()
);
create index if not exists activity_user_idx on activity_log (user_id, created_at desc);

create table if not exists leads (
  id text primary key,
  user_id text,
  name text not null,
  polish_city text,
  purpose text,
  budget_eur integer,
  setting text,
  stage text not null default 'new',
  last_touch text,
  notes text,
  is_seed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists property_copy (
  property_id text primary key,
  title_pl text,
  body_pl text,
  facebook_it text,
  instagram_it text,
  approved boolean not null default false,
  updated_at timestamptz not null default now()
);
