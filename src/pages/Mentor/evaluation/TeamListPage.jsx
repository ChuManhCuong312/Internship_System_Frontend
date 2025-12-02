import styles from "./TeamListPage.module.css";

const TEAMS_DATA = {
  1: [
    {
      team_id: 101,
      team_name: "Backend Team A",
      team_lead: "Nguyen Van A",
      member_count: 5,
      description: "Node.js and Express development",
    },
    {
      team_id: 102,
      team_name: "Frontend Team B",
      team_lead: "Tran Thi B",
      member_count: 6,
      description: "React and Next.js development",
    },
    {
      team_id: 103,
      team_name: "Full-stack Team C",
      team_lead: "Le Van C",
      member_count: 7,
      description: "Full-stack MERN development",
    },
  ],
  2: [
    {
      team_id: 201,
      team_name: "DevOps Team",
      team_lead: "Hoang Minh D",
      member_count: 4,
      description: "AWS and Docker services",
    },
    {
      team_id: 202,
      team_name: "API Development",
      team_lead: "Pham Duc E",
      member_count: 5,
      description: "RESTful and GraphQL APIs",
    },
  ],
  3: [
    {
      team_id: 301,
      team_name: "Mobile Team",
      team_lead: "Vu Tuan F",
      member_count: 6,
      description: "React Native and Flutter",
    },
    {
      team_id: 302,
      team_name: "Cloud Services",
      team_lead: "Ngo Linh G",
      member_count: 5,
      description: "AWS and Google Cloud",
    },
  ],
};

export default function TeamListPage({ programId, onSelectTeam, onBack }) {
  const teams = TEAMS_DATA[programId] || [];

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={onBack}>
        ← Back to Programs
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Program Teams</h1>
        <p className={styles.subtitle}>Select a team to evaluate interns</p>
      </div>

      <div className={styles.gridContainer}>
        {teams.map((team) => (
          <div
            key={team.team_id}
            className={styles.teamCard}
            onClick={() => onSelectTeam(team.team_id)}
          >
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{team.team_name}</h2>
              <span className={styles.memberBadge}>
                {team.member_count} members
              </span>
            </div>
            <p className={styles.teamLead}>
              <span className={styles.label}>Team Lead:</span> {team.team_lead}
            </p>
            <p className={styles.cardDescription}>{team.description}</p>
            <button className={styles.selectButton}>Select Team →</button>
          </div>
        ))}
      </div>
    </div>
  );
}
