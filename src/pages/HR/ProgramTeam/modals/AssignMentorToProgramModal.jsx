import React, { useState, useEffect, useContext } from "react";
import { X } from "lucide-react";
import hrApi from "../../../../api/hrApi";
import { AuthContext } from "../../../../context/AuthContext";
import { toast } from "react-toastify";

export default function AssignMentorModal({
  isOpen,
  onClose,
  onAssign, // parent callback to refresh program overview
  assignedMentors,
  programId
}) {
  const { token } = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Local copy of assigned mentors inside modal
  const [localAssignedMentors, setLocalAssignedMentors] = useState([]);

useEffect(() => {
  if (isOpen) {
    setLocalAssignedMentors(assignedMentors || []);
    setSearch("");
    setResults([]);
  }
}, [isOpen, assignedMentors]);


  // Search mentors from API
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    hrApi.searchMentors(token, search)
      .then((data) => {
        const filtered = data.filter(
          (m) => !localAssignedMentors.some((am) => am.mentorId === m.mentorId)
        );
        setResults(filtered);
      })
      .catch((err) => console.error("Error searching mentors:", err))
      .finally(() => setLoading(false));
  }, [search, token, localAssignedMentors]);

  // Remove mentor from selection
  const handleRemoveMentor = (mentorId) => {
    setLocalAssignedMentors(
      localAssignedMentors.filter((m) => m.mentorId !== mentorId)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Phân công mentor</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p>Tìm và chọn mentor để phân công cho chương trình </p>

          {/* Search input */}
          <div className="form-group">
            <label>Tìm theo tên mentor</label>
            <input
              type="text"
              placeholder="Nhập tên mentor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              autoFocus
            />

            {loading && <p>Đang tải mentors...</p>}

            {search.trim() !== "" && results.length > 0 && (
              <div className="suggestions-list">
                {results.map((mentor) => (
                  <div
                    key={mentor.mentorId}
                    className="suggestion-item"
                    onClick={() => {
                      setLocalAssignedMentors([...localAssignedMentors, mentor]);
                      setSearch(""); // clear search but keep focus
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

            {search.trim() !== "" && results.length === 0 && !loading && (
              <p>Không tìm thấy mentors nào</p>
            )}
          </div>

          {/* Currently selected mentors */}
          <div className="selected-mentors-section">
            <h4>Chọn mentor</h4>
            {localAssignedMentors.length === 0 ? (
              <p>Chưa có mentor được phân công cho chương trình</p>
            ) : (
              <div className="mentors-list">
                {localAssignedMentors.map((mentor) => (
                  <span key={mentor.mentorId} className="mentor-badge">
                    {mentor.fullName}
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveMentor(mentor.mentorId)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn btn-primary"
            onClick={async () => {
              try {
                // Compute mentors to add and remove
                const currentIds = assignedMentors.map((m) => m.mentorId);
                const newIds = localAssignedMentors.map((m) => m.mentorId);

                const toAdd = localAssignedMentors.filter((m) => !currentIds.includes(m.mentorId));
                const toRemove = assignedMentors.filter((m) => !newIds.includes(m.mentorId));

                // Call APIs
                for (const mentor of toAdd) {
                  await hrApi.assignMentorToProgram(token, programId, mentor.mentorId);
                }

                for (const mentor of toRemove) {
                  await hrApi.removeMentorFromProgram(token, programId, mentor.mentorId);
                }

                onAssign(localAssignedMentors); // refresh parent state
                onClose();
              } catch (err) {
                console.error("Error saving mentors:", err);
                toast.error(
                  err.response?.data?.message || err.message || "Không thể lưu phân công mentor!",
                  {
                    position: "top-right",
                    autoClose: 5000,
                  }
                );
              }
            }}
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
