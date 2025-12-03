import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function AddEditTeamModal({
  isOpen,
  onClose,
  onSave,
  selectedTeam,
  teamFormData,
  setTeamFormData,
  selectedProgram,
  programMentors, // <-- pass the mentor list here
}) {
  // Sync selected mentor when editing
  useEffect(() => {
    if (selectedTeam) {
      setTeamFormData((prev) => ({
        ...prev,
        mentorId: selectedTeam.mentorId || "",
        name: selectedTeam.name || "",
        description: selectedTeam.description || "",
      }));
    } else {
      setTeamFormData((prev) => ({
        ...prev,
        mentorId: "",
        name: "",
        description: "",
      }));
    }
  }, [selectedTeam, setTeamFormData]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{selectedTeam ? "Cập nhật Team" : "Thêm Team mới"}</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">



          <div className="form-group">
            <label>Phân công Mentor</label>
            <select
              className="form-input"
              value={teamFormData.mentorId || ""}
              onChange={(e) =>
                setTeamFormData({ ...teamFormData, mentorId: Number(e.target.value) })
              }
            >
              <option value="">-- Chọn mentor --</option>
              {programMentors.map((mentor) => (
                <option key={mentor.mentorId} value={mentor.mentorId}>
                  {mentor.fullName} ({mentor.department})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Huỷ
          </button>
          <button className="btn btn-primary" onClick={onSave}>
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
