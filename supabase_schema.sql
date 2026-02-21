--
-- Schema for Login Request Management System
--

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: login_requests
create table if not exists public.login_requests (
    id uuid primary key default uuid_generate_v4(),
    email text not null unique,
    supabase_user_id uuid, -- Link to auth.users.id
    employee_id integer, -- Odoo ID
    employee_name text,
    employee_id_number text, -- Odoo external ID or barcode
    department text,
    designation text,
    status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected', 'Employee Not Found', 'Paused')),
    ip_address text,
    device_info jsonb,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    approved_at timestamp with time zone,
    approved_by uuid, -- Supabase ID of the admin who approved
    rejection_reason text,
    metadata jsonb default '{}'::jsonb
);

-- Table: login_request_logs
create table if not exists public.login_request_logs (
    id uuid primary key default uuid_generate_v4(),
    request_id uuid references public.login_requests(id) on delete cascade,
    action text not null, -- 'Request Created', 'Employee Auto-Matched', 'Approved', etc.
    performed_by uuid, -- Admin ID or User ID
    timestamp timestamp with time zone default now(),
    metadata jsonb default '{}'::jsonb,
    ip_address text,
    device_info jsonb
);

-- RLS (Row Level Security)
alter table public.login_requests enable row level security;
alter table public.login_request_logs enable row level security;

-- Admin Policy: Adms can see everything
create policy "Admins have full access to login_requests"
on public.login_requests
for all
to authenticated
using ( (select (auth.jwt() -> 'user_metadata' ->> 'role')) = 'admin' );

create policy "Admins have full access to login_request_logs"
on public.login_request_logs
for all
to authenticated
using ( (select (auth.jwt() -> 'user_metadata' ->> 'role')) = 'admin' );

-- Public Policy: Users can only create their own requests (or no access, we'll use service_role for system actions)
-- For the "Create Password & Submit Login Request" step, it will happen during signup.
-- We might need a policy for users to see their own request status.
create policy "Users can view their own login request"
on public.login_requests
for select
to authenticated
using ( auth.uid() = supabase_user_id );

-- Function to handle timestamp updates
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on public.login_requests
for each row
execute procedure handle_updated_at();
