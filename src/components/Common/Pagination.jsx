import React from "react";
import "../../styles/pagination.css";

const Pagination = ({ currentPage, totalPages, totalItems, onPageChange }) => {
  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        ← Trang trước
      </button>
      <span className="pagination-info">
        Trang {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        Trang sau →
      </button>
    </div>
  );
};

export default Pagination;
