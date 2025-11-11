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
       {user.status === "PENDING" && (
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
             <button className="btn-approve" onClick={() => onApprove(userId)}>
               ✓ Duyệt
             </button>
             <button className="btn-reject" onClick={() => onReject(userId)}>
               ✗ Từ chối
             </button>
           </>
         )}
         {user.status === "APPROVED" && (
           <button className="btn-send" onClick={() => onSendContract(userId)}>
             📎 Tải hợp đồng
           </button>
         )}
         {user.status === "COMPLETED" && (
           <>
             <button className="btn-edit" onClick={() => onEdit(user)}>
               ✎ Sửa
             </button>
             <button className="btn-delete" onClick={() => onDelete(userId)}>
               🗑 Xóa
             </button>
           </>
         )}
         {user.status === "REJECTED" && (
           <button className="btn-unlock" onClick={() => onUnlock(userId)}>
             🔓 Mở khóa
           </button>
         )}
       </div>
     );
   }


 return null;
};


export default ActionButtons;

