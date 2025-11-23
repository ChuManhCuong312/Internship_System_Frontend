import React from "react";
import ContractStatusBadge from "./ContractStatusBadge";
import DocxViewer from "./DocxViewer";
import "../../styles/contractPage.css";

const Field = ({ label, children }) => (
  <div className="viewer-field">
    <div className="viewer-label">{label}</div>
    <div className="viewer-value">{children}</div>
  </div>
);

const ContractViewer = ({ contract, onConfirm, onClose }) => {
  if (!contract) return null;

  const filePath = contract.content || contract.filePath || contract.fileUrl;
  const fileExt = filePath ? filePath.toLowerCase().split(".").pop() : null;
  const isDocx = fileExt === "docx";
  const isPdf = fileExt === "pdf";

  return (
    <div className="viewer-overlay" onClick={onClose}>
      <div className="contract-viewer-panel" onClick={(e) => e.stopPropagation()}>
        <button className="close-viewer-btn" onClick={onClose}>X</button>

        <div className="contract-viewer-header">
          <h3>{contract.title || "Hợp đồng"}</h3>
          <ContractStatusBadge status={contract.status} />
        </div>

        <Field label="Mã số">{contract.id || contract.code || "-"}</Field>
        <Field label="Ngày hiệu lực">
          {contract.effectiveDate
            ? new Date(contract.effectiveDate).toLocaleDateString("vi-VN")
            : "-"}
        </Field>

        <Field label="Tải file">
          {filePath ? (
            <a href={filePath} target="_blank" rel="noopener noreferrer" style={{ color: "#d32f2f", fontWeight: "bold" }}>
              {filePath.split("/").pop()} (Click để tải)
            </a>
          ) : "Không có file"}
        </Field>

        {/* NỘI DUNG FILE */}
        <div className="contract-content-box">
          {filePath ? (
            <>
              {/* DOCX → Microsoft Office Online (đẹp tuyệt đối) */}
              {isDocx && <DocxViewer fileUrl={filePath} />}

              {/* PDF → xem trực tiếp (nhanh nhất) */}
              {isPdf && (
                <iframe
                  src={filePath}
                  title="PDF Hợp đồng"
                  style={{
                    width: "100%",
                    height: "80vh",
                    border: "none",
                    borderRadius: "12px",
                    background: "#fff",
                  }}
                  frameBorder="0"
                />
              )}

              {!isDocx && !isPdf && (
                <div style={{ textAlign: "center", padding: "80px 20px", color: "#d32f2f", fontSize: "18px" }}>
                  <p>Không hỗ trợ xem trước định dạng này</p>
                  <a href={filePath} target="_blank" rel="noopener noreferrer" style={{ color: "#1976d2", textDecoration: "underline" }}>
                    Tải file về máy
                  </a>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "80px", color: "#999" }}>
              Không tìm thấy file hợp đồng
            </div>
          )}
        </div>

        {/* Nút xác nhận khi đang PENDING */}
        {contract.status === "PENDING" && (
          <div style={{ marginTop: 30, textAlign: "right", padding: "20px 0", borderTop: "1px solid #eee" }}>
            <button className="btn primary" onClick={() => onConfirm(contract)}>
              Xác nhận hợp đồng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractViewer;