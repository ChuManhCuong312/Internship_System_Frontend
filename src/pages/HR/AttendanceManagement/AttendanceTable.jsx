import React from "react";
import "../../../styles/table.css";
import "../../../styles/badges.css";

const formatTime = (timeValue) => {
  if (!timeValue) return "--:--";
  return timeValue?.slice(0, 5) || "--:--";
};

const formatHours = (minutes) => {
  if (minutes == null) return "--";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const getStatusBadge = (status) => {
  if (!status) return <span className="status-badge incomplete">Không rõ</span>;
  const upper = status.toUpperCase();
  const map = {
    ON_TIME: { label: "Đúng giờ", className: "on-time" },
    EARLY: { label: "Sớm", className: "early" },
    LATE: { label: "Muộn", className: "late" },
    ABSENT: { label: "Vắng", className: "absent" },
    INCOMPLETE: { label: "Thiếu giờ", className: "incomplete" },
    INSUFFICIENT: { label: "Thiếu giờ", className: "insufficient" },
    LATE_INSUFFICIENT: {
      label: "Muộn + thiếu",
      className: "late-insufficient",
    },
    PRESENT: { label: "Có mặt", className: "present" },
  };

  const badge = map[upper] || map.INCOMPLETE;
  return <span className={`status-badge ${badge.className}`}>{badge.label}</span>;
};

const AttendanceTable = ({ viewMode, dailyRecords, monthlyRecords }) => {
  const hasData =
    viewMode === "date" ? dailyRecords.length > 0 : monthlyRecords.length > 0;

  return (
    <div className="users-table-container attendance-table-wrapper">
      <table className="users-table">
        <thead>
          {viewMode === "date" ? (
            <tr>
              <th style={{ textAlign: "left" }}>Thực tập sinh</th>
              <th>Ngày</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Giờ làm</th>
              <th>Trạng thái</th>
            </tr>
          ) : (
            <tr>
              <th style={{ textAlign: "left" }}>Thực tập sinh</th>
              <th>Ngày làm</th>
              <th>Ngày muộn</th>
              <th>Tổng giờ</th>
              <th>Giờ TB</th>
              <th>Tỷ lệ đúng giờ</th>
            </tr>
          )}
        </thead>
        <tbody>
          {!hasData && (
            <tr>
              <td colSpan="6" className="no-data">
                Không có dữ liệu phù hợp với bộ lọc.
              </td>
            </tr>
          )}

          {hasData &&
            (viewMode === "date"
              ? dailyRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="intern-cell">
                      <span className="intern-name">{record.internName}</span>
                    </td>
                    <td>{record.date}</td>
                    <td>{formatTime(record.checkIn)}</td>
                    <td>{formatTime(record.checkOut)}</td>
                    <td>{formatHours(record.workingMinutes)}</td>
                    <td>{getStatusBadge(record.status)}</td>
                  </tr>
                ))
              : monthlyRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="intern-cell">
                      <span className="intern-name">{record.internName}</span>
                    </td>
                    <td>{record.workingDays}</td>
                    <td>{record.lateDays}</td>
                    <td>{formatHours(record.totalWorkingMinutes)}</td>
                    <td>{formatHours(record.avgWorkingMinutes)}</td>
                    <td>{record.punctualityRate}%</td>
                  </tr>
                )))}
        </tbody>
      </table>
    </div>
  );
};

AttendanceTable.defaultProps = {
  dailyRecords: [],
  monthlyRecords: [],
};

export default AttendanceTable;

