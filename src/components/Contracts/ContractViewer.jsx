// src/components/Contracts/ContractViewer.jsx
import React from "react";
import ContractStatusBadge from "./ContractStatusBadge";
import "../../styles/contractPage.css"; // Đảm bảo import file CSS mới

const Field = ({ label, children }) => (
  <div className="viewer-field">
    <div className="viewer-label">{label}</div>
    <div className="viewer-value">{children}</div>
  </div>
);

const ContractViewer = ({ contract, onConfirm }) => {
  if (!contract) return (
    <div className="contract-viewer-panel" style={{ textAlign: 'center', color: '#666' }}>
      <p>Chọn một hợp đồng để xem chi tiết</p>
    </div>
  );

  return (
    <div className="contract-viewer-panel">
      <div className="contract-viewer-header">
        <h3>{contract.title}</h3>
        <ContractStatusBadge status={contract.status} />
      </div>

      <Field label="Mã hợp đồng">{contract.code || contract.id}</Field>
      
      <Field label="Ngày hiệu lực">
        {contract.effectiveDate ? new Date(contract.effectiveDate).toLocaleDateString() : "-"}
      </Field>
      
      <Field label="Thời gian xác nhận">
        {contract.confirmedAt ? new Date(contract.confirmedAt).toLocaleString() : "Chưa xác nhận"}
      </Field>

      <div className="contract-content-box">
        {contract.content || "Không có nội dung hiển thị."}
      </div>

      {contract.status === "PENDING" && (
        <div style={{ marginTop: 20, textAlign: "right" }}>
          <button className="btn primary" onClick={() => onConfirm(contract)}>
            Xác nhận hợp đồng
          </button>
        </div>
      )}
    </div>
  );
};

export default ContractViewer;