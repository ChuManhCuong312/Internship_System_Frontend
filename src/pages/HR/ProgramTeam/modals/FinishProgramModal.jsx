import React from "react";
import { X, AlertTriangle } from "lucide-react";

export default function FinishProgramModal({
  isOpen,
  onClose,
  onConfirm,
  programName
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content small-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title" style={{ color: "#ff9800" }}>
            <AlertTriangle size={20} style={{ marginRight: 6 }} />
            Xác nhận kết thúc chương trình
          </h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <p style={{ fontSize: "15px" }}>
            Bạn có chắc chắn muốn kết thúc chương trình <strong>"{programName}"</strong>?
          </p>

          <p style={{ marginTop: 10, color: "#ff9800", fontStyle: "italic" }}>
            ⚠️ Lưu ý: Khi kết thúc chương trình:
          </p>
          <ul style={{ marginTop: 8, marginLeft: 20, color: "#666" }}>
            <li>Trạng thái chương trình sẽ chuyển sang "FINISHED"</li>
            <li>Tất cả tài khoản thực tập sinh sẽ bị vô hiệu hóa (REJECTED) và không thể đăng nhập lại vào hệ thống</li>
            <li>Hành động này không thể hoàn tác</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Huỷ
          </button>

          <button
            className="btn"
            onClick={onConfirm}
            style={{ backgroundColor: "#ff9800", color: "white" }}
          >
            Kết thúc chương trình
          </button>
        </div>
      </div>
    </div>
  );
}