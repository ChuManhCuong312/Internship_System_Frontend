import React, { useContext, useState } from "react";
import hrApi from "../../../../api/hrApi";
import { AuthContext } from "../../../../context/AuthContext";
import RejectModal from "../modals/RejectModal";
import { LoadingButton } from "../../../../components/common/LoadingSpinner";
import { toast } from "react-toastify";

const HRInternRow = ({ intern, index, translateStatus, onStatusChange, onEdit }) => {
  const { token } = useContext(AuthContext);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await hrApi.updateInternStatus(token, intern.internId, "APPROVED");
      toast.success("Duyệt hồ sơ thành công ✅");
      onStatusChange();
    } catch (err) {
      console.error("Error approving intern:", err);
      toast.error("Duyệt hồ sơ thất bại ❌");
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      setIsRejecting(true);
      await hrApi.updateInternStatus(token, intern.internId, "REJECTED", reason);
      toast.success("Từ chối hồ sơ thành công");
      setShowRejectModal(false);
      setReason("");
      setError("");
      onStatusChange();
    } catch (err) {
      console.error("Error rejecting intern:", err);
      toast.error("Từ chối hồ sơ thất bại ❌");
    } finally {
      setIsRejecting(false);
    }
  };

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
            <a href={intern.cvPath} target="_blank" rel="noopener noreferrer">
              📄 Xem/Tải CV
            </a>
          )}
          {intern.permissionFile && (
            <a href={intern.permissionFile} target="_blank" rel="noopener noreferrer">
              📄 Xem/Tải đơn xin
            </a>
          )}
        </td>
        <td>
          <span className={getStatusClass(intern.status)}>
            {translateStatus(intern.status)}
          </span>
        </td>
        <td>
          {intern.status === "PENDING" ? (
            <div className="action-buttons">
              <LoadingButton
                className="btn-approve"
                onClick={handleApprove}
                isLoading={isApproving}
                disabled={isRejecting}
              >
                {isApproving ? "Đang duyệt..." : "Duyệt"}
              </LoadingButton>
              <LoadingButton
                className="btn-reject"
                onClick={() => setShowRejectModal(true)}
                isLoading={isRejecting}
                disabled={isApproving}
              >
                Từ chối
              </LoadingButton>
            </div>
          ) : (
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
          onClose={() => {
            setShowRejectModal(false);
            setError("");
            setReason("");
          }}
          onConfirm={handleRejectConfirm}
          isLoading={isRejecting}
        />
      )}
    </>
  );
};

export default HRInternRow;