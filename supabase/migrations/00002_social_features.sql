-- Friendships / follows
create table friendships (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(follower_id, following_id),
  check (follower_id <> following_id)
);

-- Reactions (likes) on photos
create table reactions (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references photos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'like',
  created_at timestamptz not null default now(),
  unique(photo_id, user_id)
);

-- Profiles table (trigger-based, syncs with auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Function + trigger to auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-update updated_at for tables that have it
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger groups_updated_at
  before update on groups
  for each row execute function update_updated_at();

create trigger photos_updated_at
  before update on photos
  for each row execute function update_updated_at();

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- Indexes
create index idx_friendships_follower on friendships(follower_id);
create index idx_friendships_following on friendships(following_id);
create index idx_reactions_photo on reactions(photo_id);
create index idx_reactions_user on reactions(user_id);

-- RLS
alter table friendships enable row level security;
alter table reactions enable row level security;
alter table profiles enable row level security;

-- Friendships: users can see their own friendships
create policy "Users can view their own friendships"
  on friendships for select
  using (auth.uid() in (follower_id, following_id));

create policy "Users can follow others"
  on friendships for insert
  with check (follower_id = auth.uid());

create policy "Users can unfollow"
  on friendships for delete
  using (follower_id = auth.uid());

-- Reactions: anyone can view reactions on photos they can see
create policy "Anyone who can see the photo can view reactions"
  on reactions for select
  using (
    exists (
      select 1 from photos p
      where p.id = photo_id
      and (
        p.status = 'approved'
        and (
          p.is_public = true
          or p.group_id in (
            select group_id from group_members where user_id = auth.uid()
          )
        )
      )
    )
  );

create policy "Authenticated users can react"
  on reactions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from photos p
      where p.id = photo_id
      and p.status = 'approved'
      and (
        p.is_public = true
        or p.group_id in (
          select group_id from group_members where user_id = auth.uid()
        )
      )
    )
  );

create policy "Users can remove their own reactions"
  on reactions for delete
  using (user_id = auth.uid());

-- Profiles: public read, user can update own
create policy "Profiles are publicly readable"
  on profiles for select
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  using (id = auth.uid());

-- Update photo_comments RLS to allow non-members on public photos
drop policy if exists "Members can comment on photos in their groups" on photo_comments;
create policy "Members can comment on photos in their groups"
  on photo_comments for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from photos p
      where p.id = photo_id
      and p.status = 'approved'
      and (
        p.is_public = true
        or p.group_id in (
          select group_id from group_members where user_id = auth.uid()
        )
      )
    )
  );

-- Update groups select policy to also show if user created the group
drop policy if exists "Members can view their groups" on groups;
create policy "Members can view their groups"
  on groups for select
  using (
    id in (
      select group_id from group_members where user_id = auth.uid()
    )
    or created_by = auth.uid()
  );

-- Storage bucket RLS for photos bucket
-- Run this after creating the 'photos' bucket in Supabase Dashboard
/*
create policy "Members can upload photos"
  on storage.objects for insert
  with check (
    bucket_id = 'photos'
    and auth.role() = 'authenticated'
  );

create policy "Anyone can view photos"
  on storage.objects for select
  using (
    bucket_id = 'photos'
    and auth.role() = 'authenticated'
  );
*/
