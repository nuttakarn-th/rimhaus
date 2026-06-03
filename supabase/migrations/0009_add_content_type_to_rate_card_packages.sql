alter table public.rate_card_packages
  add column if not exists content_type text check (content_type in ('video', 'photo'));
