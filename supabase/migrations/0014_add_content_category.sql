ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS content_category text
  CHECK (content_category IN (
    'review', 'repurpose', 'affiliate', 'everyday_pick',
    'inspire', 'before_after', 'diy', 'seasonal_sell',
    'haul', 'followup', 'trend', 'connect'
  ));
