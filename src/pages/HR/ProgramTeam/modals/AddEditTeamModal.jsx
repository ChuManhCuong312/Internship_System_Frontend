import React, { useState, useEffect, useContext } from "react";
import { X } from "lucide-react";
import { AuthContext } from "../../../../context/AuthContext";
import hrApi from "../../../../api/hrApi";

export default function AddEditTeamModal({
  isOpen,
  onClose,
  onSave,
  selectedTeam,
  teamFormData,
  setTeamFormData,
  teamMentorSearch,
  setTeamMentorSearch,
  selectedProgram,
  token,
}) {


  const { token: contextToken } = useContext(AuthContext);
  const authToken = token || contextToken;

  const [mentorSuggestions, setMentorSuggestions] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync selected mentor when editing
  useEffect(() => {
    if (selectedTeam) {
      setSelectedMentor({
        mentorId: selectedTeam.mentorId,
        fullName: selectedTeam.mentorName,
      });
      setTeamMentorSearch(selectedTeam.mentorName);
      setTeamFormData((prev) => ({ ...prev, mentorId: selectedTeam.mentorId }));
    } else {
      setSelectedMentor(null);
      setTeamMentorSearch("");
    }
  }, [selectedTeam, setTeamFormData, setTeamMentorSearch]);

  // Fetch mentor suggestions from backend
useEffect(() => {

  if (!teamMentorSearch) {
    setMentorSuggestions([]);
    return;
  }

  if (!selectedProgram?.programId) {
    console.warn("No programId! Cannot search mentors.");
    setMentorSuggestions([]);
    return;
  }

  setLoading(true);
  const timer = setTimeout(async () => {
    try {
      console.log("Calling API for mentors...");
      const results = await hrApi.searchMentorsInProgram(
        authToken,
        selectedProgram.programId,
        teamMentorSearch
      );
      console.log("Mentor API results:", results);
      setMentorSuggestions(results || []);
    } catch (err) {
      console.error("Error fetching mentors:", err);
      setMentorSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  return () => clearTimeout(timer);
}, [teamMentorSearch, selectedProgram?.programId, authToken]);


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
            <label>Phân công Mentor cho Team</label>
            <div className="autocomplete-container">
              <input
                type="text"
                placeholder="Search mentor by name..."
                value={teamMentorSearch}
                onChange={(e) => {
                  setTeamMentorSearch(e.target.value);
                  setSelectedMentor(null);
                  setTeamFormData({ ...teamFormData, mentorId: null });
                }}
                className="form-input"
              />

              {/* Suggestions dropdown */}
              {teamMentorSearch && (
                <div className="suggestions-list">
                  {loading && <p className="loading-text">Loading...</p>}
                  {!loading && mentorSuggestions.length === 0 && (
                    <p className="no-results">No mentors found</p>
                  )}
                  {!loading &&
                    mentorSuggestions.map((mentor) => (
                      <div
                        key={mentor.mentorId}
                        className="suggestion-item"
                        onClick={() => {
                          setTeamFormData({ ...teamFormData, mentorId: mentor.mentorId });
                          setTeamMentorSearch(mentor.fullName);
                          setSelectedMentor(mentor);
                          setMentorSuggestions([]);
                        }}
                      >
                        <p className="suggestion-name">{mentor.fullName}</p>
                        <p className="suggestion-info">{mentor.department}</p>
                      </div>
                    ))}
                </div>
              )}

              {/* Selected mentor badge */}
              {selectedMentor && (
                <div className="selected-mentor">
                  <span className="mentor-badge">{selectedMentor.fullName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMentor(null);
                      setTeamMentorSearch("");
                      setTeamFormData({ ...teamFormData, mentorId: null });
                    }}
                    className="btn-remove"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
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
