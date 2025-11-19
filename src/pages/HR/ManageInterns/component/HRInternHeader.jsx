import React from "react";
import "../../../../styles/manageUsers.css";

const HRInternHeader = ({
  title = "Quản lý hồ sơ thực tập sinh",
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  majorFilter,
  setMajorFilter,
  onAdd,
  showStatusFilter = true,
  statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "APPROVED", label: "Đã duyệt" },
    { value: "REJECTED", label: "Bị từ chối" },
  ],
  onClearFilters,
}) => (
  <div className="manage-users-header">
    <h2 className="page-title">{title}</h2>
    <div className="header-actions">
      <input
        type="text"
        placeholder="🔍 Tìm kiếm theo tên hoặc email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      {showStatusFilter && (
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      <select
        value={majorFilter}
        onChange={(e) => setMajorFilter(e.target.value)}
        className="filter-select"
      >
        <option value="">Tất cả ngành</option>
        <option value="Công nghệ thông tin">Công nghệ thông tin</option>
        <option value="Quản trị kinh doanh">Quản trị kinh doanh</option>
        <option value="Thiết kế đồ họa">Thiết kế đồ họa</option>
        <option value="Phân tích dữ liệu">Phân tích dữ liệu</option>
      </select>

      {onAdd && <button className="btn-primary" onClick={onAdd}>Thêm mới</button>}
    </div>

    <div className="clear-filter-container">
      <button className="clear-filter-btn" onClick={onClearFilters}>
        ✖ Clear filter
      </button>
    </div>
  </div>
);

export default HRInternHeader;