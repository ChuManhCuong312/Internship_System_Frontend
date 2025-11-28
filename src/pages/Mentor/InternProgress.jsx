import React, { useState } from "react";
import MentorSidebar from "../../components/Layout/MentorSidebar";
import "../../styles/dashBoard.css";

const InternProgress = () => {
  const [interns, setInterns] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      department: "Kỹ thuật phần mềm",
      startDate: "01/09/2024",
      endDate: "01/12/2024",
      overallProgress: 80,
      technicalSkills: 85,
      softSkills: 75,
      attitude: 80,
      weeklyTasks: 12,
      completedTasks: 10,
      attendanceRate: 95,
      status: "On Track"
    },
    {
      id: 2,
      name: "Trần Thị B",
      department: "Digital Marketing",
      startDate: "01/09/2024",
      endDate: "01/12/2024",
      overallProgress: 65,
      technicalSkills: 70,
      softSkills: 80,
      attitude: 75,
      weeklyTasks: 10,
      completedTasks: 6,
      attendanceRate: 90,
      status: "Needs Attention"
    },
    {
      id: 3,
      name: "Lê Văn C",
      department: "UI/UX Design",
      startDate: "15/09/2024",
      endDate: "15/12/2024",
      overallProgress: 70,
      technicalSkills: 75,
      softSkills: 70,
      attitude: 70,
      weeklyTasks: 8,
      completedTasks: 5,
      attendanceRate: 92,
      status: "On Track"
    },
    {
      id: 4,
      name: "Phạm Thị D",
      department: "Kỹ thuật phần mềm",
      startDate: "01/09/2024",
      endDate: "01/12/2024",
      overallProgress: 90,
      technicalSkills: 95,
      softSkills: 85,
      attitude: 90,
      weeklyTasks: 12,
      completedTasks: 11,
      attendanceRate: 98,
      status: "Excellent"
    },
    {
      id: 5,
      name: "Hoàng Văn E",
      department: "Data Analysis",
      startDate: "01/10/2024",
      endDate: "01/01/2025",
      overallProgress: 45,
      technicalSkills: 50,
      softSkills: 60,
      attitude: 70,
      weeklyTasks: 6,
      completedTasks: 2,
      attendanceRate: 88,
      status: "Needs Improvement"
    }
  ]);

  const [selectedIntern, setSelectedIntern] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const getProgressColor = (progress) => {
    if (progress >= 80) return "#10b981";
    if (progress >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "Excellent": { color: "#10b981", bg: "#d1fae5" },
      "On Track": { color: "#3b82f6", bg: "#dbeafe" },
      "Needs Attention": { color: "#f59e0b", bg: "#fef3c7" },
      "Needs Improvement": { color: "#ef4444", bg: "#fee2e2" }
    };
    const config = statusConfig[status] || statusConfig["On Track"];
    return (
      <span style={{
        backgroundColor: config.bg,
        color: config.color,
        padding: "4px 12px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600"
      }}>
        {status}
      </span>
    );
  };

  const ProgressBar = ({ progress, color }) => (
    <div style={{ width: "100%", backgroundColor: "#e5e7eb", borderRadius: "8px", height: "8px" }}>
      <div
        style={{
          width: `${progress}%`,
          backgroundColor: color,
          height: "100%",
          borderRadius: "8px",
          transition: "width 0.3s ease"
        }}
      />
    </div>
  );

  const handleViewDetails = (intern) => {
    setSelectedIntern(intern);
    setShowDetails(true);
  };

  return (
    <div className="dashboard-layout">
      <MentorSidebar />
      <div className="dashboard-content">
        <h2 className="page-title">Theo dõi Tiến độ Thực tập sinh</h2>

        {/* Thống kê tổng quan */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon mentor">👥</div>
            <div>
              <h4>Tổng thực tập sinh</h4>
              <p className="stat-value">{interns.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">📈</div>
            <div>
              <h4>Tiến độ trung bình</h4>
              <p className="stat-value">
                {Math.round(interns.reduce((acc, i) => acc + i.overallProgress, 0) / interns.length)}%
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">✅</div>
            <div>
              <h4>Hoàn thành tốt</h4>
              <p className="stat-value">
                {interns.filter(i => i.overallProgress >= 80).length}
              </p>
            </div>
          </div>
        </div>

        {/* Bảng tiến độ */}
        <div className="card">
          <h4>Tiến độ chi tiết</h4>
          <div style={{ overflowX: "auto" }}>
            <table className="task-table">
              <thead>
                <tr>
                  <th>Thực tập sinh</th>
                  <th>Phòng ban</th>
                  <th>Tiến độ tổng</th>
                  <th>Kỹ năng chuyên môn</th>
                  <th>Kỹ năng mềm</th>
                  <th>Thái độ</th>
                  <th>Task hoàn thành</th>
                  <th>Điểm danh</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {interns.map(intern => (
                  <tr key={intern.id}>
                    <td>
                      <div>
                        <strong>{intern.name}</strong>
                        <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0 0" }}>
                          {intern.startDate} - {intern.endDate}
                        </p>
                      </div>
                    </td>
                    <td>{intern.department}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <ProgressBar progress={intern.overallProgress} color={getProgressColor(intern.overallProgress)} />
                        <span style={{ fontSize: "12px", fontWeight: "600", minWidth: "35px" }}>
                          {intern.overallProgress}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <ProgressBar progress={intern.technicalSkills} color={getProgressColor(intern.technicalSkills)} />
                        <span style={{ fontSize: "12px", fontWeight: "600", minWidth: "35px" }}>
                          {intern.technicalSkills}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <ProgressBar progress={intern.softSkills} color={getProgressColor(intern.softSkills)} />
                        <span style={{ fontSize: "12px", fontWeight: "600", minWidth: "35px" }}>
                          {intern.softSkills}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <ProgressBar progress={intern.attitude} color={getProgressColor(intern.attitude)} />
                        <span style={{ fontSize: "12px", fontWeight: "600", minWidth: "35px" }}>
                          {intern.attitude}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: "600" }}>{intern.completedTasks}/{intern.weeklyTasks}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                          {Math.round((intern.completedTasks / intern.weeklyTasks) * 100)}%
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: "600" }}>{intern.attendanceRate}%</div>
                      </div>
                    </td>
                    <td>{getStatusBadge(intern.status)}</td>
                    <td>
                      <button 
                        className="btn-primary btn-sm" 
                        onClick={() => handleViewDetails(intern)}
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal chi tiết */}
        {showDetails && selectedIntern && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0 }}>Chi tiết tiến độ - {selectedIntern.name}</h3>
                <button 
                  onClick={() => setShowDetails(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#6b7280"
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <p><strong>Phòng ban:</strong> {selectedIntern.department}</p>
                <p><strong>Kỳ thực tập:</strong> {selectedIntern.startDate} - {selectedIntern.endDate}</p>
                <p><strong>Trạng thái:</strong> {getStatusBadge(selectedIntern.status)}</p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ marginBottom: "12px" }}>Đánh giá chi tiết</h4>
                <div style={{ display: "grid", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span>Tiến độ tổng thể</span>
                      <span style={{ fontWeight: "600" }}>{selectedIntern.overallProgress}%</span>
                    </div>
                    <ProgressBar progress={selectedIntern.overallProgress} color={getProgressColor(selectedIntern.overallProgress)} />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span>Kỹ năng chuyên môn</span>
                      <span style={{ fontWeight: "600" }}>{selectedIntern.technicalSkills}%</span>
                    </div>
                    <ProgressBar progress={selectedIntern.technicalSkills} color={getProgressColor(selectedIntern.technicalSkills)} />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span>Kỹ năng mềm</span>
                      <span style={{ fontWeight: "600" }}>{selectedIntern.softSkills}%</span>
                    </div>
                    <ProgressBar progress={selectedIntern.softSkills} color={getProgressColor(selectedIntern.softSkills)} />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span>Thái độ học tập</span>
                      <span style={{ fontWeight: "600" }}>{selectedIntern.attitude}%</span>
                    </div>
                    <ProgressBar progress={selectedIntern.attitude} color={getProgressColor(selectedIntern.attitude)} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ marginBottom: "12px" }}>Thống kê hoạt động</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ textAlign: "center", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#3b82f6" }}>
                      {selectedIntern.completedTasks}/{selectedIntern.weeklyTasks}
                    </div>
                    <div style={{ fontSize: "14px", color: "#6b7280" }}>Task hoàn thành</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981" }}>
                      {selectedIntern.attendanceRate}%
                    </div>
                    <div style={{ fontSize: "14px", color: "#6b7280" }}>Tỷ lệ điểm danh</div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button 
                  className="btn-secondary"
                  onClick={() => setShowDetails(false)}
                >
                  Đóng
                </button>
                <button className="btn-primary">
                  Xuất báo cáo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ghi chú mentor */}
        <div className="card mt-6">
          <h4>Ghi chú và Đề xuất</h4>
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ padding: "12px", backgroundColor: "#fef3c7", borderRadius: "8px", borderLeft: "4px solid #f59e0b" }}>
              <strong>⚠️ Cần chú ý:</strong> Hoàng Văn E cần hỗ trợ thêm về kỹ năng phân tích dữ liệu và quản lý thời gian.
            </div>
            <div style={{ padding: "12px", backgroundColor: "#d1fae5", borderRadius: "8px", borderLeft: "4px solid #10b981" }}>
              <strong>✅ Xuất sắc:</strong> Phạm Thị D có tiến độ vượt trội, có thể giao các nhiệm vụ nâng cao hơn.
            </div>
            <div style={{ padding: "12px", backgroundColor: "#dbeafe", borderRadius: "8px", borderLeft: "4px solid #3b82f6" }}>
              <strong>💡 Đề xuất:</strong> Tổ chức buổi workshop chia sẻ kinh nghiệm giữa các thực tập sinh kỹ thuật.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternProgress;