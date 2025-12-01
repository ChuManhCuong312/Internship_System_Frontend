import React from "react";
import styles from "./ProgramListPage.module.css";

const PROGRAMS_DATA = [
  {
    program_id: 1,
    program_name: "Thực tập mùa hè 2024",
    description: "Chương trình thực tập Backend và Frontend",
    start_date: "2024-06-01",
    end_date: "2024-08-31",
  },
  {
    program_id: 2,
    program_name: "Thực tập mùa thu 2024",
    description: "Thực tập Full-stack và DevOps",
    start_date: "2024-09-01",
    end_date: "2024-11-30",
  },
  {
    program_id: 3,
    program_name: "Thực tập mùa xuân 2025",
    description: "Phát triển Mobile và dịch vụ Cloud",
    start_date: "2025-03-01",
    end_date: "2025-05-31",
  },
];

export default function ProgramListPage({ onSelectProgram }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Hệ thống đánh giá thực tập sinh</h1>
        <p className={styles.subtitle}>
          Chọn 1 chương trình đang diễn ra để xem và đánh giá thực tập sinh
        </p>
      </div>

      {/* Kiểm tra danh sách chương trình */}
      {PROGRAMS_DATA.length === 0 ? (
        <div className={styles.noData}>Không có chương trình nào đang diễn ra</div>
      ) : (
        <div className={styles.gridContainer}>
          {PROGRAMS_DATA.map((program) => (
            <div
              key={program.program_id}
              className={styles.programCard}
              onClick={() => onSelectProgram(program.program_id)}
            >
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{program.program_name}</h2>
              </div>

              <p className={styles.cardDescription}>{program.description}</p>

              <div className={styles.dateInfo}>
                <div className={styles.dateItem}>
                  <span className={styles.dateLabel}>Bắt đầu:</span>
                  <span className={styles.dateValue}>{program.start_date}</span>
                </div>
                <div className={styles.dateItem}>
                  <span className={styles.dateLabel}>Kết thúc:</span>
                  <span className={styles.dateValue}>{program.end_date}</span>
                </div>
              </div>

              <button className={styles.selectButton}>Xem chương trình →</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
