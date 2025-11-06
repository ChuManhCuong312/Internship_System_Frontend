import React from "react";
import "../../styles/buttons.css";

const ActionButtons = ({ user, onApprove, onReject, onEdit, onDelete, onUnlock }) => {
  return (
    <div className="action-buttons">
      {user.status === "Chờ duyệt" && (
        <>
          <button className="btn-approve" onClick={() => onApprove(user.id)}>
            ✓ Duyệt
          </button>
          <button className="btn-reject" onClick={() => onReject(user.id)}>
            ✗ Từ chối
          </button>
        </>
      )}

      {user.status === "Đã duyệt" && (
        <>
          <button className="btn-edit" onClick={() => onEdit(user)}>
            ✎ Sửa
          </button>
          <button className="btn-delete" onClick={() => onDelete(user.id)}>
            🗑 Xóa
          </button>
        </>
      )}

      {user.status === "Bị từ chối" && (
        <button className="btn-unlock" onClick={() => onUnlock(user.id)}>
          🔓 Mở khóa
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
