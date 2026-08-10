import Holidays from 'date-holidays'

const hd = new Holidays('KR')

function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getHolidayName(date) {
  const result = hd.isHoliday(date)
  if (!result) return null
  return result[0].name
}

// year: 4자리 연도, month: 0-11
export function getMonthDays(year, month, overridesByDate = {}) {
  const days = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const date = new Date(d)
    const dateStr = toDateStr(date)
    const dayOfWeek = date.getDay() // 0=일, 6=토
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const holidayName = getHolidayName(date)
    const autoBusinessDay = !isWeekend && !holidayName

    const record = overridesByDate[dateStr]
    const override = record?.override ?? null
    const isBusinessDay = override === null ? autoBusinessDay : override

    days.push({
      date,
      dateStr,
      dayOfWeek,
      isWeekend,
      holidayName,
      autoBusinessDay,
      override,
      isBusinessDay,
      completed: record?.completed ?? false,
      memo: record?.memo ?? '',
    })
  }

  return days
}
