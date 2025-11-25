import React from "react";
import "../../../styles/buttons.css";

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: `Tháng ${index + 1}`,
}));

const yearOptions = (() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, idx) => currentYear - 2 + idx);
})();

const AttendanceFilters = ({
  viewMode,
  onViewModeChange,
  selectedDate,
  onDateChange,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  searchTerm,
  onSearchTermChange,
  onRefresh,
}) => {
  return (
    <div className="attendance-filters">
      <div className="view-toggle" role="tablist">
        <button
          type="button"
          className={viewMode === "date" ? "active" : ""}
          onClick={() => onViewModeChange("date")}
        >
          Theo ngày
        </button>
        <button
          type="button"
          className={viewMode === "month" ? "active" : ""}
          onClick={() => onViewModeChange("month")}
        >
          Theo tháng
        </button>
      </div>

      <div className="filter-grid">
        {viewMode === "date" ? (
          <label className="filter-field">
            <span>Chọn ngày</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </label>
        ) : (
          <>
            <label className="filter-field">
              <span>Tháng</span>
              <select
                value={selectedMonth}
                onChange={(e) => onMonthChange(Number(e.target.value))}
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="filter-field">
              <span>Năm</span>
              <select
                value={selectedYear}
                onChange={(e) => onYearChange(Number(e.target.value))}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        <label className="filter-field">
          <span>Tìm theo tên hoặc mã TTS</span>
          <input
            type="text"
            placeholder="Nhập tên hoặc mã..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </label>

        <div className="filter-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onRefresh}
          >
            Làm mới dữ liệu
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceFilters;

