-- Create app role enum for admin system
create type public.app_role as enum ('admin', 'user');

-- Create user_roles table for admin management
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security definer function to check roles (prevents RLS recursion)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- RLS policy for user_roles
create policy "Users can view their own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

-- Create moderation status enum
create type public.moderation_status as enum ('pending', 'approved', 'rejected');

-- Create gallery_images table with moderation
create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) <= 100),
  description text check (length(description) <= 500),
  image_url text not null,
  status moderation_status not null default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.gallery_images enable row level security;

-- Anyone can view approved images
create policy "Anyone can view approved images"
  on public.gallery_images for select
  to public
  using (status = 'approved');

-- Admins can view all images (for moderation queue)
create policy "Admins can view all images"
  on public.gallery_images for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Anyone can insert images (public upload, but pending by default)
create policy "Anyone can upload images"
  on public.gallery_images for insert
  to public
  with check (status = 'pending');

-- Only admins can update images (for moderation)
create policy "Admins can update images"
  on public.gallery_images for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete images
create policy "Admins can delete images"
  on public.gallery_images for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for gallery images
insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true);

-- Anyone can view images in storage
create policy "Anyone can view gallery images"
  on storage.objects for select
  to public
  using (bucket_id = 'gallery-images');

-- Anyone can upload to storage
create policy "Anyone can upload gallery images"
  on storage.objects for insert
  to public
  with check (bucket_id = 'gallery-images');

-- Admins can delete from storage
create policy "Admins can delete gallery images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery-images' and public.has_role(auth.uid(), 'admin'));

-- Insert existing gallery images as approved
insert into public.gallery_images (title, image_url, status) values
  ('Business Leader', '/src/assets/gallery/woman-1.jpg', 'approved'),
  ('Scientist', '/src/assets/gallery/woman-2.jpg', 'approved'),
  ('Artist', '/src/assets/gallery/woman-3.jpg', 'approved'),
  ('Educator', '/src/assets/gallery/woman-4.jpg', 'approved'),
  ('Athlete', '/src/assets/gallery/woman-5.jpg', 'approved'),
  ('Engineer', '/src/assets/gallery/woman-6.jpg', 'approved'),
  ('Entrepreneur', '/src/assets/gallery/woman-7.jpg', 'approved'),
  ('Activist', '/src/assets/gallery/woman-8.jpg', 'approved'),
  ('Doctor', '/src/assets/gallery/woman-9.jpg', 'approved'),
  ('Writer', '/src/assets/gallery/woman-10.jpg', 'approved'),
  ('Designer', '/src/assets/gallery/woman-11.jpg', 'approved'),
  ('Chef', '/src/assets/gallery/woman-12.jpg', 'approved'),
  ('Musician', '/src/assets/gallery/woman-13.jpg', 'approved'),
  ('Architect', '/src/assets/gallery/woman-14.jpg', 'approved'),
  ('Lawyer', '/src/assets/gallery/woman-15.jpg', 'approved'),
  ('Pilot', '/src/assets/gallery/woman-16.jpg', 'approved'),
  ('Researcher', '/src/assets/gallery/woman-17.jpg', 'approved'),
  ('Judge', '/src/assets/gallery/woman-18.jpg', 'approved'),
  ('Photographer', '/src/assets/gallery/woman-19.jpg', 'approved'),
  ('Astronaut', '/src/assets/gallery/woman-20.jpg', 'approved');

-- Enable realtime for gallery_images
alter publication supabase_realtime add table public.gallery_images;