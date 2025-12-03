import { MoreVertical } from "lucide-react";

const TeamsView = ({ program, assignedMentors, onEditTeam, onDeleteTeam, onBack }) => {
  return (
    <div className="teams-page">
      <div className="header-section">
        <button className="btn btn-secondary" onClick={onBack}>
          Back to Programs
        </button>
      </div>

      <div className="teams-list">
        {program.teams && program.teams.length > 0 ? (
          program.teams.map((team, idx) => (
            <div key={team.teamId} className="card team-card">
              <div className="team-card-header">
                <span className="team-stt">Team {idx + 1}</span>
                <h3>{team.name}</h3>
                <div className="team-mentors">
                  {assignedMentors
                    .filter((m) => m.mentorId === team.mentorId)
                    .map((m) => (
                      <span key={m.mentorId} className="mentor-badge">
                        {m.fullName}
                      </span>
                    ))}
                </div>
                <div className="dropdown-menu-container">
                  <button className="btn-icon">
                    <MoreVertical size={16} />
                  </button>
                  <div className="dropdown-menu">
                    <button className="dropdown-item">View Intern</button>
                    <button className="dropdown-item" onClick={() => onEditTeam(team)}>
                      Update Team
                    </button>
                    <button className="dropdown-item danger" onClick={() => onDeleteTeam(team.teamId)}>
                      Delete Team
                    </button>
                  </div>
                </div>
              </div>
              <p className="team-description">{team.description}</p>
              <p className="team-interns-count">Interns: {team.interns?.length || 0}</p>
            </div>
          ))
        ) : (
          <p>No teams in this program.</p>
        )}
      </div>
    </div>
  );
};

export default TeamsView;