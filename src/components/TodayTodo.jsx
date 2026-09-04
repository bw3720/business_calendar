const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export default function TodayTodo({ day, onToggleComplete, onEdit }) {
  if (!day) return null

  const items = [
    ...day.recurringTasks.map((task) => ({ key: `r-${task.id}`, label: task.title })),
    ...(day.memo ? [{ key: 'memo', label: day.memo }] : []),
  ]

  return (
    <section className="today-todo" onClick={onEdit}>
      <div className="today-todo-header">
        <div className="today-todo-title">
          <span className="today-todo-label">오늘의 할 일</span>
          <span className="today-todo-date">
            {day.date.getMonth() + 1}월 {day.date.getDate()}일 (
            {WEEKDAY_LABELS[day.dayOfWeek]})
          </span>
        </div>
        <div className="today-todo-badges">
          {day.holidayName && <span className="badge badge-holiday">{day.holidayName}</span>}
          <span className={`badge ${day.isBusinessDay ? 'badge-business' : 'badge-off'}`}>
            {day.isBusinessDay ? `영업일 D+${day.businessDayIndex}` : '휴무일'}
          </span>
        </div>
      </div>

      {items.length > 0 ? (
        <ul className="today-todo-list">
          {items.map((item) => (
            <li key={item.key}>{item.label}</li>
          ))}
        </ul>
      ) : (
        <p className="today-todo-empty">오늘 등록된 업무가 없습니다.</p>
      )}

      {day.isBusinessDay && (
        <label
          className="today-todo-complete"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={day.completed}
            onChange={onToggleComplete}
          />
          산출 완료
        </label>
      )}
    </section>
  )
}
