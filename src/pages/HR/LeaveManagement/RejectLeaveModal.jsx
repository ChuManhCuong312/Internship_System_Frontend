import React from "react";
import Modal from "../../../components/Layout/Modal";
import { LoadingButton } from "../../../components/Common/LoadingSpinner";

const predefinedReasons = [
  "Không phù hợp kế hoạch công việc",
  "Thiếu nhân sự thay thế",
  "Thời gian nghỉ không hợp lý",
  "Đơn không đầy đủ thông tin",
  "Khác"
];

const RejectLeaveModal = ({ request, reason, setReason, error, onClose, onConfirm, isLoading }) => {
  const handleSelectChange = (e) => {
    const value = e.target.value;
    if (value !== "Khác") {
      setReason(value);
    } else {
      setReason("");
    }
  };

  return (
    <Modal title={`Từ chối đơn nghỉ phép: ${request.fullName}`} onClose={onClose}>
      <div className="form-group">
        <label>Lý do từ chối *</label>
        <select
          className="form-input"
          value={predefinedReasons.includes(reason) ? reason : "Khác"}
          onChange={handleSelectChange}
          disabled={isLoading}
        >
          {predefinedReasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {(!predefinedReasons.includes(reason) || reason === "") && (
          <textarea
            className="form-input"
            rows="4"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do từ chối đơn nghỉ phép..."
            disabled={isLoading}
          />
        )}

        {error && <p className="field-error">{error}</p>}
      </div>

      <div className="modal-actions">
        <button className="btn-cancel" onClick={onClose} disabled={isLoading}>
          Hủy
        </button>
        <LoadingButton
          className="btn-confirm-reject"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          Xác nhận từ chối
        </LoadingButton>
      </div>
    </Modal>
  );
};

export default RejectLeaveModal;
