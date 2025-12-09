import { useState } from "react";
import { Plus, MoreVertical, Search, Trash2 } from "lucide-react";
import hrApi from "../../../../api/hrApi";

export default function InternDetails({
  team,
  teamIndex,
  programMentors,
  onUpdateTeam,
  onDeleteTeam,
  onRefreshTeam,
  token,
  programId,
  programStatus,
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAssignMentorDialog, setShowAssignMentorDialog] = useState(false);
  const [removeInternConfirm, setRemoveInternConfirm] = useState(null);
  const [showAddInternDialog, setShowAddInternDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInterns, setFilteredInterns] = useState([]);
  const [selectedMentorForAssign, setSelectedMentorForAssign] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingIntern, setIsAddingIntern] = useState(false);

   const canModify = programStatus ;

  const getMentorName = (mentorId) => {
    const mentor = programMentors.find((m) => m.mentorId === mentorId);
    console.log("mentor:",mentor)
    return mentor?.fullName || "Chưa có mentor";
  };

  const handleSearchInterns = async (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredInterns([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await hrApi.searchAvailableInterns(token, query);

      // Filter out interns already in this team
      const available = results.filter(
        (intern) => !team.interns?.some((t) => t.internId === intern.internId)
      );

      setFilteredInterns(available);
    } catch (err) {
      console.error("Error searching interns:", err);
      setFilteredInterns([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectIntern = async (intern) => {
    try {
      setIsAddingIntern(true);
      await hrApi.addInternToTeam(token, programId, team.teamId, intern.internId);

      // Refresh the team data to show the new intern
      if (onRefreshTeam) {
        await onRefreshTeam();
      }

      setShowAddInternDialog(false);
      setSearchQuery("");
      setFilteredInterns([]);
    } catch (err) {
      console.error("Error adding intern to team:", err);
      alert("Không thể thêm thực tập sinh vào team. Vui lòng thử lại.");
    } finally {
      setIsAddingIntern(false);
    }
  };



  const handleRemoveIntern = async (internId) => {
    try {
      await hrApi.removeInternFromTeam(token, team.teamId, internId);

      // Refresh the team data to remove the intern from the list
      if (onRefreshTeam) {
        await onRefreshTeam();
      }

      setRemoveInternConfirm(null);
    } catch (err) {
      console.error("Error removing intern from team:", err);
      alert("Không thể xoá thực tập sinh khỏi team. Vui lòng thử lại.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div className="main-header">
        <div className="main-header-content">
          <div>
            <h1 className="main-header-title">Team {teamIndex + 1}</h1>
            <p className="main-header-subtitle">Mentor: {getMentorName(team.mentorId)}</p>
          </div>

          {/* Top Right Actions */}
          <div className="main-header-actions">
            <button className="btn btn-primary"
                onClick={() => setShowAddInternDialog(true)}
                disabled={!(canModify === "ON_GOING" || canModify === "UPCOMING")}
                >
              <Plus size={16} />
              Thêm thực tập sinh
            </button>

            <div className="dropdown-menu-container">
              <button className="btn-icon" onClick={() => setShowMenu(!showMenu)}>
                <MoreVertical size={16} />
              </button>
              {showMenu && (
                <div className="dropdown-menu">
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      // Pre-select current mentor
                      const currentMentor = programMentors.find(
                        (m) => m.mentorId === team.mentorId
                      ) || null;
                      setSelectedMentorForAssign(currentMentor);
                      setShowAssignMentorDialog(true);
                      setShowMenu(false);
                    }}
                    disabled={!(canModify === "ON_GOING" || canModify === "UPCOMING")}
                  >
                    Phân công mentor
                  </button>

                  <button
                    className="dropdown-item danger"
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                    disabled={!(canModify === "UPCOMING")}
                  >
                    Xoá team
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="main-content">
        <h2 className="interns-section-title">
          Danh sách thực tập sinh ({team.interns?.length || 0})
        </h2>

        {team.interns && team.interns.length > 0 ? (
          <div className="intern-list">
            {team.interns.map((intern) => (
              <div key={intern.internId} className="intern-card">
                <div className="intern-card-header">
                  <div className="intern-card-info">
                    <h3 className="intern-name">{intern.fullName}</h3>
                    <p className="intern-email">{intern.email} -- {intern.phone}</p>
                    {intern.gpa && <p className="intern-gpa">GPA: {intern.gpa}</p>}
                    <br></br>
                    <div className="intern-tags">
                      <span className="tag">{intern.school}</span>
                      <span className="tag">{intern.major}</span>
                    </div>

                  </div>
                  <button
                    className="remove-button"
                    onClick={() => setRemoveInternConfirm(intern.internId)}
                    disabled={!(canModify === "ON_GOING" || canModify === "UPCOMING")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-interns">
            <p>Không có thực tập sinh nào</p>
          </div>
        )}
      </div>

      {/* Delete Team Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal confirmation-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirmation-dialog-content">
              <div className="confirmation-dialog-title">Xoá team?</div>
              <div className="confirmation-dialog-description">
                Bạn có chắc muốn xoá team {team.name}? Hành động này không thể hoàn tác.
              </div>
              <div className="confirmation-dialog-actions">
                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                  Hủy
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    onDeleteTeam(team.teamId);
                    setShowDeleteConfirm(false);
                  }}
                >
                  Xoá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Intern Confirmation */}
      {removeInternConfirm !== null && (
        <div className="modal-overlay" onClick={() => setRemoveInternConfirm(null)}>
          <div className="modal confirmation-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirmation-dialog-content">
              <div className="confirmation-dialog-title">Loại thực tập sinh?</div>
              <div className="confirmation-dialog-description">
                Bạn có chắc muốn loại thực tập sinh này ra khỏi team?
              </div>
              <div className="confirmation-dialog-actions">
                <button className="btn btn-secondary" onClick={() => setRemoveInternConfirm(null)}>
                  Hủy
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    handleRemoveIntern(removeInternConfirm);
                  }}
                >
                  Xoá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Mentor Dialog */}
      {/* Assign Mentor Dialog */}
      {showAssignMentorDialog && (
        <div className="modal-overlay" onClick={() => setShowAssignMentorDialog(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Phân công Mentor cho Team {teamIndex + 1}</h2>
            </div>
            <div className="modal-body">
              <div className="mentor-list">
                {programMentors.map((mentor) => (
                  <button
                    key={mentor.mentorId}
                    className={`mentor-option ${
                      selectedMentorForAssign?.mentorId === mentor.mentorId ? "selected" : ""
                    }`}
                    onClick={() => setSelectedMentorForAssign(mentor)}
                  >
                    <div className="mentor-name">{mentor.fullName}</div>
                    <div className="mentor-detail">{mentor.department}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAssignMentorDialog(false)}>
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (selectedMentorForAssign) {
                    onUpdateTeam(selectedMentorForAssign.mentorId, team.teamId);  // call useTeamActions.handleAssignMentorToTeam
                    setShowAssignMentorDialog(false);
                    setSelectedMentorForAssign(null);
                  }
                }}
                disabled={!selectedMentorForAssign}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Intern Dialog */}
      {showAddInternDialog && (
        <div className="modal-overlay" onClick={() => setShowAddInternDialog(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Thêm thực tập sinh vào team</h2>
            </div>
            <div className="modal-body">
              <div className="search-input-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Nhập tên thực tập sinh..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInterns(e.target.value)}
                  className="form-input search-input"
                />
              </div>

              {/* Search Results */}
              {searchQuery.trim() !== "" && (
                <div className="search-results">
                  {isSearching ? (
                    <div className="no-results">Đang tìm kiếm...</div>
                  ) : filteredInterns.length > 0 ? (
                    <div>
                      {filteredInterns.map((intern) => (
                        <button
                          key={intern.internId}
                          className="search-result-item"
                          onClick={() => handleSelectIntern(intern)}
                          disabled={isAddingIntern}
                        >
                          <div className="search-result-name">{intern.fullName}</div>
                          <div className="search-result-email">{intern.email}</div>
                          <div className="search-result-tags">
                            <span className="tag">{intern.school}</span>
                            <span className="tag">{intern.major}</span>
                          </div>
                          {intern.gpa && <div className="search-result-gpa">GPA: {intern.gpa}</div>}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="no-results">Không tìm thấy thực tập sinh nào</div>
                  )}
                </div>
              )}

              {searchQuery.trim() === "" && (
                <div className="empty-search-prompt">
                  Nhập tên để tìm kiếm thực tập sinh
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddInternDialog(false);
                  setSearchQuery("");
                  setFilteredInterns([]);
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}