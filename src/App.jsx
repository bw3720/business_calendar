import { useEffect, useMemo, useState } from 'react'
import Calendar from './components/Calendar'
import DayEditor from './components/DayEditor'
import { getMonthDays } from './lib/businessDays'
import { supabase } from './lib/supabaseClient'
import './App.css'

const isConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)

function App() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [overridesByDate, setOverridesByDate] = useState({})
  const [selectedDay, setSelectedDay] = useState(null)
  const [loading, setLoading] = useState(isConfigured)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isConfigured) return
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('day_status').select('*')
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
  }, [])

  const days = useMemo(
    () => getMonthDays(year, month, overridesByDate),
    [year, month, overridesByDate],
  )

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
    const row = { date: dateStr, override, completed, memo }
    setOverridesByDate((prev) => ({ ...prev, [dateStr]: row }))
    const { error } = await supabase.from('day_status').upsert(row)
    if (error) setError(error.message)
  }

  const handleDelete = async (dateStr) => {
    setOverridesByDate((prev) => {
      const next = { ...prev }
      delete next[dateStr]
      return next
    })
    const { error } = await supabase.from('day_status').delete().eq('date', dateStr)
    if (error) setError(error.message)
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>영업일 캘린더</h1>
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
      {loading ? (
        <p className="loading">불러오는 중...</p>
      ) : (
        <Calendar year={year} month={month} days={days} onDayClick={setSelectedDay} />
      )}

      {selectedDay && (
        <DayEditor
          day={selectedDay}
          onClose={() => setSelectedDay(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default App
