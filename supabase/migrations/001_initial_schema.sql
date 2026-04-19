-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- BRANDS
-- ─────────────────────────────────────────────
create table public.brands (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text not null,
  status text not null default 'draft', -- draft | active | paused
  logo_url text,
  logo_drive_file_id text,
  -- Shopify
  shopify_store_domain text,
  shopify_access_token text,
  -- Gemini
  gemini_api_key text,
  gemini_caption_model text default 'gemini-2.0-flash',
  gemini_image_model text default 'gemini-2.0-flash-exp',
  -- Zernio
  zernio_api_key text,
  zernio_account_id text,
  -- Config
  excluded_product_types text[] default array['hoodie','sweatshirt'],
  fixed_hashtags text[] default array['#sheeen','#sheeenstore','#streetwear','#ootd','#fashion','#outfitinspo','#style'],
  caption_prompt text default 'Write a bold 3-sentence Instagram caption for a fashion product. Include emojis, a strong CTA, and close with the brand hashtags. Keep the tone confident and aspirational.',
  image_prompt text default 'Edit this product image into a premium fashion advertisement. Keep the original product unchanged without distortion. Place the brand logo at the top-right corner (6-8% of image width, 3-4% padding from edges). Apply cinematic lighting with realistic shadows. Output as a 1:1 square Instagram-ready image.',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, slug)
);

-- ─────────────────────────────────────────────
-- SCHEDULES
-- ─────────────────────────────────────────────
create table public.schedules (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references public.brands(id) on delete cascade not null unique,
  days_of_week int[] default array[0,1,2,4], -- 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  post_time text default '08:00',
  timezone text default 'UTC',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- POSTS
-- ─────────────────────────────────────────────
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references public.brands(id) on delete cascade not null,
  -- Product info
  product_id text,
  product_title text,
  product_image_url text,
  headline text,
  scene text,
  -- Generated content
  caption text,
  generated_image_url text,
  -- Instagram
  instagram_post_id text,
  instagram_permalink text,
  likes_count int,
  -- Status
  status text not null default 'pending', -- pending | running | published | failed
  error_message text,
  triggered_by text default 'schedule', -- schedule | manual
  -- Timing
  scheduled_for timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- RUN LOGS
-- ─────────────────────────────────────────────
create table public.run_logs (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete cascade not null,
  level text not null default 'info', -- info | success | error | warn
  stage text,
  message text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table public.brands enable row level security;
alter table public.schedules enable row level security;
alter table public.posts enable row level security;
alter table public.run_logs enable row level security;

-- Brands: users own their brands
create policy "Users can manage own brands"
  on public.brands for all
  using (auth.uid() = user_id);

-- Schedules: via brand ownership
create policy "Users can manage own schedules"
  on public.schedules for all
  using (brand_id in (select id from public.brands where user_id = auth.uid()));

-- Posts: via brand ownership
create policy "Users can manage own posts"
  on public.posts for all
  using (brand_id in (select id from public.brands where user_id = auth.uid()));

-- Logs: via brand ownership
create policy "Users can view own logs"
  on public.run_logs for all
  using (brand_id in (select id from public.brands where user_id = auth.uid()));

-- ─────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger brands_updated_at before update on public.brands
  for each row execute function update_updated_at();

create trigger schedules_updated_at before update on public.schedules
  for each row execute function update_updated_at();
