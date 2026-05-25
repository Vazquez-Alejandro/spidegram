-- Groups (albums/containers)
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cover_url text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Group members with roles
create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'member')) default 'member',
  joined_at timestamptz not null default now(),
  unique(group_id, user_id)
);

-- Photos uploaded to groups
create table photos (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  uploader_id uuid not null references auth.users(id),
  url text not null,
  thumbnail_url text,
  caption text,
  is_public boolean not null default false,
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Comments on photos
create table photo_comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references photos(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  content text not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_group_members_group_id on group_members(group_id);
create index idx_group_members_user_id on group_members(user_id);
create index idx_photos_group_id on photos(group_id);
create index idx_photos_status on photos(status);
create index idx_photos_is_public on photos(is_public) where is_public = true;
create index idx_photo_comments_photo_id on photo_comments(photo_id);

-- Row Level Security
alter table groups enable row level security;
alter table group_members enable row level security;
alter table photos enable row level security;
alter table photo_comments enable row level security;

-- Groups: members and admins can view; only authenticated users can create
create policy "Members can view their groups"
  on groups for select
  using (
    id in (
      select group_id from group_members where user_id = auth.uid()
    )
  );

create policy "Authenticated users can create groups"
  on groups for insert
  with check (auth.role() = 'authenticated');

-- Group members: members can see other members in their groups (security definer avoids recursion)
create or replace function public.is_group_member(group_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.group_members
    where user_id = auth.uid()
    and group_members.group_id = is_group_member.group_id
  );
$$;

drop policy if exists "Members can view group members" on group_members;
create policy "Members can view group members"
  on group_members for select
  using (public.is_group_member(group_id));

create policy "Users can join groups"
  on group_members for insert
  with check (auth.uid() = user_id);

-- Photos: approved photos visible to members, pending to uploader and admins
create policy "Members can view approved photos"
  on photos for select
  using (
    status = 'approved'
    and group_id in (
      select group_id from group_members where user_id = auth.uid()
    )
  );

create policy "Uploaders can view their own pending photos"
  on photos for select
  using (uploader_id = auth.uid());

create policy "Admins can view all photos in their groups"
  on photos for select
  using (
    group_id in (
      select group_id from group_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Members can upload photos to their groups"
  on photos for insert
  with check (
    group_id in (
      select group_id from group_members where user_id = auth.uid()
    )
  );

create policy "Admins can update photos (approve/reject)"
  on photos for update
  using (
    group_id in (
      select group_id from group_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Comments: members can view and create comments on photos in their groups
create policy "Members can view comments on their group photos"
  on photo_comments for select
  using (
    photo_id in (
      select p.id from photos p
      join group_members gm on gm.group_id = p.group_id
      where gm.user_id = auth.uid()
    )
  );

create policy "Members can comment on photos in their groups"
  on photo_comments for insert
  with check (
    photo_id in (
      select p.id from photos p
      join group_members gm on gm.group_id = p.group_id
      where gm.user_id = auth.uid()
    )
  );
