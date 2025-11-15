import React from "react";
import Modal from "../Layout/Modal";

const ConfirmContractModal = ({ open, contract, onClose, onConfirm }) => {
  if (!open) return null;
  if (!contract) return null;

  return (
    <Modal title="Xác nhận hợp đồng" onClose={onClose}>
      <div style={{ padding: 8 }}>
        <p>Bạn xác nhận đã đọc và đồng ý với các điều khoản của hợp đồng "{contract.title}"?</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <button className="btn" onClick={onClose}>Huỷ</button>
          <button className="btn primary" onClick={() => onConfirm(contract)}>Xác nhận</button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmContractModal;

