import React, { useState, useEffect, useContext } from "react";
import { X } from "lucide-react";
import hrApi from "../../../../api/hrApi";
import { AuthContext } from "../../../../context/AuthContext";

export default function AssignMentorModal({
  isOpen,
  onClose,
  onAssign,
  assignedMentors,
  programId
}) {
  const { token } = useContext(AuthContext);  // ✅ get token here

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      hrApi.getMentorsForProgram(token, programId)
        .then((data) => setMentors(data))
        .catch((err) => console.error("Error fetching mentors:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, programId, token]);

  useEffect(() => {
    if (search.trim() === "") {
      setResults([]);
      return;
    }

    setLoading(true);
    hrApi.searchMentors(token, search)
      .then((data) => {
        const filtered = data.filter(
          (m) => !assignedMentors.find((am) => am.mentorId === m.mentorId)
        );
        setResults(filtered);
      })
      .catch((err) => console.error("Error searching mentors:", err))
      .finally(() => setLoading(false));
  }, [search, token, assignedMentors]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Assign Mentor</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p>Search and select a mentor to assign to this program</p>
          {loading ? (
            <p>Loading mentors...</p>
          ) : (
            <div className="form-group">
              <label>Search by Mentor Name</label>
              <input
                type="text"
                placeholder="Type mentor name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
              />

              {search.trim() !== "" && results.length > 0 && (
                <div className="suggestions-list">
                  {results.map((mentor) => (
                    <div
                      key={mentor.mentorId}
                      className="suggestion-item"
                      onClick={() => {
                        onAssign(mentor);
                        setSearch("");
                      }}
                    >
                      <p className="suggestion-name">{mentor.fullName}</p>
                      <p className="suggestion-info">
                        {mentor.department} — {mentor.email} — {mentor.phone}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {search.trim() !== "" && results.length === 0 && (
                <p>No mentors found</p>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
