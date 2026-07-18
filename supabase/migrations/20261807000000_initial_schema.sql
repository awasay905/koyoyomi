-- ============================================================
-- CATEGORIES
-- ============================================================
create table categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  scope      text not null check (scope in ('task', 'shopping')),
  name       text not null,
  color      text,
  last_used  timestamptz,                 -- updated on each use; drives MRU ordering in combobox
  created_at timestamptz not null default now(),
  unique (user_id, scope, name)
);

-- ============================================================
-- TASKS
-- ============================================================
create table tasks (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  title                   text not null,
  description             text,
  category_id             uuid references categories(id) on delete set null,
  type                    text not null check (type in ('one_time', 'recurring')),
  priority                text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  estimated_minutes       int,

  -- notifications
  notify_enabled          boolean not null default false,
  notify_lead_minutes     int not null default 10,

  -- one_time fields
  deadline                timestamptz,
  status                  text not null default 'active' check (status in ('active', 'done', 'archived')),
  completed_at            timestamptz,

  -- recurring fields
  recurrence_unit         text check (recurrence_unit in ('day', 'week', 'month')),
  recurrence_interval     int  check (recurrence_interval > 0),
  start_date              date,
  recurrence_end_type     text check (recurrence_end_type in ('never', 'after_n', 'on_date')),
  recurrence_end_count    int  check (recurrence_end_count > 0),  -- used when end_type = 'after_n'
  recurrence_end_date     date,                                    -- used when end_type = 'on_date'

  created_at              timestamptz not null default now()
);

create table task_completions (
  id           uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  task_id      uuid not null references tasks(id) on delete cascade,
  completed_at timestamptz not null default now(),
  cycle_number int,   -- which repeat this was (1st, 2nd, ...) — computed on insert
  note         text
);

-- ============================================================
-- SHOPPING LIST
-- ============================================================
create table shopping_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  category_id uuid references categories(id) on delete set null,
  quantity    text,
  notes       text,
  status      text not null default 'pending' check (status in ('pending', 'bought')),
  bought_at   timestamptz,
  is_frequent boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- PRAYER TIMES  (reference + adhan notifications only)
-- ============================================================
create table prayer_times (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  name                text not null,        -- 'Fajr','Dhuhr','Asr','Maghrib','Isha' + any custom
  time                time not null,
  is_system           boolean not null default false,   -- true for the 5 fixed prayers
  sort_order          int not null default 0,
  notify_enabled      boolean not null default false,
  notify_lead_minutes int not null default 0,
  unique (user_id, name)
);

-- ============================================================
-- DAY-TYPE TEMPLATES
-- ============================================================
create table day_types (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  color       text,
  is_archived boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (user_id, name)
);

create table schedule_blocks (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  day_type_id      uuid not null references day_types(id) on delete cascade,
  title            text not null,
  block_type       text not null check (block_type in ('fixed', 'free')),
  start_time       time not null check (extract(minute from start_time)::int % 5 = 0),
  end_time         time not null check (extract(minute from end_time)::int % 5 = 0),
  notes            text,
  sort_order       int not null default 0,
  constraint end_after_start check (end_time > start_time)
);
-- duration in minutes = derived in app as (end_time - start_time) in minutes

-- ============================================================
-- WEEKLY PATTERN & DATE OVERRIDES
-- ============================================================
create table weekly_pattern (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  day_of_week  int not null check (day_of_week between 0 and 6),   -- 0 = Sunday
  day_type_id  uuid not null references day_types(id) on delete cascade,
  unique (user_id, day_of_week)
);

create table day_overrides (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  the_date    date not null,
  day_type_id uuid not null references day_types(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, the_date)
);

-- ============================================================
-- TASK ASSIGNMENTS  (two-step: day first, slot optional later)
-- ============================================================
create table task_assignments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  task_id           uuid not null references tasks(id) on delete cascade,
  assigned_date     date not null,
  schedule_block_id uuid references schedule_blocks(id) on delete set null,  -- null = day-level only
  status            text not null default 'pending' check (status in ('pending', 'done', 'skipped')),
  completed_at      timestamptz,
  created_at        timestamptz not null default now()
);

-- ============================================================
-- SYSTEM REMINDERS
-- ============================================================
create table reminders (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  reminder_type  text not null check (reminder_type in ('plan_next_day', 'stale_backlog', 'weekly_summary', 'custom')),
  fire_time      time not null,
  is_enabled     boolean not null default true,
  config         jsonb not null default '{}'::jsonb
  -- examples: {"idle_days_threshold": 3}  for stale_backlog
);

-- ============================================================
-- WEB PUSH SUBSCRIPTIONS  (laptop browser-closed notifications)
-- ============================================================
create table push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  endpoint   text not null,
  keys       jsonb not null,   -- { p256dh, auth } from browser PushSubscription
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);


-- enable RLS on every table
alter table categories enable row level security;
alter table tasks enable row level security;
alter table task_completions enable row level security;
alter table shopping_items enable row level security;
alter table prayer_times enable row level security;
alter table day_types enable row level security;
alter table schedule_blocks enable row level security;
alter table weekly_pattern enable row level security;
alter table day_overrides enable row level security;
alter table task_assignments enable row level security;
alter table reminders enable row level security;
alter table push_subscriptions enable row level security;

-- single policy per table
create policy "owner" on categories for all using (user_id = auth.uid());
create policy "owner" on tasks for all using (user_id = auth.uid());
create policy "owner" on task_completions for all using (user_id = auth.uid());
create policy "owner" on shopping_items for all using (user_id = auth.uid());
create policy "owner" on prayer_times for all using (user_id = auth.uid());
create policy "owner" on day_types for all using (user_id = auth.uid());
create policy "owner" on schedule_blocks for all using (user_id = auth.uid());
create policy "owner" on weekly_pattern for all using (user_id = auth.uid());
create policy "owner" on day_overrides for all using (user_id = auth.uid());
create policy "owner" on task_assignments for all using (user_id = auth.uid());
create policy "owner" on reminders for all using (user_id = auth.uid());
create policy "owner" on push_subscriptions for all using (user_id = auth.uid());


-- Performance indexes
create index idx_tasks_user_id on tasks(user_id);
create index idx_tasks_category_id on tasks(category_id);
create index idx_task_assignments_date on task_assignments(assigned_date);
create index idx_shopping_items_user_id on shopping_items(user_id);
-- Index for RLS/Auth checks (already implied by foreign keys, but helpful)
create index idx_categories_user_id on categories(user_id);