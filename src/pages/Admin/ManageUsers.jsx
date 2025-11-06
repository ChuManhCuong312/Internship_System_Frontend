import React, { useState, useEffect, useContext } from "react";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import { authService } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/manageUsers.css";

const mockRoles = [
  { roleId: 1, name: "Admin" },
  { roleId: 2, name: "HR" },
  { roleId: 3, name: "Mentor" },
  { roleId: 4, name: "Intern" },
];

// Mock data for users
const mockUsers = [
  { id: 1, fullName: "Nguyễn Văn A", email: "a@example.com", phone: '09877654431',role: "HR", status: "Chờ duyệt", createdAt: "2024-01-15" },
  { id: 2, fullName: "Trần Thị B", email: "b@example.com", phone: '09877654431',role: "Mentor", status: "Đã duyệt", createdAt: "2024-02-20" },
  { id: 3, fullName: "Lê Văn C", email: "c@example.com",phone: '09877654431', role: "Intern", status: "Bị từ chối", createdAt: "2024-03-10" },
  { id: 4, fullName: "Phạm Thị D", email: "d@example.com", phone: '09877654431',role: "HR", status: "Đã duyệt", createdAt: "2024-03-25" },
  { id: 5, fullName: "Hoàng Văn E", email: "e@example.com", phone: '09877654431',role: "Intern", status: "Chờ duyệt", createdAt: "2024-04-01" },
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
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state for creating user
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "",
  });

  // Permission state
  const [permissions, setPermissions] = useState({
    HR: ["Quản lý hồ sơ", "Tạo báo cáo", "Xem dashboard"],
    Mentor: ["Hướng dẫn intern", "Đánh giá", "Xem báo cáo"],
    Intern: ["Xem tài liệu", "Nộp báo cáo", "Check-in"],
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // CRUD operations
  const handleApprove = (userId) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: "Đã duyệt" } : u));
    setSuccess("Đã duyệt tài khoản thành công");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleReject = (userId) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: "Bị từ chối" } : u));
    setSuccess("Đã từ chối tài khoản");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleUnlock = (userId) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: "Đã duyệt" } : u));
    setSuccess("Đã mở khóa tài khoản");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleDelete = (userId) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
      setUsers(users.filter(u => u.id !== userId));
      setSuccess("Đã xóa người dùng thành công");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleViewReason = (user) => {
    setSelectedUser(user);
    setShowReasonModal(true);
  };

  // Create user
  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!form.role) {
      setError("Vui lòng chọn vai trò");
      return;
    }

    const newUser = {
      id: users.length + 1,
      fullName: form.fullName,
      email: form.email,
      role: form.role,
      status: "Đã duyệt",
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers([...users, newUser]);
    setSuccess("Tạo người dùng thành công");
    setShowCreateModal(false);
    setForm({ fullName: "", email: "", password: "", phone: "", role: "" });
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
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
            <button
              className="btn-primary"
              onClick={() => {
                setForm({ fullName: "", email: "", password: "", phone: "", role: "" });
                setIsEditing(false);
                setSelectedUser(null);
                setShowCreateModal(true);
              }}
            >
              ➕ Thêm người dùng
            </button>

            <button
              className="btn-secondary"
              onClick={() => setShowPermissionModal(true)}
            >
              🔐 Phân quyền
            </button>
          </div>
        </div>

        {/* Success/Error messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

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
                    <span className={`status-badge status-${user.status.replace(/\s/g, '-').toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.createdAt}</td>
                  <td className="action-buttons">
                    {user.status === "Chờ duyệt" && (
                      <>
                        <button
                          className="btn-approve"
                          onClick={() => handleApprove(user.id)}
                        >
                          ✓ Duyệt
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(user.id)}
                        >
                          ✗ Từ chối
                        </button>
                      </>
                    )}
                    {user.status === "Đã duyệt" && (
                      <>
                        <button className="btn-edit"
                        onClick={() => {
                          setForm({
                            fullName: user.fullName,
                            email: user.email,
                            password: "",
                            phone: user.phone,
                            role: user.role,
                          });
                          setSelectedUser(user);
                          setIsEditing(true);
                          setShowCreateModal(true);
                        }}
                        >✎ Sửa</button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(user.id)}
                        >
                          🗑 Xóa
                        </button>
                      </>
                    )}
                    {user.status === "Bị từ chối" && null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Trang trước
          </button>
          <span className="pagination-info">
            Trang {currentPage} / {totalPages} ({filteredUsers.length} người dùng)
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Trang sau →
          </button>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Thêm mới người dùng</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowCreateModal(false)}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="form-group">
                  <label>Họ tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleFormChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu khởi tạo *</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleFormChange}
                      required
                      className="form-input"
                      placeholder="••••••••"
                    />
                    <span
                      className={`toggle-icon ${showPassword ? "active" : ""}`}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      👁
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Vai trò *</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleFormChange}
                    required
                    className="form-input"
                  >
                    <option value="">-- Chọn vai trò --</option>
                    {mockRoles.map(role => (
                      <option key={role.roleId} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn-save">
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Permission Modal */}
        {showPermissionModal && (
          <div className="modal-overlay" onClick={() => setShowPermissionModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Thiết lập phân quyền</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowPermissionModal(false)}
                >
                  ✕
                </button>
              </div>
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
                <button className="btn-save" onClick={() => {
                  setSuccess("Cập nhật phân quyền thành công");
                  setShowPermissionModal(false);
                  setTimeout(() => setSuccess(""), 3000);
                }}>
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;