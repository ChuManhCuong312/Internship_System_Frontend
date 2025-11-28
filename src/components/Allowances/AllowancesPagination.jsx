import React from "react";

const AllowancesPagination = ({
  page,
  size,
  totalPages,
  totalElements,
  onPageChange,
  onSizeChange,
}) => {
  if (totalElements === 0) {
    return null;
  }

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="pagination-btn"
      >
        ← Trước
      </button>

      <div className="pagination-info">
        Trang {page + 1} / {totalPages} (Tổng: {totalElements} bản ghi)
      </div>

      <select
        value={size}
        onChange={(e) => onSizeChange(parseInt(e.target.value))}
        className="pagination-select"
      >
        <option value={5}>5 bản ghi</option>
        <option value={10}>10 bản ghi</option>
        <option value={20}>20 bản ghi</option>
        <option value={50}>50 bản ghi</option>
      </select>

      <button
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
        className="pagination-btn"
      >
        Tiếp →
      </button>
    </div>
  );
};

export default AllowancesPagination;
