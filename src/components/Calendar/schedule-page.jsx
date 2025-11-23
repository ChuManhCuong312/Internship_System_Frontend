import React, { useState } from "react"
import ScheduleLayout from "./schedule-layout"
import CalendarView from "./calendar-view"
import TimelineView from "./timeline-view"
import WeekView from "./week-view"

export default function SchedulePage() {
  const [viewType, setViewType] = useState("calendar")
  const [currentDate, setCurrentDate] = useState(new Date())

  return (
    <ScheduleLayout
      viewType={viewType}
      onViewChange={setViewType}
      currentDate={currentDate}
      onDateChange={setCurrentDate}
    >
      {viewType === "calendar" ? (
        <CalendarView currentDate={currentDate} onDateChange={setCurrentDate} />
      ) : viewType === "week" ? (
        <WeekView currentDate={currentDate} onDateChange={setCurrentDate} />
      ) : (
        <TimelineView currentDate={currentDate} />
      )}
    </ScheduleLayout>
  )
}
