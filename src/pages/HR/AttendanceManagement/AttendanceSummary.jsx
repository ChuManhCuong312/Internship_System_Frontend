import React from "react";

const AttendanceSummary = ({
  viewMode,
  selectedDate,
  selectedMonth,
  selectedYear,
  stats,
  lastUpdated,
}) => {
  const formatHourText = (minutes) => {
    if (!minutes || minutes <= 0) return "0h 0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const renderSummaryContent = () => {
    if (!stats) {
      return (
        <span className="summary-empty">
          Chưa có dữ liệu cho bộ lọc hiện tại.
        </span>
      );
    }

    if (viewMode === "date") {
      return (
        <>
          <span>
            <strong>Ngày:</strong> {selectedDate}
          </span>
          <span>
            <strong>Bản ghi:</strong> {stats.totalRecords}
          </span>
          <span>
            <strong>Đúng giờ:</strong> {stats.onTime}
          </span>
          <span>
            <strong>Muộn:</strong> {stats.late}
          </span>
          <span>
            <strong>Vắng/Thiếu:</strong> {stats.absentOrIncomplete}
          </span>
        </>
      );
    }

    return (
      <>
        <span>
          <strong>Tháng:</strong> {selectedMonth}/{selectedYear}
        </span>
        <span>
          <strong>Số TTS:</strong> {stats.totalInterns}
        </span>
        <span>
          <strong>Ngày làm:</strong> {stats.totalWorkingDays}
        </span>
        <span>
          <strong>Ngày đi muộn:</strong> {stats.totalLateDays}
        </span>
        <span>
          <strong>Giờ làm TB:</strong> {formatHourText(stats.avgWorkingMinutes)}
        </span>
      </>
    );
  };

  return (
    <div className="attendance-summary">
      <div className="summary-content">{renderSummaryContent()}</div>
      {lastUpdated && (
        <span className="summary-updated">
          Cập nhật lần cuối: {lastUpdated.toLocaleTimeString("vi-VN")}
        </span>
      )}
    </div>
  );
};

export default AttendanceSummary;

