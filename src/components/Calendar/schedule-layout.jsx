import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./schedule-layout.module.css"

export default function ScheduleLayout({ viewType, onViewChange, currentDate, onDateChange, children }) {
  const monthName = currentDate.toLocaleString("vi-VN", { month: "long", year: "numeric" })
  const weekStart = new Date(currentDate)
  weekStart.setDate(currentDate.getDate() - currentDate.getDay())

  const handlePrevious = () => {
    const newDate = new Date(currentDate)
    if (viewType === "calendar") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setDate(newDate.getDate() - 7)
    }
    onDateChange(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(currentDate)
    if (viewType === "calendar") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else {
      newDate.setDate(newDate.getDate() + 7)
    }
    onDateChange(newDate)
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Lịch Thực Tập</h1>
          <p className={styles.subtitle}>Xem và quản lý lịch thực tập của bạn</p>
        </div>
      </header>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlsInner}>
          {/* View Toggle */}
          <div className={styles.viewToggle}>
            <button
              onClick={() => onViewChange("calendar")}
              className={`${styles.viewButton} ${viewType === "calendar" ? styles.viewButtonActive : styles.viewButtonInactive}`}
            >
              Lịch
            </button>
            <button
              onClick={() => onViewChange("week")}
              className={`${styles.viewButton} ${viewType === "week" ? styles.viewButtonActive : styles.viewButtonInactive}`}
            >
              Tuần
            </button>
            <button
              onClick={() => onViewChange("timeline")}
              className={`${styles.viewButton} ${viewType === "timeline" ? styles.viewButtonActive : styles.viewButtonInactive}`}
            >
              Dòng Thời Gian
            </button>
          </div>

          {/* Navigation */}
          {viewType !== "timeline" && (
            <div className={styles.navigation}>
              <button className={styles.navButton} onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                className={`${styles.navButton} ${styles.todayButton}`}
                onClick={handleToday}
              >
                Hôm Nay
              </button>

              <button className={styles.navButton} onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </button>

              <span className={styles.dateDisplay}>{monthName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>{children}</div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendDotProgram} />
          <span className={styles.legendLabel}>Chương trình</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDotTask} />
          <span className={styles.legendLabel}>Sự kiện</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDotDeadline} />
          <span className={styles.legendLabel}>Deadline</span>
        </div>
      </div>
    </div>
  )
}
