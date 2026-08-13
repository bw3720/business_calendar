# 영업일 캘린더

평일에서 한국 공휴일을 자동으로 제외해 영업일을 계산하고, 특정 영업일에 어떤 업무가 있는지 미리 입력해두면 캘린더에서 계속 보여주는 개인용 웹 캘린더. 필요하면 특정 날짜를 수동으로 영업일/휴무일로 강제 지정할 수도 있다.

## 기능

- **자동 영업일 계산**: Google Calendar API의 대한민국 공휴일 캘린더로 주말 + 공휴일을 자동 제외
- **수동 override**: 특정 날짜를 영업일 ↔ 휴무일로 강제 지정 가능 (자동 계산 무시)
- **업무 메모 표시**: 날짜별로 입력한 업무 메모가 hover 없이 달력 칸에 바로 노출되어, 그날 무슨 일을 해야 하는지 한눈에 확인 가능
- **매달 반복 업무**: "매달 N번째 영업일마다" 반복되는 업무를 등록하면 월이 바뀌어도 해당 순번의 영업일에 자동으로 표시
- **D+영업일 표시**: 업무가 있는 날짜 칸에 그 달의 몇 번째 영업일인지 "D+N" 배지로 표시
- **완료 체크**: 날짜별로 산출 완료 여부 체크
- **오늘 강조**: 오늘 날짜 칸을 테두리 + "오늘" 라벨로 한눈에 구분
- **월 이동 네비게이션**: 이전 달 / 다음 달 / 오늘로 이동
- **Supabase 연동**: 입력한 override·완료·메모 데이터를 Supabase에 저장해 새로고침해도 유지

## 기술 스택

- **프론트엔드**: React 19 + Vite
- **공휴일 조회**: [Google Calendar API](https://developers.google.com/calendar/api) (대한민국 공휴일 공개 캘린더)
- **데이터 저장**: [Supabase](https://supabase.com) (`day_status`, `recurring_tasks` 테이블, anon key 기반)
- **배포**: GitHub Pages (GitHub Actions로 자동 빌드/배포)
- **린트**: oxlint

## 프로젝트 구조

```
src/
├── App.jsx                # 최상위 상태 관리 (월/연도, override 데이터, 로딩/에러)
├── components/
│   ├── Calendar.jsx        # 월 달력 그리드 렌더링
│   └── DayEditor.jsx       # 날짜 클릭 시 뜨는 편집 모달 (override/완료/메모/반복 업무)
├── lib/
│   ├── businessDays.js     # 영업일 자동 계산 로직 (주말+공휴일 판정, override 병합, 영업일 순번 계산)
│   ├── googleHolidays.js   # Google Calendar API로 연도별 한국 공휴일 조회 (연도 단위 캐시)
│   └── supabaseClient.js   # Supabase 클라이언트 초기화
└── main.jsx
supabase.sql                # day_status, recurring_tasks 테이블 + RLS 정책 생성 SQL
```

## 로컬 개발

1. Supabase 프로젝트를 만들고 SQL Editor에서 `supabase.sql`을 실행해 `day_status`, `recurring_tasks` 테이블을 생성한다.
2. [Google Cloud Console](https://console.cloud.google.com/apis/credentials)에서 프로젝트를 만들고 **Google Calendar API**를 활성화한 뒤 API 키를 발급받는다. 키는 "API 제한사항"에서 Calendar API로, "애플리케이션 제한사항"에서 사용할 도메인(HTTP 리퍼러)으로 제한해두는 것을 권장한다.
3. `.env.example`을 `.env.local`로 복사하고 Supabase URL/anon key, Google Calendar API 키를 채운다.
4. 의존성 설치 후 개발 서버 실행:

   ```bash
   npm install
   npm run dev
   ```

## GitHub Pages 배포

1. GitHub 저장소 Settings > Pages에서 Source를 "GitHub Actions"로 설정한다.
2. 저장소 Settings > Secrets and variables > Actions에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_CALENDAR_API_KEY`를 등록한다.
3. `main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동으로 빌드 후 배포한다.

저장소 이름이 `business_calendar`가 아니라면 `vite.config.js`의 `base` 값도 함께 바꿔야 한다.

## 보안 참고

인증 없이 anon key만으로 Supabase에 접근하는 구조라, anon key가 포함된 배포 번들 URL을 아는 사람은 누구나 데이터를 읽고 쓸 수 있다. 개인 전용 도구로 쓰는 것을 전제로 한 트레이드오프이며, `supabase.sql`의 RLS 정책이 이를 명시하고 있다.

Google Calendar API 키도 빌드 번들에 그대로 노출된다. Google Cloud Console에서 Calendar API 전용으로, 배포 도메인 리퍼러로 제한해두면 다른 용도로 악용되는 것을 막을 수 있다.

## 변경 이력

변경 사항은 [CHANGELOG.md](./CHANGELOG.md)에 날짜별로 기록한다.
