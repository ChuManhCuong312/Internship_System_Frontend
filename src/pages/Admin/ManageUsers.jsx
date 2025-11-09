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

const mockRoles = [
  { roleId: 1, name: "Admin" },
  { roleId: 2, name: "HR" },
  { roleId: 3, name: "Mentor" },
  { roleId: 4, name: "Intern" },
];

const mockUsers = [
  { id: 1, fullName: "Nguyễn Văn A", email: "a@example.com", phone: '09877654431', role: "HR", status: "Chờ duyệt", createdAt: "2024-01-15" },
  { id: 2, fullName: "Trần Thị B", email: "b@example.com", phone: '09877654431', role: "Mentor", status: "Đã duyệt", createdAt: "2024-02-20" },
  { id: 3, fullName: "Lê Văn C", email: "c@example.com", phone: '09877654431', role: "Intern", status: "Bị từ chối", createdAt: "2024-03-10" },
  { id: 4, fullName: "Phạm Thị D", email: "d@example.com", phone: '09877654431', role: "HR", status: "Đã duyệt", createdAt: "2024-03-25" },
  { id: 5, fullName: "Hoàng Văn E", email: "e@example.com", phone: '09877654431', role: "Intern", status: "Chờ duyệt", createdAt: "2024-04-01" },
];

const ManageUsers = () => {
  const { user: loggedInUser } = useContext(AuthContext);
  const isAdmin = loggedInUser?.role === "ADMIN";

  const [users, setUsers] = useState(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalSuccess, setModalSuccess] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [rejectError, setRejectError] = useState("");

  const [permissions, setPermissions] = useState({
    HR: ["Quản lý hồ sơ", "Tạo báo cáo", "Xem dashboard"],
    Mentor: ["Hướng dẫn intern", "Đánh giá", "Xem báo cáo"],
    Intern: ["Xem tài liệu", "Nộp báo cáo", "Check-in"],
  });

  // Filter and search logic
  useEffect(() => {
    let result = users;

    if (searchTerm) {
      result = result.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter) {
      result = result.filter(user => user.role === roleFilter);
    }

    if (statusFilter) {
      result = result.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, users]);

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const notify = (msg) => {
    setModalSuccess(msg);
    setTimeout(() => setModalSuccess(""), 3000);
  };

  const handleApprove = (userId) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: "Đã duyệt" } : u));
    notify("✅ Đã duyệt tài khoản thành công");
  };

  const handleReject = (userId) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
    setRejectReason("");
    setRejectError("");
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      setRejectError("Vui lòng nhập lý do từ chối");
      return;
    }
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: "Bị từ chối" } : u));
    setShowRejectModal(false);
    setRejectError("");
    notify("❌ Đã từ chối tài khoản");
  };

  const handleUnlock = (userId) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: "Chờ duyệt" } : u));
    notify("🔓 Tài khoản đã được mở khóa và chuyển về trạng thái chờ duyệt");
  };

  const handleDelete = (userId) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setUsers(users.filter(u => u.id !== selectedUser.id));
    setShowDeleteModal(false);
    notify("🗑️ Đã xóa người dùng thành công");
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên";

    if (!form.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) newErrors.email = "Email không hợp lệ (ví dụ: example@gmail.com)";
      const emailExists = users.some(u =>
        (isEditing ? u.id !== selectedUser?.id : true) &&
        u.email.toLowerCase() === form.email.toLowerCase()
      );
      if (emailExists) newErrors.email = "Email này đã tồn tại trong hệ thống";
    }

    if (!isEditing) {
      if (!form.password.trim()) newErrors.password = "Vui lòng nhập mật khẩu";
      else if (form.password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
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
    if (isEditing) {
      setUsers(users.map(u =>
        u.id === selectedUser.id ? { ...u, ...form } : u
      ));
      notify("✅ Cập nhật người dùng thành công");
    } else {
      const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...form,
        status: "Đã duyệt",
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers([newUser, ...users]);
      notify("✅ Tạo người dùng thành công");
    }

    handleCloseCreateModal();
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
      role: user.role,
    });
    setFormErrors({});
    setSelectedUser(user);
    setIsEditing(true);
    setShowCreateModal(true);
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả vai trò</option>
              <option value="HR">HR</option>
              <option value="Mentor">Mentor</option>
              <option value="Intern">Intern</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Chờ duyệt">Chờ duyệt</option>
              <option value="Đã duyệt">Đã duyệt</option>
              <option value="Bị từ chối">Bị từ chối</option>
            </select>

            <button className="btn-primary" onClick={handleOpenCreateModal}>
              ➕ Thêm người dùng
            </button>
            <button className="btn-secondary" onClick={() => setShowPermissionModal(true)}>
              🔐 Phân quyền
            </button>
          </div>
        </div>

        {/* Success message */}
        {modalSuccess && <div className="success-message">{modalSuccess}</div>}

        {/* User Table */}
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={user.status} />
                  </td>
                  <td>{user.createdAt}</td>
                  <td>
                    <ActionButtons
                      user={user}
                      userRole="admin"
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

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          onPageChange={setCurrentPage}
        />

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
                  {mockRoles.map(role => (
                    <option key={role.roleId} value={role.name}>
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
              <label>Lý do từ chối *</label>
              <textarea
                className="form-input"
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  setRejectError("");
                }}
                placeholder="Nhập lý do từ chối tài khoản..."
                rows={4}
                style={{ resize: 'vertical' }}
              />
              {rejectError && <p className="field-error">{rejectError}</p>}
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

        {/* Permission Modal */}
        {showPermissionModal && (
          <Modal title="Thiết lập phân quyền" onClose={() => setShowPermissionModal(false)}>
            <div className="permission-content">
              {Object.entries(permissions).map(([role, perms]) => (
                <div key={role} className="permission-group">
                  <h4>{role}</h4>
                  {perms.map((perm, idx) => (
                    <label key={idx} className="permission-item">
                      <input type="checkbox" defaultChecked />
                      <span>{perm}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowPermissionModal(false)}>
                Hủy
              </button>
              <button
                className="btn-save"
                onClick={() => {
                  notify("✅ Cập nhật phân quyền thành công");
                  setShowPermissionModal(false);
                }}
              >
                Lưu thay đổi
              </button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;