import React from "react";
import styles from "./timeline-view.module.css";

export default function TimelineView({ currentDate, events }) {
  if (!events || events.length === 0 || !events.some((e) => e.type === "program")) {
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

  // Phân loại sự kiện
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);
  const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const pastEvents = events.filter((e) => {
    const eventDate = normalizeDate(e.date);
    return eventDate < today;
  });

  const todayEvents = events.filter((e) => {
    const eventDate = normalizeDate(e.date);
    return eventDate.getTime() === today.getTime();
  });

  const upcomingEvents = events.filter((e) => {
    const eventDate = normalizeDate(e.date);
    return eventDate > today;
  });

  const getEventColors = (type) => ({
    program: styles.eventProgram,
    task: styles.eventTask,
    deadline: styles.eventDeadline,
  }[type]);

  const getEventDotColor = (type) => ({
    program: styles.dotProgram,
    task: styles.dotTask,
    deadline: styles.dotDeadline,
  }[type]);

  const getEventLabel = (type) => ({
    program: "Chương Trình",
    task: "Sự kiện",
    deadline: "Deadline",
  }[type]);

  // Nhóm sự kiện theo trạng thái
  const eventGroups = [
    { label: "Đã qua", events: pastEvents },
    { label: "Đang diễn ra", events: todayEvents },
    { label: "Sắp tới", events: upcomingEvents },
  ];

  return (
    <div className={styles.timeline}>
      {eventGroups.map(
        (group) =>
          group.events.length > 0 && (
            <div key={group.label} className={styles.eventGroup}>
              <h2 className={styles.groupLabel}>{group.label}</h2>
              {group.events.map((event, index) => {
                const isLast = index === group.events.length - 1;

                return (
                  <div key={event.id} className={styles.timelineItem}>
                    <div className={styles.timelineConnector}>
                      <div
                        className={`${styles.timelineDot} ${getEventDotColor(
                          event.type
                        )}`}
                      />
                      {!isLast && <div className={styles.timelineLine} />}
                    </div>

                    <div
                      className={`${styles.eventCard} ${getEventColors(
                        event.type
                      )}`}
                    >
                      <div className={styles.eventCardHeader}>
                        <div>
                          <p className={styles.eventType}>

                          </p>
                          <h3 className={styles.eventTitle}>{event.title}</h3>
                          <p className={styles.eventDescription}>
                            {event.description}
                          </p>
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
                            <p className={styles.eventDateDue}>
                              Hạn: {event.dueDate.toLocaleDateString("vi-VN")}
                            </p>
                          )}
                        </div>
                      </div>
                      {event.details && (
                        <div className={styles.eventDetails}>{event.details}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
      )}
    </div>
  );
}
