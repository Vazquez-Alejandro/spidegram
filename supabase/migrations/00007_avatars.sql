-- Storage bucket for avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Authenticated users can upload to avatars bucket
create policy "Users can upload avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and auth.role() = 'authenticated'
  );

-- Anyone can view avatars
create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Users can update/delete their own avatars
create policy "Users can update avatars"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete avatars"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
