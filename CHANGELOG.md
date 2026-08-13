# 변경 이력

이 프로젝트의 주요 변경 사항을 날짜순으로 기록합니다.

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

## 2026-08-10

- Vite + React 스캐폴딩으로 프로젝트 초기 구성
- `date-holidays` 기반 자동 영업일 계산 로직 추가 (주말 + 한국 공휴일 제외)
- 특정 날짜를 영업일/휴무일로 수동 override 하는 기능 추가
- 날짜별 완료 체크·메모 입력 기능 (`DayEditor`) 추가
- Supabase 연동으로 override·완료·메모 데이터 영구 저장
- GitHub Pages 자동 배포 워크플로 구성 (`.github/workflows/deploy.yml`)
