-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Reset triggers/functions to ensure clean slate
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 2. Create Profiles Table
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  usage_cost numeric default 0.00000,
  primary key (id)
);

-- 3. Create Conversations Table (Sidebar History)
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text,
  created_at timestamptz default now()
);

-- 4. Create Messages Table (Chat Content)
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations on delete cascade not null,
  role text check (role in ('user', 'assistant')), -- OpenAI uses 'assistant', we map 'model' to this
  content text,
  created_at timestamptz default now()
);

-- 5. Enable RLS
alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- 6. RLS Policies

-- Profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using ( auth.uid() = id );
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using ( auth.uid() = id );

-- Conversations
create policy "Users can view own conversations" on public.conversations for select using ( auth.uid() = user_id );
create policy "Users can insert own conversations" on public.conversations for insert with check ( auth.uid() = user_id );
create policy "Users can delete own conversations" on public.conversations for delete using ( auth.uid() = user_id );

-- Messages
create policy "Users can view own messages" on public.messages for select using ( 
  exists ( select 1 from public.conversations where id = messages.conversation_id and user_id = auth.uid() )
);
create policy "Users can insert own messages" on public.messages for insert with check (
  exists ( select 1 from public.conversations where id = messages.conversation_id and user_id = auth.uid() )
);

-- 7. Trigger for New User
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, usage_cost)
  values (new.id, new.email, 0.00000);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();