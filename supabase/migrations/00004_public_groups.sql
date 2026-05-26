-- Add is_public flag to groups (public groups can be joined without invite)
alter table groups add column is_public boolean not null default false;

-- Allow members to view public groups even if not a member
drop policy if exists "Members can view their groups" on groups;
create policy "Members can view their groups"
  on groups for select
  using (
    id in (
      select group_id from group_members where user_id = auth.uid()
    )
    or created_by = auth.uid()
    or is_public = true
  );
