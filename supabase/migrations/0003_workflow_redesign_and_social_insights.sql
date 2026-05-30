-- ================================================================
-- 1. Drop old check constraints so we can migrate data freely
-- ================================================================
ALTER TABLE public.review_jobs DROP CONSTRAINT IF EXISTS review_jobs_status_check;
ALTER TABLE public.review_jobs DROP CONSTRAINT IF EXISTS review_jobs_deal_type_check;

-- ================================================================
-- 2. Migrate existing status values → new workflow statuses
-- ================================================================
UPDATE public.review_jobs SET status = 'approved'      WHERE status = 'accepted';
UPDATE public.review_jobs SET status = 'in_production' WHERE status = 'in_progress';
UPDATE public.review_jobs SET status = 'draft_sent'    WHERE status = 'content_done';
-- 'posted' and 'closed' keep the same value

-- ================================================================
-- 3. Migrate existing deal_type values → new deal types
-- ================================================================
UPDATE public.review_jobs SET deal_type = 'paid_keep'    WHERE deal_type = 'paid';
UPDATE public.review_jobs SET deal_type = 'barter'       WHERE deal_type = 'barter_inbound';
UPDATE public.review_jobs SET deal_type = 'gifted_self'  WHERE deal_type = 'barter_outbound';

-- ================================================================
-- 4. Add new check constraints with expanded value sets
-- ================================================================
ALTER TABLE public.review_jobs
  ADD CONSTRAINT review_jobs_status_check
  CHECK (status = ANY (ARRAY[
    'lead','contacted','quoted',
    'in_production','draft_sent','revision',
    'approved','scheduled','posted',
    'invoiced','paid','closed'
  ]));

ALTER TABLE public.review_jobs
  ADD CONSTRAINT review_jobs_deal_type_check
  CHECK (deal_type = ANY (ARRAY[
    'paid_keep','paid_return','barter','gifted_self','gifted_brand'
  ]));

-- ================================================================
-- 5. Update column defaults to match new values
-- ================================================================
ALTER TABLE public.review_jobs ALTER COLUMN status    SET DEFAULT 'lead';
ALTER TABLE public.review_jobs ALTER COLUMN deal_type SET DEFAULT 'paid_keep';

-- ================================================================
-- 6. Create social_tokens table (OAuth tokens for Instagram/Facebook)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.social_tokens (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform      text NOT NULL CHECK (platform IN ('instagram','facebook')),
  access_token  text NOT NULL,
  token_type    text NOT NULL DEFAULT 'long_lived',
  expires_at    timestamptz,
  page_id       text,
  page_name     text,
  ig_user_id    text,
  ig_username   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform)
);

ALTER TABLE public.social_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tokens"
  ON public.social_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- 7. Create social_insights table (cached metrics snapshots)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.social_insights (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform            text NOT NULL CHECK (platform IN ('instagram','facebook')),
  followers           integer,
  follows             integer,
  media_count         integer,
  avg_reach           numeric,
  avg_impressions     numeric,
  engagement_rate     numeric,
  profile_views       integer,
  website_clicks      integer,
  audience_gender_age jsonb,
  audience_city       jsonb,
  audience_country    jsonb,
  top_posts           jsonb,
  fetched_at          timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own insights"
  ON public.social_insights
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- 8. Add new columns to review_jobs for richer workflow tracking
-- ================================================================
ALTER TABLE public.review_jobs ADD COLUMN IF NOT EXISTS contact_channel text;
ALTER TABLE public.review_jobs ADD COLUMN IF NOT EXISTS contact_handle  text;
ALTER TABLE public.review_jobs ADD COLUMN IF NOT EXISTS quote_amount    numeric;
ALTER TABLE public.review_jobs ADD COLUMN IF NOT EXISTS scheduled_date  date;
ALTER TABLE public.review_jobs ADD COLUMN IF NOT EXISTS invoice_date    date;
