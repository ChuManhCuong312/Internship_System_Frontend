
import React from "react";
import { X, Plus, MoreVertical } from "lucide-react";

export default function TeamManagementModal({
  isOpen,
  onClose,
  selectedProgram,
  handleAddTeam,
  handleEditTeam,
  handleDeleteTeam,
  mockMentors
}) {
  if (!isOpen || !selectedProgram) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Quản lý Team và phân công</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Teams Section */}
          <div className="teams-section">
            <div className="section-header">
              <h3>Quản lý Team</h3>
              <button className="btn btn-primary btn-small" onClick={handleAddTeam}>
                <Plus size={16} /> Thêm Team
              </button>
            </div>

            <div className="teams-list">
              {selectedProgram.teams.map((team) => {
                const assignedMentor = mockMentors.find((m) => m.mentor_id === team.mentor_id);
                return (
                  <div key={team.team_id} className="team-card">
                    <div className="team-header">
                      <div>
                        <h4 className="team-name">{team.name}</h4>
                        <p className="team-description">{team.description}</p>
                        {assignedMentor ? (
                          <div className="team-mentor-info">
                            <span className="mentor-badge">
                              Mentor: <strong>{assignedMentor.name}</strong> ({assignedMentor.department})
                            </span>
                          </div>
                        ) : (
                          <p className="team-no-mentor">Không có mentor để phân công</p>
                        )}
                      </div>
                      <div className="dropdown-menu-container">
                        <button className="btn-icon">
                          <MoreVertical size={16} />
                        </button>
                        <div className="dropdown-menu">
                          <button className="dropdown-item" onClick={() => handleEditTeam(team)}>
                            Cập nhật thông tin Team
                          </button>
                          <button className="dropdown-item danger" onClick={() => handleDeleteTeam(team.team_id)}>
                            Xoá team
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="team-stats">
                      <span className="interns-count">{team.interns?.length || 0} TTS</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
