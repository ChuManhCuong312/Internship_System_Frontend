import React from "react";
import HRSidebar from "../../components/Layout/HRSidebar";
import "../../styles/dashBoard.css";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const HRDashboard = () => {
  return (
    <div className="dashboard-layout">
      <HRSidebar />

      <div className="dashboard-content">
        <h2 className="page-title">HR Dashboard</h2>

        {/* Top Cards */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon intern">🎓</div>
            <div>
              <h4>Thực tập sinh</h4>
              <p className="stat-value">42</p>
              <span>42 đang tham gia / 10 chờ duyệt</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">🧑‍🏫</div>
            <div>
              <h4>Chương trình</h4>
              <p className="stat-value">3</p>
              <span>Kỹ thuật, Marketing, Thiết kế</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">🧑‍🏫</div>
            <div>
              <h4>Mentor</h4>
              <p className="stat-value">8</p>
              <span>Số lượng mentor đang hoạt động</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon hr">📊</div>
            <div>
              <h4>Tỷ lệ hoàn thành</h4>
              <p className="stat-value">78%</p>
              <span>TTS đã hoàn thành chương trình</span>
            </div>
          </div>
        </div>

        {/* Middle Section */}
        <div className="main-grid">
          <div className="card chart-card">
            <h4>Phản hồi thực tập sinh</h4>
            <div className="chart-container">
              <Pie
                data={{
                  labels: ["CNTT", "Kinh tế số", "Thiết kế đồ họa"],
                  datasets: [
                    {
                      data: [50, 40, 25], // tổng phản hồi mỗi ngành
                      backgroundColor: ["#00acc1", "#26a69a", "#66bb6a"],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "bottom" },
                  },
                }}
              />
            </div>

          </div>
          <div className="card">
            <h4>Tiến độ chương trình</h4>
            <div className="chart-container">
              <Bar
                data={{
                  labels: ["CNTT", "Kinh tế số", "Thiết kế đồ họa"],
                  datasets: [
                    {
                      label: "% hoàn thành",
                      data: [78, 72, 66],
                      backgroundColor: ["#00acc1", "#26a69a", "#66bb6a"],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true, max: 100 },
                  },
                }}
              />
            </div>

          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottom-grid">
          <div className="card">
            <h4>Lịch sắp tới</h4>
            <ul className="activity-list">
              <li>📅 Họp đánh giá nhóm Marketing</li>
              <li>⏰ Hạn nộp báo cáo tuần này</li>
              <li>🗓️ Buổi review giao tiếp</li>
            </ul>
          </div>

          <div className="card">
            <h4>Thông báo nội bộ</h4>
            <ul className="activity-list">
              <li>Mentor Nguyễn An đã đánh giá 3 TTS tuần này</li>
              <li>TTS Trinh Minh gửi yêu cầu hỗ trợ</li>
              <li>Chương trình Marketing đạt 77% hoàn thành</li>
            </ul>
          </div>

          <div className="card">
            <h4>Tiến độ theo phòng ban</h4>
            <table className="task-table">
              <thead>
                <tr>
                  <th>Phòng ban</th>
                  <th>Số TTS</th>
                  <th>Mentor</th>
                  <th>% Hoàn thành</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>IT</td>
                  <td>10</td>
                  <td>2</td>
                  <td className="status done">58%</td>
                </tr>
                <tr>
                  <td>Marketing</td>
                  <td>15</td>
                  <td>1</td>
                  <td className="status pending">72%</td>
                </tr>
                <tr>
                  <td>Thiết kế</td>
                  <td>5</td>
                  <td>1</td>
                  <td className="status pending">66%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
