
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import styles from "./TeamListPage.module.css";
import { AuthContext } from "../../../context/AuthContext";

export default function TeamListPage({ programId, onSelectTeam, onBack }) {
  const { token } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let alive = true;

    async function fetchTeams() {
      setLoading(true);
      setErrorMsg("");
      try {
        if (!programId) {
          throw new Error("Thiếu programId để tải danh sách team.");
        }
        const res = await axios.get(
          `http://localhost:8080/api/teams/by-program/${programId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // API trả về:
        // [
        //   { "team_id": 1, "team_name": "Nhóm 1", "member_count": 4 }
        // ]
        const data = Array.isArray(res.data) ? res.data : [];
        if (alive) setTeams(data);
      } catch (err) {
        console.error("Fetch teams failed:", err);
        if (alive) {
          setErrorMsg(
            err.response?.data?.message ||
              err.message ||
              "Không thể tải danh sách nhóm."
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (token && programId) {
      fetchTeams();
    } else {
      setLoading(false);
      setErrorMsg("Chưa đăng nhập hoặc thiếu programId.");
    }

    return () => {
      alive = false;
    };
  }, [programId, token]);

  if (loading) {
    return (
      <div className={styles.container}>
        <button className={styles.backButton} onClick={onBack}>
          ← Quay lại danh sách chương trình
        </button>
        <div>Đang tải danh sách nhóm...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={onBack}>
        ← Quay lại danh sách chương trình
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Danh sách nhóm</h1>
        <p className={styles.subtitle}>
          Chọn một nhóm để đánh giá thực tập sinh
        </p>
      </div>

      {errorMsg && <div className={styles.error}>{errorMsg}</div>}

      <div className={styles.gridContainer}>
        {teams.length === 0 ? (
          <div className={styles.noData}>Chương trình chưa có nhóm nào</div>
        ) : (
          teams.map((team) => (
            <div
              key={team.team_id}
              className={styles.teamCard}
              onClick={() => onSelectTeam(team.team_id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelectTeam(team.team_id)}
            >
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{team.team_name}</h2>
                <span className={styles.memberBadge}>
                  {team.member_count} thành viên
                </span>
              </div>

              <button
                className={styles.selectButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTeam(team.team_id);
                }}
              >
                Chọn nhóm →
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};