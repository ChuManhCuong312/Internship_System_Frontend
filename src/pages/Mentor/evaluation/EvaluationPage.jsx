import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../../context/AuthContext"
import styles from "./EvaluationPage.module.css"
import Modal from "./Modal"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function EvaluationPage({ teamId, onBack }) {
  const { token, user } = useContext(AuthContext)

  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedIntern, setSelectedIntern] = useState(null)
  const [editEval, setEditEval] = useState(null)
  const [openAddModal, setOpenAddModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [mentor, setMentor] = useState(null)

  const [newEval, setNewEval] = useState({
    title: "",
    technical: 5,
    communication: 5,
    discipline: 5,
    attitude: 5,
    weight: 50,
    note: "",
  })

  // =============================
  // 🔥 CALL API LẤY DATA TEAM
  // =============================
  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/mentors/user/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Không lấy được mentor");
        const data = await res.json();
        setMentor(data);
      } catch (err) {
        toast.error(err.message);
      }
    }
    fetchMentor();
  }, [user.userId, token]);
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/evaluations/team/${teamId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) throw new Error("Không thể tải dữ liệu nhóm")

        const data = await res.json()

        // API trả về dạng mảng [ { team_id, interns: [...] } ]
        const team = Array.isArray(data) ? data[0] : data

        setTeamData(team)
        setSelectedIntern(team.interns[0] || null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTeam()
  }, [teamId, token])

  if (loading) return <p>Đang tải dữ liệu...</p>
  if (error) return <p style={{ color: "red" }}>{error}</p>
  if (!teamData) return <p>Không tìm thấy dữ liệu nhóm</p>

  // =============================
  // ⭐ chuẩn bị danh sách evaluated / not evaluated
  // =============================
  const selectedInternEvals = selectedIntern?.evaluations || []

  const evaluatedInternIds = new Set(
    teamData.interns.filter(i => i.evaluations.length > 0).map(i => i.intern_id)
  )

  const notEvaluatedInterns = teamData.interns.filter(
    intern => !evaluatedInternIds.has(intern.intern_id)
  )

  const evaluatedInterns = teamData.interns.filter(
    intern => evaluatedInternIds.has(intern.intern_id)
  )

  // =============================
  // ⭐ tính trung bình
  // =============================
  const calculateAverages = () => {
    if (selectedInternEvals.length === 0) return null

    const avg = {
      technical: selectedInternEvals.reduce((s, e) => s + e.technical * (e.weight / 100), 0),
      communication: selectedInternEvals.reduce((s, e) => s + e.communication * (e.weight / 100), 0),
      discipline: selectedInternEvals.reduce((s, e) => s + e.discipline * (e.weight / 100), 0),
      attitude: selectedInternEvals.reduce((s, e) => s + e.attitude * (e.weight / 100), 0),
      totalScore: selectedInternEvals.reduce(
        (sum, e) => sum + ((e.technical + e.communication + e.discipline + e.attitude) / 4) * (e.weight / 100),
        0
      ),
    }

    return avg
  }

  const handleAddEvaluation = async () => {
    if (!selectedIntern || !mentor) return;

    try {
      const res = await fetch("http://localhost:8080/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          internId: selectedIntern.intern_id,  // gửi đúng tên trường
          mentorId: mentor.mentorId,           // gửi mentorId
          title: newEval.title,
          technical: newEval.technical,
          communication: newEval.communication,
          discipline: newEval.discipline,
          attitude: newEval.attitude,
          weight: newEval.weight,
          note: newEval.note
        })
      })

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Thêm đánh giá thất bại");
      }

      toast.success("Thêm đánh giá thành công!");

      // refresh team data
      const refresh = await fetch(`http://localhost:8080/api/evaluations/team/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await refresh.json();
      const team = Array.isArray(data) ? data[0] : data;
      setTeamData(team);
      setSelectedIntern(team.interns.find(i => i.intern_id === selectedIntern.intern_id));
      setOpenAddModal(false);
      setNewEval({ title: "", technical: 5, communication: 5, discipline: 5, attitude: 5, weight: 50, note: "" });

    } catch (err) {
      toast.error(err.message);
    }
  }

  const averages = calculateAverages()

  const handleDeleteEvaluation = async (evaluationId) => {

    try {
      const res = await fetch(`http://localhost:8080/api/evaluations/${evaluationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error("Xóa thất bại")

      // refresh data
      const refresh = await fetch(`http://localhost:8080/api/evaluations/team/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await refresh.json()
      const team = Array.isArray(data) ? data[0] : data

      setTeamData(team)
      const intern = team.interns.find(i => i.intern_id === selectedIntern.intern_id)
      setSelectedIntern(intern)

      toast.success("Xóa đánh giá thành công!");
    } catch (err) {
      toast.error(err.message);
    }
  }
  const handleUpdateEvaluation = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/evaluations/${editEval.evaluation_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editEval,
          mentorId: mentor.mentorId,
          internId: selectedIntern.intern_id
        })
      })

      if (!res.ok) throw new Error("Cập nhật thất bại")

      const refresh = await fetch(`http://localhost:8080/api/evaluations/team/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await refresh.json()
      const team = Array.isArray(data) ? data[0] : data

      setTeamData(team)
      const intern = team.interns.find(i => i.intern_id === selectedIntern.intern_id)
      setSelectedIntern(intern)

      setOpenEditModal(false)
      toast.success("Chỉnh sửa đánh giá thành công!");
    } catch (err) {
      toast.error(err.message);
    }
  }
  const openEditForm = (evaluation) => {
    setEditEval({ ...evaluation })
    setOpenEditModal(true)
  }
  return (
    <div className={styles.container}>
      <div className={styles.container}>
            <button className={styles.backButton} onClick={onBack}>← Quay lại danh sách nhóm</button>

            <div className={styles.header}>
              <div className={styles.teamInfo}>
                <h1 className={styles.teamName}>Nhóm {teamData.team_id}</h1>
              </div>
            </div>

            <div className={styles.mainContent}>
              {/* PANEL TRÁI */}
              <div className={styles.leftPanel}>
                <h2 className={styles.panelTitle}>Thành viên nhóm</h2>

                <div className={styles.memberSection}>
                  <h3 className={styles.sectionTitle}>Chưa được đánh giá ({notEvaluatedInterns.length})</h3>
                  <div className={styles.memberList}>
                    {notEvaluatedInterns.map(intern => (
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
                    {evaluatedInterns.map(intern => (
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

              {/* PANEL PHẢI */}
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
                        <button className={styles.addButton} onClick={() => setOpenAddModal(true)}>
                          + Thêm đánh giá
                        </button>
                      </div>

                      {openAddModal && (
                        <Modal title="Thêm đánh giá" onClose={() => setOpenAddModal(false)}>
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
                        </Modal>
                      )}

                      {openEditModal && editEval && (
                        <Modal title="Chỉnh sửa đánh giá" onClose={() => setOpenEditModal(false)}>
                          <div className={styles.addEvalForm}>
                            <h3>Chỉnh sửa đánh giá</h3>

                            <div className={styles.formGroup}>
                             <label className={styles.formLabel}>Tiêu đề</label>
                             <input
                               type="text"
                               className={styles.formInput}
                               value={editEval.title}
                               onChange={(e) => setEditEval({ ...editEval, title: e.target.value })}
                             />
                            </div>


                            <div className={styles.criteriaRow}>
                             {["technical","communication","discipline","attitude"].map(field => (
                               <div key={field} className={styles.formGroup}>
                                 <label className={styles.formLabel}>{field}</label>
                                 <input
                                   type="number"
                                   min="0"
                                   max="10"
                                   step="0.1"
                                   className={styles.formInput}
                                   value={editEval[field]}
                                   onChange={(e) =>
                                     setEditEval({ ...editEval, [field]: Number(e.target.value) })
                                   }
                                 />
                               </div>
                             ))}
                            </div>

                            <div className={styles.formGroup}>
                             <label className={styles.formLabel}>Hệ số</label>
                             <input
                               type="number"
                               min="0"
                               max="100"
                               className={styles.formInput}
                               value={editEval.weight}
                               onChange={(e) => setEditEval({ ...editEval, weight: Number(e.target.value) })}
                             />
                            </div>


                            <div className={styles.formGroup}>
                             <label className={styles.formLabel}>Ghi chú</label>
                             <textarea
                               className={styles.formTextarea}
                               rows={3}
                               value={editEval.note}
                               onChange={(e) => setEditEval({ ...editEval, note: e.target.value })}
                             />
                            </div>
                            <button className={styles.submitButton} onClick={handleUpdateEvaluation}>
                              Lưu chỉnh sửa
                            </button>
                          </div>
                        </Modal>
                      )}

                      {selectedInternEvals.map((evaluation) => (
                        <div key={evaluation.evaluation_id} className={styles.evalCard}>
                          <div className={styles.evalCardHeader}>
                            <h4 className={styles.evalTitle}>{evaluation.title} ({evaluation.created_at})</h4>
                            <div className={styles.evalActions}>
                              <button
                                className={styles.editButton}
                                onClick={() => openEditForm(evaluation)}
                              >
                                ✏️ Sửa
                              </button>
                              <button
                                className={styles.deleteButton}
                                onClick={() => setDeleteTarget(evaluation)}
                              >
                                🗑️ Xóa
                              </button>
                            </div>
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
                      {deleteTarget && (
                        <Modal title="Xác nhận xóa" onClose={() => setDeleteTarget(null)}>
                          <p>Bạn có chắc muốn xóa đánh giá:</p>

                          <strong>{deleteTarget.title}</strong>
                          <p>Ngày tạo: {deleteTarget.created_at}</p>

                          <button
                            className={styles.deleteButton}
                            onClick={() => {
                              handleDeleteEvaluation(deleteTarget.evaluation_id)
                              setDeleteTarget(null)
                            }}
                          >
                            Xóa ngay
                          </button>
                        </Modal>
                      )}

                         {averages && (
                           <div className={styles.averageSection}>
                             <h4 className={styles.averageTitle}>Điểm tổng kết</h4>
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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}
