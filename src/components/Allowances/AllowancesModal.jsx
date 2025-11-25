import React, { useState } from "react";

const AllowancesModal = ({
  showModal,
  editingAllowance,
  formData,
  errors,
  onFormChange,
  onSave,
  onClose,
  internSuggestions = [],
  onSearchInterns = () => {},
  onSelectIntern = () => {},
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  if (!showModal) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editingAllowance ? "Chỉnh sửa trợ cấp" : "Thêm trợ cấp mới"}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Tên Thực tập sinh *</label>
            <div className="autocomplete-container">
              <input
                type="text"
                value={formData.internName}
                onChange={(e) => {
                  onFormChange("internName", e.target.value);
                  onSearchInterns(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Nhập tên thực tập sinh"
                className={errors.internName ? "input-error" : ""}
              />
              {showSuggestions && internSuggestions.length > 0 && (
                <div className="suggestions-list">
                  {internSuggestions.map((intern) => (
                    <div
                      key={intern.internId}
                      className="suggestion-item"
                      onClick={() => {
                        onSelectIntern(intern);
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
            {errors.internName && <span className="error-text">{errors.internName}</span>}
          </div>

          <div className="form-group">
            <label>Loại trợ cấp *</label>
            <select
              value={formData.type}
              onChange={(e) => onFormChange("type", e.target.value)}
              className={errors.type ? "input-error" : ""}
            >
              <option value="">-- Chọn loại trợ cấp --</option>
              <option value="MONTHLY">Hàng tháng</option>
              <option value="BONUS">Thưởng</option>
              <option value="SPECIAL">Đặc biệt</option>
              <option value="OTHER">Khác</option>
            </select>
            {errors.type && <span className="error-text">{errors.type}</span>}
          </div>

          <div className="form-group">
            <label>Số tiền (VND) *</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                onFormChange("amount", parseFloat(e.target.value) || "")
              }
              placeholder="Nhập số tiền"
              className={errors.amount ? "input-error" : ""}
            />
            {errors.amount && <span className="error-text">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label>Ngày áp dụng *</label>
            <input
              type="date"
              value={formData.dateApplied}
              onChange={(e) => onFormChange("dateApplied", e.target.value)}
              className={errors.dateApplied ? "input-error" : ""}
            />
            {errors.dateApplied && (
              <span className="error-text">{errors.dateApplied}</span>
            )}
          </div>

          <div className="form-group">
            <label>Ghi chú</label>
            <textarea
              value={formData.note}
              onChange={(e) => onFormChange("note", e.target.value)}
              placeholder="Nhập ghi chú (tùy chọn)"
              rows="3"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-submit" onClick={onSave}>
            {editingAllowance ? "Cập nhật" : "Thêm mới"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllowancesModal;
