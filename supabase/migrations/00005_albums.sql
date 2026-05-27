-- Albums within groups for organizing photos
create table albums (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  name text not null,
  description text,
  cover_url text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add album_id to photos
alter table photos add column album_id uuid references albums(id) on delete set null;

-- Indexes
create index idx_albums_group_id on albums(group_id);
create index idx_photos_album_id on photos(album_id);

-- RLS
alter table albums enable row level security;

-- Members can view albums in their groups
create policy "Members can view albums"
  on albums for select
  using (public.is_group_member(group_id));

-- Members can create albums in their groups
create policy "Members can create albums"
  on albums for insert
  with check (public.is_group_member(group_id));

-- Admins can update albums
create policy "Admins can update albums"
  on albums for update
  using (
    group_id in (
      select group_id from group_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Admins can delete albums
create policy "Admins can delete albums"
  on albums for delete
  using (
    group_id in (
      select group_id from group_members
      where user_id = auth.uid() and role = 'admin'
    )
  );
