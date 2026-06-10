create table if not exists public.gallery_albums (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  cover_image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.gallery_items
  add column if not exists album_id uuid references public.gallery_albums(id) on delete set null;

alter table public.gallery_albums enable row level security;

create policy "Users can manage their own albums"
  on public.gallery_albums for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
