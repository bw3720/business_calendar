import { useEffect, useMemo, useState } from 'react'
import Calendar from './components/Calendar'
import DayEditor from './components/DayEditor'
import Login from './components/Login'
import TodayTodo from './components/TodayTodo'
import { getMonthDays, toDateStr } from './lib/businessDays'
import { getYearHolidays } from './lib/googleHolidays'
import {
  getStoredEmployeeId,
  setStoredEmployeeId,
  clearStoredEmployeeId,
  verifyEmployeeId,
} from './lib/employeeAuth'
import { supabase } from './lib/supabaseClient'
import './App.css'

const isConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)

function App() {
  const today = new Date()
  const todayStr = toDateStr(today)
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [employeeId, setEmployeeId] = useState(getStoredEmployeeId())
  const [employeeName, setEmployeeName] = useState(null)
  const [overridesByDate, setOverridesByDate] = useState({})
  const [holidaysByDate, setHolidaysByDate] = useState({})
  const [todayHolidaysByDate, setTodayHolidaysByDate] = useState({})
  const [recurringTasks, setRecurringTasks] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [loading, setLoading] = useState(isConfigured)
  const [holidaysLoading, setHolidaysLoading] = useState(true)
  const [recurringLoading, setRecurringLoading] = useState(isConfigured)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isConfigured || !employeeId || employeeName) return
    let cancelled = false
    verifyEmployeeId(employeeId).then((employee) => {
      if (!cancelled && employee) setEmployeeName(employee.name)
    })
    return () => {
      cancelled = true
    }
  }, [employeeId, employeeName])

  useEffect(() => {
    if (!isConfigured || !employeeId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('day_status')
          .select('*')
          .eq('employee_id', employeeId)
        if (cancelled) return
        if (error) {
          setError(error.message)
        } else {
          const map = {}
          for (const row of data) {
            map[row.date] = row
          }
          setOverridesByDate(map)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
      if (!cancelled) setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [employeeId])

  useEffect(() => {
    let cancelled = false

    async function loadHolidays() {
      setHolidaysLoading(true)
      try {
        const map = await getYearHolidays(year)
        if (!cancelled) setHolidaysByDate(map)
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
      if (!cancelled) setHolidaysLoading(false)
    }

    loadHolidays()
    return () => {
      cancelled = true
    }
  }, [year])

  useEffect(() => {
    let cancelled = false

    getYearHolidays(today.getFullYear())
      .then((map) => {
        if (!cancelled) setTodayHolidaysByDate(map)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isConfigured || !employeeId) return
    let cancelled = false

    async function loadRecurring() {
      setRecurringLoading(true)
      try {
        const { data, error } = await supabase
          .from('recurring_tasks')
          .select('*')
          .eq('employee_id', employeeId)
        if (cancelled) return
        if (error) {
          setError(error.message)
        } else {
          setRecurringTasks(data)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
      if (!cancelled) setRecurringLoading(false)
    }

    loadRecurring()
    return () => {
      cancelled = true
    }
  }, [employeeId])

  const recurringByIndex = useMemo(() => {
    const map = {}
    for (const task of recurringTasks) {
      ;(map[task.nth_business_day] ??= []).push(task)
    }
    return map
  }, [recurringTasks])

  const days = useMemo(
    () => getMonthDays(year, month, overridesByDate, holidaysByDate, recurringByIndex),
    [year, month, overridesByDate, holidaysByDate, recurringByIndex],
  )

  const todayDayData = useMemo(() => {
    const monthDays = getMonthDays(
      today.getFullYear(),
      today.getMonth(),
      overridesByDate,
      todayHolidaysByDate,
      recurringByIndex,
    )
    return monthDays.find((d) => d.dateStr === todayStr) ?? null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overridesByDate, todayHolidaysByDate, recurringByIndex, todayStr])

  const selectedRecurringTasks = selectedDay
    ? (recurringByIndex[selectedDay.businessDayIndex] ?? [])
    : []

  const goPrevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1)
      setMonth(11)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const goNextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1)
      setMonth(0)
    } else {
      setMonth((m) => m + 1)
    }
  }

  const goToday = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }

  const handleSave = async (dateStr, { override, completed, memo }) => {
    const row = { employee_id: employeeId, date: dateStr, override, completed, memo }
    setOverridesByDate((prev) => ({ ...prev, [dateStr]: row }))
    const { error } = await supabase.from('day_status').upsert(row)
    if (error) setError(error.message)
  }

  const handleToggleTodayComplete = () => {
    if (!todayDayData) return
    handleSave(todayStr, {
      override: todayDayData.override,
      completed: !todayDayData.completed,
      memo: todayDayData.memo,
    })
  }

  const handleDelete = async (dateStr) => {
    setOverridesByDate((prev) => {
      const next = { ...prev }
      delete next[dateStr]
      return next
    })
    const { error } = await supabase
      .from('day_status')
      .delete()
      .eq('employee_id', employeeId)
      .eq('date', dateStr)
    if (error) setError(error.message)
  }

  const handleAddRecurring = async (nthBusinessDay, title) => {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert({ employee_id: employeeId, nth_business_day: nthBusinessDay, title })
      .select()
      .single()
    if (error) {
      setError(error.message)
      return
    }
    setRecurringTasks((prev) => [...prev, data])
  }

  const handleDeleteRecurring = async (id) => {
    setRecurringTasks((prev) => prev.filter((task) => task.id !== id))
    const { error } = await supabase
      .from('recurring_tasks')
      .delete()
      .eq('employee_id', employeeId)
      .eq('id', id)
    if (error) setError(error.message)
  }

  const handleLogin = (id, name) => {
    setStoredEmployeeId(id)
    setEmployeeId(id)
    setEmployeeName(name)
  }

  const handleLogout = () => {
    clearStoredEmployeeId()
    setEmployeeId(null)
    setEmployeeName(null)
    setOverridesByDate({})
    setRecurringTasks([])
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
    return <Login onLogin={handleLogin} />
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

      {!loading && !recurringLoading && (
        <TodayTodo
          day={todayDayData}
          onToggleComplete={handleToggleTodayComplete}
          onEdit={() => setSelectedDay(todayDayData)}
        />
      )}

      <div className="calendar-area">
        {loading || holidaysLoading || recurringLoading ? (
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
          onSave={handleSave}
          onDelete={handleDelete}
          onAddRecurring={handleAddRecurring}
          onDeleteRecurring={handleDeleteRecurring}
        />
      )}
    </div>
  )
}

export default App
