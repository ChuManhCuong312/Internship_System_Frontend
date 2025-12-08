import React, { useState, useEffect, useContext } from "react";
import HRSidebar from "../../../components/Layout/HRSidebar";
import "../../../styles/dashBoard.css";
import "../../../styles/table.css";
import "../../../styles/badges.css";
import "../../../styles/buttons.css";
import "../../../styles/leaveRequest.css";
import { AuthContext } from "../../../context/AuthContext";
import {
  getAllLeaveRequestsForHR,
  approveLeaveRequestByHR,
  rejectLeaveRequestByHR,
} from "../../../api/leaveRequestApi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import RejectLeaveModal from "./RejectLeaveModal"

const LeaveManagement = () => {
  const { token, user } = useContext(AuthContext);
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [searchName, setSearchName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allRequests, setAllRequests] = useState([]);
  const [requests, setRequests] = useState([]);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

const [showRejectModal, setShowRejectModal] = useState(false);
const [rejectingRequest, setRejectingRequest] = useState(null);
const [rejectReason, setRejectReason] = useState("");
const [rejectError, setRejectError] = useState("");
const [isRejecting, setIsRejecting] = useState(false);

  const hrId = user?.userId || null;

  useEffect(() => {
    if (!token) return;
    fetchAll();
  }, [token, filterStatus]);

  useEffect(() => {
    applyFilters();
  }, [allRequests, searchName, page, size]);

  useEffect(() => {
    setPage(0);
  }, [searchName, filterStatus]);

  const fetchAll = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);

      const data = await getAllLeaveRequestsForHR(
        token,
        filterStatus || undefined
      );

      const list = Array.isArray(data) ? data : [];
      setAllRequests(list);
    } catch (e) {
      setError("Không thể tải danh sách đơn nghỉ phép.");
      setAllRequests([]);
      setRequests([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allRequests];

    if (searchName.trim()) {
      const searchLower = searchName.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const name = (item.fullName || item.internName || "").toLowerCase();
        return name.includes(searchLower);
      });
    }

    filtered.sort((a, b) => {
      const timeA = a.requestDate ? new Date(a.requestDate).getTime() : 0;
      const timeB = b.requestDate ? new Date(b.requestDate).getTime() : 0;
      return timeB - timeA;
    });

    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginated = filtered.slice(startIndex, endIndex);

    setRequests(paginated);
    setTotalElements(filtered.length);
    setTotalPages(Math.ceil(filtered.length / size));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--/--/----";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return String(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const STATUS_CONFIG = {
    PENDING: {
      text: "Chờ duyệt",
      className: "status-pending",
    },
    APPROVED: {
      text: "Đã duyệt",
      className: "status-approved",
    },
    REJECTED: {
      text: "Từ chối",
      className: "status-rejected",
    },
  };

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    return (
      <span className={`status-badge ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const handleApprove = async (request) => {
    if (!hrId) {
      toast.error("Không tìm thấy thông tin HR");
      return;
    }

    const result = await Swal.fire({
      title: "Duyệt đơn nghỉ phép",
      text: "Bạn có chắc chắn muốn duyệt đơn này?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Duyệt",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) return;

    try {
      await approveLeaveRequestByHR(token, request.leaveId, hrId);
      toast.success("Đã duyệt đơn nghỉ phép");
      fetchAll();
    } catch (e) {
      toast.error(e.message || "Lỗi khi duyệt đơn nghỉ phép");
    }
  };

  const handleReject = (request) => {
    setRejectingRequest(request);
    setRejectReason("");
    setRejectError("");
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      setRejectError("Vui lòng nhập lý do từ chối");
      return;
    }
    try {
      setIsRejecting(true);
      await rejectLeaveRequestByHR(token, rejectingRequest.leaveId, hrId, rejectReason);
      toast.success("Đã từ chối đơn nghỉ phép");
      setShowRejectModal(false);
      setRejectingRequest(null);
      fetchAll();
    } catch (e) {
      toast.error(e.message || "Lỗi khi từ chối đơn nghỉ phép");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchName("");
    setFilterStatus("");
  };

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="dashboard-content">
        <div className="history-section">
          <div className="manage-users-header">
            <h2 className="page-title">Quản lý đơn nghỉ phép</h2>
            <h3>Danh sách đơn nghỉ phép theo trạng thái</h3>
            <div className="header-top">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="search-input"
              />

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            </div>

            <div className="clear-filter-container">
              <button
                type="button"
                className="clear-filter-btn"
                onClick={handleClearFilters}
              >
                
                ✖ Clear filter
              </button>
            </div>
          </div>

          {loading && (
            <div className="loading-spinner">Đang tải dữ liệu đơn nghỉ phép...</div>
          )}

          {error && !loading && (
            <div className="attendance-error-box">{error}</div>
          )}

          {!loading && !error && (
            <>
              <div className="leave-requests-list">
                {requests && requests.length > 0 ? (
                  <div className="requests-grid">
                    {requests.map((item, index) => {
                      const name = item.fullName || item.internName || "--";
                      const programName = item.programName || "--";
                      const start = formatDate(item.startDate);
                      const end = formatDate(item.endDate);
                      const requestDate = formatDate(item.requestDate);
                      const days = calculateDays(item.startDate, item.endDate);

                      return (
                        <div
                          key={item.leaveId || index}
                          className="request-card"
                        >
                          <div className="card-header">
                            <div className="card-date">
                              <span>
                                {name}
                              </span>
                            </div>
                            {getStatusBadge(item.status)}
                          </div>

                          <div className="card-body">
                            <div className="card-info-row">
                              <span>
                                <strong>Chương trình: </strong>
                                {programName}
                              </span>
                            </div>
                            <div className="card-info-row">
                              <span>
                                <strong>Thời gian: </strong>
                                {start} - {end} ({days} ngày)
                              </span>
                            </div>
                            <div className="card-reason">
                              <strong>Lý do:</strong>
                              <p>{item.reason}</p>
                            </div>
                            {item.rejectionReason && (
                              <div className="card-rejection">
                                <strong>Lý do từ chối:</strong>
                                <p>{item.rejectionReason}</p>
                              </div>
                            )}
                            <div className="card-date-submitted">
                              <small>
                                Ngày gửi: {requestDate} • ID TTS: {item.internId}
                              </small>
                            </div>
                            {item.status === "APPROVED" &&
                              (item.hrName || item.processedBy) && (
                                <div className="card-info-row">
                                  <span>
                                    <strong>Người duyệt: </strong>
                                    {item.hrName
                                      ? `${item.hrName} (ID HR: ${item.processedBy})`
                                      : `ID HR: ${item.processedBy}`}
                                  </span>
                                </div>
                              )}
                            {item.status === "REJECTED" &&
                              (item.hrName || item.processedBy) && (
                                <div className="card-info-row">
                                  <span>
                                    <strong>Người từ chối: </strong>
                                    {item.hrName
                                      ? `${item.hrName} (ID HR: ${item.processedBy})`
                                      : `ID HR: ${item.processedBy}`}
                                  </span>
                                </div>
                              )}
                          </div>

                          {item.status === "PENDING" && (
                            <div className="card-actions action-buttons">
                              <button
                                type="button"
                                className="btn-approve"
                                onClick={() => handleApprove(item)}
                              >
                                Duyệt
                              </button>
                              <button
                                type="button"
                                className="btn-reject"
                                onClick={() => handleReject(item)}
                              >
                                Từ chối
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-data">
                    <p>Chưa có đơn nghỉ phép</p>
                  </div>
                )}
              </div>

              {showRejectModal && rejectingRequest && (
                <RejectLeaveModal
                  request={rejectingRequest}
                  reason={rejectReason}
                  setReason={setRejectReason}
                  error={rejectError}
                  onClose={() => setShowRejectModal(false)}
                  onConfirm={handleConfirmReject}
                  isLoading={isRejecting}
                />
              )}

              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  Trang trước
                </button>

                <span className="pagination-info">
                  Trang {page + 1} / {totalPages || 1} ({totalElements} bản ghi)
                </span>

                <button
                  className="pagination-btn"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Trang sau
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
