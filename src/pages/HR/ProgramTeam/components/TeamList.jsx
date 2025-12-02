import "../../../../styles/team-management.css";

export default function TeamList({ teams, selectedTeamId, onSelectTeam, assignedMentors }) {
  const getMentorName = (mentorId) => {
    const mentor = assignedMentors.find((m) => m.mentorId === mentorId);
    return mentor?.fullName || "Chưa có mentor";
  };

  return (
    <div className="team-list">
      {teams.map((team, idx) => (
        <div
          key={team.teamId}
          onClick={() => onSelectTeam(team)}
          className={`team-item ${selectedTeamId === team.teamId ? "active" : ""}`}
        >
          <div className="team-item-name">Team {idx + 1}</div>
          <div className="team-item-mentor">{getMentorName(team.mentorId)}</div>
          <div className="team-item-count">{team.interns?.length || 0} thực tập sinh</div>
        </div>
      ))}
    </div>
  );
}