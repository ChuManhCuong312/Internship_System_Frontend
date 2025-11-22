import React, { useState, useEffect } from "react";
import "../../../../styles/CriteriaModal.css";

const CriteriaModal = ({ onClose, onApply, initialCriteria }) => {
  const [criteria, setCriteria] = useState({
    gpa: { enabled: false, value: "" },
    age: { enabled: false, min: "", max: "" },
  });

  useEffect(() => {
    if (initialCriteria) {
      setCriteria(initialCriteria);
    }
  }, [initialCriteria]);

  const handleCheckboxChange = (field) => {
    setCriteria({
      ...criteria,
      [field]: { ...criteria[field], enabled: !criteria[field].enabled },
    });
  };

  const handleGpaChange = (value) => {
    setCriteria({
      ...criteria,
      gpa: { ...criteria.gpa, value },
    });
  };

  const handleAgeChange = (field, value) => {
    setCriteria({
      ...criteria,
      age: { ...criteria.age, [field]: value },
    });
  };

  const handleApply = () => {
    onApply(criteria);
    onClose();
  };

  const handleReset = () => {
    setCriteria({
      gpa: { enabled: false, value: "" },
      age: { enabled: false, min: "", max: "" },
    });
  };

  const getActiveCriteriaCount = () => {
    return Object.values(criteria).filter((c) => c.enabled).length;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-criteria" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-criteria">
          <h2>Thiết lập tiêu chí phê duyệt</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body-criteria">
          <div className="criteria-info-box">
            <p>
              Chọn các tiêu chí bên dưới để hệ thống tự động đánh dấu các hồ sơ phù hợp.
              Các hồ sơ đạt tiêu chí sẽ có nút phê duyệt/từ chối được làm nổi bật.
            </p>
          </div>

          {/* GPA Criteria */}
          <div className="criteria-section-box">
            <div className="criteria-header-box">
              <label className="checkbox-label-main">
                <input
                  type="checkbox"
                  checked={criteria.gpa.enabled}
                  onChange={() => handleCheckboxChange("gpa")}
                />
                <span className="criteria-title-text">GPA</span>
              </label>
            </div>
            {criteria.gpa.enabled && (
              <div className="criteria-content-box">
                <div className="criteria-row-flex">
                  <div className="operator-box">
                    <span className="operator-symbol">≥</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={criteria.gpa.value}
                    onChange={(e) => handleGpaChange(e.target.value)}
                    placeholder="Nhập GPA (VD: 3.0)"
                    className="form-input-large"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Age Criteria */}
          <div className="criteria-section-box">
            <div className="criteria-header-box">
              <label className="checkbox-label-main">
                <input
                  type="checkbox"
                  checked={criteria.age.enabled}
                  onChange={() => handleCheckboxChange("age")}
                />
                <span className="criteria-title-text">Độ tuổi</span>
              </label>
            </div>
            {criteria.age.enabled && (
              <div className="criteria-content-box">
                <div className="criteria-row-flex">
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={criteria.age.min}
                    onChange={(e) => handleAgeChange("min", e.target.value)}
                    placeholder="Tuổi tối thiểu"
                    className="form-input-large"
                  />
                  <span className="range-separator">đến</span>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={criteria.age.max}
                    onChange={(e) => handleAgeChange("max", e.target.value)}
                    placeholder="Tuổi tối đa"
                    className="form-input-large"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer-criteria">
          <div className="criteria-summary-box">
            <span className="criteria-count-badge">
              {getActiveCriteriaCount()} tiêu chí được chọn
            </span>
          </div>
          <div className="modal-actions-group">
            <button className="btn-secondary-action" onClick={handleReset}>
              Đặt lại
            </button>
            <button className="btn-cancel-action" onClick={onClose}>
              Hủy
            </button>
            <button
              className="btn-primary-action"
              onClick={handleApply}
              disabled={getActiveCriteriaCount() === 0}
            >
              Áp dụng tiêu chí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriteriaModal;