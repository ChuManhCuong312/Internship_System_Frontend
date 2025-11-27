import React, { useState, useContext, useEffect } from "react";
import HRSidebar from "../../../components/Layout/HRSidebar";
import  AttendanceTable from "./AttendanceTable";
import "../../../styles/dashBoard.css";
import "../../../styles/attendance.css";
import "../../../styles/badges.css";
import "../../../styles/buttons.css";
import { AuthContext } from "../../../context/AuthContext";
import {
  getDailyAttendanceForHR,
  getMonthlyAttendanceForHR,
} from "../../../api/attendanceApi";
import { exportTableToExcel } from "../../../utils/excelExport";
import { toast } from "react-toastify";

const AttendanceManagement = () => {
  const { token } = useContext(AuthContext);

  const [mode, setMode] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (!token) return;

    if (mode === "daily") {
      fetchDaily();
    } else {
      fetchMonthly();
    }
  }, [token, mode, selectedDate, selectedMonth, selectedYear]);

  const fetchDaily = async () => {
    if (!token || !selectedDate) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getDailyAttendanceForHR(token, selectedDate);
      setRecords(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Không thể tải danh sách chấm công ngày.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthly = async () => {
    if (!token || !selectedYear || !selectedMonth) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getMonthlyAttendanceForHR(
        token,
        selectedYear,
        selectedMonth
      );
      setRecords(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Không thể tải thống kê chấm công tháng.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return "--:--";
    return String(time).substring(0, 5);
  };

  const formatDate = (date) => {
    if (!date) return "--/--/----";
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN");
  };

  const STATUS_MAP = {
    ON_TIME: { label: "Đúng giờ", class: "on-time" },
    LATE: { label: "Muộn", class: "late" },
    INCOMPLETE: { label: "Chưa hoàn thành", class: "incomplete" },
    ABSENT: { label: "Vắng", class: "absent" },
    INSUFFICIENT: { label: "Không đủ giờ", class: "insufficient" },
    LATE_INSUFFICIENT: {
      label: "Muộn + thiếu giờ",
      class: "late-insufficient",
    },
  };

  const getStatusLabel = (status) => {
    if (!status) return STATUS_MAP.ABSENT.label;
    const mapped = STATUS_MAP[status] || STATUS_MAP.INCOMPLETE;
    return mapped.label;
  };

  const getStatusBadge = (status) => {
    const label = getStatusLabel(status);
    const mapped = status
      ? STATUS_MAP[status] || STATUS_MAP.INCOMPLETE
      : STATUS_MAP.ABSENT;

    return (
      <span className={`status-badge ${mapped.class}`}>{label}</span>
    );
  };

  const calculateWorkingMinutes = (record) => {
    if (record.workingMinutes != null) return record.workingMinutes;
    const checkIn = record.checkIn;
    const checkOut = record.checkOut;
    if (!checkIn || !checkOut) return null;

    const [inH, inM] = String(checkIn).split(":").map(Number);
    const [outH, outM] = String(checkOut).split(":").map(Number);
    return outH * 60 + outM - (inH * 60 + inM);
  };

  const handleExportCSV = async () => {
    if (!records || records.length === 0) {
      toast.warning("Không có dữ liệu để xuất");
      return;
    }

    let header = [];
    let rows = [];

    if (mode === "daily") {
      header = [
        "Ngày",
        "Intern ID",
        "Tên chương trình",
        "Họ tên",
        "Check-in",
        "Check-out",
        "Trạng thái",
      ];

      rows = records.map((record) => {
        const name =
          record.internName ||
          record.fullName ||
          record.name ||
          record.intern_name ||
          "--";
        const internId = record.internId ?? "";
        const programName = record.programName || "";
        const dateStr = formatDate(record.date);
        const checkIn = formatTime(record.checkIn);
        const checkOut = formatTime(record.checkOut);
        const statusLabel = getStatusLabel(record.status);

        return [
          dateStr,
          internId,
          programName,
          name,
          checkIn,
          checkOut,
          statusLabel,
        ];
      });
    } else {
      header = [
        "Tháng",
        "Intern ID",
        "Tên chương trình",
        "Họ tên",
        "Số ngày vắng",
        "Số ngày đủ giờ",
        "Số ngày thiếu giờ",
        "Số ngày đi muộn",
      ];

      const monthLabel = `${selectedMonth}/${selectedYear}`;

      rows = records.map((record) => {
        const name =
          record.internName ||
          record.fullName ||
          record.name ||
          record.intern_name ||
          "--";
        const internId = record.internId ?? "";
        const programName = record.programName || "";
        const absentDays =
          record.absentDays != null ? record.absentDays : 0;
        const sufficientDays =
          record.sufficientDays != null ? record.sufficientDays : 0;
        const insufficientDays =
          record.insufficientDays != null ? record.insufficientDays : 0;
        const lateDays = record.lateDays != null ? record.lateDays : 0;

        return [
          monthLabel,
          internId,
          programName,
          name,
          absentDays,
          sufficientDays,
          insufficientDays,
          lateDays,
        ];
      });
    }

    const fileName =
      mode === "daily"
        ? `attendance_daily_${selectedDate}.xlsx`
        : `attendance_monthly_${selectedYear}_${selectedMonth}.xlsx`;

    const sheetName =
      mode === "daily" ? "Chấm công ngày" : "Chấm công tháng";

    try {
      await exportTableToExcel(header, rows, fileName, sheetName);
      toast.success(`Xuất Excel thành công (${records.length} bản ghi)`);
    } catch (error) {
      console.error("Error exporting attendance CSV:", error);
      toast.error("Lỗi khi xuất Excel: " + (error.message || "Không xác định"));
    }
  };

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="dashboard-content">
        <div className="history-section">
          <div className="manage-users-header">
            <h2 className="page-title">Quản lý chấm công</h2>
            <h3>
              {mode === "daily"
                ? "Danh sách chấm công theo ngày"
                : "Thống kê chấm công theo tháng"}
            </h3>
            <div className="month-selector">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="month-select"
              >
                <option value="daily">Theo ngày</option>
                <option value="monthly">Theo tháng</option>
              </select>

              {mode === "daily" ? (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="month-select"
                />
              ) : (
                <>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="month-select"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Tháng {i + 1}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="year-select"
                  >
                    {[2023, 2024, 2025].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <button
                type="button"
                className="btn-primary"
                onClick={handleExportCSV}
                disabled={!records || records.length === 0}
              >
                Xuất Excel
              </button>
            </div>
          </div>

          {loading && (
            <div className="loading-spinner">Đang tải dữ liệu chấm công...</div>
          )}

          {error && !loading && (
            <div className="attendance-error-box">{error}</div>
          )}

          {!loading && !error && (
            <AttendanceTable
              mode={mode}
              records={records}
              formatDate={formatDate}
              formatTime={formatTime}
              getStatusBadge={getStatusBadge}
              calculateWorkingMinutes={calculateWorkingMinutes}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;