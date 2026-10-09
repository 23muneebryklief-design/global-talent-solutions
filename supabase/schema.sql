create extension if not exists pgcrypto;
create table if not exists public.enquiries (
 id uuid primary key default gen_random_uuid(), reference text not null unique,
 name text not null check(char_length(name) between 2 and 100), email text not null,
 phone text, company text, service text not null,
 message text not null check(char_length(message) between 10 and 4000),
 status text not null default 'new' check(status in('new','in_progress','closed')),
 notes text not null default '', notification_status text not null default 'pending',
 notification_id text, notification_error text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists enquiries_created_at_idx on public.enquiries(created_at desc);
create index if not exists enquiries_status_idx on public.enquiries(status);
alter table public.enquiries enable row level security;
revoke all on table public.enquiries from anon, authenticated;
