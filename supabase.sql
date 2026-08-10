-- Supabase SQL Editor에서 실행하세요.

create table if not exists day_status (
  date date primary key,
  override boolean,        -- true=강제 영업일, false=강제 비영업일, null=자동 계산 사용
  completed boolean not null default false,
  memo text,
  updated_at timestamptz not null default now()
);

alter table day_status enable row level security;

-- 인증 없이 anon key로 접근하는 개인용 앱이므로 anon 롤에 전체 권한 부여.
-- 이 anon key는 GitHub Pages 번들에 그대로 노출되므로,
-- URL을 아는 누구나 읽고/쓸 수 있다는 점을 감수하는 조건임.
create policy "anon full access" on day_status
  for all
  to anon
  using (true)
  with check (true);
