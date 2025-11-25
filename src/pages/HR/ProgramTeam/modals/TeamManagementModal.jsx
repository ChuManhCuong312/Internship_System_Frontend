import React, { useState } from "react";
import { X, Plus, MoreVertical } from "lucide-react";
import AssignMentorModal from "./AssignMentorModal";

export default function TeamManagementModal({
  isOpen,
  onClose,
  selectedProgram,
  handleAddTeam,
  handleEditTeam,
  handleDeleteTeam,
  mockMentors
}) {
  const [assignedProgramMentors, setAssignedProgramMentors] = useState(
    selectedProgram?.mentors || []
  );
  const [showAssignMentorForm, setShowAssignMentorForm] = useState(false);
  const [mentorSearch, setMentorSearch] = useState("");

  if (!isOpen || !selectedProgram) return null;

  // Filter mentors based on search input
  const mentorResults = mockMentors.filter(
    (m) =>
      m.name.toLowerCase().includes(mentorSearch.toLowerCase()) &&
      !assignedProgramMentors.find((am) => am.mentor_id === m.mentor_id)
  );

  const assignMentorToProgram = (mentor) => {
    setAssignedProgramMentors([...assignedProgramMentors, mentor]);
    setMentorSearch("");
    setShowAssignMentorForm(false);
  };

  const removeProgramMentor = (mentorId) => {
    setAssignedProgramMentors(assignedProgramMentors.filter((m) => m.mentor_id !== mentorId));
  };

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
          {/* ---------------- Program Mentors Section ---------------- */}
          <div className="program-mentors-section">
            <div className="section-header">
              <h3>Mentor phân công cho chương trình</h3>
              <button
                className="btn btn-primary btn-small"
                onClick={() => setShowAssignMentorForm(true)}
              >
                <Plus size={16} /> Thêm Mentor
              </button>
            </div>

            {/* Assigned Mentors */}
            <div className="mentors-list">
              {assignedProgramMentors.length === 0 && (
                <p>Chưa có mentor được phân công</p>
              )}
              {assignedProgramMentors.map((m) => (
                <div key={m.mentor_id} className="mentor-card">
                  <div>
                    <p>
                      <strong>{m.name}</strong> ({m.department})
                    </p>
                    <p>Email: {m.email}</p>
                    <p>Phone: {m.phone}</p>
                  </div>
                  <button
                    className="btn-remove"
                    onClick={() => removeProgramMentor(m.mentor_id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* ---------------- Assign Mentor Modal ---------------- */}
            <AssignMentorModal
              isOpen={showAssignMentorForm}
              onClose={() => setShowAssignMentorForm(false)}
              onAssign={assignMentorToProgram}
              mockMentors={mockMentors}
              assignedMentors={assignedProgramMentors}
            />
          </div>

          {/* ---------------- Teams Section ---------------- */}
          <div className="teams-section" style={{ marginTop: "24px" }}>
            <div className="section-header">
              <h3>Quản lý Team</h3>
              <button className="btn btn-primary btn-small" onClick={handleAddTeam}>
                <Plus size={16} /> Thêm Team
              </button>
            </div>

            <div className="teams-list">
              {selectedProgram.teams.map((team) => {
                const assignedMentor = mockMentors.find(
                  (m) => m.mentor_id === team.mentor_id
                );
                return (
                  <div key={team.team_id} className="team-card">
                    <div className="team-header">
                      <div>
                        <h4 className="team-name">{team.name}</h4>
                        <p className="team-description">{team.description}</p>
                        {assignedMentor ? (
                          <div className="team-mentor-info">
                            <span className="mentor-badge">
                              Mentor: <strong>{assignedMentor.name}</strong> (
                              {assignedMentor.department})
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
                          <button
                            className="dropdown-item"
                            onClick={() => handleEditTeam(team)}
                          >
                            Cập nhật thông tin Team
                          </button>
                          <button
                            className="dropdown-item danger"
                            onClick={() => handleDeleteTeam(team.team_id)}
                          >
                            Xoá team
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="team-stats">
                      <span className="interns-count">
                        {team.interns?.length || 0} TTS
                      </span>
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
