import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import programApi from "../../../api/programApi";
import mentorApi from "../../../api/mentorApi";
import { toast } from "react-toastify";
import styles from "./ProgramSelectPage.module.css";

export default function ProgramSelectPage({ onSelectProgram }) {
  const { token, user } = useContext(AuthContext);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch active programs on mount
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!token || !user?.userId) return;

      try {
        setLoading(true);
        setError(null);

        // First, get mentorId from userId
        const mentorData = await mentorApi.getMentorByUserId(token, user.userId);
        
        let allPrograms = [];
        if (mentorData?.mentorId) {
          // Filter programs by mentor ID
          const response = await programApi.filterByMentor(token, mentorData.mentorId);
          console.log("Programs response:", response);
          allPrograms = Array.isArray(response) ? response : [];
        } else {
          // Fallback: Get all programs
          const response = await programApi.getAllPrograms(token, 1, 100);
          console.log("All programs response:", response);
          allPrograms = Array.isArray(response) ? response : (response.data || []);
        }
        
        // Filter to only show active programs (ON_GOING)
        const activePrograms = allPrograms.filter(
          program => program.programStatus === 'ON_GOING'
        );
        
        setPrograms(activePrograms);
      } catch (err) {
        console.error("Error fetching programs:", err);
        setError("Không thể tải danh sách chương trình");
        toast.error("Lỗi khi tải chương trình");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [token, user]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      UPCOMING: { label: "Sắp diễn ra", class: "statusUpcoming" },
      ON_GOING: { label: "Đang diễn ra", class: "statusOngoing" },
      FINISHED: { label: "Hoàn thành", class: "statusCompleted" },
    };
    const info = statusMap[status] || { label: status || "N/A", class: "statusDefault" };
    return <span className={styles[info.class]}>{info.label}</span>;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>📋 Quản lý Nhiệm vụ</h1>
          <p className={styles.subtitle}>Chọn chương trình đang diễn ra để quản lý nhiệm vụ</p>
          <p className={styles.note}>(Chỉ hiển thị các chương trình đang diễn ra)</p>
        </div>
        <div className={styles.loadingState}>
          <p>Đang tải chương trình...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>📋 Quản lý Nhiệm vụ</h1>
          <p className={styles.subtitle}>Chọn chương trình đang diễn ra để quản lý nhiệm vụ</p>
          <p className={styles.note}>(Chỉ hiển thị các chương trình đang diễn ra)</p>
        </div>
        <div className={styles.errorState}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>📋 Quản lý Nhiệm vụ</h1>
        <p className={styles.subtitle}>Chọn chương trình đang diễn ra để quản lý nhiệm vụ</p>
        <p className={styles.note}>(Chỉ hiển thị các chương trình đang diễn ra)</p>
      </div>

      {programs.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Không có chương trình đang diễn ra nào được gán cho bạn</p>
          <p>Vui lòng kiểm tra lại hoặc liên hệ quản trị viên nếu cần hỗ trợ.</p>
        </div>
      ) : (
        <div className={styles.gridContainer}>
          {programs.map((program) => (
            <div
              key={program.programId}
              className={styles.programCard}
              onClick={() => onSelectProgram(program.programId)}
            >
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{program.name}</h2>
                {getStatusBadge(program.programStatus)}
              </div>

              <div className={styles.cardMeta}>
                <span className={styles.department}>{program.department}</span>
                {program.maxInterns && (
                  <span className={styles.maxInterns}>
                    {program.maxInterns} thực tập sinh
                  </span>
                )}
              </div>
              <div className={styles.dateInfo}>
                <div className={styles.dateItem}>
                  <span className={styles.dateLabel}>Bắt đầu:</span>
                  <span className={styles.dateValue}>{formatDate(program.startDate)}</span>
                </div>
                <div className={styles.dateItem}>
                  <span className={styles.dateLabel}>Kết thúc:</span>
                  <span className={styles.dateValue}>{formatDate(program.endDate)}</span>
                </div>
              </div>
              <button className={styles.selectButton}>Quản lý Nhiệm vụ →</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
