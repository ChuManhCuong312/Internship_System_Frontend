import React from "react";
import { X, AlertTriangle } from "lucide-react";

export default function DeleteConfirmModal({
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
          <h2 className="modal-title" style={{ color: "#d9534f" }}>
            <AlertTriangle size={20} style={{ marginRight: 6 }} />
            Xác nhận xoá
          </h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <p style={{ fontSize: "15px" }}>
            Bạn có chắc chắn muốn xoá chương trình <strong>"{programName}"</strong> ?

          </p>

          <p style={{ marginTop: 10, color: "#d9534f", fontStyle: "italic" }}>
            Lưu ý: hành động này không thể hoàn tác.
          </p>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Huỷ
          </button>

          <button
            className="btn btn-danger"
            onClick={onConfirm}
            style={{ backgroundColor: "#d9534f" }}
          >
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}
