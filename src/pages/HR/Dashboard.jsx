import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HRSidebar from "../../components/Layout/HRSidebar";
import "../../styles/dashBoard.css";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { AuthContext } from "../../context/AuthContext";
import hrApi from "../../api/hrApi";
import { getAllLeaveRequestsForHR } from "../../api/leaveRequestApi";
import { toast } from "react-toastify";
import { FileClock, UserCheck, Layers3, BarChart3, Users } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const MAJOR_COLORS = ["#00acc1", "#26a69a", "#66bb6a"]; // reused for chart and legend

const HRDashboard = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pendingInterns, setPendingInterns] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [programCount, setProgramCount] = useState(0);
  const [activeMentors, setActiveMentors] = useState(0);
  const [majorLabels, setMajorLabels] = useState([]);
  const [internMajorStats, setInternMajorStats] = useState([]);
  const [programOverview, setProgramOverview] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;

      try {
        setLoadingStats(true);

        const [internRes, leaveRes, programRes, mentorsRes] = await Promise.all([
          hrApi.searchInterns(token, {
            status: "PENDING",
            page: 0,
            size: 1000,
          }),
          getAllLeaveRequestsForHR(token, "PENDING"),
          // Backend expects page index to start from 1, so use page: 1 (same as hrApi default)
          hrApi.getAllPrograms(token, { page: 1, size: 5 }),
          hrApi.getAllMentors(token),
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

        let totalPrograms = 0;
        let programsData = [];
        if (programRes) {
          if (typeof programRes.totalItems === "number") {
            totalPrograms = programRes.totalItems;
          } else if (typeof programRes.totalElements === "number") {
            totalPrograms = programRes.totalElements;
          }

          if (Array.isArray(programRes.data)) {
            programsData = programRes.data;
            if (!totalPrograms) {
              totalPrograms = programRes.data.length;
            }
          }
        }

        let totalMentors = 0;
        if (mentorsRes) {
          if (typeof mentorsRes.totalItems === "number") {
            totalMentors = mentorsRes.totalItems;
          } else if (typeof mentorsRes.totalElements === "number") {
            totalMentors = mentorsRes.totalElements;
          } else if (Array.isArray(mentorsRes)) {
            totalMentors = mentorsRes.length;
          } else if (Array.isArray(mentorsRes.data)) {
            totalMentors = mentorsRes.data.length;
          }
        }

        let majors = [];
        try {
          const majorsRes = await hrApi.getAllMajors(token);
          if (Array.isArray(majorsRes)) {
            majors = majorsRes;
          }
        } catch (e) {
          majors = [];
        }

        const majorResponses = await Promise.all(
          majors.map((major) =>
            hrApi
              .searchInterns(token, {
                major,
                page: 0,
                size: 1,
              })
              .catch(() => null)
          )
        );

        const majorCounts = majorResponses.map((res) => {
          if (!res) return 0;

          if (typeof res.totalItems === "number") {
            return res.totalItems;
          }
          if (typeof res.totalElements === "number") {
            return res.totalElements;
          }
          if (Array.isArray(res.content)) {
            return res.content.length;
          }
          if (Array.isArray(res.data)) {
            return res.data.length;
          }

          return 0;
        });

        // Build per-program overview rows using getProgramOverview
        const overviewResponses = await Promise.all(
          programsData.map((program) =>
            hrApi
              .getProgramOverview(token, program.programId)
              .catch(() => null)
          )
        );

        const programRows = programsData.map((program, index) => {
          const ov = overviewResponses[index] || {};
          let internTotal = 0;
          let mentorTotal = 0;

          if (typeof ov.totalInterns === "number") {
            internTotal = ov.totalInterns;
          }
          if (typeof ov.totalMentors === "number") {
            mentorTotal = ov.totalMentors;
          }

          const name =
            program.programName ||
            program.name ||
            program.title ||
            `Chương trình #${program.programId || index + 1}`;

          return {
            id: program.programId || program.id || index,
            name,
            internTotal,
            mentorTotal,
          };
        });

        setPendingInterns(internPendingCount);
        setPendingLeaves(leavePendingCount);
        setProgramCount(totalPrograms);
        setActiveMentors(totalMentors);
        setMajorLabels(majors);
        setInternMajorStats(majorCounts);
        setProgramOverview(programRows);
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
          <div
            className="stat-card clickable-card"
            onClick={() => navigate("/hr/leave-requests")}
          >
            <div className="stat-icon intern">
              <FileClock />
            </div>
            <div>
              <h4>Đơn nghỉ phép đang chờ duyệt</h4>
              <p className="stat-value">{pendingLeaves}</p>
              <span>
                {loadingStats
                  ? "Đang tải thống kê đơn nghỉ phép..."
                  : ""}
              </span>
            </div>
          </div>
          <div
            className="stat-card clickable-card"
            onClick={() => navigate("/hr/approve-interns")}
          >
            <div className="stat-icon mentor">
              <UserCheck />
            </div>
            <div>
              <h4>Hồ sơ đang chờ duyệt</h4>
              <p className="stat-value">{pendingInterns}</p>
              <span>
                {loadingStats
                  ? "Đang tải thống kê hồ sơ..."
                  : ""}
              </span>
            </div>
          </div>
          <div
            className="stat-card clickable-card"
            onClick={() => navigate("/hr/program")}
          >
            <div className="stat-icon mentor">
              <Layers3 />
            </div>
            <div>
              <h4>Chương trình</h4>
              <p className="stat-value">{programCount}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">
              <Users />
            </div>
            <div>
              <h4>Mentor đang hoạt động</h4>
              <p className="stat-value">{activeMentors}</p>
            </div>
          </div>
        </div>

        {/* Middle Section */}
        <div className="main-grid">
          <div className="card chart-card intern-majors-card">
            <h4>Thực tập sinh theo ngành</h4>
            <div className="chart-container chart-container-large">
              <div className="intern-chart-row">
                <div className="intern-chart-canvas">
                  <Pie
                    data={{
                      labels: majorLabels,
                      datasets: [
                        {
                          data: internMajorStats,
                          backgroundColor: MAJOR_COLORS,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                      },
                    }}
                  />
                </div>
                <div className="intern-chart-legend">
                  {majorLabels.map((label, index) => (
                    <div className="intern-chart-legend-item" key={label || index}>
                      <span
                        className="intern-chart-legend-color"
                        style={{
                          backgroundColor: MAJOR_COLORS[index % MAJOR_COLORS.length],
                        }}
                      />
                      <span className="intern-chart-legend-label">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottom-grid">
          <div className="card program-table-card">
            <h4>Chương trình</h4>
            <table className="task-table">
              <thead>
                <tr>
                  <th>Chương trình</th>
                  <th>Số TTS</th>
                  <th>Số mentor phụ trách</th>
                </tr>
              </thead>
              <tbody>
                {programOverview.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.internTotal}</td>
                    <td>{row.mentorTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
