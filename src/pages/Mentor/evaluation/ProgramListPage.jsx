
import React from "react";
import styles from "./ProgramListPage.module.css";

const PROGRAMS_DATA = [
  {
    program_id: 1,
    program_name: "Summer Internship 2024",
    description: "Backend and Frontend development program",
    start_date: "2024-06-01",
    end_date: "2024-08-31",
    total_interns: 45,
  },
  {
    program_id: 2,
    program_name: "Fall Internship 2024",
    description: "Full-stack development and DevOps",
    start_date: "2024-09-01",
    end_date: "2024-11-30",
    total_interns: 52,
  },
  {
    program_id: 3,
    program_name: "Spring Internship 2025",
    description: "Mobile development and Cloud services",
    start_date: "2025-03-01",
    end_date: "2025-05-31",
    total_interns: 38,
  },
];

export default function ProgramListPage({ onSelectProgram }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mentor Evaluation System</h1>
        <p className={styles.subtitle}>Select a program to view and evaluate interns</p>
      </div>

      <div className={styles.gridContainer}>
        {PROGRAMS_DATA.map((program) => (
          <div
            key={program.program_id}
            className={styles.programCard}
            onClick={() => onSelectProgram(program.program_id)}
          >
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{program.program_name}</h2>
              <span className={styles.internCount}>{program.total_interns} interns</span>
            </div>
            <p className={styles.cardDescription}>{program.description}</p>
            <div className={styles.dateInfo}>
              <div className={styles.dateItem}>
                <span className={styles.dateLabel}>Start:</span>
                <span className={styles.dateValue}>{program.start_date}</span>
              </div>
              <div className={styles.dateItem}>
                <span className={styles.dateLabel}>End:</span>
                <span className={styles.dateValue}>{program.end_date}</span>
              </div>
            </div>
            <button className={styles.selectButton}>View Program →</button>
          </div>
        ))}
      </div>
    </div>
  );
}
