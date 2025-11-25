import React, { useState } from "react";

const AllowancesFilter = ({
  showFilter,
  filterData,
  isFiltering,
  onToggleFilter,
  onFilterChange,
  onApplyFilter,
  onResetFilter,
  internSuggestions = [],
  onSearchInterns = () => {},
  onSelectIntern = () => {},
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  if (!showFilter) {
    return null;
  }

  return (
    <div className="filter-container">
      <div className="filter-row">
        <div className="filter-group">
          <label>Tên Thực tập sinh</label>
          <div className="autocomplete-container">
            <input
              type="text"
              value={filterData.internName || ""}
              onChange={(e) => {
                onFilterChange("internName", e.target.value);
                onSearchInterns(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Nhập tên thực tập sinh"
            />
            {showSuggestions && internSuggestions.length > 0 && (
              <div className="suggestions-list">
                {internSuggestions.map((intern) => (
                  <div
                    key={intern.internId}
                    className="suggestion-item"
                    onClick={() => {
                      onFilterChange("internName", intern.fullName);
                      onFilterChange("internId", intern.internId);
                      setShowSuggestions(false);
                    }}
                  >
                    <div className="suggestion-name">{intern.fullName}</div>
                    <div className="suggestion-id">ID: {intern.internId}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="filter-group">
          <label>Loại trợ cấp</label>
          <select
            value={filterData.type}
            onChange={(e) => onFilterChange("type", e.target.value)}
          >
            <option value="">-- Tất cả --</option>
            <option value="MONTHLY">Hàng tháng</option>
            <option value="BONUS">Thưởng</option>
            <option value="SPECIAL">Đặc biệt</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Từ tiền</label>
          <input
            type="number"
            value={filterData.minAmount}
            onChange={(e) => onFilterChange("minAmount", e.target.value)}
            placeholder="Tối thiểu"
          />
        </div>
        <div className="filter-group">
          <label>Đến tiền</label>
          <input
            type="number"
            value={filterData.maxAmount}
            onChange={(e) => onFilterChange("maxAmount", e.target.value)}
            placeholder="Tối đa"
          />
        </div>
      </div>
      <div className="filter-row">
        <div className="filter-group">
          <label>Từ ngày</label>
          <input
            type="date"
            value={filterData.startDate}
            onChange={(e) => onFilterChange("startDate", e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Đến ngày</label>
          <input
            type="date"
            value={filterData.endDate}
            onChange={(e) => onFilterChange("endDate", e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <button
            className="btn-filter-apply"
            onClick={onApplyFilter}
            disabled={isFiltering}
          >
            {isFiltering ? "Đang lọc..." : "Áp dụng"}
          </button>
          <button
            className="btn-filter-reset"
            onClick={onResetFilter}
            disabled={isFiltering}
          >
            Đặt lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllowancesFilter;
