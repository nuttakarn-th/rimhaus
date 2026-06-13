create table public.pitch_scripts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  content     text not null,
  category    text not null default 'general'
              check (category in ('cold_outreach','follow_up','barter','collab','general')),
  customer_id uuid references public.customers(id) on delete set null,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.pitch_scripts enable row level security;

create policy "pitch_scripts_owner" on public.pitch_scripts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index idx_pitch_scripts_user on public.pitch_scripts(user_id);

create trigger on_pitch_scripts_updated
  before update on public.pitch_scripts
  for each row execute procedure public.handle_updated_at();
