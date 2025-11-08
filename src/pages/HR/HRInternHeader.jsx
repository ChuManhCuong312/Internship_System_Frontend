import React from "react";

const HRInternHeader = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, onAdd }) => (
  <div className="manage-users-header">
    <h2 className="page-title">Quản lý hồ sơ thực tập sinh</h2>
    <div className="header-actions">
      <input
        type="text"
        placeholder="🔍 Tìm kiếm theo tên hoặc email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="filter-select"
      >
        <option value="">Tất cả trạng thái</option>
        <option value="Chờ duyệt">Chờ duyệt</option>
        <option value="Đã duyệt">Đã duyệt</option>
        <option value="Bị từ chối">Bị từ chối</option>
        <option value="Hợp đồng hoàn tất">Hợp đồng hoàn tất</option>
      </select>
      <button className="btn-primary" onClick={onAdd}>
        ➕ Thêm hợp đồng
      </button>
    </div>
  </div>
);

export default HRInternHeader;
