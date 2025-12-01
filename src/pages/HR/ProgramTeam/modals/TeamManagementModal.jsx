import React, { useState, useEffect, useContext } from "react";
import { X, Plus, MoreVertical } from "lucide-react";

import hrApi from "../../../../api/hrApi";
import { AuthContext } from "../../../../context/AuthContext";

export default function TeamManagementModal({
  isOpen,
  onClose,
  selectedProgram,
  handleAddTeam,
  handleEditTeam,
  handleDeleteTeam
}) {
  const { token } = useContext(AuthContext);

  const [assignedProgramMentors, setAssignedProgramMentors] = useState([]);
  const [availableMentors, setAvailableMentors] = useState([]);
  const [showAssignMentorForm, setShowAssignMentorForm] = useState(false);
  const [mentorSearch, setMentorSearch] = useState("");

  // Load mentors when modal opens
  useEffect(() => {
    if (!isOpen || !selectedProgram || !token) return;

    const fetchMentors = async () => {
      try {
        const programMentors = await hrApi.getMentorsForProgram(
          token,
          selectedProgram.programId
        );
        setAssignedProgramMentors(programMentors);

        const allMentors = await hrApi.getAssignedMentorsDropdown(token);
        setAvailableMentors(allMentors);
      } catch (err) {
        console.error("Error fetching mentors:", err);
      }
    };

    fetchMentors();
  }, [isOpen, selectedProgram, token]);

  if (!isOpen || !selectedProgram) return null;

  // Filter mentors based on search input (safe access)
  const mentorResults = availableMentors.filter(
    (m) =>
      (m.mentorName?.toLowerCase() || "").includes(
        mentorSearch.toLowerCase()
      ) &&
      !assignedProgramMentors.find((am) => am.mentorId === m.mentorId)
  );

  const assignMentorToProgram = async (mentor) => {
    try {
      await hrApi.assignMentorToProgram(token, selectedProgram.programId, mentor.mentorId);
      setAssignedProgramMentors((prev) => [...prev, mentor]);
      setMentorSearch("");
      setShowAssignMentorForm(false);
    } catch (err) {
      console.error("Error assigning mentor:", err);
    }
  };

  const removeProgramMentor = async (mentorId) => {
    try {
      await hrApi.removeMentorFromProgram(token, selectedProgram.programId, mentorId);
      setAssignedProgramMentors((prev) =>
        prev.filter((m) => m.mentorId !== mentorId)
      );
    } catch (err) {
      console.error("Error removing mentor:", err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Quản lý Team và phân công</h2>
          <button className="btn-close" onClick={onClose} aria-label="Đóng">
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
                <div key={m.mentorId} className="mentor-card">
                  <div>
                    <p>
                      <strong>{m.fullName}</strong>
                    </p>
                  </div>
                  <button
                    className="btn-remove"
                    onClick={() => removeProgramMentor(m.mentorId)}
                    aria-label={`Xóa mentor ${m.mentorName}`}
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
              assignedMentors={assignedProgramMentors}
              programId={selectedProgram.programId}   // ✅ add this
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
              {selectedProgram?.teams?.length > 0 ? (
                selectedProgram.teams.map((team) => {
                  const assignedMentor = assignedProgramMentors.find(
                    (m) => m.mentorId === team.mentorId
                  );
                  return (
                    <div key={team.teamId} className="team-card">
                      <div className="team-header">
                        <div>
                          <h4 className="team-name">{team.name}</h4>
                          <p className="team-description">{team.description}</p>
                          {assignedMentor ? (
                            <div className="team-mentor-info">
                              <span className="mentor-badge">
                                Mentor: <strong>{assignedMentor.mentorName}</strong>
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
                              key={`edit-${team.teamId}`}
                              className="dropdown-item"
                              onClick={() => handleEditTeam(team)}
                            >
                              Cập nhật thông tin Team
                            </button>
                            <button
                              key={`delete-${team.teamId}`}
                              className="dropdown-item danger"
                              onClick={() => handleDeleteTeam(team.teamId)}
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
                })
              ) : (
                <p>Chưa có team nào trong chương trình</p>
              )}
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
