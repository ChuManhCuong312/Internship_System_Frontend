import React from "react";

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
        <>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Bị từ chối</option>
            <option value="COMPLETED">Hợp đồng hoàn tất</option>
          </select>

          <select
            value={majorFilter}
            onChange={(e) => setMajorFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả ngành</option>
            <option value="Công nghệ thông tin">Công nghệ thông tin</option>
            <option value="Kinh tế số">Kinh tế</option>
            <option value="Phân tích dữ liệu">Phân tích dữ liệu</option>
             <option value="Thiết kế đồ họa">Thiết kế đồ họa</option>
         </select>
        </>
      )}

      {onAdd && <button className="btn-primary" onClick={onAdd}>Thêm mới</button>}
    </div>
  </div>
);

export default HRInternHeader;
