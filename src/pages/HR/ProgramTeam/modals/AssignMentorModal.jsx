import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function AssignMentorModal({
  isOpen,
  onClose,
  onAssign,
  mockMentors,
  assignedMentors
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (search.trim() === "") {
      setResults([]);
      return;
    }

    // Filter mentors excluding already assigned
    const filtered = mockMentors.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) &&
        !assignedMentors.find((am) => am.mentor_id === m.mentor_id)
    );
    setResults(filtered);
  }, [search, mockMentors, assignedMentors]);

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
          <div className="form-group">
            <label>Search by Mentor Name</label>
            <input
              type="text"
              placeholder="Type mentor name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
            />

            {/* Show dropdown only when typing and results exist */}
            {search.trim() !== "" && results.length > 0 && (
              <div className="suggestions-list">
                {results.map((mentor) => (
                  <div
                    key={mentor.mentor_id}
                    className="suggestion-item"
                    onClick={() => {
                      onAssign(mentor);
                      setSearch("");
                    }}
                  >
                    <p className="suggestion-name">{mentor.name}</p>
                    <p className="suggestion-info">
                      {mentor.department} — {mentor.email} — {mentor.phone}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
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
