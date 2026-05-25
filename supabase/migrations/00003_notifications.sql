-- Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in (
    'photo_uploaded', 'photo_approved', 'photo_rejected',
    'new_comment', 'new_follower'
  )),
  actor_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid references groups(id) on delete cascade,
  photo_id uuid references photos(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on notifications(user_id, created_at desc);

alter table notifications enable row level security;

create policy "Users can view their own notifications"
  on notifications for select
  using (user_id = auth.uid());

create policy "Users can mark their own notifications as read"
  on notifications for update
  using (user_id = auth.uid());

-- Trigger: notify admins when a photo is uploaded
create or replace function notify_photo_uploaded()
returns trigger as $$
begin
  insert into notifications (user_id, type, actor_id, group_id, photo_id)
  select gm.user_id, 'photo_uploaded', new.uploader_id, new.group_id, new.id
  from group_members gm
  where gm.group_id = new.group_id
  and gm.role = 'admin'
  and gm.user_id <> new.uploader_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_photo_uploaded
  after insert on photos
  for each row execute function notify_photo_uploaded();

-- Trigger: notify uploader when photo is approved/rejected
create or replace function notify_photo_status()
returns trigger as $$
begin
  if new.status = 'approved' and old.status = 'pending' then
    insert into notifications (user_id, type, actor_id, group_id, photo_id)
    values (new.uploader_id, 'photo_approved', new.approved_by, new.group_id, new.id);
  end if;
  if new.status = 'rejected' and old.status = 'pending' then
    insert into notifications (user_id, type, actor_id, group_id, photo_id)
    values (new.uploader_id, 'photo_rejected', old.approved_by, new.group_id, new.id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_photo_status
  after update on photos
  for each row
  when (old.status = 'pending' and new.status in ('approved', 'rejected'))
  execute function notify_photo_status();

-- Trigger: notify photo uploader when someone comments
create or replace function notify_new_comment()
returns trigger as $$
begin
  insert into notifications (user_id, type, actor_id, photo_id)
  select p.uploader_id, 'new_comment', new.user_id, new.photo_id
  from photos p
  where p.id = new.photo_id
  and p.uploader_id <> new.user_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_new_comment
  after insert on photo_comments
  for each row execute function notify_new_comment();

-- Trigger: notify when someone follows you
create or replace function notify_new_follower()
returns trigger as $$
begin
  insert into notifications (user_id, type, actor_id)
  values (new.following_id, 'new_follower', new.follower_id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_new_follower
  after insert on friendships
  for each row execute function notify_new_follower();
