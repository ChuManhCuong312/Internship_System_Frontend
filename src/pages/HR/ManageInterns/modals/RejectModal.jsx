import React from "react";
import Modal from "../../../../components/Layout/Modal";

const RejectModal = ({ intern, reason, setReason, onClose, onConfirm, error }) => (
  <Modal title={`Từ chối hồ sơ: ${intern?.fullName}`} onClose={onClose}>
    <div className="form-group">
      <label>Lý do từ chối *</label>
      <textarea
        className="form-input"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Nhập lý do từ chối hồ sơ..."
        rows={4}
        style={{ resize: 'vertical' }}
      />
      {error && <p className="field-error">{error}</p>}
    </div>
    <div className="modal-actions">
      <button className="btn-cancel" onClick={onClose}>Hủy</button>
      <button className="btn-save" onClick={onConfirm}>Xác nhận từ chối</button>
    </div>
  </Modal>
);

export default RejectModal;
