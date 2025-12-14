import styles from "./event-tooltip.module.css"

const formatTime = (time) => time?.slice(0, 5)

export default function EventTooltip({ event, position }) {
  if (!event) return null

  return (
    <div
      className={styles.tooltip}
      style={{ top: position.y + 10, left: position.x + 10 }}
    >
      <div className={styles.title}>
         {event.title}
      </div>

      {event.location && (
        <div className={styles.item}>
          📍 {event.location}
        </div>
      )}

      <div className={styles.item}>
        ⏰ {formatTime(event.startTime)} – {formatTime(event.endTime)}
      </div>
    </div>
  )
}