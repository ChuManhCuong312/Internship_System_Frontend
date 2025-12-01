import { useState } from "react"
import styles from "./EvaluationPage.module.css"

const TEAM_INFO = {
  101: {
      name: "Backend Team A",
      lead: "Nguyen Van A",
      description: "Node.js and Express development",
      interns: [
        {
          intern_id: 1001,
          intern_name: "Tran Minh Duc",
          email: "duc.tran@email.com",
          position: "Backend Developer",
          start_date: "2024-06-01",
        },
        {
          intern_id: 1002,
          intern_name: "Pham Linh Nhi",
          email: "nhi.pham@email.com",
          position: "Backend Developer",
          start_date: "2024-06-01",
        },
        {
          intern_id: 1003,
          intern_name: "Vu Hoang Minh",
          email: "minh.vu@email.com",
          position: "Backend Developer",
          start_date: "2024-06-01",
        },
        {
          intern_id: 1004,
          intern_name: "Le Thanh Tung",
          email: "tung.le@email.com",
          position: "Backend Developer",
          start_date: "2024-06-01",
        },
        {
          intern_id: 1005,
          intern_name: "Hoang Anh Tuan",
          email: "tuan.hoang@email.com",
          position: "Backend Developer",
          start_date: "2024-06-01",
        },
      ],
      evaluations: [
        {
          evaluation_id: 1,
          intern_id: 1001,
          title: "Mid-term Evaluation",
          technical: 8,
          communication: 7,
          discipline: 8,
          attitude: 9,
          multiply: 80,
          note: "Good progress on API development",
          created_at: "2024-07-15",
        },
        {
          evaluation_id: 2,
          intern_id: 1002,
          title: "Mid-term Evaluation",
          technical: 7,
          communication: 8,
          discipline: 7,
          attitude: 8,
          multiply: 75,
          note: "Strong communication skills",
          created_at: "2024-07-16",
        },
      ],
    },
    102: {
      name: "Frontend Team B",
      lead: "Tran Thi B",
      description: "React and Next.js development",
      interns: [
        {
          intern_id: 2001,
          intern_name: "Nguyen Anh Khoa",
          email: "khoa.nguyen@email.com",
          position: "Frontend Developer",
          start_date: "2024-06-01",
        },
        {
          intern_id: 2002,
          intern_name: "Do Minh Tuan",
          email: "tuan.do@email.com",
          position: "Frontend Developer",
          start_date: "2024-06-01",
        },
        {
          intern_id: 2003,
          intern_name: "Ngo Linh Chi",
          email: "chi.ngo@email.com",
          position: "Frontend Developer",
          start_date: "2024-06-01",
        },
      ],
      evaluations: [
        {
          evaluation_id: 3,
          intern_id: 2001,
          title: "Initial Evaluation",
          technical: 9,
          communication: 9,
          discipline: 9,
          attitude: 9,
          multiply: 90,
          note: "Excellent work on UI components",
          created_at: "2024-07-20",
        },
      ],
    },
    103: {
      name: "Full-stack Team C",
      lead: "Le Van C",
      description: "Full-stack MERN development",
      interns: [
        {
          intern_id: 3001,
          intern_name: "Vu Thanh Long",
          email: "long.vu@email.com",
          position: "Full-stack Developer",
          start_date: "2024-06-01",
        },
        {
          intern_id: 3002,
          intern_name: "Cao Hoang Anh",
          email: "anh.cao@email.com",
          position: "Full-stack Developer",
          start_date: "2024-06-01",
        },
      ],
      evaluations: [],
    },
}

export default function EvaluationPage({ teamId, onBack }) {
  const teamData = TEAM_INFO[teamId]
  const [selectedIntern, setSelectedIntern] = useState(teamData?.interns[0] || null)
  const [showAddEval, setShowAddEval] = useState(false)
  const [newEval, setNewEval] = useState({
    title: "",
    technical: 5,
    communication: 5,
    discipline: 5,
    attitude: 5,
    multiply: 50,
    note: "",
  })

  if (!teamData) return <div>Team not found</div>

  const selectedInternEvals = teamData.evaluations.filter((e) => e.intern_id === selectedIntern?.intern_id)
  const evaluatedInternIds = new Set(teamData.evaluations.map((e) => e.intern_id))
  const notEvaluatedInterns = teamData.interns.filter((intern) => !evaluatedInternIds.has(intern.intern_id))
  const evaluatedInterns = teamData.interns.filter((intern) => evaluatedInternIds.has(intern.intern_id))

  const calculateAverages = () => {
    if (selectedInternEvals.length === 0) return null
    const avg = {
      technical: selectedInternEvals.reduce((sum, e) => sum + e.technical, 0) / selectedInternEvals.length,
      communication: selectedInternEvals.reduce((sum, e) => sum + e.communication, 0) / selectedInternEvals.length,
      discipline: selectedInternEvals.reduce((sum, e) => sum + e.discipline, 0) / selectedInternEvals.length,
      attitude: selectedInternEvals.reduce((sum, e) => sum + e.attitude, 0) / selectedInternEvals.length,
      multiply: selectedInternEvals.reduce((sum, e) => sum + e.multiply, 0) / selectedInternEvals.length,
    }
    return avg
  }

  const handleAddEvaluation = () => {
    if (!selectedIntern) return
    console.log("Add evaluation:", newEval, "for intern:", selectedIntern.intern_id)
    setShowAddEval(false)
    setNewEval({
      title: "",
      technical: 5,
      communication: 5,
      discipline: 5,
      attitude: 5,
      multiply: 50,
      note: "",
    })
  }

  const averages = calculateAverages()

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={onBack}>
        ← Back to Teams
      </button>

      <div className={styles.header}>
        <div className={styles.teamInfo}>
          <h1 className={styles.teamName}>{teamData.name}</h1>
          <p className={styles.teamDetails}>
            Lead: <strong>{teamData.lead}</strong> | {teamData.description}
          </p>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.leftPanel}>
          <h2 className={styles.panelTitle}>Team Members</h2>

          <div className={styles.memberSection}>
            <h3 className={styles.sectionTitle}>Not Evaluated ({notEvaluatedInterns.length})</h3>
            <div className={styles.memberList}>
              {notEvaluatedInterns.map((intern) => (
                <button
                  key={intern.intern_id}
                  className={`${styles.memberItem} ${
                    selectedIntern?.intern_id === intern.intern_id ? styles.active : ""
                  }`}
                  onClick={() => setSelectedIntern(intern)}
                >
                  <div className={styles.memberName}>{intern.intern_name}</div>
                  <div className={styles.memberPosition}>{intern.position}</div>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.memberSection}>
            <h3 className={styles.sectionTitle}>Evaluated ({evaluatedInterns.length})</h3>
            <div className={styles.memberList}>
              {evaluatedInterns.map((intern) => (
                <button
                  key={intern.intern_id}
                  className={`${styles.memberItem} ${styles.evaluated} ${
                    selectedIntern?.intern_id === intern.intern_id ? styles.active : ""
                  }`}
                  onClick={() => setSelectedIntern(intern)}
                >
                  <div className={styles.memberName}>{intern.intern_name}</div>
                  <div className={styles.memberPosition}>{intern.position}</div>
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
                    <span className={styles.infoLabel}>Position:</span>
                    <span className={styles.infoValue}>{selectedIntern.position}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email:</span>
                    <span className={styles.infoValue}>{selectedIntern.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Start Date:</span>
                    <span className={styles.infoValue}>{selectedIntern.start_date}</span>
                  </div>
                </div>
              </div>

              <div className={styles.evaluationSection}>
                <div className={styles.evalHeader}>
                  <h3 className={styles.evalTitle}>Evaluations ({selectedInternEvals.length})</h3>
                  <button className={styles.addButton} onClick={() => setShowAddEval(!showAddEval)}>
                    {showAddEval ? "✕ Cancel" : "+ Add Evaluation"}
                  </button>
                </div>

                {showAddEval && (
                  <div className={styles.addEvalForm}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Title</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={newEval.title}
                        onChange={(e) => setNewEval({ ...newEval, title: e.target.value })}
                        placeholder="e.g., Mid-term Evaluation"
                      />
                    </div>

                    <div className={styles.criteriaRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Technical (0-10)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          className={styles.formInput}
                          value={newEval.technical}
                          onChange={(e) => setNewEval({ ...newEval, technical: Number.parseInt(e.target.value) })}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Communication (0-10)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          className={styles.formInput}
                          value={newEval.communication}
                          onChange={(e) => setNewEval({ ...newEval, communication: Number.parseInt(e.target.value) })}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Discipline (0-10)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          className={styles.formInput}
                          value={newEval.discipline}
                          onChange={(e) => setNewEval({ ...newEval, discipline: Number.parseInt(e.target.value) })}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Attitude (0-10)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          className={styles.formInput}
                          value={newEval.attitude}
                          onChange={(e) => setNewEval({ ...newEval, attitude: Number.parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Coefficient (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className={styles.formInput}
                        value={newEval.multiply}
                        onChange={(e) => setNewEval({ ...newEval, multiply: Number.parseInt(e.target.value) })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Note</label>
                      <textarea
                        className={styles.formTextarea}
                        rows={3}
                        value={newEval.note}
                        onChange={(e) => setNewEval({ ...newEval, note: e.target.value })}
                        placeholder="Additional comments..."
                      />
                    </div>

                    <button className={styles.submitButton} onClick={handleAddEvaluation}>
                      Save Evaluation
                    </button>
                  </div>
                )}

                {selectedInternEvals.length > 0 && (
                  <>
                    <div className={styles.evalsList}>
                      {selectedInternEvals.map((evaluation) => (
                        <div key={evaluation.evaluation_id} className={styles.evalCard}>
                          <div className={styles.evalCardHeader}>
                            <h4 className={styles.evalTitle}>{evaluation.title}</h4>
                            <span className={styles.evalDate}>{evaluation.created_at}</span>
                          </div>
                          <div className={styles.evalCriteria}>
                            <div className={styles.criteriaItem}>
                              <span>Technical:</span>
                              <strong>{evaluation.technical}/10</strong>
                            </div>
                            <div className={styles.criteriaItem}>
                              <span>Communication:</span>
                              <strong>{evaluation.communication}/10</strong>
                            </div>
                            <div className={styles.criteriaItem}>
                              <span>Discipline:</span>
                              <strong>{evaluation.discipline}/10</strong>
                            </div>
                            <div className={styles.criteriaItem}>
                              <span>Attitude:</span>
                              <strong>{evaluation.attitude}/10</strong>
                            </div>
                            <div className={styles.criteriaItem}>
                              <span>Coefficient:</span>
                              <strong>{evaluation.multiply}%</strong>
                            </div>
                          </div>
                          {evaluation.note && <p className={styles.evalNote}>{evaluation.note}</p>}
                        </div>
                      ))}
                    </div>

                    {averages && (
                      <div className={styles.averageSection}>
                        <h4 className={styles.averageTitle}>Average Scores</h4>
                        <div className={styles.averageGrid}>
                          <div className={styles.averageItem}>
                            <span>Technical:</span>
                            <strong>{averages.technical.toFixed(1)}/10</strong>
                          </div>
                          <div className={styles.averageItem}>
                            <span>Communication:</span>
                            <strong>{averages.communication.toFixed(1)}/10</strong>
                          </div>
                          <div className={styles.averageItem}>
                            <span>Discipline:</span>
                            <strong>{averages.discipline.toFixed(1)}/10</strong>
                          </div>
                          <div className={styles.averageItem}>
                            <span>Attitude:</span>
                            <strong>{averages.attitude.toFixed(1)}/10</strong>
                          </div>
                          <div className={styles.totalScore}>
                            <span>Overall Score:</span>
                            <strong>{averages.multiply.toFixed(1)}%</strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {selectedInternEvals.length === 0 && (
                  <div className={styles.noEvals}>
                    <p>No evaluations yet. Click "Add Evaluation" to create one.</p>
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