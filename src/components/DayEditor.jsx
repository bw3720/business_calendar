import { useState } from 'react'

export default function DayEditor({ day, onClose, onSave, onDelete }) {
  const [override, setOverride] = useState(day.override)
  const [completed, setCompleted] = useState(day.completed)
  const [memo, setMemo] = useState(day.memo)

  const effectiveBusinessDay = override === null ? day.autoBusinessDay : override

  const handleSave = () => {
    onSave(day.dateStr, { override, completed, memo })
    onClose()
  }

  const handleReset = () => {
    onDelete(day.dateStr)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>
          {day.dateStr} ({['일', '월', '화', '수', '목', '금', '토'][day.dayOfWeek]})
        </h3>
        {day.holidayName && <p className="holiday-label">공휴일: {day.holidayName}</p>}
        <p className="auto-label">
          자동 계산: {day.autoBusinessDay ? '영업일' : '휴무일'}
        </p>

        <div className="field-group">
          <label>영업일 지정</label>
          <div className="segmented">
            <button
              className={override === null ? 'active' : ''}
              onClick={() => setOverride(null)}
            >
              자동
            </button>
            <button
              className={override === true ? 'active' : ''}
              onClick={() => setOverride(true)}
            >
              영업일로 강제
            </button>
            <button
              className={override === false ? 'active' : ''}
              onClick={() => setOverride(false)}
            >
              휴무일로 강제
            </button>
          </div>
        </div>

        {effectiveBusinessDay && (
          <div className="field-group">
            <label>
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
              산출 완료
            </label>
          </div>
        )}

        <div className="field-group">
          <label htmlFor="memo">메모</label>
          <textarea
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
          />
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={handleReset}>
            초기화
          </button>
          <div>
            <button className="btn-secondary" onClick={onClose}>
              취소
            </button>
            <button className="btn-primary" onClick={handleSave}>
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
