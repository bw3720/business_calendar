const CALENDAR_ID = 'ko.south_korea#holiday@group.v.calendar.google.com'

const yearCache = new Map()

// year: 4자리 연도. 반환값: { 'YYYY-MM-DD': '공휴일명' } 형태의 객체(Promise)
export function getYearHolidays(year) {
  if (!yearCache.has(year)) {
    yearCache.set(year, fetchYearHolidays(year))
  }
  return yearCache.get(year)
}

async function fetchYearHolidays(year) {
  const apiKey = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY
  if (!apiKey) {
    throw new Error(
      'VITE_GOOGLE_CALENDAR_API_KEY가 설정되지 않아 공휴일을 가져올 수 없습니다.',
    )
  }

  const timeMin = `${year}-01-01T00:00:00Z`
  const timeMax = `${year + 1}-01-01T00:00:00Z`
  const params = new URLSearchParams({
    key: apiKey,
    timeMin,
    timeMax,
    singleEvents: 'true',
  })
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params}`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`공휴일 조회 실패 (${res.status})`)
  }
  const data = await res.json()

  const holidays = {}
  for (const event of data.items ?? []) {
    const dateStr = event.start?.date
    if (dateStr) holidays[dateStr] = event.summary
  }
  return holidays
}
