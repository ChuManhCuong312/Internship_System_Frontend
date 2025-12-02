import React, { useEffect, useState, useContext } from "react";
import InternSidebar from "../../components/Layout/InternSidebar";
import { AuthContext } from "../../context/AuthContext";
import Cookies from "js-cookie";
import { getMySupportRequests } from "../../api/supportApi";
import Modal from "../../components/Layout/Modal";
import "../../styles/dashBoard.css";
import "../../styles/supportRequest.css";

const MySupport = () => {
  const { user, token } = useContext(AuthContext);
  const [internId, setInternId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    try {
      const cookieInternId = Cookies.get("internId");
      if (cookieInternId) {
        setInternId(parseInt(cookieInternId));
      } else if (user?.internId) {
        setInternId(user.internId);
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    if (!token || !internId) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMySupportRequests(token, internId);
        setRequests(Array.isArray(data) ? data : data?.content || []);
      } catch (err) {
        setError(err?.message || "Không thể tải danh sách yêu cầu hỗ trợ");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, internId]);

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ xử lý";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Từ chối";
      default:
        return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case "TECHNICAL":
        return "Kỹ thuật";
      case "HR":
        return "Nhân sự";
      case "ADMINISTRATIVE":
        return "Hành chính";
      case "OTHER":
        return "Khác";
      default:
        return type;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <div className="dashboard-layout">
      <InternSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1>Yêu cầu hỗ trợ của tôi</h1>
        </div>

        {error && (
          <div className="card" style={{ marginBottom: 16, color: "#b91c1c" }}>{error}</div>
        )}

        <div className="table-container">
          <table className="support-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Loại</th>
                <th>Tiêu đề</th>
                <th>Trạng thái</th>
                <th>Ngày yêu cầu</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>Đang tải...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">Không có dữ liệu</td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.supportId}>
                    <td>{r.supportId}</td>
                    <td>
                      <span className="type-badge">{getTypeText(r.supportType)}</span>
                    </td>
                    <td className="title-cell">{r.title}</td>
                    <td>
                      <span className={`status-badge ${
                        r.status === "PENDING"
                          ? "status-pending"
                          : r.status === "APPROVED"
                          ? "status-approved"
                          : r.status === "REJECTED"
                          ? "status-rejected"
                          : ""
                      }`}>
                        {getStatusText(r.status)}
                      </span>
                    </td>
                    <td>{formatDate(r.requestDate)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-detail" onClick={() => setSelected(r)}>Chi tiết</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <Modal title="Chi tiết yêu cầu hỗ trợ" onClose={() => setSelected(null)}>
            <div className="support-detail-modal">
              <div className="detail-section">
                <h3>Thông tin yêu cầu</h3>
                <div className="detail-grid">
                  <div className="detail-row"><label>ID:</label><span>{selected.supportId}</span></div>
                  <div className="detail-row"><label>Loại:</label><span>{getTypeText(selected.supportType)}</span></div>
                  <div className="detail-row"><label>Trạng thái:</label><span className="highlight-value">{getStatusText(selected.status)}</span></div>
                  <div className="detail-row"><label>Ngày yêu cầu:</label><span>{formatDate(selected.requestDate)}</span></div>
                </div>
              </div>
              <div className="detail-section">
                <h3>Nội dung</h3>
                <div className="content-box">
                  <h4>{selected.title}</h4>
                  <p>{selected.description}</p>
                </div>
              </div>
              {selected.response && (
                <div className="detail-section response-section">
                  <h3>Phản hồi</h3>
                  <p>{selected.response}</p>
                </div>
              )}
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setSelected(null)}>Đóng</button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default MySupport;
