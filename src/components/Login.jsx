import { useState } from 'react'
import { verifyEmployeeId } from '../lib/employeeAuth'

export default function Login({ onLogin }) {
  const [employeeId, setEmployeeId] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    const id = employeeId.trim()
    if (!id) return

    setSubmitting(true)
    setError(null)
    try {
      const employee = await verifyEmployeeId(id)
      if (!employee) {
        setError('등록되지 않은 사번입니다.')
        return
      }
      onLogin(employee.employee_id, employee.name)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h2>영업일 캘린더</h2>
        <p className="auto-label">사번을 입력해주세요</p>
        <div className="field-group">
          <input
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="사번"
            autoFocus
          />
        </div>
        {error && <p className="error-banner">{error}</p>}
        <button
          className="btn-primary login-submit"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '확인 중...' : '입장하기'}
        </button>
      </div>
    </div>
  )
}
