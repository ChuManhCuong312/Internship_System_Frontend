import styles from "./calendar-view.module.css"

export default function CalendarView({   currentDate,
                                         events,
                                         onEventHover,
                                         onEventClick,
                                         onDateClick, }) {
  if (!events || events.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateContent}>
          <p className={styles.emptyStateTitle}>Chưa có sự kiện</p>
          <p className={styles.emptyStateSubtitle}>Vui lòng chọn chương trình để xem lịch</p>
        </div>
      </div>
    )
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i))

  const getEventsForDate = (date) =>
    events.filter(
      (event) => event.date.toDateString() === date.toDateString()
    )
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isPastDay = (date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d < today
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.dayHeaders}>
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.calendarGrid}>
        {days.map((date, i) => (
          <div
            key={i}
              className={`${styles.calendarDay} ${
                date && isPastDay(date) ? styles.dayDisabled : ""
              }`}
              onClick={() => {
                if (!date || isPastDay(date)) return
                onDateClick(date)
              }}
          >
            {date && (
              <>
                <div className={styles.dayNumber}>{date.getDate()}</div>
                <div className={styles.eventsList}>
                  {getEventsForDate(date).map((event) => (
                    <div
                      key={event.id}
                      className={`${styles.eventBadge} ${styles.eventTask}`}
                      onMouseEnter={(e) => {
                        onEventHover(event, { x: e.clientX, y: e.clientY })
                      }}
                      onMouseLeave={() => onEventHover(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}