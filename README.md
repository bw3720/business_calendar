# 영업일 캘린더

평일에서 한국 공휴일을 자동으로 제외해 영업일을 계산하고, 필요하면 특정 날짜를 수동으로 영업일/휴무일로 강제 지정할 수 있는 개인용 캘린더 웹앱. 각 영업일마다 산출 완료 체크와 메모를 남길 수 있다.

## 로컬 개발

1. Supabase 프로젝트를 만들고 SQL Editor에서 `supabase.sql`을 실행해 `day_status` 테이블을 생성한다.
2. `.env.example`을 `.env.local`로 복사하고 Supabase 프로젝트의 URL, anon key를 채운다.
3. 의존성 설치 후 개발 서버 실행:

   ```bash
   npm install
   npm run dev
   ```

## GitHub Pages 배포

1. GitHub 저장소 Settings > Pages에서 Source를 "GitHub Actions"로 설정한다.
2. 저장소 Settings > Secrets and variables > Actions에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 등록한다.
3. `main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동으로 빌드 후 배포한다.

저장소 이름이 `business_calendar`가 아니라면 `vite.config.js`의 `base` 값도 함께 바꿔야 한다.

## 보안 참고

인증 없이 anon key만으로 Supabase에 접근하는 구조라, anon key가 포함된 배포 번들 URL을 아는 사람은 누구나 데이터를 읽고 쓸 수 있다. 개인 전용 도구로 쓰는 것을 전제로 한 트레이드오프이며, `supabase.sql`의 RLS 정책이 이를 명시하고 있다.
