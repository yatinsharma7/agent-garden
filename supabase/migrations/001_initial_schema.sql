-- Agent Garden: Initial Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── TEAMS ──
create table public.teams (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  field       text not null default 'General',
  color       text not null default '#4ade80',
  created_at  timestamptz not null default now()
);

-- ── AGENTS ──
create type agent_role as enum (
  'Engineer',
  'Data Engineer',
  'Architect',
  'Lead',
  'DevOps Engineer',
  'ML Engineer',
  'Backend Engineer',
  'Frontend Engineer',
  'Security Engineer',
  'Data Scientist',
  'Analytics Engineer'
);

create type agent_status as enum ('idle', 'thinking', 'done', 'error');

create table public.agents (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  role        agent_role not null,
  team_id     uuid not null references public.teams(id) on delete cascade,
  specialty   text,
  status      agent_status not null default 'idle',
  created_at  timestamptz not null default now()
);

-- ── MESSAGES ──
create type message_role as enum ('user', 'assistant', 'system');

create table public.messages (
  id          uuid primary key default uuid_generate_v4(),
  agent_id    uuid not null references public.agents(id) on delete cascade,
  role        message_role not null,
  content     text not null,
  created_at  timestamptz not null default now()
);

-- ── INDEXES ──
create index on public.agents(team_id);
create index on public.messages(agent_id, created_at);

-- ── ROW LEVEL SECURITY ──
-- Enable RLS (tighten per your auth strategy)
alter table public.teams   enable row level security;
alter table public.agents  enable row level security;
alter table public.messages enable row level security;

-- Allow full access via service role key (used by backend)
-- The frontend uses the anon key; lock this down once you add auth
create policy "service_role_all" on public.teams    for all using (true);
create policy "service_role_all" on public.agents   for all using (true);
create policy "service_role_all" on public.messages for all using (true);

-- ── SEED DATA (optional) ──
insert into public.teams (name, field, color) values
  ('Platform Engineering', 'Infrastructure', '#4ade80'),
  ('Data & Analytics',     'Data',           '#f59e0b'),
  ('Solutions Architecture','Architecture',  '#c084fc');
