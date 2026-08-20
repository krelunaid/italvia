alter table live_sessions add column if not exists chat_enabled boolean not null default true;
