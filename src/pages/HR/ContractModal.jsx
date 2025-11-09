import React from "react";
import Modal from "../../components/Layout/Modal";

const ContractModal = ({ intern, contractFile, setContractFile, onClose, onConfirm, error }) => (
  <Modal title={`Gửi hợp đồng cho: ${intern?.fullName}`} onClose={onClose}>
    <div className="form-group">
      <label>Chọn file hợp đồng *</label>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => setContractFile(e.target.files[0])}
        className="form-input"
      />
      {contractFile && <p style={{ marginTop: '8px', color: '#28a745', fontSize: '14px' }}>✅ Đã chọn: {contractFile.name}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
    <div className="modal-actions">
      <button className="btn-cancel" onClick={onClose}>Hủy</button>
      <button className="btn-save" onClick={onConfirm}>Gửi hợp đồng</button>
    </div>
  </Modal>
);

export default ContractModal;
