import React from "react";
import Modal from "../../../../components/Layout/Modal";
import { LoadingButton } from "../../../../components/common/LoadingSpinner";
import "../../../../styles/table.css";
import "../../../../styles/modal.css";
import "../../../../styles/buttons.css";

const ApproveModal = ({ intern, onClose, onConfirm, isLoading }) => {
  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(intern.dob);

  return (
    <Modal title="Xác nhận duyệt hồ sơ" onClose={onClose}>
      <div className="approve-modal">
        {/* Thông tin ứng viên */}
        <div className="approve-modal__section">
          <h3 className="approve-modal__heading">Thông tin ứng viên</h3>
          <div className="profile-details">
            <InfoRow label="Họ tên" value={intern.fullName} />
            <InfoRow label="Email" value={intern.email} />
            <InfoRow label="Số điện thoại" value={intern.phone} />
            <InfoRow label="Ngành" value={intern.major} />
            <InfoRow label="GPA" value={intern.gpa} highlight={true} />
            <InfoRow label="Trường" value={intern.school} />
            {age && <InfoRow label="Tuổi" value={`${age} tuổi`} />}
          </div>
        </div>

        {/* Tài liệu đã nộp */}
        <div className="approve-modal__section approve-modal__section--documents">
          <h3 className="approve-modal__heading">Tài liệu đã nộp</h3>
          {intern.status === "NO_FILE" ? (
            <span className="doc-status">Chưa có</span>
          ) : (
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
          )}
        </div>

        {/* Xác nhận */}
        <div className="warning-box">
          <strong>⚠️ Xác nhận duyệt hồ sơ:</strong>
          <p>
            Sau khi duyệt, hồ sơ sẽ được chuyển sang trạng thái <strong>"Đã duyệt"</strong> và ứng viên có thể tiếp tục các bước tiếp theo trong quy trình thực tập.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="modal-actions">
        <button className="btn-cancel" onClick={onClose} disabled={isLoading}>
          Hủy
        </button>
        <LoadingButton className="btn-save" onClick={onConfirm} isLoading={isLoading}>
          Xác nhận duyệt
        </LoadingButton>
      </div>
    </Modal>
  );
};

const InfoRow = ({ label, value, highlight }) => (
  <div className="detail-row">
    <label>{label}:</label>
    <span className={highlight ? "highlight-value" : ""}>{value}</span>
  </div>
);

export default ApproveModal;