import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProgramList = ({
  programs,
  programOverview,
  onViewTeams,
  onCreateAutoTeam,
  onEditProgram,
  onDeleteProgram,
  onCloneProgram,
  onAssignMentor,
  onFinishProgram,
  formatLocalDate,
  getStatusColor,
}) => {
  const navigate = useNavigate();

  if (programs.length === 0) {
    return (
      <div className="card empty-state">
        <p className="empty-state-text">Không tìm thấy chương trình</p>
      </div>
    );
  }


  return (
    <div className="programs-list">
      {programs.map((program) => (
        <div key={program.programId} className="card program-card">
          <div className="program-header">
            <div className="program-title-section">
              <h2 className="program-title">{program.name}</h2>
              <span className={`status-badge ${getStatusColor(program.programStatus)}`}>
                {program.programStatus}
              </span>
            </div>
            <div className="dropdown-menu-container">
              <button className="btn-icon">
                <MoreVertical size={16} />
              </button>
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => onViewTeams(program)}>
                  Quản lý Teams
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => onCreateAutoTeam(program)}
                  disabled={["ON_GOING", "FINISHED"].includes(program.programStatus)}
                >
                  Tự động tạo teams
                </button>
                <button className="dropdown-item" onClick={() => onAssignMentor(program)}>
                  Phân công Mentor
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => onEditProgram(program)}
                  disabled={["ON_GOING", "FINISHED"].includes(program.programStatus)}
                >
                  Cập nhật chương trình
                </button>
                <button className="dropdown-item" onClick={() => onCloneProgram(program)}>
                  Sao chép chương trình
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => onFinishProgram(program)}
                  disabled={program.programStatus !== "ON_GOING"}
                  style={program.programStatus === "ON_GOING" ? { color: "#ff9800" } : {}}
                >
                  Kết thúc chương trình
                </button>
                <button
                  className="dropdown-item danger"
                  onClick={() => onDeleteProgram(program)}
                  disabled={program.programStatus === "ON_GOING"}
                >
                  Xoá chương trình
                </button>
              </div>
            </div>
          </div>

          <p className="program-detail">{program.description}</p>

          <div className="program-stats">
            <div className="stat-item">
              <p className="stat-label">Phòng ban</p>
              <p className="stat-value">{program.department}</p>
            </div>
            <div className="stat-item">
              <p className="stat-label">Ngày bắt đầu</p>
              <p className="stat-value">{formatLocalDate(program.startDate)}</p>
            </div>
            <div className="stat-item">
              <p className="stat-label">Ngày kết thúc</p>
              <p className="stat-value">{formatLocalDate(program.endDate)}</p>
            </div>
            <div className="stat-item">
              <p className="stat-label">Số lượng mentor</p>
              <p className="stat-value">{programOverview[program.programId]?.totalMentors || 0}</p>
            </div>
            <div className="stat-item">
              <p className="stat-label">Số lượng interns</p>
              <p className="stat-value">{programOverview[program.programId]?.totalInterns || 0}</p>
            </div>
            <div className="stat-item">
              <p className="stat-label">Số lượng teams</p>
              <p className="stat-value">{programOverview[program.programId]?.totalTeams || 0}</p>
            </div>
          </div>

          <div className="program-mentors-section">
            <h4 className="mentors-title">Mentor được phân công</h4>
            <div className="mentors-list">
              {programOverview[program.programId]?.mentorNames?.length > 0 ? (
                programOverview[program.programId].mentorNames.map((name, idx) => (
                  <span key={idx} className="mentor-badge">
                    {name}
                  </span>
                ))
              ) : (
                <span className="no-mentor">Chưa có mentor</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgramList;