
import { MOCK_EVENTS } from "./MOCK_EVENTS"
import styles from "./timeline-view.module.css"

export default function TimelineView({ currentDate }) {
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

  const sortedEvents = [...MOCK_EVENTS].sort((a, b) => a.date.getTime() - b.date.getTime())

  const getEventColors = (type) => {
    const colors = {
      program: styles.eventProgram,
      task: styles.eventTask,
      deadline: styles.eventDeadline,
    }
    return colors[type]
  }

  const getEventDotColor = (type) => {
    const colors = {
      program: styles.dotProgram,
      task: styles.dotTask,
      deadline: styles.dotDeadline,
    }
    return colors[type]
  }

  const getEventLabel = (type) => {
    const labels = {
      program: "Chương Trình",
      task: "Nhiệm Vụ",
      deadline: "Deadline",
    }
    return labels[type]
  }

  return (
    <div className={styles.timeline}>
      {sortedEvents.map((event, index) => {
        const isLast = index === sortedEvents.length - 1

        return (
          <div key={event.id} className={styles.timelineItem}>
            {/* Timeline connector */}
            <div className={styles.timelineConnector}>
              <div className={`${styles.timelineDot} ${getEventDotColor(event.type)}`} />
              {!isLast && <div className={styles.timelineLine} />}
            </div>

            {/* Event card */}
            <div className={`${styles.eventCard} ${getEventColors(event.type)}`}>
              <div className={styles.eventCardHeader}>
                <div>
                  <p className={styles.eventType}>{getEventLabel(event.type)}</p>
                  <h3 className={styles.eventTitle}>{event.title}</h3>
                  <p className={styles.eventDescription}>{event.description}</p>
                </div>
                <div className={styles.eventDate}>
                  <p className={styles.eventDateMain}>
                    {event.date.toLocaleDateString("vi-VN", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  {event.dueDate && (
                    <p className={styles.eventDateDue}>Hạn: {event.dueDate.toLocaleDateString("vi-VN")}</p>
                  )}
                </div>
              </div>
              {event.details && <div className={styles.eventDetails}>{event.details}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
