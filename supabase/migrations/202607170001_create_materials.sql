-- Sprint 4: private, user-owned PDF materials.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lecture-materials',
  'lecture-materials',
  false,
  26214400,
  array['application/pdf']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket_id text not null default 'lecture-materials' check (bucket_id = 'lecture-materials'),
  object_path text not null unique,
  original_name text not null check (char_length(original_name) between 1 and 255),
  mime_type text not null check (mime_type = 'application/pdf'),
  size_bytes bigint not null check (size_bytes between 1 and 26214400),
  checksum_sha256 text not null check (checksum_sha256 ~ '^[0-9a-f]{64}$'),
  status text not null default 'ready' check (status in ('ready')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists materials_user_created_at_idx
  on public.materials (user_id, created_at desc);

alter table public.materials enable row level security;
revoke all on public.materials from anon;
grant select, insert, delete on public.materials to authenticated;

drop policy if exists "Users can view their own materials" on public.materials;
create policy "Users can view their own materials"
  on public.materials for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own materials" on public.materials;
create policy "Users can create their own materials"
  on public.materials for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own materials" on public.materials;
create policy "Users can delete their own materials"
  on public.materials for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can upload PDFs to their own folder" on storage.objects;
create policy "Users can upload PDFs to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'lecture-materials'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and storage.extension(name) = 'pdf'
  );

drop policy if exists "Users can view PDFs in their own folder" on storage.objects;
create policy "Users can view PDFs in their own folder"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'lecture-materials'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and owner_id = (select auth.uid()::text)
  );

drop policy if exists "Users can delete PDFs in their own folder" on storage.objects;
create policy "Users can delete PDFs in their own folder"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'lecture-materials'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and owner_id = (select auth.uid()::text)
  );

