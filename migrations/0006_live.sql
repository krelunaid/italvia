-- Live dal terrazzo: invito a tutti o a contatti scelti, chat opzionale, sussurri privati.

create table if not exists live_sessions (
  id text primary key,
  property_id text not null,
  agent_id text not null,
  mode text not null,
  status text not null default 'live',
  spot_id text not null default 'terrace',
  chat_enabled boolean not null default true,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  headline_pl text,
  headline_it text
);
create index if not exists live_sessions_status_idx on live_sessions (status, started_at desc);

create table if not exists live_guests (
  id text primary key,
  session_id text not null,
  guest_key text not null,
  user_id text,
  display_name text not null,
  city text,
  status text not null default 'notified',
  is_simulated boolean not null default false,
  notified_at timestamptz not null default now(),
  joined_at timestamptz,
  unique (session_id, guest_key)
);
create index if not exists live_guests_session_idx on live_guests (session_id, status);

create table if not exists live_whispers (
  id text primary key,
  session_id text not null,
  guest_key text not null,
  from_role text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists live_whispers_thread_idx on live_whispers (session_id, guest_key, created_at);
