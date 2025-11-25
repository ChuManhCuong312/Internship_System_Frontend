import React from "react";
import ContractStatusBadge from "./ContractStatusBadge";
import "../../styles/styles.css";

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
    <div style={{ fontWeight: 500 }}>{children}</div>
  </div>
);

const ContractViewer = ({ contract, onConfirm }) => {
  if (!contract) return (
    <div style={{ padding: 16, color: "#666" }}>Chọn một hợp đồng để xem chi tiết</div>
  );

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>{contract.title}</h3>
        <ContractStatusBadge status={contract.status} />
      </div>

      <Field label="Mã hợp đồng">{contract.code || contract.id}</Field>
      <Field label="Ngày tạo">{new Date(contract.createdAt).toLocaleString()}</Field>
      <Field label="Ngày hiệu lực">{contract.effectiveDate ? new Date(contract.effectiveDate).toLocaleDateString() : "-"}</Field>
      <Field label="Thời gian xác nhận">{contract.confirmedAt ? new Date(contract.confirmedAt).toLocaleString() : "Chưa xác nhận"}</Field>

      <div style={{ marginTop: 12, padding: 12, background: "#fafafa", borderRadius: 6, whiteSpace: "pre-wrap" }}>
        {contract.content}
      </div>

      {contract.status === "PENDING" && (
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button className="btn primary" onClick={() => onConfirm(contract)}>
            Xác nhận hợp đồng
          </button>
        </div>
      )}
    </div>
  );
};

export default ContractViewer;

