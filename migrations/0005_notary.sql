alter table offers add column if not exists requested_deposit_eur integer;
alter table offers add column if not exists requested_deed_by date;
alter table offers add column if not exists signature_hash text;
alter table offers add column if not exists identity_ok boolean not null default false;
