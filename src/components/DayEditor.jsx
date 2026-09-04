import { useState } from 'react'

export default function DayEditor({
  day,
  recurringTasks,
  onClose,
  onSave,
  onDelete,
  onAddRecurring,
  onDeleteRecurring,
}) {
  const [override, setOverride] = useState(day.override)
  const [completed, setCompleted] = useState(day.completed)
  const [memo, setMemo] = useState(day.memo)
  const [newRecurringTitle, setNewRecurringTitle] = useState('')

  const effectiveBusinessDay = override === null ? day.autoBusinessDay : override

  const handleSave = () => {
    onSave(day.dateStr, { override, completed, memo })
    onClose()
  }

  const handleReset = () => {
    onDelete(day.dateStr)
    onClose()
  }

  const handleAddRecurring = () => {
    const title = newRecurringTitle.trim()
    if (!title) return
    onAddRecurring(day.businessDayIndex, title)
    setNewRecurringTitle('')
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
          <label htmlFor="memo">할 일</label>
          <textarea
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
          />
        </div>

        {day.businessDayIndex !== null && (
          <div className="field-group">
            <label>매달 {day.businessDayIndex}번째 영업일 반복 업무</label>
            {recurringTasks.length > 0 && (
              <ul className="recurring-list">
                {recurringTasks.map((task) => (
                  <li key={task.id}>
                    <span>{task.title}</span>
                    <button
                      type="button"
                      className="recurring-remove"
                      onClick={() => onDeleteRecurring(task.id)}
                      aria-label="반복 업무 삭제"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="recurring-add">
              <input
                type="text"
                value={newRecurringTitle}
                onChange={(e) => setNewRecurringTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRecurring()}
                placeholder="예: 전문 발송"
              />
              <button type="button" className="btn-secondary" onClick={handleAddRecurring}>
                추가
              </button>
            </div>
          </div>
        )}

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
