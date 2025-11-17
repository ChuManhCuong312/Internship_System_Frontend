import React from "react";
import "../../styles/buttons.css";

const statusMap = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  ACTIVE: "Đang hoạt động",
  COMPLETED: "Hợp đồng hoàn tất",
};

const ActionButtons = ({
 user,
 userRole,
 onApprove,
 onReject,
 onEdit,
 onDelete,
 onUnlock,
 onSendContract
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
       {user.status === "PENDING" && (
         <>
           <button type="button" className="btn-approve" onClick={() => onApprove(user)}>
             ✓ Duyệt
           </button>
           <button type="button" className="btn-reject" onClick={() => onReject(user)}>
             ✗ Từ chối
           </button>
         </>
       )}
       {user.status === "APPROVED" && (
         <button type="button" className="btn-send" onClick={() => onSendContract(user)}>
           📎 Tải hợp đồng
         </button>
       )}
       {user.status === "COMPLETED" && (
         <>
           <button type="button" className="btn-edit" onClick={() => onEdit(user)}>
             ✎ Sửa
           </button>
           <button className="btn-delete" onClick={() => onDelete(user)}>
             🗑 Xóa
           </button>
         </>
       )}
       {user.status === "REJECTED" && (
         <button type="button" className="btn-unlock" onClick={() => onUnlock(user)}>
           🔓 Mở khóa
         </button>
       )}
     </div>
   );
 }

 return null;
};

export default ActionButtons;

