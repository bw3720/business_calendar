-- Supabase SQL Editor에서 실행하세요.
-- 주의: 이 스크립트는 day_status, recurring_tasks 테이블을 재생성합니다.
-- 기존에 저장된 데이터(메모, 반복 업무 등)는 모두 삭제됩니다.

drop table if exists day_status;
drop table if exists recurring_task_completions;
drop table if exists recurring_tasks;
drop table if exists employees;

-- 사번 목록. 로그인 시 사번 존재 여부 확인용.
-- 팀원 추가/삭제는 앱이 아니라 Supabase 대시보드(Table Editor)에서 직접 관리한다.
create table employees (
  employee_id text primary key,
  name text,
  created_at timestamptz not null default now()
);

alter table employees enable row level security;

-- 로그인 화면에서 사번 조회만 필요하므로 select만 허용.
-- insert/update/delete 정책은 만들지 않아 anon key로는 팀원 목록을 바꿀 수 없다.
create policy "anon read access" on employees
  for select
  to anon
  using (true);

create table day_status (
  employee_id text not null references employees(employee_id),
  date date not null,
  override boolean,        -- true=강제 영업일, false=강제 비영업일, null=자동 계산 사용
  completed boolean not null default false,
  memo text,
  updated_at timestamptz not null default now(),
  primary key (employee_id, date)
);

alter table day_status enable row level security;

-- 인증 없이 anon key로 접근하는 구조라, anon key와 사번을 아는 사람은
-- 이 앱을 통해 다른 사람의 사번으로도 데이터를 읽고 쓸 수 있다.
-- 사번 로그인에는 비밀번호가 없으므로 감수하는 트레이드오프임.
create policy "anon full access" on day_status
  for all
  to anon
  using (true)
  with check (true);

-- 매달 반복되는 업무 (예: "매달 5번째 영업일마다 전문 발송")
create table recurring_tasks (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null references employees(employee_id),
  nth_business_day int not null check (nth_business_day > 0),
  title text not null,
  created_at timestamptz not null default now()
);

alter table recurring_tasks enable row level security;

create policy "anon full access" on recurring_tasks
  for all
  to anon
  using (true)
  with check (true);

-- 반복 업무는 매달 재사용되는 템플릿이라 그 자체에는 완료 여부를 저장할 수 없다.
-- 그래서 (반복 업무, 날짜) 조합별로 완료 여부를 따로 기록한다.
create table recurring_task_completions (
  recurring_task_id uuid not null references recurring_tasks(id) on delete cascade,
  employee_id text not null references employees(employee_id),
  date date not null,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (recurring_task_id, date)
);

alter table recurring_task_completions enable row level security;

create policy "anon full access" on recurring_task_completions
  for all
  to anon
  using (true)
  with check (true);
