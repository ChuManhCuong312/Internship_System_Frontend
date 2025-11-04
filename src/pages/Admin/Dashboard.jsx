import React from "react";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import "../../styles/dashBoard.css";

const UserManagement = () => {
  return (
    <div className="dashboard-layout">
      {/* Sidebar bên trái */}
      <AdminSidebar />

      {/* Nội dung bên phải */}
      <div className="dashboard-content">
        <h2 className="page-title">Quản trị người dùng</h2>

        {/* 3 vùng đầu: HR / Mentor / Intern */}
        <div className="header-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="card">
            <h4>HR</h4>
            <p style={{ fontSize: "28px", fontWeight: "bold", color: "#00796b" }}>5</p>
            <span>Nhân sự quản lý hệ thống</span>
          </div>
          <div className="card">
            <h4>Mentor</h4>
            <p style={{ fontSize: "28px", fontWeight: "bold", color: "#00796b" }}>8</p>
            <span>Đang hướng dẫn thực tập sinh</span>
          </div>
          <div className="card">
            <h4>Intern</h4>
            <p style={{ fontSize: "28px", fontWeight: "bold", color: "#00796b" }}>42</p>
            <span>Thực tập sinh đang hoạt động</span>
          </div>
        </div>

        {/* Nút xem danh sách cho 3 vùng trên */}
        <div className="header-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="card" style={{ textAlign: "center" }}>
            <button className="checkin-btn">Xem danh sách HR</button>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <button className="checkin-btn">Xem danh sách Mentor</button>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <button className="checkin-btn">Xem danh sách Intern</button>
          </div>
        </div>

        {/* 6 vùng còn lại chia trong main-grid & bottom-grid */}
        <div className="main-grid">
          <div className="card">
            <h4>Thống kê người dùng</h4>
            <div className="chart-placeholder">
              <p>[Biểu đồ tròn: Phân bố vai trò]</p>
            </div>
          </div>
          <div className="card">
            <h4>Hoạt động gần đây</h4>
            <ul>
              <li>HR Nguyễn An tạo tài khoản Mentor</li>
              <li>Mentor Hương cập nhật đánh giá nhóm IT</li>
              <li>Intern Trí nộp báo cáo tuần</li>
            </ul>
          </div>
        </div>

        <div className="bottom-grid">
          <div className="card">
            <h4>Phân quyền người dùng</h4>
            <div className="chart-placeholder">
              <p>[Sơ đồ quyền truy cập]</p>
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
                <tr><td>HR Thu</td><td>09:12 hôm nay</td><td className="status done">Thành công</td></tr>
                <tr><td>Mentor Long</td><td>08:45 hôm nay</td><td className="status done">Thành công</td></tr>
                <tr><td>Intern Quang</td><td>07:30 hôm nay</td><td className="status pending">Thất bại</td></tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <h4>Gợi ý bảo mật</h4>
            <ul>
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
