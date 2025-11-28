import React, { useState } from "react";
import MentorSidebar from "../../components/Layout/MentorSidebar";
import "../../styles/dashBoard.css";

const MentorEvaluations = () => {
  const [evaluations, setEvaluations] = useState([
    {
      id: 1,
      internName: "Nguyễn Văn A",
      period: "Tháng 11/2024",
      status: "Draft",
      technicalSkills: 8,
      softSkills: 7,
      attitude: 9,
      overallScore: 8.0,
      notes: "Tiến độ tốt, cần cải thiện kỹ năng giao tiếp"
    },
    {
      id: 2,
      internName: "Trần Thị B",
      period: "Tháng 11/2024", 
      status: "Completed",
      technicalSkills: 7,
      softSkills: 8,
      attitude: 8,
      overallScore: 7.7,
      notes: "Sáng tạo, thái độ tốt cần cải thiện kỹ năng chuyên môn"
    },
    {
      id: 3,
      internName: "Lê Văn C",
      period: "Tháng 11/2024",
      status: "Draft",
      technicalSkills: 6,
      softSkills: 8,
      attitude: 7,
      overallScore: 7.0,
      notes: "Thiết kế tốt, cần học hỏi thêm về UX principles"
    }
  ]);

  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [currentEvaluation, setCurrentEvaluation] = useState({
    technicalSkills: 5,
    softSkills: 5,
    attitude: 5,
    notes: ""
  });

  const handleEvaluate = (intern) => {
    setSelectedIntern(intern);
    const existing = evaluations.find(e => e.id === intern.id);
    if (existing) {
      setCurrentEvaluation({
        technicalSkills: existing.technicalSkills,
        softSkills: existing.softSkills,
        attitude: existing.attitude,
        notes: existing.notes
      });
    } else {
      setCurrentEvaluation({
        technicalSkills: 5,
        softSkills: 5,
        attitude: 5,
        notes: ""
      });
    }
    setShowEvaluationForm(true);
  };

  const handleSubmitEvaluation = () => {
    const overallScore = (
      (currentEvaluation.technicalSkills + 
       currentEvaluation.softSkills + 
       currentEvaluation.attitude) / 3
    ).toFixed(1);

    if (selectedIntern) {
      setEvaluations(evaluations.map(e => 
        e.id === selectedIntern.id 
          ? {
              ...e,
              ...currentEvaluation,
              overallScore: parseFloat(overallScore),
              status: "Completed"
            }
          : e
      ));
    }
    setShowEvaluationForm(false);
    setSelectedIntern(null);
  };

  const getStatusClass = (status) => {
    return status === "Completed" ? "status done" : "status pending";
  };

  const getScoreClass = (score) => {
    if (score >= 8) return "score-excellent";
    if (score >= 6) return "score-good";
    return "score-average";
  };

  const calculateOverallScore = () => {
    return ((currentEvaluation.technicalSkills + 
             currentEvaluation.softSkills + 
             currentEvaluation.attitude) / 3).toFixed(1);
  };

  return (
    <div className="dashboard-layout">
      <MentorSidebar />
      <div className="dashboard-content">
        <h2 className="page-title">Đánh giá cuối kỳ</h2>

        {/* Thống kê nhanh */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon mentor">📊</div>
            <div>
              <h4>Tổng thực tập sinh</h4>
              <p className="stat-value">{evaluations.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">✅</div>
            <div>
              <h4>Đã đánh giá</h4>
              <p className="stat-value">{evaluations.filter(e => e.status === "Completed").length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">⏳</div>
            <div>
              <h4>Chưa đánh giá</h4>
              <p className="stat-value">{evaluations.filter(e => e.status === "Draft").length}</p>
            </div>
          </div>
        </div>

        {/* Form đánh giá */}
        {showEvaluationForm && selectedIntern && (
          <div className="card mb-6">
            <h4>Đánh giá thực tập sinh: {selectedIntern.internName}</h4>
            <p className="mb-4"><strong>Kỳ đánh giá:</strong> {selectedIntern.period}</p>
            
            <div className="evaluation-form">
              <div className="form-group">
                <label>Kỹ năng chuyên môn (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentEvaluation.technicalSkills}
                  onChange={(e) => setCurrentEvaluation({
                    ...currentEvaluation,
                    technicalSkills: parseInt(e.target.value)
                  })}
                />
                <span className="score-display">{currentEvaluation.technicalSkills}</span>
              </div>

              <div className="form-group">
                <label>Kỹ năng mềm (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentEvaluation.softSkills}
                  onChange={(e) => setCurrentEvaluation({
                    ...currentEvaluation,
                    softSkills: parseInt(e.target.value)
                  })}
                />
                <span className="score-display">{currentEvaluation.softSkills}</span>
              </div>

              <div className="form-group">
                <label>Thái độ học tập (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentEvaluation.attitude}
                  onChange={(e) => setCurrentEvaluation({
                    ...currentEvaluation,
                    attitude: parseInt(e.target.value)
                  })}
                />
                <span className="score-display">{currentEvaluation.attitude}</span>
              </div>

              <div className="form-group">
                <label>Điểm trung bình</label>
                <div className={`score-badge ${getScoreClass(calculateOverallScore())}`}>
                  {calculateOverallScore()}/10
                </div>
              </div>

              <div className="form-group">
                <label>Nhận xét chi tiết</label>
                <textarea
                  value={currentEvaluation.notes}
                  onChange={(e) => setCurrentEvaluation({
                    ...currentEvaluation,
                    notes: e.target.value
                  })}
                  placeholder="Nhập nhận xét chi tiết về thực tập sinh..."
                  rows="4"
                  className="w-full"
                ></textarea>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="btn-primary" onClick={handleSubmitEvaluation}>
                Lưu đánh giá
              </button>
              <button className="btn-secondary" onClick={() => setShowEvaluationForm(false)}>
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Danh sách đánh giá */}
        <div className="card">
          <h4>Danh sách đánh giá</h4>
          <table className="task-table">
            <thead>
              <tr>
                <th>Thực tập sinh</th>
                <th>Kỳ đánh giá</th>
                <th>Kỹ năng chuyên môn</th>
                <th>Kỹ năng mềm</th>
                <th>Thái độ</th>
                <th>Điểm TB</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map(evaluation => (
                <tr key={evaluation.id}>
                  <td>
                    <div>
                      <strong>{evaluation.internName}</strong>
                      {evaluation.notes && (
                        <p className="text-sm text-gray-600">{evaluation.notes}</p>
                      )}
                    </div>
                  </td>
                  <td>{evaluation.period}</td>
                  <td>
                    <span className={`score-badge ${getScoreClass(evaluation.technicalSkills)}`}>
                      {evaluation.technicalSkills}/10
                    </span>
                  </td>
                  <td>
                    <span className={`score-badge ${getScoreClass(evaluation.softSkills)}`}>
                      {evaluation.softSkills}/10
                    </span>
                  </td>
                  <td>
                    <span className={`score-badge ${getScoreClass(evaluation.attitude)}`}>
                      {evaluation.attitude}/10
                    </span>
                  </td>
                  <td>
                    <span className={`score-badge ${getScoreClass(evaluation.overallScore)}`}>
                      {evaluation.overallScore}/10
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(evaluation.status)}`}>
                      {evaluation.status === "Completed" ? "Đã hoàn thành" : "Nháp"}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-primary btn-sm" 
                      onClick={() => handleEvaluate(evaluation)}
                    >
                      {evaluation.status === "Completed" ? "Xem/Sửa" : "Đánh giá"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hướng dẫn đánh giá */}
        <div className="card mt-6">
          <h4>Hướng dẫn đánh giá</h4>
          <div className="guidance-content">
            <div className="guidance-item">
              <h5>📋 Kỹ năng chuyên môn</h5>
              <p>Đánh giá khả năng thực hiện công việc, kiến thức chuyên ngành, kỹ thuật lập trình/thiết kế...</p>
            </div>
            <div className="guidance-item">
              <h5>🤝 Kỹ năng mềm</h5>
              <p>Đánh giá khả năng giao tiếp, làm việc nhóm, giải quyết vấn đề, quản lý thời gian...</p>
            </div>
            <div className="guidance-item">
              <h5>⭐ Thái độ học tập</h5>
              <p>Đánh giá sự chủ động, tinh thần cầu tiến, tuân thủ quy định, thái độ với công việc...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorEvaluations;