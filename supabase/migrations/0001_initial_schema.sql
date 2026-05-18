-- =====================================================
-- RIMHAUS DATABASE SCHEMA
-- =====================================================

-- =====================================================
-- PLATFORMS (ขยายได้ ไม่ hardcode)
-- =====================================================
create table public.platforms (
  id          text primary key,
  label       text not null,
  color       text not null default '#6b7280',
  icon_name   text not null default 'globe',
  is_active   boolean not null default true,
  sort_order  integer not null default 0
);

-- Seed platforms (ขยายได้เพิ่มในอนาคต)
insert into public.platforms (id, label, color, icon_name, sort_order) values
  ('facebook',  'Facebook',  '#1877F2', 'facebook',  1),
  ('instagram', 'Instagram', '#E1306C', 'instagram', 2),
  ('tiktok',    'TikTok',    '#000000', 'music-2',   3),
  ('youtube',   'YouTube',   '#FF0000', 'youtube',   4),
  ('lemon8',    'Lemon8',    '#FFD700', 'citrus',    5),
  ('shopee',    'Shopee',    '#EE4D2D', 'shopping-bag', 6);

-- =====================================================
-- REVIEW JOBS (งานรีวิว)
-- =====================================================
create table public.review_jobs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  brand_name       text not null,
  product_name     text not null,
  product_category text,
  review_type      text not null check (review_type in ('short_video', 'photo', 'long_video')),
  platforms        text[] not null default '{}',
  deadline         date,
  post_date        date,
  payment_amount   numeric(12, 2) not null default 0,
  payment_status   text not null default 'pending' check (payment_status in ('pending', 'invoiced', 'received')),
  status           text not null default 'accepted' check (status in ('accepted', 'in_progress', 'content_done', 'posted', 'closed')),
  notes            text,
  product_received boolean not null default false,
  product_value    numeric(12, 2),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- =====================================================
-- TRANSACTIONS (การเงิน)
-- =====================================================
create table public.transactions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  review_job_id    uuid references public.review_jobs(id) on delete set null,
  type             text not null check (type in ('income', 'expense')),
  amount           numeric(12, 2) not null,
  category         text,
  description      text,
  transaction_date date not null default current_date,
  payment_method   text,
  slip_url         text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- =====================================================
-- CONTENT ITEMS (วางแผนคอนเทนต์)
-- =====================================================
create table public.content_items (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  review_job_id    uuid references public.review_jobs(id) on delete set null,
  title            text not null,
  description      text,
  content_type     text not null check (content_type in ('short_video', 'photo', 'long_video', 'story', 'reel', 'blog')),
  platforms        text[] not null default '{}',
  planned_date     date,
  shoot_date       date,
  idea_notes       text,
  script           text,
  hashtags         text,
  status           text not null default 'idea' check (status in ('idea', 'scripting', 'shooting', 'editing', 'ready', 'posted', 'cancelled')),
  is_sponsored     boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- =====================================================
-- SOCIAL POSTS (จัดการโพส)
-- =====================================================
create table public.social_posts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  review_job_id    uuid references public.review_jobs(id) on delete set null,
  content_item_id  uuid references public.content_items(id) on delete set null,
  platform         text not null,
  post_title       text not null,
  post_url         text,
  caption          text,
  hashtags         text,
  post_date        timestamptz,
  status           text not null default 'draft' check (status in ('draft', 'scheduled', 'posted', 'archived')),
  views            integer,
  likes            integer,
  comments         integer,
  shares           integer,
  saves            integer,
  reach            integer,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
alter table public.review_jobs   enable row level security;
alter table public.transactions  enable row level security;
alter table public.content_items enable row level security;
alter table public.social_posts  enable row level security;

-- platforms table is public read (no RLS needed)

create policy "review_jobs_owner" on public.review_jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transactions_owner" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "content_items_owner" on public.content_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "social_posts_owner" on public.social_posts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =====================================================
-- AUTO-UPDATE updated_at
-- =====================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_review_jobs_updated
  before update on public.review_jobs
  for each row execute procedure public.handle_updated_at();

create trigger on_transactions_updated
  before update on public.transactions
  for each row execute procedure public.handle_updated_at();

create trigger on_content_items_updated
  before update on public.content_items
  for each row execute procedure public.handle_updated_at();

create trigger on_social_posts_updated
  before update on public.social_posts
  for each row execute procedure public.handle_updated_at();

-- =====================================================
-- INDEXES
-- =====================================================
create index idx_review_jobs_user_status on public.review_jobs(user_id, status);
create index idx_review_jobs_deadline    on public.review_jobs(deadline);
create index idx_transactions_user_type  on public.transactions(user_id, type);
create index idx_transactions_date       on public.transactions(transaction_date);
create index idx_content_items_planned   on public.content_items(user_id, planned_date);
create index idx_social_posts_platform   on public.social_posts(user_id, platform);
create index idx_social_posts_date       on public.social_posts(post_date);
