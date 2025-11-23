import { MOCK_EVENTS } from "./MOCK_EVENTS"

import styles from "./calendar-view.module.css"

export default function CalendarView({ currentDate }) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }

  const hasProgram = MOCK_EVENTS.some((e) => e.type === "program")

  if (!hasProgram) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateContent}>
          <p className={styles.emptyStateTitle}>Bạn chưa được phân chương trình thực tập</p>
          <p className={styles.emptyStateSubtitle}>Vui lòng liên hệ với bộ phận quản lý để được phân chương trình</p>
        </div>
      </div>
    )
  }

  const getEventsForDate = (date) => {
    return MOCK_EVENTS.filter((event) => event.date.toDateString() === date.toDateString())
  }

  const getEventColor = (type) => {
    const colors = {
      program: styles.eventProgram,
      task: styles.eventTask,
      deadline: styles.eventDeadline,
    }
    return colors[type]
  }

  const getDayBgColor = (date) => {
    const events = getEventsForDate(date)
    if (events.length === 0) return ""
    if (events.some((e) => e.type === "deadline")) return styles.dayDeadline
    if (events.some((e) => e.type === "task")) return styles.dayTask
    return styles.dayProgram
  }

  return (
    <div className={styles.calendar}>
      {/* Day headers */}
      <div className={styles.dayHeaders}>
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className={styles.calendarGrid}>
        {days.map((date, i) => (
          <div key={i} className={`${styles.calendarDay} ${date ? getDayBgColor(date) : styles.dayOther}`}>
            {date && (
              <>
                <div className={styles.dayNumber}>{date.getDate()}</div>
                <div className={styles.eventsList}>
                  {getEventsForDate(date).map((event) => (
                    <div key={event.id} className={`${styles.eventBadge} ${getEventColor(event.type)}`}>
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