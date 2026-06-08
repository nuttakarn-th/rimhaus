alter table public.rate_card_packages
  add column if not exists terms text;
