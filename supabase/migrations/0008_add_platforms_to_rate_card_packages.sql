alter table public.rate_card_packages
  add column if not exists platforms text[] not null default '{}';
