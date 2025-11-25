import React from "react";
import Modal from "../../../../components/Layout/Modal";
import { LoadingButton } from "../../../../components/common/LoadingSpinner";

const RejectModal = ({ intern, reason, setReason, error, onClose, onConfirm, isLoading }) => (
  <Modal title={`Từ chối hồ sơ: ${intern.fullName}`} onClose={onClose}>
    <div className="form-group">
      <label>Lý do từ chối *</label>
      <textarea
        className="form-input"
        rows="4"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Nhập lý do từ chối hồ sơ..."
        disabled={isLoading}
      />
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

export default RejectModal;