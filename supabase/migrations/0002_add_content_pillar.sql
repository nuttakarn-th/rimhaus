-- Add content_pillar to content_items for tracking which content pillar each piece belongs to
alter table public.content_items
  add column if not exists content_pillar text
  check (content_pillar in ('room_corner', 'product_review', 'organization_tips', 'home_humor'));
