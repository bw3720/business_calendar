export function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// year: 4자리 연도, month: 0-11
// holidaysByDate: { 'YYYY-MM-DD': '공휴일명' }
// recurringByIndex: { 1: [{ id, title }], 2: [...] } - 매달 N번째 영업일마다 반복되는 업무
// completionsByTaskDate: { '{recurring_task_id}_{YYYY-MM-DD}': true } - 반복 업무의 날짜별 완료 여부
export function getMonthDays(
  year,
  month,
  overridesByDate = {},
  holidaysByDate = {},
  recurringByIndex = {},
  completionsByTaskDate = {},
) {
  const days = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  let businessDayCount = 0

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const date = new Date(d)
    const dateStr = toDateStr(date)
    const dayOfWeek = date.getDay() // 0=일, 6=토
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const holidayName = holidaysByDate[dateStr] ?? null
    const autoBusinessDay = !isWeekend && !holidayName

    const record = overridesByDate[dateStr]
    const override = record?.override ?? null
    const isBusinessDay = override === null ? autoBusinessDay : override

    const businessDayIndex = isBusinessDay ? ++businessDayCount : null
    const recurringTasks = isBusinessDay
      ? (recurringByIndex[businessDayIndex] ?? []).map((task) => ({
          ...task,
          completed: completionsByTaskDate[`${task.id}_${dateStr}`] ?? false,
        }))
      : []

    days.push({
      date,
      dateStr,
      dayOfWeek,
      isWeekend,
      holidayName,
      autoBusinessDay,
      override,
      isBusinessDay,
      businessDayIndex,
      recurringTasks,
      completed: record?.completed ?? false,
      memo: record?.memo ?? '',
    })
  }

  return days
}
