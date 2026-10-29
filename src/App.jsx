import { useMemo, useState } from 'react'
import Calendar from './components/Calendar'
import DayEditor from './components/DayEditor'
import Login from './components/Login'
import TodayTodo from './components/TodayTodo'
import { getMonthDays, toDateStr } from './lib/businessDays'
import { useMonthNav } from './hooks/useMonthNav'
import { useEmployeeSession } from './hooks/useEmployeeSession'
import { useDayStatus } from './hooks/useDayStatus'
import { useHolidays } from './hooks/useHolidays'
import { useRecurringTasks } from './hooks/useRecurringTasks'
import './App.css'

const isConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)

function App() {
  const today = useMemo(() => new Date(), [])
  const todayStr = toDateStr(today)
  const [error, setError] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)

  const { year, month, goPrevMonth, goNextMonth, goToday } = useMonthNav(today)
  const { employeeId, employeeName, login, logout } = useEmployeeSession(isConfigured)
  const dayStatus = useDayStatus(employeeId, isConfigured, setError)
  const holidays = useHolidays(year, today, setError)
  const recurring = useRecurringTasks(employeeId, isConfigured, setError)

  const recurringByIndex = useMemo(() => {
    const map = {}
    for (const task of recurring.recurringTasks) {
      ;(map[task.nth_business_day] ??= []).push(task)
    }
    return map
  }, [recurring.recurringTasks])

  const days = useMemo(
    () =>
      getMonthDays(
        year,
        month,
        dayStatus.overridesByDate,
        holidays.holidaysByDate,
        recurringByIndex,
        recurring.taskCompletionsByKey,
      ),
    [
      year,
      month,
      dayStatus.overridesByDate,
      holidays.holidaysByDate,
      recurringByIndex,
      recurring.taskCompletionsByKey,
    ],
  )

  const todayDayData = useMemo(() => {
    const monthDays = getMonthDays(
      today.getFullYear(),
      today.getMonth(),
      dayStatus.overridesByDate,
      holidays.todayHolidaysByDate,
      recurringByIndex,
      recurring.taskCompletionsByKey,
    )
    return monthDays.find((d) => d.dateStr === todayStr) ?? null
  }, [
    today,
    dayStatus.overridesByDate,
    holidays.todayHolidaysByDate,
    recurringByIndex,
    recurring.taskCompletionsByKey,
    todayStr,
  ])

  const selectedRecurringTasks = selectedDay
    ? (recurringByIndex[selectedDay.businessDayIndex] ?? [])
    : []

  const handleLogout = () => {
    logout()
    dayStatus.reset()
    recurring.reset()
  }

  if (!isConfigured) {
    return (
      <div className="setup-notice">
        <h2>Supabase 설정이 필요합니다</h2>
        <p>
          프로젝트 루트에 <code>.env.local</code> 파일을 만들고 아래 값을 채워주세요.
          (<code>.env.example</code> 참고)
        </p>
        <pre>{`VITE_SUPABASE_URL=...\nVITE_SUPABASE_ANON_KEY=...`}</pre>
        <p>
          테이블 생성 SQL은 <code>supabase.sql</code> 파일을 Supabase SQL Editor에서
          실행하세요.
        </p>
      </div>
    )
  }

  if (!employeeId) {
    return <Login onLogin={login} />
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>영업일 캘린더</h1>
        <div className="user-bar">
          <span>{employeeName ?? employeeId}님</span>
          <button className="btn-secondary" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
        <div className="month-nav">
          <button onClick={goPrevMonth}>◀</button>
          <span className="month-label">
            {year}년 {month + 1}월
          </span>
          <button onClick={goNextMonth}>▶</button>
          <button className="btn-secondary" onClick={goToday}>
            오늘
          </button>
        </div>
      </header>

      {error && <p className="error-banner">오류: {error}</p>}

      {!dayStatus.loading && !recurring.recurringLoading && (
        <TodayTodo
          day={todayDayData}
          onToggleTask={(taskId, completed) =>
            recurring.toggleCompletion(taskId, todayDayData.dateStr, completed)
          }
          onEdit={() => setSelectedDay(todayDayData)}
        />
      )}

      <div className="calendar-area">
        {dayStatus.loading || holidays.holidaysLoading || recurring.recurringLoading ? (
          <p className="loading">불러오는 중...</p>
        ) : (
          <Calendar
            year={year}
            month={month}
            days={days}
            todayStr={todayStr}
            onDayClick={setSelectedDay}
          />
        )}
      </div>

      {selectedDay && (
        <DayEditor
          day={selectedDay}
          recurringTasks={selectedRecurringTasks}
          onClose={() => setSelectedDay(null)}
          onSave={dayStatus.save}
          onDelete={dayStatus.remove}
          onAddRecurring={recurring.addTask}
          onDeleteRecurring={recurring.deleteTask}
        />
      )}
    </div>
  )
}

export default App
