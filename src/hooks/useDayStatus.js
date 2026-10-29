import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useDayStatus(employeeId, isConfigured, onError) {
  const [overridesByDate, setOverridesByDate] = useState({})
  const [loading, setLoading] = useState(isConfigured)

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
          onError(error.message)
        } else {
          const map = {}
          for (const row of data) {
            map[row.date] = row
          }
          setOverridesByDate(map)
        }
      } catch (err) {
        if (!cancelled) onError(err.message)
      }
      if (!cancelled) setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [employeeId, isConfigured, onError])

  const save = async (dateStr, { override, completed, memo }) => {
    const row = { employee_id: employeeId, date: dateStr, override, completed, memo }
    setOverridesByDate((prev) => ({ ...prev, [dateStr]: row }))
    const { error } = await supabase.from('day_status').upsert(row)
    if (error) onError(error.message)
  }

  const remove = async (dateStr) => {
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
    if (error) onError(error.message)
  }

  const reset = () => setOverridesByDate({})

  return { overridesByDate, loading, save, remove, reset }
}
