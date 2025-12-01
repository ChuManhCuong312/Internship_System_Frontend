import React, { useContext, useEffect, useState } from "react";
import HRSidebar from "../../components/Layout/HRSidebar";
import "../../styles/dashBoard.css";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { AuthContext } from "../../context/AuthContext";
import hrApi from "../../api/hrApi";
import { getAllLeaveRequestsForHR } from "../../api/leaveRequestApi";
import { toast } from "react-toastify";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const HRDashboard = () => {
  const { token } = useContext(AuthContext);
  const [pendingInterns, setPendingInterns] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;

      try {
        setLoadingStats(true);

        const [internRes, leaveRes] = await Promise.all([
          hrApi.searchInterns(token, {
            status: "PENDING",
            page: 0,
            size: 1000,
          }),
          getAllLeaveRequestsForHR(token, "PENDING"),
        ]);

        let internPendingCount = 0;
        if (internRes) {
          if (typeof internRes.totalElements === "number") {
            internPendingCount = internRes.totalElements;
          } else if (typeof internRes.totalItems === "number") {
            internPendingCount = internRes.totalItems;
          } else if (Array.isArray(internRes.content)) {
            internPendingCount = internRes.content.length;
          }
        }

        const leavePendingCount = Array.isArray(leaveRes) ? leaveRes.length : 0;

        setPendingInterns(internPendingCount);
        setPendingLeaves(leavePendingCount);
      } catch (err) {
        console.error("Error loading HR dashboard stats:", err);
        toast.error("Không thể tải thống kê dashboard HR");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [token]);

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
              <h4>Đơn nghỉ phép</h4>
              <p className="stat-value">{pendingLeaves}</p>
              <span>
                {loadingStats
                  ? "Đang tải thống kê đơn nghỉ phép..."
                  : "Đơn nghỉ phép đang chờ duyệt"}
              </span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">🧑‍🏫</div>
            <div>
              <h4>Hồ sơ thực tập sinh</h4>
              <p className="stat-value">{pendingInterns}</p>
              <span>
                {loadingStats
                  ? "Đang tải thống kê hồ sơ..."
                  : "Hồ sơ thực tập sinh đang chờ duyệt"}
              </span>
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
            <div className="stat-icon hr">📊</div>
            <div>
              <h4>Tỷ lệ hoàn thành</h4>
              <p className="stat-value">78%</p>
              <span>TTS đã hoàn thành chương trình</span>
            </div>
          </div>
          <div className="stat-card">
            <p className="stat-value">8</p>
            <span>Số lượng mentor đang hoạt động</span>
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
                      data: [50, 40, 25],
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
