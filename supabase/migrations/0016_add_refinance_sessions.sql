create table if not exists public.refinance_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'ไม่มีชื่อ',
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists refinance_sessions_user_id_idx on public.refinance_sessions(user_id);

alter table public.refinance_sessions enable row level security;

create policy "users can manage own refinance sessions"
  on public.refinance_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.update_refinance_session_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger refinance_sessions_updated_at
  before update on public.refinance_sessions
  for each row execute function public.update_refinance_session_updated_at();
