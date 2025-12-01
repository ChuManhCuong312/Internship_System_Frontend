import React, { useState } from "react";
import MentorSidebar from "../../components/Layout/MentorSidebar";
import "../../styles/dashBoard.css";

const MentorFeedback = () => {
  const [reports, setReports] = useState([
    {
      id: 1,
      internName: "Nguyễn Văn A",
      title: "Báo cáo tuần 3 - Phát triển frontend",
      submitDate: "2024-11-25",
      status: "Pending",
      type: "Weekly Report",
      description: "Báo cáo tiến độ thực hiện các task frontend trong tuần 3",
      content: "Tuần này đã hoàn thành được 3/4 nhiệm vụ được giao. Cần thêm thời gian để hoàn thành task cuối cùng về responsive design.",
      mentorFeedback: ""
    },
    {
      id: 2,
      internName: "Trần Thị B",
      title: "Báo cáo chiến dịch marketing tháng 11",
      submitDate: "2024-11-24",
      status: "Reviewed",
      type: "Campaign Report",
      description: "Tổng kết hiệu quả chiến dịch marketing tháng 11",
      content: "Chiến dịch đạt được 120% KPI về lượt tiếp cận, 85% về chuyển đổi. Đề xuất cải thiện nội dung video cho tháng sau.",
      mentorFeedback: "Tốt! Cần phân tích sâu hơn về insight khách hàng và A/B testing cho các nội dung."
    },
    {
      id: 3,
      internName: "Lê Văn C",
      title: "Báo cáo thiết kế UI cho ứng dụng mobile",
      submitDate: "2024-11-23",
      status: "Pending",
      type: "Design Report",
      description: "Báo cáo tiến độ thiết kế giao diện ứng dụng mobile",
      content: "Đã hoàn thành thiết kế 15/20 màn hình. Đang gặp khó khăn về consistency trong design system.",
      mentorFeedback: ""
    },
    {
      id: 4,
      internName: "Phạm Thị D",
      title: "Báo cáo kỹ năng mềm - Giao tiếp nhóm",
      submitDate: "2024-11-22",
      status: "Reviewed",
      type: "Soft Skills Report",
      description: "Tự đánh giá và cải thiện kỹ năng giao tiếp nhóm",
      content: "Tham gia active trong các buổi họp nhóm, chủ động chia sẻ ý kiến. Cần cải thiện kỹ năng lắng nghe.",
      mentorFeedback: "Tiến bộ tốt! Tiếp tục phát huy và chú ý hơn đến feedback từ các thành viên khác."
    },
    {
      id: 5,
      internName: "Hoàng Văn E",
      title: "Báo cáo phân tích dữ liệu khách hàng",
      submitDate: "2024-11-21",
      status: "Pending",
      type: "Analysis Report",
      description: "Phân tích hành vi khách hàng quý 4",
      content: "Sử dụng Excel và Power BI để phân tích dữ liệu. Tìm ra 3 insight chính về hành vi mua sắm.",
      mentorFeedback: ""
    }
  ]);

  const [selectedReport, setSelectedReport] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [filter, setFilter] = useState("all");

  const handleFeedback = (report) => {
    setSelectedReport(report);
    setShowFeedbackForm(true);
    setFeedback(report.mentorFeedback || "");
  };

  const handleSubmitFeedback = () => {
    if (selectedReport && feedback.trim()) {
      setReports(reports.map(r => 
        r.id === selectedReport.id 
          ? { ...r, status: "Reviewed", mentorFeedback: feedback }
          : r
      ));
      setShowFeedbackForm(false);
      setSelectedReport(null);
      setFeedback("");
    }
  };

  const getStatusClass = (status) => {
    return status === "Reviewed" ? "status done" : "status pending";
  };

  const getTypeBadge = (type) => {
    const badgeConfig = {
      "Weekly Report": { color: "#3b82f6", bg: "#dbeafe" },
      "Campaign Report": { color: "#10b981", bg: "#d1fae5" },
      "Design Report": { color: "#8b5cf6", bg: "#ede9fe" },
      "Soft Skills Report": { color: "#f59e0b", bg: "#fef3c7" },
      "Analysis Report": { color: "#ef4444", bg: "#fee2e2" }
    };
    const config = badgeConfig[type] || badgeConfig["Weekly Report"];
    return (
      <span style={{
        backgroundColor: config.bg,
        color: config.color,
        padding: "4px 8px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: "600"
      }}>
        {type}
      </span>
    );
  };

  const filteredReports = reports.filter(report => {
    if (filter === "pending") return report.status === "Pending";
    if (filter === "reviewed") return report.status === "Reviewed";
    return true;
  });

  const pendingCount = reports.filter(r => r.status === "Pending").length;
  const reviewedCount = reports.filter(r => r.status === "Reviewed").length;

  return (
    <div className="dashboard-layout">
      <MentorSidebar />
      <div className="dashboard-content">
        <h2 className="page-title">Phản hồi Báo cáo</h2>

        {/* Thống kê nhanh */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon mentor">📝</div>
            <div>
              <h4>Tổng báo cáo</h4>
              <p className="stat-value">{reports.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">⏳</div>
            <div>
              <h4>Chờ phản hồi</h4>
              <p className="stat-value">{pendingCount}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">✅</div>
            <div>
              <h4>Đã phản hồi</h4>
              <p className="stat-value">{reviewedCount}</p>
            </div>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="card mb-4">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ margin: 0 }}>Danh sách báo cáo</h4>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className={filter === "all" ? "btn-primary" : "btn-secondary"}
                onClick={() => setFilter("all")}
                style={{ padding: "8px 16px", fontSize: "14px" }}
              >
                Tất cả ({reports.length})
              </button>
              <button
                className={filter === "pending" ? "btn-primary" : "btn-secondary"}
                onClick={() => setFilter("pending")}
                style={{ padding: "8px 16px", fontSize: "14px" }}
              >
                Chờ phản hồi ({pendingCount})
              </button>
              <button
                className={filter === "reviewed" ? "btn-primary" : "btn-secondary"}
                onClick={() => setFilter("reviewed")}
                style={{ padding: "8px 16px", fontSize: "14px" }}
              >
                Đã phản hồi ({reviewedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Form phản hồi */}
        {showFeedbackForm && selectedReport && (
          <div className="card mb-6">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h4 style={{ margin: 0 }}>Phản hồi báo cáo: {selectedReport.title}</h4>
              <button 
                onClick={() => setShowFeedbackForm(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#6b7280"
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
              <p><strong>Thực tập sinh:</strong> {selectedReport.internName}</p>
              <p><strong>Ngày nộp:</strong> {selectedReport.submitDate}</p>
              <p><strong>Loại báo cáo:</strong> {getTypeBadge(selectedReport.type)}</p>
              <p><strong>Mô tả:</strong> {selectedReport.description}</p>
              <div style={{ marginTop: "12px" }}>
                <strong>Nội dung báo cáo:</strong>
                <p style={{ marginTop: "4px", lineHeight: "1.5", color: "#374151" }}>
                  {selectedReport.content}
                </p>
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Nội dung phản hồi
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Nhập phản hồi chi tiết của bạn về báo cáo này..."
                rows="6"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  resize: "vertical"
                }}
              ></textarea>
            </div>

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "16px" }}>
              <button 
                className="btn-secondary"
                onClick={() => setShowFeedbackForm(false)}
              >
                Hủy
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSubmitFeedback}
                disabled={!feedback.trim()}
              >
                Gửi phản hồi
              </button>
            </div>
          </div>
        )}

        {/* Danh sách báo cáo */}
        <div className="card">
          <table className="task-table">
            <thead>
              <tr>
                <th>Tiêu đề báo cáo</th>
                <th>Thực tập sinh</th>
                <th>Loại báo cáo</th>
                <th>Ngày nộp</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map(report => (
                <tr key={report.id}>
                  <td>
                    <div>
                      <strong>{report.title}</strong>
                      <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 0 0" }}>
                        {report.description}
                      </p>
                      {report.mentorFeedback && (
                        <p style={{ 
                          fontSize: "11px", 
                          color: "#059669", 
                          margin: "4px 0 0 0",
                          fontStyle: "italic"
                        }}>
                          "Đã phản hồi: {report.mentorFeedback.substring(0, 50)}..."
                        </p>
                      )}
                    </div>
                  </td>
                  <td>{report.internName}</td>
                  <td>{getTypeBadge(report.type)}</td>
                  <td>{report.submitDate}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(report.status)}`}>
                      {report.status === "Reviewed" ? "Đã phản hồi" : "Chờ phản hồi"}
                    </span>
                  </td>
                  <td>
                    {report.status === "Pending" ? (
                      <button 
                        className="btn-primary btn-sm" 
                        onClick={() => handleFeedback(report)}
                      >
                        Phản hồi
                      </button>
                    ) : (
                      <button 
                        className="btn-secondary btn-sm" 
                        onClick={() => handleFeedback(report)}
                      >
                        Xem/Sửa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hoạt động gần đây */}
        <div className="card mt-6">
          <h4>Hoạt động phản hồi gần đây</h4>
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px",
              padding: "12px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px"
            }}>
              <div style={{ 
                width: "32px", 
                height: "32px", 
                borderRadius: "50%", 
                backgroundColor: "#d1fae5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px"
              }}>
                ✅
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 4px 0" }}>
                  Đã phản hồi báo cáo của <strong>Trần Thị B</strong> - Chiến dịch marketing tháng 11
                </p>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>2 ngày trước</span>
              </div>
            </div>

            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px",
              padding: "12px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px"
            }}>
              <div style={{ 
                width: "32px", 
                height: "32px", 
                borderRadius: "50%", 
                backgroundColor: "#d1fae5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px"
              }}>
                📝
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 4px 0" }}>
                  Đã phản hồi báo cáo của <strong>Phạm Thị D</strong> - Kỹ năng mềm
                </p>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>3 ngày trước</span>
              </div>
            </div>

            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px",
              padding: "12px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px"
            }}>
              <div style={{ 
                width: "32px", 
                height: "32px", 
                borderRadius: "50%", 
                backgroundColor: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px"
              }}>
                ⏳
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 4px 0" }}>
                  <strong>Nguyễn Văn A</strong> đã nộp báo cáo tuần 3 - Chờ phản hồi
                </p>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>Hôm nay</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thống kê theo loại báo cáo */}
        <div className="card mt-6">
          <h4>Thống kê theo loại báo cáo</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            {["Weekly Report", "Campaign Report", "Design Report", "Soft Skills Report", "Analysis Report"].map(type => {
              const typeReports = reports.filter(r => r.type === type);
              const pending = typeReports.filter(r => r.status === "Pending").length;
              const total = typeReports.length;
              
              return (
                <div key={type} style={{ 
                  textAlign: "center", 
                  padding: "16px", 
                  backgroundColor: "#f9fafb", 
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb"
                }}>
                  <div style={{ marginBottom: "8px" }}>
                    {getTypeBadge(type)}
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937" }}>
                    {total}
                  </div>
                  <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>
                    Tổng báo cáo
                  </div>
                  <div style={{ fontSize: "12px", color: pending > 0 ? "#ef4444" : "#10b981" }}>
                    {pending > 0 ? `${pending} chờ phản hồi` : "Đã hoàn thành"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorFeedback;