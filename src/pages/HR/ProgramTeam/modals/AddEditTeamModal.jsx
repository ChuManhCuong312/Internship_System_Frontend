
import React from "react";
import { X, Plus } from "lucide-react";

export default function AddEditTeamModal({
  isOpen,
  onClose,
  onSave,
  selectedTeam,
  teamFormData,
  setTeamFormData,
  teamMentorSearch,
  setTeamMentorSearch,
  mockMentors,
  handleRemoveIntern,
  setIsAddInternOpen
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{selectedTeam ? "Cập nhật thông tin Team" : "Thêm Team mới"}</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Team Name */}
          <div className="form-group">
            <label>Tên Team</label>
            <input
              type="text"
              value={teamFormData.name || ""}
              onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
              className="form-input"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              value={teamFormData.description || ""}
              onChange={(e) => setTeamFormData({ ...teamFormData, description: e.target.value })}
              className="form-textarea"
              rows={2}
            />
          </div>

          {/* Mentor Autocomplete */}
          <div className="form-group">
            <label>Phân công Mentor cho Team</label>
            <div className="autocomplete-container">
              <input
                type="text"
                placeholder="Search mentor by name..."
                value={teamMentorSearch}
                onChange={(e) => setTeamMentorSearch(e.target.value)}
                className="form-input"
              />

              {teamMentorSearch && (
                <div className="suggestions-list">
                  {mockMentors
                    .filter((mentor) => mentor.name.toLowerCase().includes(teamMentorSearch.toLowerCase()))
                    .map((mentor) => (
                      <div
                        key={mentor.mentor_id}
                        className="suggestion-item"
                        onClick={() => {
                          setTeamFormData({ ...teamFormData, mentor_id: mentor.mentor_id });
                          setTeamMentorSearch(mentor.name);
                        }}
                      >
                        <div>
                          <p className="suggestion-name">{mentor.name}</p>
                          <p className="suggestion-info">{mentor.department}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {teamFormData.mentor_id && (
                <div className="selected-mentor">
                  <span className="mentor-badge">
                    {mockMentors.find((m) => m.mentor_id === teamFormData.mentor_id)?.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTeamFormData({ ...teamFormData, mentor_id: null });
                      setTeamMentorSearch("");
                    }}
                    className="btn-remove"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interns Section */}
          {selectedTeam && (
            <div className="interns-section">
              <div className="section-header">
                <h4>Thực tập sinh trong Team</h4>
                <button className="btn btn-primary btn-small" onClick={() => setIsAddInternOpen(true)}>
                  <Plus size={16} /> Thêm Thực tập sinh
                </button>
              </div>

              <div className="interns-list">
                {selectedTeam.interns &&
                  selectedTeam.interns.map((intern) => (
                    <div key={intern.intern_id} className="intern-item">
                      <div>
                        <p className="intern-name">{intern.name}</p>
                        <p className="intern-info">{intern.phone}</p>
                      </div>
                      <button className="btn-remove" onClick={() => handleRemoveIntern(intern.intern_id)}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

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
