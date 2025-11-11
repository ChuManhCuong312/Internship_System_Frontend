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
 if (userRole === "ADMIN") {
   return (
     <div className="action-buttons">
       {user.status === "PENDING_APPROVAL" && (
         <>
           <button className="btn-approve" onClick={() => onApprove(user.userId)}>
             ✓ Duyệt
           </button>
           <button className="btn-reject" onClick={() => onReject(user.userId)}>
             ✗ Từ chối
           </button>
         </>
       )}
       {user.status === "ACTIVE" && (
         <>
           <button className="btn-edit" onClick={() => onEdit(user)}>
             ✎ Sửa
           </button>
           {/* Chỉ hiển thị nút Xóa nếu không phải admin */}
             {user.roleId !== 1 && (
               <button className="btn-delete" onClick={() => onDelete(user.userId)}>
                 🗑 Xóa
               </button>
             )}
         </>
       )}
       {user.status === "REJECTED" && (
         <button className="btn-unlock" onClick={() => onUnlock(user.userId)}>
           🔓 Mở khóa
         </button>
       )}
       {user.status === "INACTIVE" && (
         <div style={{ color: "red", fontStyle: "italic" }}>
           Email chưa được xác thực
         </div>
       )}
     </div>
   );
 }


 // Render cho HR
 if (userRole === "hr") {
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
         <button className="btn-send" onClick={() => onSendContract(user.id)}>
           📎 Tải hợp đồng
         </button>
       )}
       {user.status === "Hợp đồng hoàn tất" && (
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


 return null;
};


export default ActionButtons;

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

