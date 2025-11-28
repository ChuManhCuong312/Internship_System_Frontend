import React, { useState, useEffect, useContext } from 'react';
import InternSidebar from '../../components/Layout/InternSidebar';
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  getAttendanceHistory,
  getAttendanceByDateRange,
  getAttendanceStatistics,
  getMonthlyStatistics,
} from '../../api/attendanceApi';
import { getInternByUserId } from '../../api/internApi';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import '../../styles/attendance.css';
import '../../styles/badges.css';
import '../../styles/buttons.css';

const Attendance = () => {
  const { user, token, loading: authLoading } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [history, setHistory] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [internId, setInternId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInternId = async () => {
      try {
        if (authLoading) return;

        if (!token) {
          setError('Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }

        let userId = user?.userId;
        if (!userId) {
          const storedUserId = localStorage.getItem('userId');
          if (storedUserId) {
            userId = parseInt(storedUserId, 10);
          }
        }

        if (!userId || Number.isNaN(userId)) {
          setError('Không tìm thấy thông tin người dùng.');
          setLoading(false);
          return;
        }

        const response = await getInternByUserId(token, userId);

        const profile = response.internProfile || response;
        const resolvedInternId =
          profile.internId ||
          profile.id ||
          profile.internID ||
          profile.intern_id;

        if (!resolvedInternId) {
          setError('Không tìm thấy hồ sơ thực tập sinh.');
          setLoading(false);
          return;
        }

        setInternId(resolvedInternId);
      } catch (e) {
        setError('Không thể tải thông tin thực tập sinh.');
        setLoading(false);
      }
    };

    fetchInternId();
  }, [authLoading, token, user?.userId]);

  useEffect(() => {
    if (!token || !internId) return;

    loadData();
  }, [token, internId, selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0);
      const startDateStr = startDate.toISOString().slice(0, 10);
      const endDateStr = endDate.toISOString().slice(0, 10);

      const results = await Promise.allSettled([
        getTodayAttendance(token, internId),
        getAttendanceByDateRange(token, internId, startDateStr, endDateStr),
        getAttendanceStatistics(token, internId),
        getMonthlyStatistics(token, internId, selectedYear, selectedMonth),
      ]);

      if (results[0].status === 'fulfilled') {
        const todayData = results[0].value;
        setTodayAttendance(todayData.attendance);
        setHasCheckedIn(todayData.hasCheckedIn);
        setHasCheckedOut(todayData.hasCheckedOut);
      } else {
        setTodayAttendance(null);
        setHasCheckedIn(false);
        setHasCheckedOut(false);
      }

      if (results[1].status === 'fulfilled') {
        const historyData = results[1].value;
        const list = Array.isArray(historyData) ? historyData : [];
        setHistory(list);
      } else {
        setHistory([]);
      }

      if (results[2].status === 'fulfilled') {
        const statsData = results[2].value;
        setStatistics(statsData);
      } else {
        setStatistics(null);
      }

      if (results[3].status === 'fulfilled') {
        const monthlyData = results[3].value;
        setMonthlyStats(monthlyData);
      } else {
        setMonthlyStats(null);
      }

    } catch (error) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const result = await checkIn(token, internId);
      toast.success('Check-in thành công!');
      loadData();
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Lỗi khi check-in';
      toast.error(message);
    }
  };

  const handleCheckOut = async () => {
    try {
      const result = await checkOut(token, internId);
      const hours = Math.floor(result.workingMinutes / 60);
      const minutes = result.workingMinutes % 60;
      toast.success(`Check-out thành công! (Làm việc: ${hours}h ${minutes} phút)`);
      loadData();
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Lỗi khi check-out';
      toast.error(message);
    }
  };

  const formatTime = (time) => {
    if (!time) return '--:--';
    return time.substring(0, 5);
  };

  const formatDate = (date) => {
    if (!date) return '--/--/----';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (attendance) => {
    if (!attendance) return <span className="status-badge absent">Vắng</span>;

    const status = attendance.status || 'INCOMPLETE';
    const statusMap = {
      ON_TIME: { label: 'Đúng giờ', class: 'on-time' },
      LATE: { label: 'Muộn', class: 'late' },
      INCOMPLETE: { label: 'Chưa hoàn thành', class: 'incomplete' },
      ABSENT: { label: 'Vắng', class: 'absent' },
      INSUFFICIENT: { label: 'Không đủ giờ', class: 'insufficient' },
      LATE_INSUFFICIENT: { label: 'Muộn + thiếu giờ', class: 'late-insufficient' },
    };

    const { label, class: className } = statusMap[status] || statusMap.INCOMPLETE;
    return <span className={`status-badge ${className}`}>{label}</span>;
  };

  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '--:--';

    const [inH, inM] = checkIn.split(':').map(Number);
    const [outH, outM] = checkOut.split(':').map(Number);

    const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <InternSidebar />
        <div className="dashboard-content">
          <div className="loading-spinner">
            Đang tải dữ liệu chấm công...
            <br />
            <small className="loading-intern-id">
              InternId: {internId || 'Không xác định'}
            </small>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <InternSidebar />
        <div className="dashboard-content">
          <div className="attendance-error-box">
            <h3>⚠️ Lỗi</h3>
            <p>{error}</p>
            <button
              onClick={loadData}
              className="attendance-error-retry-btn"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <InternSidebar />
      <div className="dashboard-content">
        <h2 className="page-title">Chấm công</h2>

        {/* Check-in/Check-out */}
        <div className="checkin-section">
          <div className="checkin-card">
            <h3>Chấm công hôm nay</h3>
            <div className="today-info">
              <div className="time-display">
                <div className="time-item">
                  <span className="time-label">Check-in</span>
                  <span className="time-value">
                    {formatTime(todayAttendance?.checkIn)}
                  </span>
                </div>
                <div className="time-divider">→</div>
                <div className="time-item">
                  <span className="time-label">Check-out</span>
                  <span className="time-value">
                    {formatTime(todayAttendance?.checkOut)}
                  </span>
                </div>
              </div>

              {todayAttendance && (
                <div className="working-hours">
                  Thời gian làm việc: {calculateWorkingHours(
                    todayAttendance.checkIn,
                    todayAttendance.checkOut
                  )}
                </div>
              )}

              <div className="today-status">
                {getStatusBadge(todayAttendance)}
              </div>
            </div>

            <div className="checkin-buttons">
              <button
                className={`btn-checkin ${hasCheckedIn ? 'disabled' : ''}`}
                onClick={handleCheckIn}
                disabled={hasCheckedIn}
              >
                {hasCheckedIn ? '✓ Đã check-in' : '🕐 Check-in'}
              </button>

              <button
                className={`btn-checkout ${!hasCheckedIn || hasCheckedOut ? 'disabled' : ''}`}
                onClick={handleCheckOut}
                disabled={!hasCheckedIn || hasCheckedOut}
              >
                {hasCheckedOut ? '✓ Đã check-out' : '🕐 Check-out'}
              </button>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="history-section">
          <div className="history-header">
            <h3>
              Lịch sử chấm công tháng {selectedMonth}/{selectedYear}
            </h3>
            <div className="month-selector">
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
            </div>
          </div>

          {monthlyStats && (
            <div className="monthly-summary">
              <span>Tháng {selectedMonth}/{selectedYear}: </span>
              <strong>{monthlyStats.totalDays} ngày làm</strong>
              <span className="separator">•</span>
              <span className="late-count">{monthlyStats.lateDays} ngày muộn</span>
            </div>
          )}

          <div className="table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Giờ làm</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((record, index) => (
                    <tr key={record.attendanceId || index}>
                      <td>{formatDate(record.date)}</td>
                      <td>
                        <span className="time-cell">
                          {formatTime(record.checkIn)}
                        </span>
                      </td>
                      <td>
                        <span className="time-cell">
                          {formatTime(record.checkOut)}
                        </span>
                      </td>
                      <td>
                        {calculateWorkingHours(record.checkIn, record.checkOut)}
                      </td>
                      <td>{getStatusBadge(record)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      Chưa có dữ liệu chấm công
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;