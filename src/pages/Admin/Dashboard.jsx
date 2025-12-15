import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import "../../styles/dashBoard.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { AuthContext } from "../../context/AuthContext";
import { getAllUsers } from "../../api/userApi";

ChartJS.register(ArcElement, Tooltip, Legend);

const UserManagement = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [userStats, setUserStats] = useState({
    hr: 0,
    mentor: 0,
    intern: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!token) return;

      try {
        setLoadingStats(true);
        setStatsError(null);

        const [hrRes, mentorRes, internRes] = await Promise.all([
          getAllUsers(token, { page: 1, size: 1, roleId: 2 }),
          getAllUsers(token, { page: 1, size: 1, roleId: 3 }),
          getAllUsers(token, { page: 1, size: 1, roleId: 4 }),
        ]);

        const extractCount = (res) => {
          if (typeof res?.totalItems === "number") {
            return res.totalItems;
          }
          if (Array.isArray(res?.data)) {
            return res.data.length;
          }
          return 0;
        };

        const hrCount = extractCount(hrRes);
        const mentorCount = extractCount(mentorRes);
        const internCount = extractCount(internRes);

        setUserStats({
          hr: hrCount,
          mentor: mentorCount,
          intern: internCount,
        });
      } catch (error) {
        console.error("Error loading admin dashboard stats:", error);
        setStatsError("Không thể tải thống kê người dùng");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchUserStats();
  }, [token]);

  return (
    <div className="dashboard-layout">
      {/* Sidebar bên trái */}
      <AdminSidebar />

      {/* Nội dung bên phải */}
      <div className="dashboard-content">
        <h2 className="page-title">Bảng điều khiển người dùng</h2>

        {/* Hàng thống kê chính */}
        <div className="stats-row">
          <div
            className="stat-card clickable-card"
            onClick={() => navigate("/admin/users")}
          >
            <div className="stat-icon hr">👩‍💼</div>
            <div>
              <h4>HR</h4>
              <p className="stat-value">{loadingStats ? "..." : userStats.hr}</p>
              <span>Nhân sự quản lý hệ thống</span>
            </div>
          </div>
          <div
            className="stat-card clickable-card"
            onClick={() => navigate("/admin/users")}
          >
            <div className="stat-icon mentor">🧑‍🏫</div>
            <div>
              <h4>Mentor</h4>
              <p className="stat-value">{loadingStats ? "..." : userStats.mentor}</p>
              <span>Đang hướng dẫn thực tập sinh</span>
            </div>
          </div>
          <div
            className="stat-card clickable-card"
            onClick={() => navigate("/admin/users")}
          >
            <div className="stat-icon intern">🎓</div>
            <div>
              <h4>Intern</h4>
              <p className="stat-value">{loadingStats ? "..." : userStats.intern}</p>
              <span>Thực tập sinh đang hoạt động</span>
            </div>
            </div>
        </div>

        {/* Biểu đồ thống kê người dùng */}
        <div className="main-grid">
          <div className="card chart-card">
            <h4 className="chart-title">Thống kê người dùng</h4>
            <div className="chart-container">
              <Pie
                data={{
                  labels: ["HR", "Mentor", "Intern"],
                  datasets: [
                    {
                      data: [userStats.hr, userStats.mentor, userStats.intern],
                      backgroundColor: ["#00acc1", "#26a69a", "#66bb6a"],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
