import React, { useState, useEffect, useContext } from "react";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import Modal from "../../components/Layout/Modal";
import StatusBadge from "../../components/Common/StatusBadge";
import ActionButtons from "../../components/Common/ActionButtons";
import Pagination from "../../components/Common/Pagination";
import PasswordInput from "../../components/Common/PasswordInput";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/manageUsers.css";
import "../../styles/modal.css";
import "../../styles/table.css";
import { UserContext } from "../../context/UserContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



const Roles = [
 { roleId: 1, name: "Admin" },
 { roleId: 2, name: "HR" },
 { roleId: 3, name: "Mentor" },
 { roleId: 4, name: "Intern" },
];


const ManageUsers = () => {
 const { user: loggedInUser } = useContext(AuthContext);
 const isAdmin = loggedInUser?.role === "ADMIN";
 const {
   users,
   pagination,
   loading,
   error,
   fetchUsers,
   addUser,
   editUser,
   removeUser,
   activate,
   reject,
   unlock,
 } = useContext(UserContext);
 const [filteredUsers, setFilteredUsers] = useState("");
 const [searchTerm, setSearchTerm] = useState("");
 const [roleFilter, setRoleFilter] = useState("");
 const [statusFilter, setStatusFilter] = useState("");
 const [currentPage, setCurrentPage] = useState(1);
 const [usersPerPage] = useState(10);


 // Modal states
 const [showCreateModal, setShowCreateModal] = useState(false);
 const [showDeleteModal, setShowDeleteModal] = useState(false);
 const [showRejectModal, setShowRejectModal] = useState(false);


 const [selectedUser, setSelectedUser] = useState(null);
 const [isEditing, setIsEditing] = useState(false);
 const [modalSuccess, setModalSuccess] = useState("");


 const [form, setForm] = useState({
   fullName: "",
   email: "",
   password: "",
   phone: "",
   role: "",
 });
 const [formErrors, setFormErrors] = useState({});

 const [permissions, setPermissions] = useState({
   HR: ["Quản lý hồ sơ", "Tạo báo cáo", "Xem dashboard"],
   Mentor: ["Hướng dẫn intern", "Đánh giá", "Xem báo cáo"],
   Intern: ["Xem tài liệu", "Nộp báo cáo", "Check-in"],
 });


 // Filter and search logic
 useEffect(() => {
   const filters = {
     page: currentPage,
     size: usersPerPage,
     nameOrEmail: searchTerm,
     roleId: roleFilter,
     status: statusFilter,
   };
   fetchUsers(filters);
 }, [searchTerm, roleFilter, statusFilter, currentPage]); // thêm currentPage


 const getRoleName = (roleId) => {
   const roleMap = {
     1: "ADMIN",
     2: "HR",
     3: "MENTOR",
     4: "INTERN",
   };
   return roleMap[roleId] || "UNKNOWN";
 };


const mapStatusToVietnamese = (status) => {
 const statusMap = {
   ACTIVE: "Đã duyệt",
   INACTIVE: "Chưa xác thực",
   REJECTED: "Bị từ chối",
   PENDING_APPROVAL: "Chờ duyệt",
 };
 return statusMap[status] || "Không xác định";
};


 const notify = (msg, type = "success") => {
   if (type === "error") toast.error(msg);
   else toast.success(msg);
 };

 // ====== DUYỆT ======
   const handleApprove = async (userId) => {
     try {
       await activate(userId);
       notify(" Đã duyệt tài khoản thành công");
       await reloadUsers();
     } catch (err) {
       notify(" Lỗi khi duyệt tài khoản", "error");
     }
   };

   // ====== MỞ MODAL TỪ CHỐI ======
   const handleReject = (userId) => {
     const user = users.find((u) => u.userId === userId);
     setSelectedUser(user);
     setShowRejectModal(true);
   };

   // ====== XÁC NHẬN TỪ CHỐI ======
   const confirmReject = async () => {
     try {
       await reject(selectedUser.userId);
       setShowRejectModal(false);
       notify(" Đã từ chối tài khoản");
       await reloadUsers();
     } catch (err) {
       notify(" Lỗi khi từ chối tài khoản", "error");
     }
   };

   // ====== MỞ KHÓA ======
   const handleUnlock = async (userId) => {
     try {
       await unlock(userId);
       notify(" Tài khoản đã được mở khóa và chuyển về trạng thái chờ duyệt");
       await reloadUsers();
     } catch (err) {
       notify(" Lỗi khi mở khóa tài khoản", "error");
     }
   };

   // ====== MỞ MODAL XÓA ======
   const handleDelete = (userId) => {
     const user = users.find((u) => u.userId === userId);
     setSelectedUser(user);
     setShowDeleteModal(true);
   };

   // ====== XÁC NHẬN XÓA ======
   const confirmDelete = async () => {
     try {
       await removeUser(selectedUser.userId);
       setShowDeleteModal(false);
       notify(" Đã xóa người dùng thành công");
       await reloadUsers();
     } catch (err) {
       notify(err.response.data, "error");
     }
   };


 const handleSubmitUser = async (e) => {
   e.preventDefault();
   const newErrors = {};

   // --- Validate cơ bản ---
   if (!form.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên";

   if (!form.email.trim()) {
     newErrors.email = "Vui lòng nhập email";
   } else {
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!emailRegex.test(form.email)) newErrors.email = "Email không hợp lệ (ví dụ: example@gmail.com)";
   }

   if (!isEditing) {
     if (!form.password.trim()) newErrors.password = "Vui lòng nhập mật khẩu";
     else if (form.password.length < 6)
       newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
   }

   if (!form.phone.trim()) {
     newErrors.phone = "Vui lòng nhập số điện thoại";
   } else {
     const phoneRegex = /^0[0-9]{9}$/;
     if (!phoneRegex.test(form.phone)) newErrors.phone = "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng 0";
   }

   if (!form.role) newErrors.role = "Vui lòng chọn vai trò";

   if (Object.keys(newErrors).length > 0) {
     setFormErrors(newErrors);
     return;
   }

   setFormErrors({});
   try {
     if (isEditing) {
       // 🟢 Cập nhật user
       await editUser(selectedUser.userId, {
         fullName: form.fullName,
         email: form.email,
         phone: form.phone,
         roleId: form.role,
         password: form.password, // nếu để trống thì backend sẽ tự xử lý giữ nguyên mật khẩu
       });
       notify(" Cập nhật người dùng thành công");
     } else {
       // 🟢 Tạo user mới
       await addUser({
         fullName: form.fullName,
         email: form.email,
         password: form.password,
         phone: form.phone,
         roleId: form.role,
       });
       notify(" Tạo người dùng thành công");
     }

     handleCloseCreateModal(); // đóng modal
     await reloadUsers();
   } catch (error) {
       console.error("Lỗi khi lưu người dùng:", error);
       // Gọi toast để hiển thị đúng message
       notify(error.response.data, "error");

     }
 };

 const handleFormChange = (e) => {
   setForm({ ...form, [e.target.name]: e.target.value });
 };


 const handleCloseCreateModal = () => {
   setShowCreateModal(false);
   setForm({ fullName: "", email: "", password: "", phone: "", role: "" });
   setFormErrors({});
   setSelectedUser(null);
   setIsEditing(false);
 };


 const handleOpenCreateModal = () => {
   setForm({ fullName: "", email: "", password: "", phone: "", role: "" });
   setFormErrors({});
   setIsEditing(false);
   setSelectedUser(null);
   setShowCreateModal(true);
 };


 const handleOpenEditModal = (user) => {
   setForm({
     fullName: user.fullName,
     email: user.email,
     password: "",
     phone: user.phone,
     role: user.roleId,
   });
   setFormErrors({});
   setSelectedUser(user);
   setIsEditing(true);
   setShowCreateModal(true);
 };
const handlePageChange = (page) => {
  setCurrentPage(page);
};
 const reloadUsers = async (page = currentPage) => {
   await fetchUsers({
     page,
     size: usersPerPage,
     nameOrEmail: searchTerm,
     roleId: roleFilter,
     status: statusFilter,
   });
 };
const handleClearFilters = () => {
    setFilteredUsers("");
    setRoleFilter("");
    setStatusFilter("");
  };


 if (!isAdmin) {
   return (
     <div className="dashboard-layout">
       <AdminSidebar />
       <div className="dashboard-content">
         <h2 className="page-title">Bạn không có quyền truy cập trang này.</h2>
       </div>
     </div>
   );
 }

 return (
   <div className="dashboard-layout">
     <AdminSidebar />
     <div className="dashboard-content manage-users-content">
       {/* Header */}
       <div className="manage-users-header">
         <h2 className="page-title">Quản lý người dùng</h2>
         <div className="header-actions">
           <input
             type="text"
             placeholder="🔍 Tìm kiếm theo tên hoặc email"
             value={searchTerm}
             onChange={(e) => {setSearchTerm(e.target.value),setCurrentPage(1)}}
             className="search-input"
           />
           <select
             value={roleFilter}
             onChange={(e) => {setRoleFilter(e.target.value),setCurrentPage(1)}}
             className="filter-select"
           >
             <option value="">Tất cả vai trò</option>
             <option value="1">Admin</option>
             <option value="2">HR</option>
             <option value="3">Mentor</option>
             <option value="4">Intern</option>
           </select>
           <select
             value={statusFilter}
             onChange={(e) => {setStatusFilter(e.target.value),setCurrentPage(1)}}
             className="filter-select"
           >
             <option value="">Tất cả trạng thái</option>
             <option value="PENDING_APPROVAL">Chờ duyệt</option>
             <option value="INACTIVE">Chưa xác thực email</option>
             <option value="ACTIVE">Đã duyệt</option>
             <option value="REJECTED">Bị từ chối</option>
           </select>


           <button className="btn-primary" onClick={handleOpenCreateModal}>
              Thêm người dùng
           </button>
         </div>
         <button
                 className="clear-filter-btn"
                 onClick={handleClearFilters}
               >
                 ✖ Clear filter
               </button>
       </div>

       {/* User Table */}
       <div className="users-table-container">
         <table className="users-table">
           <thead>
             <tr>
               <th>STT</th>
               <th>Họ tên</th>
               <th>Email</th>
               <th>Vai trò</th>
               <th>Trạng thái</th>
               <th>Ngày tạo</th>
               <th>Hành động</th>
             </tr>
           </thead>
           <tbody>
             {users.map((user, index) => (
               <tr key={user.userId}>
                 <td>{(currentPage - 1) * usersPerPage + index + 1}</td>
                 <td>{user.fullName}</td>
                 <td>{user.email}</td>
                 <td>
                   <span className={`role-badge role-${getRoleName(user.roleId).toLowerCase()}`}>
                     {getRoleName(user.roleId)}
                   </span>
                 </td>
                 <td>
                   <StatusBadge status={mapStatusToVietnamese(user.status)} />
                 </td>
                 <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                 <td>
                   <ActionButtons
                     user={user}
                     userRole="ADMIN"
                     onApprove={handleApprove}
                     onReject={handleReject}
                     onEdit={handleOpenEditModal}
                     onDelete={handleDelete}
                     onUnlock={handleUnlock}
                   />
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>


       <div className="pagination">
         {/* Trang trước */}
         <button
           className="pagination-btn"
           disabled={pagination.currentPage === 1}
           onClick={() => handlePageChange(pagination.currentPage - 1)}
         >
           ◀ Trang trước
         </button>

         {/* Nút số trang */}
         {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1).map((page) => (
           <button
             key={page}
             className={`pagination-btn ${page === pagination.currentPage ? "active" : ""}`}
             onClick={() => handlePageChange(page)}
           >
             {page}
           </button>
         ))}

         {/* Trang sau */}
         <button
           className="pagination-btn"
           disabled={pagination.currentPage === pagination.totalPages}
           onClick={() => handlePageChange(pagination.currentPage + 1)}
         >
           Trang sau ▶
         </button>

         {/* Thông tin trang */}
         <span className="pagination-info">
           Trang {pagination.currentPage} / {pagination.totalPages}
         </span>
       </div>


       {/* Create/Edit User Modal */}
       {showCreateModal && (
         <Modal
           title={isEditing ? "Chỉnh sửa người dùng" : "Thêm mới người dùng"}
           onClose={handleCloseCreateModal}
         >
           <form onSubmit={handleSubmitUser}>
             <div className="form-group">
               <label>Họ tên *</label>
               <input
                 type="text"
                 name="fullName"
                 value={form.fullName}
                 onChange={handleFormChange}
                 className="form-input"
               />
               {formErrors.fullName && <p className="field-error">{formErrors.fullName}</p>}
             </div>


             <div className="form-group">
               <label>Email *</label>
               <input
                 type="email"
                 name="email"
                 value={form.email}
                 onChange={handleFormChange}
                 className="form-input"
                 placeholder="ví dụ: example@gmail.com"
               />
               {formErrors.email && <p className="field-error">{formErrors.email}</p>}
             </div>


             <div className="form-group">
               <label>Số điện thoại *</label>
               <input
                 type="text"
                 name="phone"
                 value={form.phone}
                 onChange={handleFormChange}
                 className="form-input"
                 placeholder="10 chữ số bắt đầu từ 0, ví dụ: 0987765443"
               />
               {formErrors.phone && <p className="field-error">{formErrors.phone}</p>}
             </div>


             <div className="form-group">
               <label>{isEditing ? "Đổi mật khẩu" : "Mật khẩu khởi tạo"} {isEditing ? "(Để trống nếu không đổi)" : "*"}</label>
               <PasswordInput
                 name="password"
                 value={form.password}
                 onChange={handleFormChange}
                 placeholder="••••••••"
               />
               {formErrors.password && <p className="field-error">{formErrors.password}</p>}
             </div>


             <div className="form-group">
               <label>Vai trò *</label>
               <select
                 name="role"
                 value={form.role}
                 onChange={handleFormChange}
                 className="form-input"
               >
                 <option value="">-- Chọn vai trò --</option>
                 {Roles.map(role => (
                   <option key={role.roleId} value={role.roleId}>
                     {role.name}
                   </option>
                 ))}
               </select>
               {formErrors.role && <p className="field-error">{formErrors.role}</p>}
             </div>


             <div className="modal-actions">
               <button type="button" className="btn-cancel" onClick={handleCloseCreateModal}>
                 Hủy
               </button>
               <button type="submit" className="btn-save">
                 Lưu
               </button>
             </div>
           </form>
         </Modal>
       )}


       {/* Delete Confirmation Modal */}
       {showDeleteModal && (
         <Modal
           title="Xác nhận xóa người dùng"
           onClose={() => setShowDeleteModal(false)}
         >
           <div className="form-group">
             <p style={{ marginBottom: '15px' }}>
               Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser?.fullName}</strong>?
             </p>
             <p style={{ color: '#dc3545', fontSize: '14px' }}>
               ⚠️ Hành động này không thể hoàn tác!
             </p>
           </div>


           <div className="modal-actions">
             <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
               Hủy
             </button>
             <button
               className="btn-save"
               onClick={confirmDelete}
               style={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' }}
             >
               Xác nhận xóa
             </button>
           </div>
         </Modal>
       )}


       {/* Reject Modal */}
       {showRejectModal && (
         <Modal
           title={`Từ chối tài khoản: ${selectedUser?.fullName}`}
           onClose={() => setShowRejectModal(false)}
         >
           <div className="form-group">
             <label>Bạn có chắc chắn muốn từ chối tài khoản *</label>
           </div>


           <div className="modal-actions">
             <button className="btn-cancel" onClick={() => setShowRejectModal(false)}>
               Hủy
             </button>
             <button className="btn-save" onClick={confirmReject}>
               Xác nhận từ chối
             </button>
           </div>
         </Modal>
       )}



     </div>
     <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
   </div>
 );
};

export default ManageUsers;