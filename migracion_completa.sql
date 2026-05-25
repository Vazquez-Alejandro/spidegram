-- Arreglar trigger de notificacion para reject
create or replace function notify_photo_status()
returns trigger as $$
begin
  if new.status = 'approved' and old.status = 'pending' then
    insert into notifications (user_id, type, actor_id, group_id, photo_id)
    values (new.uploader_id, 'photo_approved', new.approved_by, new.group_id, new.id);
  end if;
  if new.status = 'rejected' and old.status = 'pending' then
    insert into notifications (user_id, type, actor_id, group_id, photo_id)
    values (new.uploader_id, 'photo_rejected', auth.uid(), new.group_id, new.id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Recrear el trigger (para asegurar que use la nueva funcion)
drop trigger if exists on_photo_status on photos;
create trigger on_photo_status after update on photos
  for each row when (old.status = 'pending' and new.status in ('approved', 'rejected'))
  execute function notify_photo_status();
