import { supabase } from './supabaseClient'

const STORAGE_KEY = 'employeeId'

export function getStoredEmployeeId() {
  return localStorage.getItem(STORAGE_KEY)
}

export function setStoredEmployeeId(employeeId) {
  localStorage.setItem(STORAGE_KEY, employeeId)
}

export function clearStoredEmployeeId() {
  localStorage.removeItem(STORAGE_KEY)
}

// 반환값: 존재하면 { employee_id, name }, 없으면 null
export async function verifyEmployeeId(employeeId) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('employee_id', employeeId)
    .maybeSingle()
  if (error) throw error
  return data
}
