-- Stories (ephemeral content, 24h expiry)
create table stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid not null references groups(id) on delete cascade,
  media_url text not null,
  media_type text not null default 'photo' check (media_type in ('photo', 'video')),
  caption text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours'
);

create table story_views (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique (story_id, user_id)
);

-- Indexes
create index idx_stories_group_id on stories(group_id);
create index idx_stories_user_id on stories(user_id);
create index idx_stories_expires_at on stories(expires_at);
create index idx_story_views_story_id on story_views(story_id);
create index idx_story_views_user_id on story_views(user_id);

-- RLS
alter table stories enable row level security;
alter table story_views enable row level security;

-- Members can view active stories in their groups
create policy "Members can view stories"
  on stories for select
  using (public.is_group_member(group_id) and expires_at > now());

-- Members can create stories in their groups
create policy "Members can create stories"
  on stories for insert
  with check (public.is_group_member(group_id) and user_id = auth.uid());

-- Owners can delete their own stories
create policy "Owners can delete stories"
  on stories for delete
  using (user_id = auth.uid());

-- Members can view story views
create policy "Members can view story views"
  on story_views for select
  using (
    exists (
      select 1 from stories s
      where s.id = story_id and public.is_group_member(s.group_id)
    )
  );

-- Users can mark stories as viewed
create policy "Users can insert story views"
  on story_views for insert
  with check (user_id = auth.uid());

-- Storage bucket for story media
insert into storage.buckets (id, name, public) values ('stories', 'stories', true)
on conflict (id) do nothing;

-- Authenticated users can upload to stories bucket
create policy "Users can upload stories"
  on storage.objects for insert
  with check (
    bucket_id = 'stories' and auth.role() = 'authenticated'
  );

-- Anyone can view story media
create policy "Anyone can view stories"
  on storage.objects for select
  using (bucket_id = 'stories');

-- Function to get active stories with view status
create or replace function public.get_active_stories(group_id uuid, viewer_id uuid)
returns table (
  id uuid,
  user_id uuid,
  group_id uuid,
  media_url text,
  media_type text,
  caption text,
  created_at timestamptz,
  expires_at timestamptz,
  viewed boolean
)
language sql
security definer
set search_path = public
as $$
  select
    s.id,
    s.user_id,
    s.group_id,
    s.media_url,
    s.media_type,
    s.caption,
    s.created_at,
    s.expires_at,
    exists (
      select 1 from story_views sv
      where sv.story_id = s.id and sv.user_id = viewer_id
    ) as viewed
  from stories s
  where s.group_id = get_active_stories.group_id
    and s.expires_at > now()
    and public.is_group_member(s.group_id)
  order by s.created_at desc;
$$;
