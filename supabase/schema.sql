-- OnlyFans Sales Tracker - Supabase Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create users table (extends Supabase auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text default 'user' check (role in ('user', 'admin')),
  app_name text default 'OnlyFans Sales',
  app_title text default 'Your sales, your numbers, your empire',
  theme text default 'dark' check (theme in ('dark', 'light')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create sales table
create table if not exists public.sales (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  gross_sales numeric not null default 0,
  hourly_rate numeric default 0,
  comms_base numeric default 0,
  hours_worked numeric default 0,
  net_sales numeric generated always as (gross_sales) stored,
  salary numeric generated always as (gross_sales - comms_base + (hourly_rate * hours_worked)) stored,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.sales enable row level security;

-- Users policies
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Admin can view all users"
  on public.users for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin can update all users"
  on public.users for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Sales policies
create policy "Users can view their own sales"
  on public.sales for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sales"
  on public.sales for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own sales"
  on public.sales for update
  using (auth.uid() = user_id);

create policy "Users can delete their own sales"
  on public.sales for delete
  using (auth.uid() = user_id);

create policy "Admin can view all sales"
  on public.sales for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to soft delete sales
create or replace function public.soft_delete_sale()
returns trigger as $$
begin
  update public.sales
  set deleted_at = now()
  where id = old.id;
  return old;
end;
$$ language plpgsql;

-- indexes for performance
create index if not exists idx_sales_user_id on public.sales(user_id);
create index if not exists idx_sales_created_at on public.sales(created_at);
create index if not exists idx_sales_deleted_at on public.sales(deleted_at);
create index if not exists idx_users_role on public.users(role);