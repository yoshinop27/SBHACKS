-- Videos table schema (reference/documentation)
-- If table already exists, this serves as documentation of the schema

create table if not exists public.videos (
  id bigserial primary key,  -- Auto-incrementing bigint
  user_id uuid not null references auth.users (id) on delete cascade,
  video_link text not null,
  response_data jsonb,  -- 12 Labs API response containing text and questions
  created_at timestamptz not null default now()
);

create index if not exists videos_user_id_idx on public.videos (user_id);
create index if not exists videos_created_at_idx on public.videos (created_at);

-- Note: RLS policies will be added in the future
-- alter table public.videos enable row level security;

