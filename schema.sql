-- 1. Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  
  -- Custom witchy fields
  moon_phase text, 
  coven_name text,

  constraint username_length check (char_length(username) >= 3)
);

-- 2. Enable Row Level Security (RLS)
-- This turns on the security system so random people can't delete your data.
alter table profiles enable row level security;

-- 3. Create Policy: "Public profiles are viewable by everyone."
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- 4. Create Policy: "Users can insert their own profile."
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

-- 5. Create Policy: "Users can update own profile."
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

  -- 1. Create a function that inserts a row into public.profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id, 
    new.email, -- defaults username to email initially
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

-- 2. Create the trigger to fire that function every time a user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

  -- 1. ADD ROLES TO PROFILES
-- We add a 'role' column. Default is 'initiate' (non-verified).
-- Future values could be: 'verified', 'supporter', 'admin'.
ALTER TABLE public.profiles 
ADD COLUMN role text default 'initiate';

-- 2. CREATE POSTS TABLE
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  image_url text, -- Optional image for the post
  
  -- Link the post to the User who wrote it
  user_id uuid references public.profiles(id) not null
);

-- 3. ENABLE SECURITY (RLS)
alter table public.posts enable row level security;

-- 4. POLICIES
-- Everyone can SEE posts
create policy "Public posts are viewable by everyone."
  on public.posts for select
  using ( true );

-- Only Logged In users can CREATE posts
create policy "Authenticated users can insert posts"
  on public.posts for insert
  with check ( auth.uid() = user_id );

-- Users can only DELETE their OWN posts
create policy "Users can delete own posts"
  on public.posts for delete
  using ( auth.uid() = user_id );

  -- 1. Add a handle column
ALTER TABLE public.profiles 
ADD COLUMN handle text unique;

-- 2. Populate existing handles (temporary fix for existing users)
-- This just takes their username and makes it lowercase.
UPDATE public.profiles 
SET handle = lower(replace(username, ' ', '-'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, handle, full_name)
  values (
    new.id, 
    -- 1. Get the username passed from the Sign Up form
    new.raw_user_meta_data ->> 'username',
    -- 2. Get the handle passed (or generate one if missing)
    new.raw_user_meta_data ->> 'handle',
    -- 3. Full name if provided
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;