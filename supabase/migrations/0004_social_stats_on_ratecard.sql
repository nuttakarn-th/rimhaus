ALTER TABLE public.rate_card_settings
  ADD COLUMN IF NOT EXISTS social_stats jsonb;
