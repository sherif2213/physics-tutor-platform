-- ============================================================
-- منصة إدارة مركز الدروس الخصوصية - Physics Tutoring Platform
-- Run this once in your Supabase project's SQL editor.
-- ============================================================

-- Months of the academic year, in order, as used across attendance & payments
create type academic_month as enum (
  'august','september','october','november','december',
  'january','february','march','april','may','june'
);

-- ---------- Groups ----------
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- ---------- Students ----------
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  parent_phone text,
  grade text not null,               -- الصف الدراسي
  group_id uuid references groups(id) on delete set null,
  monthly_price numeric(10,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz              -- soft delete, never hard-delete attendance/payment history
);

-- ---------- Attendance: 12 lesson slots per month per student ----------
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  month academic_month not null,
  lesson_number smallint not null check (lesson_number between 1 and 12),
  present boolean not null default false,
  marked_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, month, lesson_number)
);

-- ---------- Monthly payment status: one row per student per month ----------
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  month academic_month not null,
  paid boolean not null default false,
  amount numeric(10,2),
  paid_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (student_id, month)
);

-- ---------- Center settings (single row) ----------
create table if not exists center_settings (
  id int primary key default 1,
  center_name text not null default 'مركز الفيزياء',
  logo_url text,
  phone text,
  address text,
  constraint single_row check (id = 1)
);
insert into center_settings (id, center_name) values (1, 'مركز الفيزياء')
  on conflict (id) do nothing;

-- ---------- Activity log (for dashboard "آخر النشاطات") ----------
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ---------- Sync log: used to make offline sync idempotent ----------
create table if not exists sync_log (
  client_op_id text primary key,      -- generated client-side (uuid), dedupes retried writes
  applied_at timestamptz not null default now()
);

-- updated_at triggers
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_students_updated on students;
create trigger trg_students_updated before update on students
  for each row execute function set_updated_at();

drop trigger if exists trg_attendance_updated on attendance;
create trigger trg_attendance_updated before update on attendance
  for each row execute function set_updated_at();

drop trigger if exists trg_payments_updated on payments;
create trigger trg_payments_updated before update on payments
  for each row execute function set_updated_at();

-- Helpful indexes for scale (thousands of students)
create index if not exists idx_students_group on students(group_id) where deleted_at is null;
create index if not exists idx_students_name on students using gin (to_tsvector('simple', full_name));
create index if not exists idx_attendance_student_month on attendance(student_id, month);
create index if not exists idx_payments_student_month on payments(student_id, month);

-- ============================================================
-- Row Level Security: only the authenticated teacher can read/write.
-- No student login exists, so a single authenticated role covers all access.
-- ============================================================
alter table groups enable row level security;
alter table students enable row level security;
alter table attendance enable row level security;
alter table payments enable row level security;
alter table center_settings enable row level security;
alter table activity_log enable row level security;
alter table sync_log enable row level security;

create policy "teacher full access" on groups for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "teacher full access" on students for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "teacher full access" on attendance for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "teacher full access" on payments for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "teacher full access" on center_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "teacher full access" on activity_log for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "teacher full access" on sync_log for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- After running this file:
-- 1. Go to Authentication > Users in the Supabase dashboard
-- 2. Create one user (email + password) — this is the teacher's login
-- 3. Copy your Project URL and anon public key into .env.local
-- ============================================================
