const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export default function Calendar({ year, month, days, onDayClick }) {
  const leadingBlanks = days[0].dayOfWeek

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
      <div className="calendar-grid">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} className="calendar-cell blank" />
        ))}
        {days.map((day) => (
          <button
            key={day.dateStr}
            className={[
              'calendar-cell',
              day.isBusinessDay ? 'business-day' : 'off-day',
              day.override !== null ? 'has-override' : '',
              day.dayOfWeek === 0 ? 'sun' : '',
              day.dayOfWeek === 6 ? 'sat' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onDayClick(day)}
          >
            <span className="date-num">{day.date.getDate()}</span>
            {day.holidayName && <span className="holiday-name">{day.holidayName}</span>}
            {day.isBusinessDay && (
              <span className={`status-dot ${day.completed ? 'completed' : ''}`} />
            )}
            {day.memo && <span className="memo-dot" title={day.memo} />}
          </button>
        ))}
      </div>
    </div>
  )
}
