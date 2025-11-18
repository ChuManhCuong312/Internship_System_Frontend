import React, { useContext, useState } from "react";
import hrApi from "../../../../api/hrApi";
import { AuthContext } from "../../../../context/AuthContext";
import RejectModal from "../modals/RejectModal";

const HRInternRow = ({ intern, index, translateStatus, onStatusChange, onEdit }) => {
  const { token } = useContext(AuthContext);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleApprove = async () => {
    await hrApi.updateInternStatus(token, intern.internId, "APPROVED");
    onStatusChange();
  };

  const handleRejectConfirm = async () => {
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do từ chối");
      return;
    }
    await hrApi.updateInternStatus(token, intern.internId, "REJECTED", reason);
    setShowRejectModal(false);
    setReason("");
    setError("");
    onStatusChange();
  };

  // Hàm tạo class name cho status badge
  const getStatusClass = (status) => {
    const statusMap = {
      'PENDING': 'status-chờ-duyệt',
      'APPROVED': 'status-đã-duyệt',
      'REJECTED': 'status-bị-từ-chối',
      'NO_FILE': 'status-chưa-xác-thực',
      'ACTIVE': 'status-đã-duyệt',
      'COMPLETED': 'status-hợp-đồng-hoàn-tất'
    };
    return `status-badge ${statusMap[status] || ''}`;
  };

  return (
    <>
      <tr>
        <td>{index + 1}</td>
        <td>{intern.fullName}</td>
        <td>{intern.email}</td>
        <td>{intern.phone}</td>
        <td>{intern.major}</td>
        <td>{intern.gpa}</td>
        <td>
                  {intern.cvPath && (
                    <a href={`/${intern.cvPath}`} download>{intern.cvPath}</a>
                  )}
                  {intern.permissionFile && (
                    <>
                      {" | "}
                      <a href={`/${intern.permissionFile}`} download>
                        {intern.permissionFile}
                      </a>
                    </>
                  )}
                  {!intern.cvPath && !intern.permissionFile && "Chưa có"}
                </td>
                <td>
                  <span className={getStatusClass(intern.status)}>
                    {translateStatus(intern.status)}
                  </span>
                </td>
        <td>
          {intern.status === "PENDING" && (
            <div className="action-buttons">
              <button className="btn-approve" onClick={handleApprove}>
                Duyệt
              </button>
              <button className="btn-reject" onClick={() => setShowRejectModal(true)}>
                Từ chối
              </button>
            </div>
          )}
          {intern.status === "APPROVED" && (
            <div className="action-buttons">
              <button className="btn-edit" onClick={() => onEdit(intern)}>
                ✏️ Sửa hồ sơ
              </button>
            </div>
          )}
        </td>
      </tr>

      {showRejectModal && (
        <RejectModal
          intern={intern}
          reason={reason}
          setReason={setReason}
          error={error}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleRejectConfirm}
        />
      )}
    </>
  );
};

export default HRInternRow;