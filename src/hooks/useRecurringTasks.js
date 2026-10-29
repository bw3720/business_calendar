import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useRecurringTasks(employeeId, isConfigured, onError) {
  const [recurringTasks, setRecurringTasks] = useState([])
  const [taskCompletionsByKey, setTaskCompletionsByKey] = useState({})
  const [recurringLoading, setRecurringLoading] = useState(isConfigured)

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
          onError(error.message)
        } else {
          setRecurringTasks(data)
        }
      } catch (err) {
        if (!cancelled) onError(err.message)
      }
      if (!cancelled) setRecurringLoading(false)
    }

    loadRecurring()
    return () => {
      cancelled = true
    }
  }, [employeeId, isConfigured, onError])

  useEffect(() => {
    if (!isConfigured || !employeeId) return
    let cancelled = false

    async function loadTaskCompletions() {
      try {
        const { data, error } = await supabase
          .from('recurring_task_completions')
          .select('*')
          .eq('employee_id', employeeId)
        if (cancelled) return
        if (error) {
          onError(error.message)
        } else {
          const map = {}
          for (const row of data) {
            map[`${row.recurring_task_id}_${row.date}`] = row.completed
          }
          setTaskCompletionsByKey(map)
        }
      } catch (err) {
        if (!cancelled) onError(err.message)
      }
    }

    loadTaskCompletions()
    return () => {
      cancelled = true
    }
  }, [employeeId, isConfigured, onError])

  const addTask = async (nthBusinessDay, title) => {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert({ employee_id: employeeId, nth_business_day: nthBusinessDay, title })
      .select()
      .single()
    if (error) {
      onError(error.message)
      return
    }
    setRecurringTasks((prev) => [...prev, data])
  }

  const deleteTask = async (id) => {
    setRecurringTasks((prev) => prev.filter((task) => task.id !== id))
    const { error } = await supabase
      .from('recurring_tasks')
      .delete()
      .eq('employee_id', employeeId)
      .eq('id', id)
    if (error) onError(error.message)
  }

  const toggleCompletion = async (taskId, dateStr, nextCompleted) => {
    const key = `${taskId}_${dateStr}`
    setTaskCompletionsByKey((prev) => ({ ...prev, [key]: nextCompleted }))
    const { error } = await supabase.from('recurring_task_completions').upsert({
      employee_id: employeeId,
      recurring_task_id: taskId,
      date: dateStr,
      completed: nextCompleted,
    })
    if (error) onError(error.message)
  }

  const reset = () => {
    setRecurringTasks([])
    setTaskCompletionsByKey({})
  }

  return {
    recurringTasks,
    taskCompletionsByKey,
    recurringLoading,
    addTask,
    deleteTask,
    toggleCompletion,
    reset,
  }
}
