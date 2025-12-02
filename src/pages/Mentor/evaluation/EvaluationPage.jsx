import { useState } from "react"
import styles from "./EvaluationPage.module.css"

const TEAM_INFO = [
  {
    team_id: 101,
    interns: [
      {
        intern_id: 1001,
        intern_name: "Trần Minh Đức",
        email: "duc.tran@email.com",
        phone: "0123456781",
        evaluations: [
          {
            evaluation_id: 1,
            title: "Đánh giá cuối kỳ",
            technical: 8.5,
            communication: 4.5,
            discipline: 6.5,
            attitude: 8,
            weight: 80,
            note: "Tiến độ tốt trong phát triển API",
            created_at: "2024-07-15"
          },
      {
                  evaluation_id: 3,
                  title: "Đánh giá giữa kỳ",
                  technical: 2.5,
                  communication: 1.5,
                  discipline: 1.5,
                  attitude: 1,
                  weight: 20,
                  note: "Tiến độ tốt trong phát triển API",
                  created_at: "2024-07-15"
                }
        ]
      },
      {
        intern_id: 1002,
        intern_name: "Phạm Linh Nhi",
        email: "nhi.pham@email.com",
        phone: "0123456782",
        evaluations: [
          {
            evaluation_id: 2,
            title: "Đánh giá giữa kỳ",
            technical: 7,
            communication: 8,
            discipline: 0,
            attitude: 7.5,
            weight: 75,
            note: "Kỹ năng giao tiếp tốt",
            created_at: "2024-07-16"
          }
        ]
      },
      {
        intern_id: 1003,
        intern_name: "Vũ Hoàng Minh",
        email: "minh.vu@email.com",
        phone: "0123456783",
        evaluations: []
      }
    ]
  },
  {
    team_id: 102,
    name: "Nhóm Frontend B",
    interns: [
      // ... các thực tập sinh khác
    ]
  }
]

export default function EvaluationPage({ teamId, onBack }) {
  const teamData = TEAM_INFO.find(team => team.team_id === teamId)
  const [selectedIntern, setSelectedIntern] = useState(teamData?.interns[0] || null)
  const [showAddEval, setShowAddEval] = useState(false)
  const [newEval, setNewEval] = useState({
    title: "",
    technical: 5,
    communication: 5,
    discipline: 5,
    attitude: 5,
    weight: 50,
    note: "",
  })

  if (!teamData) return <div>Không tìm thấy nhóm</div>

const selectedInternEvals = selectedIntern?.evaluations || []
const evaluatedInternIds = new Set(teamData.interns.filter(i => i.evaluations.length > 0).map(i => i.intern_id))
const notEvaluatedInterns = teamData.interns.filter((intern) => !evaluatedInternIds.has(intern.intern_id))
const evaluatedInterns = teamData.interns.filter((intern) => evaluatedInternIds.has(intern.intern_id))

  const calculateAverages = () => {
    if (selectedInternEvals.length === 0) return null

    const avg = {
      technical: selectedInternEvals.reduce((sum, e) => sum + e.technical * (e.weight / 100), 0),
      communication: selectedInternEvals.reduce((sum, e) => sum + e.communication * (e.weight / 100), 0),
      discipline: selectedInternEvals.reduce((sum, e) => sum + e.discipline * (e.weight / 100), 0),
      attitude: selectedInternEvals.reduce((sum, e) => sum + e.attitude * (e.weight / 100), 0),
      totalScore: selectedInternEvals.reduce(
        (sum, e) => sum + ((e.technical + e.communication + e.discipline + e.attitude) / 4) * (e.weight / 100),
        0
      ),
    }

    return avg
  }

  const handleAddEvaluation = () => {
    if (!selectedIntern) return
    console.log("Thêm đánh giá:", newEval, "cho thực tập sinh:", selectedIntern.intern_id)
    setShowAddEval(false)
    setNewEval({
      title: "",
      technical: 5,
      communication: 5,
      discipline: 5,
      attitude: 5,
      weight: 50,
      note: "",
    })
  }

  const averages = calculateAverages()

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={onBack}>
        ← Quay lại danh sách nhóm
      </button>

      <div className={styles.header}>
        <div className={styles.teamInfo}>
          <h1 className={styles.teamName}>Nhóm {teamData.team_id}</h1>
          <p className={styles.teamDetails}>
          </p>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.leftPanel}>
          <h2 className={styles.panelTitle}>Thành viên nhóm</h2>

          <div className={styles.memberSection}>
            <h3 className={styles.sectionTitle}>Chưa được đánh giá ({notEvaluatedInterns.length})</h3>
            <div className={styles.memberList}>
              {notEvaluatedInterns.map((intern) => (
                <button
                  key={intern.intern_id}
                  className={`${styles.memberItem} ${selectedIntern?.intern_id === intern.intern_id ? styles.active : ""}`}
                  onClick={() => setSelectedIntern(intern)}
                >
                  <div className={styles.memberName}>{intern.intern_name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.memberSection}>
            <h3 className={styles.sectionTitle}>Đã đánh giá ({evaluatedInterns.length})</h3>
            <div className={styles.memberList}>
              {evaluatedInterns.map((intern) => (
                <button
                  key={intern.intern_id}
                  className={`${styles.memberItem} ${styles.evaluated} ${selectedIntern?.intern_id === intern.intern_id ? styles.active : ""}`}
                  onClick={() => setSelectedIntern(intern)}
                >
                  <div className={styles.memberName}>{intern.intern_name}</div>
                  <div className={styles.checkmark}>✓</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.rightPanel}>
          {selectedIntern && (
            <>
              <div className={styles.internInfo}>
                <h2 className={styles.internName}>{selectedIntern.intern_name}</h2>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email:</span>
                    <span className={styles.infoValue}>{selectedIntern.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>SĐT:</span>
                    <span className={styles.infoValue}>{selectedIntern.phone}</span>
                  </div>
                </div>
              </div>

              <div className={styles.evaluationSection}>
                <div className={styles.evalHeader}>
                  <h3 className={styles.evalTitle}>Đánh giá ({selectedInternEvals.length})</h3>
                  <button className={styles.addButton} onClick={() => setShowAddEval(!showAddEval)}>
                    {showAddEval ? "✕ Hủy" : "+ Thêm đánh giá"}
                  </button>
                </div>

                {showAddEval && (
                  <div className={styles.addEvalForm}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Tiêu đề</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={newEval.title}
                        onChange={(e) => setNewEval({ ...newEval, title: e.target.value })}
                        placeholder="Ví dụ: Đánh giá giữa kỳ"
                      />
                    </div>

                    <div className={styles.criteriaRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Kỹ thuật (0-10)</label>
                         <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            className={styles.formInput}
                            value={newEval.technical}
                            onChange={(e) =>
                              setNewEval({ ...newEval, technical: Number(e.target.value) || 0 })
                            }
                          />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Giao tiếp (0-10)</label>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            className={styles.formInput}
                            value={newEval.communication}
                            onChange={(e) =>
                              setNewEval({ ...newEval, communication: Number(e.target.value) || 0 })
                            }
                          />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Kỷ luật (0-10)</label>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            className={styles.formInput}
                            value={newEval.discipline}
                            onChange={(e) =>
                              setNewEval({ ...newEval, discipline: Number(e.target.value) || 0 })
                            }
                          />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Thái độ (0-10)</label>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            className={styles.formInput}
                            value={newEval.attitude}
                            onChange={(e) =>
                              setNewEval({ ...newEval, attitude: Number(e.target.value) || 0 })
                            }
                          />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Hệ số (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className={styles.formInput}
                        value={newEval.weight}
                        onChange={(e) => setNewEval({ ...newEval, weight: Number.parseInt(e.target.value) })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Ghi chú</label>
                      <textarea
                        className={styles.formTextarea}
                        rows={3}
                        value={newEval.note}
                        onChange={(e) => setNewEval({ ...newEval, note: e.target.value })}
                        placeholder="Nhận xét thêm..."
                      />
                    </div>

                    <button className={styles.submitButton} onClick={handleAddEvaluation}>
                      Lưu đánh giá
                    </button>
                  </div>
                )}

                {selectedInternEvals.map((evaluation) => (
                  <div key={evaluation.evaluation_id} className={styles.evalCard}>
                    <div className={styles.evalCardHeader}>
                      <h4 className={styles.evalTitle}>{evaluation.title}</h4>
                      <span className={styles.evalDate}>{evaluation.created_at}</span>
                    </div>
                    <div className={styles.evalCriteria}>
                      {[
                        { label: "Kỹ thuật", value: evaluation.technical },
                        { label: "Giao tiếp", value: evaluation.communication },
                        { label: "Kỷ luật", value: evaluation.discipline },
                        { label: "Thái độ", value: evaluation.attitude },
                      ].map((item) => {
                        let color = "#4caf50"; // mặc định xanh lá
                        if (item.value <= 5) color = "#f44336";
                        else if (item.value <= 7) color = "#ffeb3b";

                        return (
                          <div key={item.label} className={styles.criteriaItem}>
                            <span>{item.label}:</span>
                            <div className={styles.barContainer}>
                              <div
                                className={styles.barFill}
                                style={{
                                  width: `${(item.value / 10) * 100}%`,
                                  backgroundColor: color,
                                }}
                              />
                            </div>
                            <strong>{item.value}/10</strong>
                          </div>
                        )
                      })}
                      <div className={styles.criteriaItem}>
                        <span>Hệ số:</span>
                        <strong>{evaluation.weight}%</strong>
                      </div>
                    </div>
                    {evaluation.note && <p className={styles.evalNote}>{evaluation.note}</p>}
                  </div>
                ))}

                   {averages && (
                     <div className={styles.averageSection}>
                       <h4 className={styles.averageTitle}>Điểm trung bình</h4>
                       <div className={styles.averageGrid}>
                         {[
                           { label: "Kỹ thuật", value: averages.technical },
                           { label: "Giao tiếp", value: averages.communication },
                           { label: "Kỷ luật", value: averages.discipline },
                           { label: "Thái độ", value: averages.attitude },
                         ].map((item) => {
                           let color = "#4caf50";
                           if (item.value <= 5) color = "#f44336";
                           else if (item.value <= 7) color = "#ffeb3b";

                           return (
                             <div key={item.label} className={styles.averageItem}>
                               <span>{item.label}:</span>
                               <div className={styles.barContainer}>
                                 <div
                                   className={styles.barFill}
                                   style={{
                                     width: `${Math.min((item.value / 10) * 100, 100)}%`,
                                     backgroundColor: color,
                                   }}
                                 />
                               </div>
                               <strong>{item.value.toFixed(1)}/10</strong>
                             </div>
                           )
                         })}
                         <div className={styles.averageItem}>
                           <span>Điểm tổng:</span>
                           <strong>{averages.totalScore.toFixed(1)}/10</strong>
                         </div>
                       </div>
                     </div>
                   )}

                {selectedInternEvals.length === 0 && (
                  <div className={styles.noEvals}>
                    <p>Chưa có đánh giá. Nhấn "Thêm đánh giá" để tạo.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
