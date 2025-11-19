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
  schoolFilter,
  setSchoolFilter,
  onAdd,
  showStatusFilter = true,
  statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "APPROVED", label: "Đã duyệt" },
    { value: "REJECTED", label: "Bị từ chối" },
  ],
  majorOptions = [],
  schoolOptions = [],
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
        {majorOptions.map((major) => (
          <option key={major} value={major}>{major}</option>
        ))}
      </select>

      <select
        value={schoolFilter}
        onChange={(e) => setSchoolFilter(e.target.value)}
        className="filter-select"
      >
        <option value="">Tất cả trường</option>
        {schoolOptions.map((school) => (
          <option key={school} value={school}>{school}</option>
        ))}
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
