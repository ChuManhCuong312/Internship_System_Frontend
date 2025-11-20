import React, { useContext, useState } from "react";
import hrApi from "../../../../api/hrApi";
import { AuthContext } from "../../../../context/AuthContext";
import RejectModal from "../modals/RejectModal";
import { LoadingButton } from "../../../../components/common/LoadingSpinner";
import { toast } from "react-toastify";

const HRInternRow = ({
  intern,
  index,
  translateStatus,
  onStatusChange,
  onEdit,
  onView,
  showDocuments = true,
  showApproveActions = false,
  showStatus = true,
  isMatching = false,
  appliedCriteria,
}) => {
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
      PENDING: "status-chờ-duyệt",
      APPROVED: "status-đã-duyệt",
      REJECTED: "status-bị-từ-chối",
      NO_FILE: "status-chưa-xác-thực",
      ACTIVE: "status-đã-duyệt",
      COMPLETED: "status-hợp-đồng-hoàn-tất"
    };
    return `status-badge ${statusMap[status] || ""}`;
  };

  // Xác định class cho nút dựa trên việc có áp dụng tiêu chí và phù hợp hay không
  const getButtonClass = (buttonType) => {
    if (!appliedCriteria) return '';

    if (buttonType === 'approve') {
      // Nếu phù hợp tiêu chí -> nút Duyệt sáng, nếu không -> mờ
      return isMatching ? 'btn-bright' : 'btn-dim';
    } else {
      // Nếu không phù hợp tiêu chí -> nút Từ chối sáng, nếu phù hợp -> mờ
      return !isMatching ? 'btn-bright' : 'btn-dim';
    }
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

        {showDocuments && (
          <td>
            <div className="doc-list">
              {intern.cvPath && (
                <a href={intern.cvPath} target="_blank" rel="noopener noreferrer" className="doc-item">
                  CV
                </a>
              )}
              {intern.permissionFile && (
                <a href={intern.permissionFile} target="_blank" rel="noopener noreferrer" className="doc-item">
                  Đơn xin
                </a>
              )}
              {intern.universityConfirm && (
                <a href={intern.universityConfirm} target="_blank" rel="noopener noreferrer" className="doc-item">
                  Xác nhận
                </a>
              )}
            </div>
          </td>
        )}


        <td>{intern.school}</td>

        {showStatus && (
          <td>
            <span className={getStatusClass(intern.status)}>
              {translateStatus(intern.status)}
            </span>
          </td>
        )}

        <td>
          <div className="action-buttons">
            {showApproveActions && intern.status === "PENDING" ? (
              <>
                <LoadingButton
                  className={`btn-approve ${getButtonClass('approve')}`}
                  onClick={handleApprove}
                  isLoading={isApproving}
                  disabled={isRejecting}
                  title={isMatching && appliedCriteria ? '✅ Phù hợp tiêu chí - Nên duyệt' : appliedCriteria && !isMatching ? '⚠️ Không phù hợp tiêu chí' : 'Duyệt hồ sơ'}
                >
                  Duyệt
                </LoadingButton>
                <LoadingButton
                  className={`btn-reject ${getButtonClass('reject')}`}
                  onClick={() => setShowRejectModal(true)}
                  isLoading={isRejecting}
                  disabled={isApproving}
                  title={!isMatching && appliedCriteria ? '❌ Không phù hợp tiêu chí - Có thể từ chối' : appliedCriteria && isMatching ? '✅ Phù hợp tiêu chí' : 'Từ chối hồ sơ'}
                >
                  Từ chối
                </LoadingButton>
              </>
            ) : (
              <>
                {onView && (
                  <button className="btn-view" onClick={() => onView(intern)}>
                    Xem
                  </button>
                )}
                {onEdit && (
                  <button className="btn-edit" onClick={() => onEdit(intern)}>
                    Sửa
                  </button>
                )}
              </>
            )}
          </div>
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