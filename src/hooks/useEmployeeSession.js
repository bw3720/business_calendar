import { useEffect, useState } from 'react'
import {
  getStoredEmployeeId,
  setStoredEmployeeId,
  clearStoredEmployeeId,
  verifyEmployeeId,
} from '../lib/employeeAuth'

export function useEmployeeSession(isConfigured) {
  const [employeeId, setEmployeeId] = useState(getStoredEmployeeId())
  const [employeeName, setEmployeeName] = useState(null)

  useEffect(() => {
    if (!isConfigured || !employeeId || employeeName) return
    let cancelled = false
    verifyEmployeeId(employeeId).then((employee) => {
      if (!cancelled && employee) setEmployeeName(employee.name)
    })
    return () => {
      cancelled = true
    }
  }, [isConfigured, employeeId, employeeName])

  const login = (id, name) => {
    setStoredEmployeeId(id)
    setEmployeeId(id)
    setEmployeeName(name)
  }

  const logout = () => {
    clearStoredEmployeeId()
    setEmployeeId(null)
    setEmployeeName(null)
  }

  return { employeeId, employeeName, login, logout }
}
