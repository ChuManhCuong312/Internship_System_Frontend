import styles from "./TeamListPage.module.css";

const TEAMS_DATA = {
  1: [
    { team_id: 101, team_name: "Nhóm Backend A", member_count: 5 },
    { team_id: 102, team_name: "Nhóm Frontend B", member_count: 6 },
    { team_id: 103, team_name: "Nhóm Full-stack C", member_count: 7 },
  ],
  2: [
    { team_id: 201, team_name: "Nhóm DevOps", member_count: 4 },
    { team_id: 202, team_name: "Nhóm Phát triển API", member_count: 5 },
  ],
  3: [
    { team_id: 301, team_name: "Nhóm Mobile", member_count: 6 },
    { team_id: 302, team_name: "Dịch vụ Cloud", member_count: 5 },
  ],
};

export default function TeamListPage({ programId, onSelectTeam, onBack }) {
  const teams = TEAMS_DATA[programId] || [];

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={onBack}>
        ← Quay lại danh sách chương trình
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Danh sách nhóm</h1>
        <p className={styles.subtitle}>Chọn một nhóm để đánh giá thực tập sinh</p>
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
                {team.member_count} thành viên
              </span>
            </div>

            <button className={styles.selectButton}>Chọn nhóm →</button>
          </div>
        ))}
      </div>
    </div>
  );
}
