const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export default function Calendar({ year, month, days, todayStr, onDayClick }) {
  const leadingBlanks = days[0].dayOfWeek
  const numRows = Math.ceil((leadingBlanks + days.length) / 7)

  return (
    <div className="calendar">
      <div className="calendar-grid calendar-header">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={`calendar-weekday ${i === 0 ? 'sun' : ''} ${i === 6 ? 'sat' : ''}`}
          >
            {label}
          </div>
        ))}
      </div>
      <div
        className="calendar-grid calendar-body"
        style={{ gridTemplateRows: `repeat(${numRows}, 1fr)` }}
      >
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} className="calendar-cell blank" />
        ))}
        {days.map((day) => {
          const taskItems = [
            ...day.recurringTasks.map((task) => task.title),
            ...(day.memo ? [day.memo] : []),
          ]

          return (
            <button
              key={day.dateStr}
              className={[
                'calendar-cell',
                day.isBusinessDay ? 'business-day' : 'off-day',
                day.override !== null ? 'has-override' : '',
                day.dayOfWeek === 0 ? 'sun' : '',
                day.dayOfWeek === 6 ? 'sat' : '',
                day.dateStr === todayStr ? 'today' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onDayClick(day)}
            >
              <span className="date-num">{day.date.getDate()}</span>
              {day.holidayName && <span className="holiday-name">{day.holidayName}</span>}
              {taskItems.length > 0 && (
                <>
                  <span className="d-day">D+{day.businessDayIndex}</span>
                  <span className="memo-text" title={taskItems.join('\n')}>
                    {taskItems[0]}
                    {taskItems.length > 1 && ` +${taskItems.length - 1}`}
                  </span>
                </>
              )}
              {day.isBusinessDay && (
                <span className={`status-dot ${day.completed ? 'completed' : ''}`} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
