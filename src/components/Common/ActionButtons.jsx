import React from "react";
import "../../styles/buttons.css";

const ActionButtons = ({
  user,
  userRole, // "admin" hoặc "hr"
  onApprove,
  onReject,
  onEdit,
  onDelete,
  onUnlock,
  onSendContract // Thêm prop mới cho HR
}) => {
  // Render cho Admin
  if (userRole === "admin") {
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
  }

  // Render cho HR
  if (userRole === "hr") {
    return (
      <div className="action-buttons">
        {user.status === "PENDING" && (
          <>
            <button className="btn-approve" onClick={() => onApprove(user.id)}>✓ Duyệt</button>
            <button className="btn-reject" onClick={() => onReject(user.id)}>✗ Từ chối</button>
          </>
        )}
        {user.status === "APPROVED" && (
          <button className="btn-send" onClick={() => onSendContract(user.id)}>📎 Tải hợp đồng</button>
        )}
        {user.status === "COMPLETED" && (
          <>
            <button className="btn-edit" onClick={() => onEdit(user)}>✎ Sửa</button>
            <button className="btn-delete" onClick={() => onDelete(user.id)}>🗑 Xóa</button>
          </>
        )}
        {user.status === "REJECTED" && (
          <button className="btn-unlock" onClick={() => onUnlock(user.id)}>🔓 Mở khóa</button>
        )}
      </div>
    );
  }

  return null;
};

export default ActionButtons;