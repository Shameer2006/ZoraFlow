-- ============================================================
-- ZoraFlow Supabase Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────
-- TABLE: users
-- Mirrors Supabase Auth users. Stores credits + plan.
-- ─────────────────────────────────────────────────
create table if not exists public.users (
  id              bigserial primary key,
  user_id         text unique not null,        -- Supabase Auth UUID (auth.users.id)
  email           text,
  credits         int not null default 5,      -- Start with 5 free credits
  plan            text not null default 'free', -- 'free' | 'starter' | 'pro'
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Auto-create user row on first sign-up (via Supabase Auth trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (user_id, email, credits, plan)
  values (new.id::text, new.email, 5, 'free')
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────
-- TABLE: sessions
-- Stores each PRD generation as a resumable session.
-- ─────────────────────────────────────────────────
create table if not exists public.sessions (
  id            bigserial primary key,
  session_id    text unique not null default gen_random_uuid()::text,
  user_id       text not null references public.users(user_id) on delete cascade,
  title         text,                           -- First 60 chars of the prompt
  prd_markdown  text,                           -- The full generated PRD
  messages      jsonb not null default '[]',    -- [{role, content}, ...]
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists sessions_user_id_idx on public.sessions(user_id);
create index if not exists sessions_created_at_idx on public.sessions(created_at desc);

-- ─────────────────────────────────────────────────
-- TABLE: credit_transactions
-- Audit log of every credit change.
-- ─────────────────────────────────────────────────
create table if not exists public.credit_transactions (
  id               bigserial primary key,
  user_id          text not null references public.users(user_id) on delete cascade,
  amount           int not null,                 -- negative = deduct, positive = add
  transaction_type text not null,               -- 'deduct' | 'add' | 'reset'
  reason           text,
  created_at       timestamptz default now()
);

create index if not exists credit_tx_user_id_idx on public.credit_transactions(user_id);

-- ─────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────

-- users: each user can only read/update their own row
alter table public.users enable row level security;

create policy "Users can read own profile"
  on public.users for select
  using (user_id = auth.uid()::text);

create policy "Users can update own profile"
  on public.users for update
  using (user_id = auth.uid()::text);

-- sessions: each user can only access their own sessions
alter table public.sessions enable row level security;

create policy "Users can read own sessions"
  on public.sessions for select
  using (user_id = auth.uid()::text);

create policy "Users can insert own sessions"
  on public.sessions for insert
  with check (user_id = auth.uid()::text);

create policy "Users can update own sessions"
  on public.sessions for update
  using (user_id = auth.uid()::text);

create policy "Users can delete own sessions"
  on public.sessions for delete
  using (user_id = auth.uid()::text);

-- credit_transactions: users can only read their own transactions
alter table public.credit_transactions enable row level security;

create policy "Users can read own transactions"
  on public.credit_transactions for select
  using (user_id = auth.uid()::text);

-- ─────────────────────────────────────────────────
-- SERVICE ROLE BYPASS NOTE:
-- The server-side API uses SUPABASE_SERVICE_ROLE_KEY
-- which bypasses all RLS automatically.
-- ─────────────────────────────────────────────────
