-- Funcion helper para evitar recursion infinita en RLS
create or replace function public.is_group_member(group_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from public.group_members
    where user_id = auth.uid()
    and group_members.group_id = is_group_member.group_id
  );
$$;

-- Reemplazar la politica recursiva de group_members
drop policy if exists "Members can view group members" on group_members;
create policy "Members can view group members"
  on group_members for select
  using (public.is_group_member(group_id));

-- Agregar policy para que los usuarios puedan unirse a grupos
drop policy if exists "Users can join groups" on group_members;
create policy "Users can join groups"
  on group_members for insert
  with check (auth.uid() = user_id);
