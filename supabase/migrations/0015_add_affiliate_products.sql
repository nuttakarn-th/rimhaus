CREATE TABLE IF NOT EXISTS public.affiliate_products (
  id                 uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id            uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  zone               text NOT NULL CHECK (zone IN ('living_room','kitchen','bathroom','miscellaneous','appliances','garden','workspace','wall_shelf')),
  zone_label         text NOT NULL,
  name               text NOT NULL,
  shopee_url         text,
  lazada_url         text,
  last_scheduled_at  timestamptz,
  scheduled_count    integer DEFAULT 0 NOT NULL,
  is_active          boolean DEFAULT true NOT NULL,
  created_at         timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own affiliate products"
  ON public.affiliate_products
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS affiliate_products_user_zone_idx
  ON public.affiliate_products (user_id, zone);

CREATE INDEX IF NOT EXISTS affiliate_products_last_scheduled_idx
  ON public.affiliate_products (user_id, last_scheduled_at NULLS FIRST);
