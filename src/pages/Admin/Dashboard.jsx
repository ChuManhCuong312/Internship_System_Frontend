import React from "react";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import "../../styles/dashBoard.css";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { CategoryScale, LinearScale, BarElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.register(CategoryScale, LinearScale, BarElement);

const UserManagement = () => {
  return (
    <div className="dashboard-layout">
      {/* Sidebar bên trái */}
      <AdminSidebar />

      {/* Nội dung bên phải */}
      <div className="dashboard-content">
        <h2 className="page-title">Bảng điều khiển người dùng</h2>

        {/* Hàng thống kê chính */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon hr">👩‍💼</div>
            <div>
              <h4>HR</h4>
              <p className="stat-value">5</p>
              <span>Nhân sự quản lý hệ thống</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">🧑‍🏫</div>
            <div>
              <h4>Mentor</h4>
              <p className="stat-value">8</p>
              <span>Đang hướng dẫn thực tập sinh</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon intern">🎓</div>
            <div>
              <h4>Intern</h4>
              <p className="stat-value">42</p>
              <span>Thực tập sinh đang hoạt động</span>
            </div>
          </div>
        </div>

        {/* Nút xem danh sách */}
        <div className="button-row">
          <button className="checkin-btn">Xem danh sách HR</button>
          <button className="checkin-btn">Xem danh sách Mentor</button>
          <button className="checkin-btn">Xem danh sách Intern</button>
        </div>

        {/* Khu biểu đồ + hoạt động */}
        <div className="main-grid">
          <div className="card chart-card">
            <h4>Thống kê người dùng</h4>
            <div className="chart-container">
              <Pie
                data={{
                  labels: ["HR", "Mentor", "Intern"],
                  datasets: [
                    {
                      data: [5, 8, 42],
                      backgroundColor: ["#00acc1", "#26a69a", "#66bb6a"],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>

          </div>
          <div className="card activity-card">
            <h4>Hoạt động gần đây</h4>
            <ul className="activity-list">
              <li>HR Nguyễn An tạo tài khoản Mentor</li>
              <li>Mentor Hương cập nhật đánh giá nhóm IT</li>
              <li>Intern Trí nộp báo cáo tuần</li>
            </ul>
          </div>
        </div>

        {/* Khu dưới cùng */}
        <div className="bottom-grid">
          <div className="card">
            <h4>Phân quyền người dùng</h4>
            <div className="chart-container">
              <Bar
                data={{
                  labels: ["HR", "Mentor", "Intern"],
                  datasets: [
                    {
                      label: "Số quyền truy cập",
                      data: [10, 6, 3],
                      backgroundColor: ["#00acc1", "#26a69a", "#66bb6a"],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="card">
            <h4>Nhật ký đăng nhập</h4>
            <table className="task-table">
              <thead>
                <tr>
                  <th>Tài khoản</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>HR Thu</td>
                  <td>09:12 hôm nay</td>
                  <td className="status done">Thành công</td>
                </tr>
                <tr>
                  <td>Mentor Long</td>
                  <td>08:45 hôm nay</td>
                  <td className="status done">Thành công</td>
                </tr>
                <tr>
                  <td>Intern Quang</td>
                  <td>07:30 hôm nay</td>
                  <td className="status pending">Thất bại</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <h4>Gợi ý bảo mật</h4>
            <ul className="security-tips">
              <li>Thay đổi mật khẩu mỗi 90 ngày</li>
              <li>Bật xác thực hai bước cho HR</li>
              <li>Không chia sẻ tài khoản nội bộ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
