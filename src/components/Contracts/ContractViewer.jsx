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
  const fileExt = filePath ? filePath.toLowerCase().split(".").pop() : "file";
  const isDocx = fileExt === "docx";
  const isPdf = fileExt === "pdf";

  // --- XỬ LÝ TÊN FILE ---
  // 1. Lấy phần cuối của URL
  // 2. decodeURIComponent để chuyển các ký tự %E1... về tiếng Việt
  const rawFileName = filePath ? filePath.split("/").pop() : "";
  const decodedFileName = decodeURIComponent(rawFileName);

  return (
    <div className="viewer-overlay" onClick={onClose}>
      <div className="contract-viewer-panel" onClick={(e) => e.stopPropagation()}>
        <button className="close-viewer-btn" onClick={onClose} title="Đóng">✕</button>

        <div className="contract-viewer-header">
          <div style={{ flex: 1, paddingRight: 20 }}>
            <h3>{contract.title || "Chi tiết hợp đồng"}</h3>
            <div style={{ marginTop: 8 }}>
               <ContractStatusBadge status={contract.status} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <Field label="Mã hợp đồng">{contract.id || contract.code || "-"}</Field>
          <Field label="Ngày hiệu lực">
            {contract.effectiveDate
              ? new Date(contract.effectiveDate).toLocaleDateString("vi-VN")
              : "-"}
          </Field>
        </div>

        {/* --- PHẦN HIỂN THỊ FILE ĐẸP HƠN --- */}
        <div className="viewer-field">
          <div className="viewer-label">Tài liệu đính kèm</div>
          {filePath ? (
            <div className="file-attachment-card">
              {/* Icon File (SVG) */}
              <div className={`file-icon ${fileExt}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <line x1="10" y1="9" x2="8" y2="9"></line>
                </svg>
              </div>
              
              {/* Tên file (tự động cắt ngắn nếu dài) */}
              <div className="file-info">
                <span className="file-name" title={decodedFileName}>
                  {decodedFileName}
                </span>
                <span className="file-size">Định dạng: {fileExt.toUpperCase()}</span>
              </div>

              {/* Nút tải xuống */}
              <a href={filePath} target="_blank" rel="noopener noreferrer" className="download-action-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Tải về</span>
              </a>
            </div>
          ) : (
            <div style={{ color: "#999", fontStyle: "italic" }}>Không có file đính kèm</div>
          )}
        </div>

        {/* KHUNG XEM TRƯỚC (PREVIEW) */}
        <div className="contract-content-box">
          {filePath ? (
            <>
              {isDocx && <DocxViewer fileUrl={filePath} />}
              {isPdf && (
                <iframe
                  src={filePath}
                  title="PDF Hợp đồng"
                  className="pdf-preview-frame"
                />
              )}
              {!isDocx && !isPdf && (
                <div className="unsupported-format-msg">
                  <p>Không hỗ trợ xem trước định dạng này</p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-file-msg">Không tìm thấy file hợp đồng</div>
          )}
        </div>

        {/* Footer Actions */}
        {contract.status === "PENDING" && (
          <div className="viewer-footer-actions">
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