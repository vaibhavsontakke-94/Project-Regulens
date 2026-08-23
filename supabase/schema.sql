-- Synora chat history and user profiles — scoped by Firebase uid (user_id).
--
-- The app only ever talks to Supabase through the server layer: the server
-- verifies the Firebase ID token, extracts the uid, and sends it as the
-- user_id/id column. The client never supplies user_id.
--
-- The server authenticates with the Supabase key stored in the server-side
-- env var SUPABASE_SERVICE_ROLE_KEY (never exposed to the browser). RLS is
-- enabled and the tables carry permissive policies for anon/authenticated so
-- the calls work whether that env var holds a publishable or a secret key.
-- Access control therefore happens at the server layer (verified Firebase
-- uid), not in the database. If you later switch to a secret key, the
-- policies below are redundant but harmless.

create extension if not exists pgcrypto;

create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null default 'New conversation',
  messages jsonb not null default '[]'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chat_history_user_idx on public.chat_history (user_id);
create index if not exists chat_history_user_updated_idx on public.chat_history (user_id, updated_at desc);

alter table public.chat_history enable row level security;

grant all on table public.chat_history to anon, authenticated;

create policy "app access chat_history" on public.chat_history
  for all to anon, authenticated using (true) with check (true);

-- User profiles + settings (id = the Firebase uid from a verified ID token).
-- Replaces the old local data/users.json store so accounts persist on
-- serverless hosts (Netlify) where the filesystem is read-only.
create table if not exists public.profiles (
  id text primary key,
  email text not null default '',
  name text not null default '',
  photo_url text not null default '',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);

alter table public.profiles enable row level security;

grant all on table public.profiles to anon, authenticated;

create policy "app access profiles" on public.profiles
  for all to anon, authenticated using (true) with check (true);
