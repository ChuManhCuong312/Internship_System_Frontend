import React from "react";
import "../../../styles/manageUsers.css";

const AssignInternForm = ({
  intern,
  mentors,
  selectedMentor,
  onSelectMentor,
  onSave,
  onClose
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal assign-intern-modal">
        <h3 className="modal-title">Phân công Mentor</h3>

        {/* Intern Name */}
        <div className="form-group">
          <label className="form-label">Thực tập sinh:</label>
          <input
            type="text"
            value={intern.name}
            readOnly
            className="form-input readonly"
          />
        </div>

        {/* Mentor Selector */}
        <div className="form-group">
          <label className="form-label">Chọn Mentor:</label>
          <select
            value={selectedMentor}
            onChange={(e) => onSelectMentor(e.target.value)}
            className="form-select"
          >
            <option value="">-- Chọn Mentor --</option>
            {mentors.map((mentor) => (
              <option key={mentor.id} value={mentor.name}>
                {mentor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button className="btn-primary" onClick={onSave}>
            Lưu
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignInternForm;