import React from "react";
import MentorSidebar from "../../components/Layout/MentorSidebar";
import "../../styles/dashBoard.css";
import avatar from "../../assets/avatar.png";

const MentorDashboard = () => {
  return (
    <div className="dashboard-layout">
      <MentorSidebar />
      <div className="dashboard-content">
        <h2 className="page-title">Mentor Dashboard</h2>

        {/* Thống kê nhanh */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon mentor">👨‍🏫</div>
            <div>
              <h4>Thực tập sinh đang hướng dẫn</h4>
              <p className="stat-value">6</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">📋</div>
            <div>
              <h4>Nhiệm vụ đã giao</h4>
              <p className="stat-value">12</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">📝</div>
            <div>
              <h4>Báo cáo đã phản hồi</h4>
              <p className="stat-value">8</p>
            </div>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="main-grid">
          <div className="card col-span-2">
            <h4>Danh sách thực tập sinh</h4>
            <table className="task-table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Ngành</th>
                  <th>Tiến độ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Nguyễn Văn A</td>
                  <td>Kỹ thuật</td>
                  <td className="status done">80%</td>
                </tr>
                <tr>
                  <td>Trần Thị B</td>
                  <td>Marketing</td>
                  <td className="status pending">65%</td>
                </tr>
                <tr>
                  <td>Lê Văn C</td>
                  <td>Thiết kế</td>
                  <td className="status pending">70%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <h4>Thông tin mentor</h4>
            <div className="mentor-info">
              <img src={avatar} alt="avatar" />
              <div>
                <p>Mentor Dương</p>
                <p className="email">duong@mentor.com</p>
              </div>
            </div>
            <p>Phòng ban: Kỹ thuật</p>
            <p>Số lượng TTS: 6</p>
          </div>
        </div>

        {/* Dưới cùng */}
        <div className="bottom-grid">
          <div className="card">
            <h4>Nhiệm vụ cần giao</h4>
            <ul className="activity-list">
              <li>Chuẩn bị nhiệm vụ tuần 3</li>
              <li>Giao bài tập nhóm IT</li>
              <li>Thiết lập deadline báo cáo</li>
            </ul>
          </div>

          <div className="card">
            <h4>Báo cáo chờ phản hồi</h4>
            <ul className="activity-list">
              <li>Báo cáo tuần của TTS A</li>
              <li>Báo cáo kỹ năng mềm TTS B</li>
              <li>Báo cáo thiết kế TTS C</li>
            </ul>
          </div>

          <div className="card">
            <h4>Đánh giá cuối kỳ</h4>
            <ul className="activity-list">
              <li>Đánh giá TTS A: kỹ năng & thái độ</li>
              <li>Đánh giá TTS B: tiến độ & sáng tạo</li>
              <li>Gửi tổng hợp cho HR</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
