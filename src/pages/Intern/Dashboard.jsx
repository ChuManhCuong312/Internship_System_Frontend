import React, { useEffect, useState, useContext } from 'react';
import InternSidebar from '../../components/Layout/InternSidebar';
import LatestNotificationsWidget from '../../components/Dashboard/LatestNotificationsWidget';
import '../../styles/dashBoard.css';
import avatar from "../../assets/avatar.png";
import { AuthContext } from '../../context/AuthContext';
import { getInternByUserId } from '../../api/internApi';
import { getTodayAttendance, checkIn, checkOut } from '../../api/attendanceApi';
import allowanceApi from '../../api/allowanceApi';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user, token, loading: authLoading } = useContext(AuthContext);

  const [internId, setInternId] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [monthlyAllowance, setMonthlyAllowance] = useState(0);
  const [taskStats, setTaskStats] = useState({
    inProgress: 0,
    todo: 0,
    done: 0,
    total: 0,
  });
  const [taskStatsLoading, setTaskStatsLoading] = useState(true);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentTasksLoading, setRecentTasksLoading] = useState(true);

  useEffect(() => {
    const fetchInternId = async () => {
      try {
        if (authLoading || !token) return;

        let userId = user?.userId;
        if (!userId) {
          const storedUserId = localStorage.getItem('userId');
          if (storedUserId) {
            userId = parseInt(storedUserId, 10);
          }
        }

        if (!userId || Number.isNaN(userId)) {
          setAttendanceError('Không tìm thấy thông tin thực tập sinh');
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
          setAttendanceError('Không tìm thấy hồ sơ thực tập sinh');
          return;
        }

        setInternId(resolvedInternId);
      } catch (error) {
        setAttendanceError('Không thể tải thông tin thực tập sinh');
      }
    };

    fetchInternId();
  }, [authLoading, token, user?.userId]);

  useEffect(() => {
    if (!token || !internId) return;
    loadTodayAttendance();
    fetchMonthlyAllowance();
    fetchTaskStats();
    fetchRecentTasks();
  }, [token, internId]);

  // Fetch monthly allowance
  const fetchMonthlyAllowance = async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Get all allowances for the current intern
      const response = await allowanceApi.getAllowancesByInternId(token, internId, 0, 100);
      
      // Handle different response formats
      const allowances = Array.isArray(response) ? response : 
                       (response?.data || response?.content || []);
      
      // Filter allowances for current month and year, and sum them up
      const monthlyTotal = allowances
        .filter(allowance => {
          if (!allowance.dateApplied) return false;
          const allowanceDate = new Date(allowance.dateApplied);
          return (
            allowanceDate.getMonth() + 1 === currentMonth && 
            allowanceDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, allowance) => sum + (allowance.amount || 0), 0);
      
      setMonthlyAllowance(monthlyTotal);
    } catch (error) {
      console.error('Error fetching monthly allowance:', error);
    }
  };
  
  const fetchTaskStats = async () => {
    try {
      if (!internId || !token) {
        setTaskStats({
          inProgress: 0,
          todo: 0,
          done: 0,
          total: 0,
        });
        setTaskStatsLoading(false);
        return;
      }

      setTaskStatsLoading(true);
      const res = await axiosClient.get(`/tasks/intern/${internId}/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || {};
      setTaskStats({
        inProgress: data.inProgress || 0,
        todo: data.todo || 0,
        done: data.done || 0,
        total: data.total || 0,
      });
    } catch (error) {
      console.error('Failed to fetch task statistics:', error);
      setTaskStats({
        inProgress: 0,
        todo: 0,
        done: 0,
        total: 0,
      });
    } finally {
      setTaskStatsLoading(false);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      if (!internId || !token) {
        setRecentTasks([]);
        setRecentTasksLoading(false);
        return;
      }

      setRecentTasksLoading(true);
      const res = await axiosClient.get(`/tasks/intern/${internId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      // Lấy tối đa 3 nhiệm vụ gần đây
      const limited = data.slice(0, 3);
      setRecentTasks(limited);
    } catch (error) {
      console.error('Failed to fetch recent tasks:', error);
      setRecentTasks([]);
    } finally {
      setRecentTasksLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadTodayAttendance = async () => {
    try {
      setAttendanceLoading(true);
      setAttendanceError(null);
      const data = await getTodayAttendance(token, internId);
      setTodayAttendance(data.attendance);
      setHasCheckedIn(data.hasCheckedIn);
      setHasCheckedOut(!!data.attendance?.checkOut);
    } catch (error) {
      setAttendanceError('Không thể tải trạng thái chấm công hôm nay');
      setTodayAttendance(null);
      setHasCheckedIn(false);
      setHasCheckedOut(false);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleQuickCheckIn = async () => {
    try {
      await checkIn(token, internId);
      toast.success('Check-in thành công!');
      loadTodayAttendance();
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Lỗi khi check-in';
      toast.error(message);
    }
  };

  const handleQuickCheckOut = async () => {
    try {
      const result = await checkOut(token, internId);
      const hours = Math.floor(result.workingMinutes / 60);
      const minutes = result.workingMinutes % 60;
      toast.success(`Check-out thành công! (Làm việc: ${hours}h ${minutes} phút)`);
      loadTodayAttendance();
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Lỗi khi check-out';
      toast.error(message);
    }
  };

  const formatTime = (value) => {
    if (!value) return '--:--';
    return value.substring(0, 5);
  };

  const formatTimeFromDate = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const getTaskStatusLabel = (status) => {
    const map = {
      TODO: 'Chưa bắt đầu',
      IN_PROGRESS: 'Đang thực hiện',
      REVIEWED: 'Đã xem xét',
      DONE: 'Hoàn thành',
    };
    return map[status] || status || 'Không rõ';
  };

  const getTaskStatusClass = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'status doing';
      case 'DONE':
        return 'status done';
      case 'TODO':
      case 'REVIEWED':
      default:
        return 'status pending';
    }
  };

  const formatTaskDeadline = (deadline) => {
    if (!deadline) return '--';
    try {
      return new Date(deadline).toLocaleDateString('vi-VN');
    } catch (e) {
      return '--';
    }
  };

  const checkInStatusText = attendanceLoading
    ? 'Đang tải...'
    : hasCheckedIn
      ? (hasCheckedOut ? 'Đã hoàn tất' : 'Đã check-in')
      : 'Chưa check-in';

  return (
    <div className="dashboard-layout">
      <InternSidebar />
      <div className="dashboard-content">
        <h2 className="page-title">Dashboard thực tập sinh</h2>

        {/* Header Info */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon intern">📋</div>
            <div>
              <h4>Nhiệm vụ</h4>
              <p className="stat-value">
                {taskStatsLoading
                  ? 'Đang tải...'
                  : taskStats.inProgress + taskStats.todo}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon intern"></div>
            <div>
              <h4>Phụ cấp tháng</h4>
              <p className="stat-value">{formatCurrency(monthlyAllowance)}</p>
            </div>
          </div>
        </div>

        <div className="quick-checkin-card card">
          <h4>Chấm công</h4>
          {attendanceError && (
            <p className="attendance-error-text">{attendanceError}</p>
          )}
          {!attendanceError && (
            <>
              <div className="attendance-times">
                <div className="time-block">
                  <span>Check-in</span>
                  <strong>
                    {attendanceLoading
                      ? 'Đang tải...'
                      : !hasCheckedIn
                      ? formatTimeFromDate(currentTime)
                      : formatTime(todayAttendance?.checkIn)}
                  </strong>
                </div>
                <div className="time-block">
                  <span>Check-out</span>
                  <strong>
                    {attendanceLoading
                      ? 'Đang tải...'
                      : !hasCheckedIn
                      ? '--:--'
                      : formatTimeFromDate(currentTime)}
                  </strong>
                </div>
              </div>
              <div className="attendance-actions">
                <button
                  className="checkin-btn"
                  onClick={handleQuickCheckIn}
                  disabled={attendanceLoading || hasCheckedIn}
                >
                  {hasCheckedIn ? '✓ Đã check-in' : 'Check-in'}
                </button>
                <button
                  className="checkout-btn"
                  onClick={handleQuickCheckOut}
                  disabled={attendanceLoading || !hasCheckedIn}
                >
                  {hasCheckedOut ? 'Check-out' : 'Check-out'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="main-grid">
          <div className="card col-span-2">
            <h4>Nhiệm vụ gần đây</h4>
            <table className="task-table">
              <thead>
                <tr>
                  <th>Nhiệm vụ</th>
                  <th>Trạng thái</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {recentTasksLoading ? (
                  <tr>
                    <td colSpan="3">Đang tải...</td>
                  </tr>
                ) : recentTasks.length === 0 ? (
                  <tr>
                    <td colSpan="3">Không có nhiệm vụ nào gần đây</td>
                  </tr>
                ) : (
                  recentTasks.map((task) => (
                    <tr key={task.taskId}>
                      <td>{task.title || `Nhiệm vụ #${task.taskId}`}</td>
                      <td className={getTaskStatusClass(task.status)}>
                        {getTaskStatusLabel(task.status)}
                      </td>
                      <td>{formatTaskDeadline(task.deadline)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h4>Mentor & chương trình thực tập</h4>
            <div className="mentor-info">
              <img src={avatar} alt="avatar" />
              <div>
                <p>Mentor A</p>
                <p className="email">email@domain.com</p>
              </div>
            </div>
            <p>Doanh nghiệp: ABC Corp</p>
            <p>Thời gian: 01/01 - 31/03</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottom-grid">
          <LatestNotificationsWidget token={token} internId={internId} />
          <div className="card">
            <h4>Lịch</h4>
            <ul className="activity-list">
              <li>📅 Họp nhóm lúc 14:00</li>
              <li>🗓️ Nộp báo cáo vào thứ 6</li>
              <li>⏰ Check-in trước 9:00</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
