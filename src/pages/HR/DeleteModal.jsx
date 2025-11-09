import React from "react";
import Modal from "../../components/Layout/Modal";

const DeleteModal = ({ intern, onClose, onConfirm }) => (
  <Modal title="Xác nhận xóa hồ sơ" onClose={onClose}>
    <div className="form-group">
      <p>Bạn có chắc chắn muốn xóa hồ sơ của <strong>{intern?.fullName}</strong>?</p>
      <p style={{ color: '#dc3545', fontSize: '14px' }}>⚠️ Hành động này không thể hoàn tác!</p>
    </div>
    <div className="modal-actions">
      <button className="btn-cancel" onClick={onClose}>Hủy</button>
      <button className="btn-save" style={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' }} onClick={onConfirm}>Xác nhận xóa</button>
    </div>
  </Modal>
);

export default DeleteModal;
