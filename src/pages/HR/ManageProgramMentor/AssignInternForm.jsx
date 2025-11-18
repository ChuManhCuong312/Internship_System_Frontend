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
  const isApproved = intern.internConfirmStatus === "APPROVED";
  const isReassign = !!intern.mentorId;

  return (
    <div className="modal-overlay">
      <div className="modal assign-intern-modal">
        <h3 className="modal-title">
          {isReassign ? "Phân công lại Mentor" : "Phân công Mentor"}
        </h3>

        <div className="form-group">
          <label className="form-label">Thực tập sinh:</label>
          <input
            type="text"
            value={intern.internName}
            readOnly
            className="form-input readonly"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Chọn Mentor:</label>
          <select
            value={selectedMentor ?? ""}
            onChange={(e) => onSelectMentor(Number(e.target.value))}
            className="form-select"
            disabled={!isApproved}
          >
            <option value="">-- Chọn Mentor --</option>
            {mentors.map((mentor) => (
              <option key={mentor.mentorId} value={mentor.mentorId}>
                {mentor.mentorName} - Phụ trách ({mentor.assignedCount}) TTS
              </option>
            ))}
          </select>
        </div>

        {!isApproved && (
          <p style={{ color: "red" }}>TTS chưa xác nhận hợp đồng</p>
        )}

        <div className="modal-actions">
          <button
            className="btn-primary"
            onClick={onSave}
            disabled={!isApproved || !selectedMentor}
          >
            {isReassign ? "Phân công lại" : "Phân công"}
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