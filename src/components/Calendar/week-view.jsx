
import { MOCK_EVENTS } from "./MOCK_EVENTS"
import styles from "./week-view.module.css"

export default function WeekView({ currentDate }) {
  // Get the start of the week (Sunday)
  const weekStart = new Date(currentDate)
  weekStart.setDate(currentDate.getDate() - currentDate.getDay())

  // Generate array of 7 days in the week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + i)
    return day
  })

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

  const getEventBadgeColor = (type) => {
    const colors = {
      program: styles.badgeProgram,
      task: styles.badgeTask,
      deadline: styles.badgeDeadline,
    }
    return colors[type]
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const dayNames = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]

  return (
    <div className={styles.week}>
      {/* Week header */}
      <div className={styles.weekHeader}>
        {weekDays.map((date, index) => (
          <div key={index} className={`${styles.dayHeaderCell} ${isToday(date) ? styles.dayHeaderToday : ""}`}>
            <div className={styles.dayName}>{dayNames[index]}</div>
            <div className={`${styles.dayDateNumber} ${isToday(date) ? styles.dayDateToday : ""}`}>
              {date.getDate()}
            </div>
            <div className={styles.dayMonth}>{date.toLocaleString("vi-VN", { month: "short" })}</div>
          </div>
        ))}
      </div>

      {/* Week content */}
      <div className={styles.weekContent}>
        {weekDays.map((date, index) => {
          const events = getEventsForDate(date)
          return (
            <div
              key={index}
              className={`${styles.dayColumn} ${
                isToday(date) ? styles.dayColumnToday : index % 2 === 0 ? "" : styles.dayColumnAlt
              }`}
            >
              <div className={styles.eventsContainer}>
                {events.length === 0 ? (
                  <div className={styles.noEvents}>Không có sự kiện</div>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className={`${styles.eventItem} ${getEventColor(event.type)}`}>
                      <div className={styles.eventTitle}>{event.title}</div>
                      {event.dueDate && (
                        <div className={styles.eventDueDate}>Hạn: {event.dueDate.toLocaleDateString("vi-VN")}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Event summary at bottom */}
      <div className={styles.eventSummary}>
        <div className={styles.summaryLabel}>Sự kiện tuần này:</div>
        <div className={styles.summaryBadges}>
          {MOCK_EVENTS.filter((event) => {
            const eventDate = event.date
            return eventDate >= weekStart && eventDate < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
          }).map((event) => (
            <span key={event.id} className={`${styles.summaryBadge} ${getEventBadgeColor(event.type)}`}>
              {event.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}