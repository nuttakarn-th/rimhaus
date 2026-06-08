alter table public.rate_card_settings
  add column if not exists show_calculator boolean not null default true;
