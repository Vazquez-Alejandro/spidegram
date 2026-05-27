-- Super admin management
create table super_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- RLS: only super admins can view/insert/delete
alter table super_admins enable row level security;

create policy "Super admins can view"
  on super_admins for select
  using (auth.uid() = user_id);

create policy "Super admins can insert"
  on super_admins for insert
  with check (auth.uid() = user_id);

create policy "Super admins can delete"
  on super_admins for delete
  using (auth.uid() = user_id);
