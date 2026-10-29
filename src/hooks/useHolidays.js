import { useEffect, useState } from 'react'
import { getYearHolidays } from '../lib/googleHolidays'

export function useHolidays(year, today, onError) {
  const [holidaysByDate, setHolidaysByDate] = useState({})
  const [todayHolidaysByDate, setTodayHolidaysByDate] = useState({})
  const [holidaysLoading, setHolidaysLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadHolidays() {
      setHolidaysLoading(true)
      try {
        const map = await getYearHolidays(year)
        if (!cancelled) setHolidaysByDate(map)
      } catch (err) {
        if (!cancelled) onError(err.message)
      }
      if (!cancelled) setHolidaysLoading(false)
    }

    loadHolidays()
    return () => {
      cancelled = true
    }
  }, [year, onError])

  useEffect(() => {
    let cancelled = false

    getYearHolidays(today.getFullYear())
      .then((map) => {
        if (!cancelled) setTodayHolidaysByDate(map)
      })
      .catch((err) => {
        if (!cancelled) onError(err.message)
      })

    return () => {
      cancelled = true
    }
  }, [today, onError])

  return { holidaysByDate, todayHolidaysByDate, holidaysLoading }
}
