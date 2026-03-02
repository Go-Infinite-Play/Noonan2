-- Use gen_random_uuid() (built into Postgres 13+, available on all Supabase projects)

-- Courses table (cached from GolfCourseAPI)
create table courses (
  id uuid primary key default gen_random_uuid(),
  external_id text,
  name text not null,
  city text,
  state text,
  country text,
  par integer,
  cached_at timestamptz default now()
);

create index idx_courses_external_id on courses(external_id);
create index idx_courses_name on courses(name);

-- Users table (extends Supabase auth.users)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  handicap numeric,
  home_course_id uuid references courses(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Rounds table
create table rounds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  course_id uuid references courses(id),
  score integer,
  date_played date not null default current_date,
  highlights text,
  mood text,
  created_at timestamptz default now()
);

create index idx_rounds_user_id on rounds(user_id);
create index idx_rounds_date_played on rounds(date_played);

-- Conversations table
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  round_id uuid references rounds(id),
  conversation_type text not null default 'general'
    check (conversation_type in ('pre_round', 'post_round', 'general')),
  started_at timestamptz default now(),
  last_message_at timestamptz default now()
);

create index idx_conversations_user_id on conversations(user_id);

-- Messages table
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

create index idx_messages_conversation_id on messages(conversation_id);

-- Player memory (one per user, evolving summary)
create table player_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  summary text not null default '',
  last_updated timestamptz default now()
);

-- Row Level Security
alter table users enable row level security;
alter table rounds enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table player_memory enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users can view own profile"
  on users for select using (auth.uid() = id);
create policy "Users can update own profile"
  on users for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on users for insert with check (auth.uid() = id);

create policy "Users can view own rounds"
  on rounds for select using (auth.uid() = user_id);
create policy "Users can insert own rounds"
  on rounds for insert with check (auth.uid() = user_id);

create policy "Users can view own conversations"
  on conversations for select using (auth.uid() = user_id);
create policy "Users can insert own conversations"
  on conversations for insert with check (auth.uid() = user_id);
create policy "Users can update own conversations"
  on conversations for update using (auth.uid() = user_id);

create policy "Users can view own messages"
  on messages for select using (
    conversation_id in (
      select id from conversations where user_id = auth.uid()
    )
  );
create policy "Users can insert own messages"
  on messages for insert with check (
    conversation_id in (
      select id from conversations where user_id = auth.uid()
    )
  );

create policy "Users can view own memory"
  on player_memory for select using (auth.uid() = user_id);

-- Courses are readable by all authenticated users
create policy "Authenticated users can view courses"
  on courses for select using (auth.role() = 'authenticated');
create policy "Service role can insert courses"
  on courses for insert with check (true);

-- Function to auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Golfer'));

  insert into public.player_memory (user_id, summary)
  values (new.id, '');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
