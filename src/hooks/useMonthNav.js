import { useState } from 'react'

export function useMonthNav(today) {
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

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

  return { year, month, goPrevMonth, goNextMonth, goToday }
}
