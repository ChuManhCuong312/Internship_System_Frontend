import React, { useContext, useEffect, useMemo, useState } from "react";
import HRSidebar from "../../components/Layout/HRSidebar";
import { AuthContext } from "../../context/AuthContext";
import { getAllAttendances } from "../../api/attendanceApi";
import AttendanceFilters from "./AttendanceManagement/AttendanceFilters";
import AttendanceSummary from "./AttendanceManagement/AttendanceSummary";
import AttendanceTable from "./AttendanceManagement/AttendanceTable";
import { exportAttendanceCsv } from "../../utils/csvExport";
import "../../styles/attendanceManagement.css";

const todayStr = new Date().toISOString().slice(0, 10);
const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const normalizeDateString = (value) => {
  if (!value) return null;
  if (typeof value === "string" && value.length >= 10) {
    return value.slice(0, 10);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const normalizeAttendanceRecord = (record) => {
  return {
    raw: record,
    id: record.attendanceId || record.id,
    internId: record.internId,
    internName: record.internName || "Không xác định",
    date: normalizeDateString(record.date),
    checkIn: record.checkIn,
    checkOut: record.checkOut,
    status: record.status,
    workingMinutes: record.workingMinutes ?? 0,
  };
};

const isSameDate = (recordDate, targetDate) =>
  normalizeDateString(recordDate) === normalizeDateString(targetDate);

const isSameMonth = (recordDate, year, month) => {
  const normalized = normalizeDateString(recordDate);
  if (!normalized) return false;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return false;
  return date.getFullYear() === year && date.getMonth() + 1 === month;
};

const matchSearch = (record, keyword) => {
  if (!keyword) return true;
  const search = keyword.toLowerCase();
  return record.internName?.toLowerCase().includes(search);
};

const extractRecords = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.attendances)) return payload.attendances;
  return [];
};

const AttendanceManagement = () => {
  const { token } = useContext(AuthContext);
  const [viewMode, setViewMode] = useState("date");
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [searchTerm, setSearchTerm] = useState("");
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!token) return;
    loadAttendances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadAttendances = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllAttendances(token);
      const list = extractRecords(response);
      setAllRecords(list.map(normalizeAttendanceRecord));
      setLastUpdated(new Date());
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Không thể tải dữ liệu chấm công.";
      setError(message);
      setAllRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const keyword = searchTerm.trim().toLowerCase();

  const dailyRecords = useMemo(() => {
    return allRecords
      .filter((record) => isSameDate(record.date, selectedDate))
      .filter((record) => matchSearch(record, keyword));
  }, [allRecords, selectedDate, keyword]);

  const monthlyRecords = useMemo(() => {
    const filtered = allRecords.filter((record) =>
      isSameMonth(record.date, selectedYear, selectedMonth)
    );

    const grouped = filtered.reduce((acc, record) => {
      const key = record.internId || record.internName;
      if (!key) return acc;
      if (!acc[key]) {
        acc[key] = {
          id: key,
          internId: record.internId,
          internName: record.internName,
          workingDays: 0,
          lateDays: 0,
          onTimeDays: 0,
          totalWorkingMinutes: 0,
        };
      }

      const normalizedStatus = (record.status || "").toUpperCase();
      const countedWorkingDay =
        Boolean(record.checkIn || record.checkOut) || record.workingMinutes > 0;

      if (countedWorkingDay) {
        acc[key].workingDays += 1;
      }

      if (normalizedStatus.includes("LATE")) {
        acc[key].lateDays += 1;
      }

      if (normalizedStatus === "ON_TIME" || normalizedStatus === "EARLY") {
        acc[key].onTimeDays += 1;
      }

      acc[key].totalWorkingMinutes += record.workingMinutes || 0;
      return acc;
    }, {});

    return Object.values(grouped)
      .map((item) => ({
        ...item,
        avgWorkingMinutes: item.workingDays
          ? Math.round(item.totalWorkingMinutes / item.workingDays)
          : 0,
        punctualityRate: item.workingDays
          ? Math.round((item.onTimeDays / item.workingDays) * 100)
          : 0,
      }))
      .filter((record) => matchSearch(record, keyword));
  }, [allRecords, selectedMonth, selectedYear, keyword]);

  const dailyStats = useMemo(() => {
    if (!dailyRecords.length) return null;

    const summary = dailyRecords.reduce(
      (acc, record) => {
        const status = (record.status || "").toUpperCase();
        if (status === "ON_TIME" || status === "EARLY") acc.onTime += 1;
        else if (status.includes("LATE")) acc.late += 1;
        else acc.absentOrIncomplete += 1;
        return acc;
      },
      { onTime: 0, late: 0, absentOrIncomplete: 0 }
    );

    return {
      totalRecords: dailyRecords.length,
      ...summary,
    };
  }, [dailyRecords]);

  const monthStats = useMemo(() => {
    if (!monthlyRecords.length) return null;
    const totals = monthlyRecords.reduce(
      (acc, record) => {
        acc.totalWorkingMinutes += record.totalWorkingMinutes;
        acc.totalWorkingDays += record.workingDays;
        acc.totalLateDays += record.lateDays;
        return acc;
      },
      { totalWorkingMinutes: 0, totalWorkingDays: 0, totalLateDays: 0 }
    );

    return {
      totalInterns: monthlyRecords.length,
      totalWorkingDays: totals.totalWorkingDays,
      totalLateDays: totals.totalLateDays,
      avgWorkingMinutes: totals.totalWorkingDays
        ? Math.round(totals.totalWorkingMinutes / totals.totalWorkingDays)
        : 0,
    };
  }, [monthlyRecords]);

  const summaryStats = viewMode === "date" ? dailyStats : monthStats;

  const renderContent = () => {
    if (!token) {
      return (
        <div className="no-data">
          Vui lòng đăng nhập lại để xem dữ liệu chấm công.
        </div>
      );
    }

    if (loading) {
      return (
        <div className="loading-spinner">
          Đang tải dữ liệu chấm công...
        </div>
      );
    }

    if (error) {
      return (
        <div className="attendance-error-box">
          <p>{error}</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={loadAttendances}
          >
            Thử lại
          </button>
        </div>
      );
    }

    const isExportDisabled =
      (viewMode === "date" && dailyRecords.length === 0) ||
      (viewMode === "month" && monthlyRecords.length === 0);

    const handleExportCsv = () => {
      try {
        const dataset =
          viewMode === "date" ? dailyRecords : monthlyRecords;
        exportAttendanceCsv(dataset, {
          viewMode,
          selectedDate,
          selectedMonth,
          selectedYear,
        });
      } catch (err) {
        // eslint-disable-next-line no-alert
        alert(err.message || "Không thể xuất CSV.");
      }
    };

    return (
      <>
        <div className="attendance-summary-wrapper">
          <AttendanceSummary
            viewMode={viewMode}
            selectedDate={selectedDate}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            stats={summaryStats}
            lastUpdated={lastUpdated}
          />
          <div className="summary-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={handleExportCsv}
              disabled={isExportDisabled}
            >
              Xuất CSV
            </button>
          </div>
        </div>
        <AttendanceTable
          viewMode={viewMode}
          dailyRecords={dailyRecords}
          monthlyRecords={monthlyRecords}
        />
      </>
    );
  };

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="dashboard-content">
        <h2 className="page-title">Quản lý chấm công</h2>
        <div className="attendance-management">
          <AttendanceFilters
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onRefresh={loadAttendances}
          />
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
