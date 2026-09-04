# 변경 이력

이 프로젝트의 주요 변경 사항을 날짜순으로 기록합니다.

## 2026-09-04

- 전체 톤을 다크 모드 자동 전환(`prefers-color-scheme: dark`) 제거하고 밝은 라이트 테마로 고정, 웜한 캔버스 배경 위에 흰색 카드 패널 + 그림자를 얹는 구조로 리디자인 (`index.css`, `App.css`). 색상 토큰을 `--surface`/`--canvas`로 분리하고 영업일 D+N 배지·월 표시 등 숫자 요소에 모노스페이스 표기를 통일 적용
- 캘린더 날짜 칸에 마우스를 올리면 그 날의 업무 건수와 목록을 즉시(약 0.1초) 보여주는 커스텀 툴팁 추가 (`Calendar.jsx`, `App.css`). 브라우저 기본 `title` 툴팁의 지연 문제를 해결하기 위해 CSS 기반 커스텀 툴팁으로 교체
- "오늘의 할 일" 카드의 좌측 강조선 제거
- 모바일 화면에서 캘린더 날짜 칸이 세로로 길게 찌그러지던 버그 수정: 좁은 화면에서는 고정 높이 대신 스크롤 가능한 레이아웃으로 전환 (`index.css`, `App.css`)
- `grid-template-columns`/`grid-template-rows`에 `repeat(n, 1fr)` 대신 `repeat(n, minmax(0, 1fr))`을 사용해, 줄바꿈 없는 메모 텍스트 때문에 특정 열/행이 다른 칸보다 넓어지는 그리드 트랙 사이징 버그를 근본적으로 수정 (`App.css`, `Calendar.jsx`)

## 2026-09-03

- 메인 화면 상단에 "오늘의 할 일" 카드 추가: 오늘 날짜의 영업일/휴무일 여부, 공휴일명, 반복 업무·메모 목록, 산출 완료 체크박스를 캘린더와 별도로 바로 보여줌 (`TodayTodo.jsx` 신규, `App.jsx`/`App.css` 수정). 카드 클릭 시 오늘 날짜의 상세 편집 모달이 열림. 조회 중인 달/연도와 무관하게 오늘 공휴일 데이터를 항상 로드하도록 별도 fetch 추가

## 2026-08-13

- 날짜 칸의 업무 메모 표시 방식을 hover 전용 점(dot)에서 텍스트 직접 노출로 변경 (`Calendar.jsx`, `App.css`)
- 캘린더 칸 비율을 세로로 약간 늘려 메모 텍스트가 들어갈 공간 확보
- README에 앱의 핵심 목적(업무 메모를 입력해두면 계속 보여주는 캘린더)을 더 명확히 서술
- 공휴일 데이터 소스를 `date-holidays` 라이브러리에서 Google Calendar API(대한민국 공휴일 공개 캘린더)로 교체 (`googleHolidays.js` 신규, `businessDays.js`/`App.jsx` 수정)
- `date-holidays` 의존성 제거, `VITE_GOOGLE_CALENDAR_API_KEY` 환경변수 추가 (`.env.example`, GitHub Actions 시크릿)
- "매달 N번째 영업일마다 반복" 업무 등록 기능 추가: `recurring_tasks` 테이블 신설, `businessDays.js`가 각 날짜의 월 내 영업일 순번을 계산해 반복 업무를 병합, `DayEditor`에서 등록/삭제 가능
- 업무(메모/반복 업무)가 있는 날짜 칸에 그 달의 몇 번째 영업일인지 "D+N" 배지로 표시
- 오늘 날짜 칸에 테두리 강조 + "오늘" 라벨을 추가해 더 직관적으로 구분되도록 개선 (`Calendar.jsx`, `App.css`)
- 전체 레이아웃 개편: 고정 480px 폭 → 반응형 760px로 확대, 셀/폰트 크기 상향, 액센트 컬러를 보라색에서 틸(teal) 계열로 변경 (`index.css`, `App.css`)
- 페이지를 `100svh` 고정 높이 + flex 레이아웃으로 바꾸고 달력 셀을 고정 비율 대신 남은 공간을 채우는 그리드로 전환해, 세로 스크롤 없이 한 화면에 달력 전체가 보이도록 개선
- 개인용 도구에서 팀 공유 도구로 전환: 사번 로그인 기능 추가 (비밀번호 없이 사번만으로 입장, `Login.jsx`/`employeeAuth.js` 신규). `employees` 테이블 신설, `day_status`/`recurring_tasks`에 `employee_id` 추가해 팀원별로 캘린더 데이터 분리. 팀원 계정은 Supabase 대시보드에서 직접 관리. 기존 테스트 데이터는 마이그레이션과 함께 초기화

## 2026-08-10

- Vite + React 스캐폴딩으로 프로젝트 초기 구성
- `date-holidays` 기반 자동 영업일 계산 로직 추가 (주말 + 한국 공휴일 제외)
- 특정 날짜를 영업일/휴무일로 수동 override 하는 기능 추가
- 날짜별 완료 체크·메모 입력 기능 (`DayEditor`) 추가
- Supabase 연동으로 override·완료·메모 데이터 영구 저장
- GitHub Pages 자동 배포 워크플로 구성 (`.github/workflows/deploy.yml`)
