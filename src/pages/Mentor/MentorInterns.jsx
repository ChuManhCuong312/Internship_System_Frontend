import React from "react";
import MentorSidebar from "../../components/Layout/MentorSidebar";
import "../../styles/dashBoard.css";

const MentorInterns = () => {
  return (
    <div className="dashboard-layout">
      <MentorSidebar />
      <div className="dashboard-content">
        <h2 className="page-title">Quản lý Thực tập sinh</h2>

        {/* Thống kê nhanh */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon mentor">👥</div>
            <div>
              <h4>Tổng số thực tập sinh</h4>
              <p className="stat-value">6</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">✅</div>
            <div>
              <h4>Đang thực tập</h4>
              <p className="stat-value">5</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">📊</div>
            <div>
              <h4>Tiến độ trung bình</h4>
              <p className="stat-value">72%</p>
            </div>
          </div>
        </div>

        {/* Danh sách thực tập sinh */}
        <div className="card">
          <h4>Danh sách thực tập sinh</h4>
          <table className="task-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Ngành</th>
                <th>Ngày bắt đầu</th>
                <th>Tiến độ</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Nguyễn Văn A</td>
                <td>nguyena@email.com</td>
                <td>Kỹ thuật phần mềm</td>
                <td>01/09/2024</td>
                <td className="status done">80%</td>
                <td className="status active">Đang thực tập</td>
                <td>
                  <button className="btn-primary">Xem chi tiết</button>
                </td>
              </tr>
              <tr>
                <td>Trần Thị B</td>
                <td>tranb@email.com</td>
                <td>Digital Marketing</td>
                <td>01/09/2024</td>
                <td className="status pending">65%</td>
                <td className="status active">Đang thực tập</td>
                <td>
                  <button className="btn-primary">Xem chi tiết</button>
                </td>
              </tr>
              <tr>
                <td>Lê Văn C</td>
                <td>lec@email.com</td>
                <td>UI/UX Design</td>
                <td>15/09/2024</td>
                <td className="status pending">70%</td>
                <td className="status active">Đang thực tập</td>
                <td>
                  <button className="btn-primary">Xem chi tiết</button>
                </td>
              </tr>
              <tr>
                <td>Phạm Thị D</td>
                <td>phamd@email.com</td>
                <td>Kỹ thuật phần mềm</td>
                <td>01/09/2024</td>
                <td className="status done">90%</td>
                <td className="status active">Đang thực tập</td>
                <td>
                  <button className="btn-primary">Xem chi tiết</button>
                </td>
              </tr>
              <tr>
                <td>Hoàng Văn E</td>
                <td>hoange@email.com</td>
                <td>Data Analysis</td>
                <td>01/10/2024</td>
                <td className="status pending">45%</td>
                <td className="status active">Đang thực tập</td>
                <td>
                  <button className="btn-primary">Xem chi tiết</button>
                </td>
              </tr>
              <tr>
                <td>Đỗ Thị F</td>
                <td>dof@email.com</td>
                <td>Business Analysis</td>
                <td>01/09/2024</td>
                <td className="status inactive">Đã kết thúc</td>
                <td className="status completed">Hoàn thành</td>
                <td>
                  <button className="btn-secondary">Xem chi tiết</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MentorInterns;
