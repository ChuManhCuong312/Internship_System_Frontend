import React from "react";
import styles from "./week-view.module.css";

export default function WeekView({ currentDate,
                                     events,
                                     onEventHover,
                                     onEventClick,
                                     onDateClick, }) {
  if (!events || events.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateContent}>
          <p className={styles.emptyStateTitle}>
            Bạn chưa được phân chương trình thực tập
          </p>
          <p className={styles.emptyStateSubtitle}>
            Vui lòng liên hệ với bộ phận quản lý để được phân chương trình
          </p>
        </div>
      </div>
    );
  }

  // Tính ngày bắt đầu tuần (Sunday)
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());

  // Tạo mảng 7 ngày trong tuần
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });

  const getEventsForDate = (date) =>
    events.filter((event) => event.date.toDateString() === date.toDateString());

  const getEventColor = () => styles.eventTask

  const getEventBadgeColor = (type) =>
    ({ program: styles.badgeProgram, task: styles.badgeTask, deadline: styles.badgeDeadline }[type]);

  const isToday = (date) => new Date().toDateString() === date.toDateString();

  const dayNames = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isPastDay = (date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d < today
  }


  return (
    <div className={styles.week}>
      <div className={styles.weekHeader}>
        {weekDays.map((date, index) => (
          <div
            key={index}
            className={`${styles.dayHeaderCell} ${isToday(date) ? styles.dayHeaderToday : ""}`}
          >
            <div className={styles.dayName}>{dayNames[index]}</div>
            <div className={`${styles.dayDateNumber} ${isToday(date) ? styles.dayDateToday : ""}`}>
              {date.getDate()}
            </div>
            <div className={styles.dayMonth}>{date.toLocaleString("vi-VN", { month: "short" })}</div>
          </div>
        ))}
      </div>

      <div className={styles.weekContent}>
        {weekDays.map((date, index) => {
          const eventsForDay = getEventsForDate(date);
          return (
            <div
              key={index}
              className={`
                ${styles.dayColumn}
                ${isToday(date) ? styles.dayColumnToday : ""}
                ${isPastDay(date) ? styles.dayColumnPast : styles.dayColumnFuture}
              `}
              onClick={() => {
                if (isPastDay(date)) return
                onDateClick(date)
              }}
            >
              <div className={styles.eventsContainer}>
                {eventsForDay.length === 0 ? (
                  <div className={styles.noEvents}>Không có sự kiện</div>
                ) : (
                  eventsForDay.map((event) => (
                    <div
                      key={event.id}
                      className={`${styles.eventItem} ${getEventColor()}`}
                      onMouseEnter={(e) =>
                        onEventHover(event, { x: e.clientX, y: e.clientY })
                      }
                      onMouseLeave={() => onEventHover(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                    >
                      <div className={styles.eventTitle}>{event.title}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
