const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export default function TodayTodo({ day, onToggleTask, onEdit }) {
  if (!day) return null

  const hasItems = day.recurringTasks.length > 0 || Boolean(day.memo)

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

      {hasItems ? (
        <ul className="today-todo-list">
          {day.recurringTasks.map((task) => (
            <li key={task.id} className={task.completed ? 'done' : ''}>
              <span>{task.title}</span>
              <label
                className="today-todo-item-check"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => onToggleTask(task.id, e.target.checked)}
                />
              </label>
            </li>
          ))}
          {day.memo && <li className="today-todo-memo">{day.memo}</li>}
        </ul>
      ) : (
        <p className="today-todo-empty">오늘 등록된 업무가 없습니다.</p>
      )}
    </section>
  )
}
