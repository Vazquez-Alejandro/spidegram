-- Photo reports for moderation
create table reports (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references photos(id) on delete cascade,
  reporter_id uuid not null references auth.users(id),
  reason text not null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id),
  resolution text check (resolution in ('kept', 'dismissed'))
);

-- Indexes
create index idx_reports_photo_id on reports(photo_id);
create index idx_reports_resolved_at on reports(resolved_at);

-- RLS
alter table reports enable row level security;

-- Group admins can view reports for photos in their groups
create policy "Admins can view reports"
  on reports for select
  using (
    exists (
      select 1 from photos p
      join group_members gm on gm.group_id = p.group_id
      where p.id = photo_id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    )
  );

-- Any authenticated user can report a photo
create policy "Users can report photos"
  on reports for insert
  with check (
    auth.uid() = reporter_id
    and exists (
      select 1 from photos
      where id = photo_id and status = 'approved'
    )
  );

-- Group admins can resolve reports
create policy "Admins can resolve reports"
  on reports for update
  using (
    exists (
      select 1 from photos p
      join group_members gm on gm.group_id = p.group_id
      where p.id = photo_id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    )
  );
