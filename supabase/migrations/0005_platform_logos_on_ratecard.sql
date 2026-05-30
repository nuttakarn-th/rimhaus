ALTER TABLE public.rate_card_settings
  ADD COLUMN IF NOT EXISTS platform_logos jsonb;
