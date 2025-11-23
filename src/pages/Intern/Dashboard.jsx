import React, { useEffect, useState, useContext } from 'react';
import InternSidebar from '../../components/Layout/InternSidebar';
import '../../styles/dashBoard.css';
import avatar from "../../assets/avatar.png";
import { AuthContext } from '../../context/AuthContext';
import { getInternByUserId } from '../../api/internApi';
import { getTodayAttendance, checkIn, checkOut } from '../../api/attendanceApi';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user, token, loading: authLoading } = useContext(AuthContext);

  const [internId, setInternId] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState(null);

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
  }, [token, internId]);

  const loadTodayAttendance = async () => {
    try {
      setAttendanceLoading(true);
      setAttendanceError(null);
      const data = await getTodayAttendance(token, internId);
      setTodayAttendance(data.attendance);
      setHasCheckedIn(data.hasCheckedIn);
      setHasCheckedOut(data.hasCheckedOut);
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
              <h4>Nhiệm vụ đang làm</h4>
              <p className="stat-value">3/5</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon intern">📝</div>
            <div>
              <h4>Báo cáo tuần</h4>
              <p className="stat-value">Đã nộp</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon intern">💰</div>
            <div>
              <h4>Phụ cấp tháng</h4>
              <p className="stat-value">1.000.000</p>
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
                  <strong>{formatTime(todayAttendance?.checkIn)}</strong>
                </div>
                <div className="time-block">
                  <span>Check-out</span>
                  <strong>{formatTime(todayAttendance?.checkOut)}</strong>
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
                  disabled={attendanceLoading || !hasCheckedIn || hasCheckedOut}
                >
                  {hasCheckedOut ? '✓ Đã check-out' : 'Check-out'}
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
                <tr>
                  <td>Nhiệm vụ 1</td>
                  <td className="status doing">Đang làm</td>
                  <td>03/03</td>
                </tr>
                <tr>
                  <td>Nhiệm vụ 2</td>
                  <td className="status pending">Chưa làm</td>
                  <td>09/03</td>
                </tr>
                <tr>
                  <td>Nhiệm vụ 3</td>
                  <td className="status done">Đã làm</td>
                  <td>08/03</td>
                </tr>
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
          <div className="card">
            <h4>Thông báo mới</h4>
            <ul className="activity-list">
              <li>Mentor A đã phản hồi báo cáo tuần</li>
              <li>Buổi review kỹ năng vào thứ 5</li>
              <li>Thêm nhiệm vụ mới từ phòng IT</li>
            </ul>
          </div>
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
