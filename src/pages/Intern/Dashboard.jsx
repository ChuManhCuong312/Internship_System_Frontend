import React from 'react';
import InternSidebar from '../../components/Layout/InternSidebar';
import '../../styles/dashBoard.css';
import avatar from "../../assets/avatar.png";

const Dashboard = () => {
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
            <div className="stat-icon intern">✅</div>
            <div>
              <h4>Check-in hôm nay</h4>
              <p className="stat-value">Đã checkin</p>
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

        {/* Main Content */}
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
            <h4>Chấm công hôm nay</h4>
            <p>Đã check-in lúc 08:15</p>
            <button className="checkin-btn">Check-in</button>
          </div>
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
