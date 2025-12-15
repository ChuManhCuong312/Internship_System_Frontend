import React, { useContext, useEffect, useState } from "react";
import MentorSidebar from "../../components/Layout/MentorSidebar";
import "../../styles/dashBoard.css";
import "../../styles/table.css";
import { AuthContext } from "../../context/AuthContext";
import mentorApi from "../../api/mentorApi";
import reportApi from "../../api/reportApi";
import hrApi from "../../api/hrApi";

const InternProgress = () => {
  const { token, user } = useContext(AuthContext);

  const [interns, setInterns] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatDate = (input) => {
    if (!input) return "";
    try {
      const d = new Date(input);
      if (Number.isNaN(d.getTime())) {
        const idx = String(input).indexOf("T");
        return idx > 0 ? String(input).slice(0, idx) : String(input);
      }
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${day}/${month}/${year}`;
    } catch {
      const str = String(input);
      const idx = str.indexOf("T");
      return idx > 0 ? str.slice(0, idx) : str;
    }
  };

  const toPercent = (value) => {
    if (value == null) return null;
    const num = Number(value);
    if (!Number.isFinite(num)) return null;
    if (num <= 10) return Math.round(num * 10);
    return Math.round(num);
  };

  useEffect(() => {
    const fetchInternProgress = async () => {
      if (!token || !user?.userId) return;

      setLoading(true);
      setError(null);

      try {
        // Lấy thông tin mentor để biết đúng tên hiển thị trong báo cáo
        const mentorData = await mentorApi.getMentorByUserId(token, user.userId);
        const mentorName =
          mentorData?.fullName ||
          mentorData?.name ||
          mentorData?.mentorName ||
          user?.fullName ||
          user?.username ||
          "";

        const mentorId = mentorData?.mentorId;
        if (!mentorId) {
          setInterns([]);
          return;
        }

        // Lấy các chương trình mà mentor này đang hướng dẫn
        const programsRes = await hrApi.filterProgramsByMentor(token, mentorId);

        let rawPrograms = [];
        if (Array.isArray(programsRes)) {
          rawPrograms = programsRes;
        } else if (programsRes && Array.isArray(programsRes.data)) {
          rawPrograms = programsRes.data;
        } else if (programsRes && Array.isArray(programsRes.content)) {
          rawPrograms = programsRes.content;
        }

        const programs = rawPrograms
          .filter((p) => p && (p.programId != null || p.program_id != null))
          .map((p) => ({
            id: p.programId ?? p.program_id,
            name: p.programName ?? p.program_name ?? p.name,
            startDate: formatDate(p.startDate ?? p.start_date),
            endDate: formatDate(p.endDate ?? p.end_date),
          }));

        if (!programs.length) {
          setInterns([]);
          return;
        }

        const internMap = new Map();

        await Promise.all(
          programs.map(async (program) => {
            try {
              const teamsRes = await hrApi.getTeamsInProgram(token, program.id);

              let teams = [];
              if (Array.isArray(teamsRes)) {
                teams = teamsRes;
              } else if (teamsRes && Array.isArray(teamsRes.data)) {
                teams = teamsRes.data;
              } else if (teamsRes && Array.isArray(teamsRes.content)) {
                teams = teamsRes.content;
              }

              await Promise.all(
                teams.map(async (team) => {
                  if (!team || team.teamId == null) return;

                  try {
                    const internsRes = await hrApi.getInternsInTeam(
                      token,
                      team.teamId
                    );

                    let teamInterns = [];
                    if (Array.isArray(internsRes)) {
                      teamInterns = internsRes;
                    } else if (
                      internsRes &&
                      Array.isArray(internsRes.data)
                    ) {
                      teamInterns = internsRes.data;
                    } else if (
                      internsRes &&
                      Array.isArray(internsRes.content)
                    ) {
                      teamInterns = internsRes.content;
                    }

                    teamInterns.forEach((intern) => {
                      if (!intern) return;
                      const internId = intern.internId ?? intern.id;
                      if (internId == null) return;

                      if (!internMap.has(internId)) {
                        internMap.set(internId, {
                          id: internId,
                          name:
                            intern.fullName ||
                            intern.name ||
                            intern.internName ||
                            "-",
                          department:
                            intern.major ||
                            intern.majorName ||
                            "-",
                          programName: program.name,
                          startDate: formatDate(
                            intern.startDate ??
                              intern.assignmentStartDate ??
                              program.startDate
                          ),
                          endDate: formatDate(
                            intern.endDate ??
                              intern.assignmentEndDate ??
                              program.endDate
                          ),
                          overallProgress: 0,
                          technicalSkills: 0,
                          softSkills: 0,
                          attitude: 0,
                          weeklyTasks: 0,
                          completedTasks: 0,
                          attendanceRate: null,
                          status: "Needs Attention",
                        });
                      }
                    });
                  } catch (err) {
                    console.error(
                      "Không thể tải thực tập sinh trong nhóm",
                      team.teamId,
                      err
                    );
                  }
                })
              );
            } catch (err) {
              console.error(
                "Không thể tải nhóm trong chương trình",
                program.id,
                err
              );
            }
          })
        );

        // 2. Gắn dữ liệu báo cáo đánh giá (nếu có) lên từng intern
        await Promise.all(
          programs.map(async (program) => {
            try {
              const report = await reportApi.getFinalEvaluationReportByProgram(
                token,
                program.id
              );

              const reportInterns = Array.isArray(report?.interns)
                ? report.interns
                : [];

              reportInterns.forEach((intern) => {
                const internId =
                  intern.internId ?? intern.intern_id ?? intern.id;
                if (!internId) return;

                // Nếu báo cáo không thuộc mentor hiện tại thì bỏ qua
                if (
                  mentorName &&
                  intern.mentorName &&
                  intern.mentorName !== mentorName
                ) {
                  return;
                }

                const technical = toPercent(intern.avgTechnical);
                const communication = toPercent(intern.avgCommunication);
                const discipline = toPercent(intern.avgDiscipline);
                const attitude = toPercent(intern.avgAttitude);

                const softSkillsSource = [communication, discipline].filter(
                  (v) => typeof v === "number" && !Number.isNaN(v)
                );
                const softSkills =
                  softSkillsSource.length > 0
                    ? Math.round(
                        softSkillsSource.reduce((s, v) => s + v, 0) /
                          softSkillsSource.length
                      )
                    : attitude ?? null;

                const overallFromFinal = toPercent(intern.finalScore);
                const overallProgress =
                  overallFromFinal ??
                  softSkills ??
                  technical ??
                  attitude ??
                  null;

                let status = "Needs Attention";
                if (overallProgress != null) {
                  if (overallProgress >= 85) status = "Excellent";
                  else if (overallProgress >= 70) status = "On Track";
                  else if (overallProgress >= 50) status = "Needs Attention";
                  else status = "Needs Improvement";
                }

                const existing = internMap.get(internId) || {
                  id: internId,
                  name: intern.fullName || intern.intern_name || "-",
                  department: intern.major || "-",
                  programName: intern.programName || program.name,
                  startDate: program.startDate,
                  endDate: program.endDate,
                  // Chưa có API tổng hợp task & điểm danh cho mentor, tạm để 0 / null
                  weeklyTasks: intern.totalTasks || 0,
                  completedTasks: intern.completedTasks || 0,
                  attendanceRate:
                    typeof intern.attendanceRate === "number"
                      ? Math.round(intern.attendanceRate)
                      : null,
                  status: "Needs Attention",
                  overallProgress: 0,
                  technicalSkills: 0,
                  softSkills: 0,
                  attitude: 0,
                };

                internMap.set(internId, {
                  ...existing,
                  programName:
                    existing.programName ||
                    intern.programName ||
                    program.name,
                  overallProgress:
                    overallProgress ?? existing.overallProgress ?? 0,
                  technicalSkills:
                    technical ?? existing.technicalSkills ?? 0,
                  softSkills:
                    softSkills ?? existing.softSkills ?? 0,
                  attitude: attitude ?? existing.attitude ?? 0,
                  status,
                });
              });
            } catch (err) {
              console.error(
                "Không thể tải báo cáo đánh giá cho chương trình",
                program.id,
                err
              );
            }
          })
        );

        setInterns(Array.from(internMap.values()));
      } catch (err) {
        console.error("Lỗi khi tải tiến độ thực tập sinh:", err);

        setError("Không thể tải dữ liệu tiến độ thực tập sinh");
        setInterns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInternProgress();
  }, [token, user]);

  // Chuyển từ thang 0-100 (phần trăm) về thang điểm 0-10
  const toScoreFromPercent = (progress) => {
    if (progress == null) return null;
    const num = Number(progress);
    if (!Number.isFinite(num)) return null;
    return Math.round(num) / 10;
  };

  const getProgressColor = (score) => {
    if (score >= 9) return "#10b981"; // Xuất sắc
    if (score >= 8) return "#3b82f6"; // Giỏi
    if (score >= 5) return "#f59e0b"; // Khá
    return "#ef4444"; // Yếu
  };

  const getStatusBadge = (score) => {
    const statusConfig = {
      weak: { color: "#ef4444", bg: "#fee2e2", label: "Yếu" },
      fair: { color: "#f59e0b", bg: "#fef3c7", label: "Khá" },
      good: { color: "#3b82f6", bg: "#dbeafe", label: "Giỏi" },
      excellent: { color: "#10b981", bg: "#d1fae5", label: "Xuất sắc" },
    };

    let key = "weak";
    if (score != null) {
      if (score >= 9) key = "excellent";      // 9-10
      else if (score >= 8) key = "good";      // 8
      else if (score >= 5) key = "fair";      // 5-7
      else if (score >= 1) key = "weak";      // 1-4
    }

    const config = statusConfig[key];
    return (
      <span
        style={{
          backgroundColor: config.bg,
          color: config.color,
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        {config.label}
      </span>
    );
  };

  const ProgressBar = ({ progress, color }) => (
    <div
      style={{
        width: "100%",
        backgroundColor: "#e5e7eb",
        borderRadius: "8px",
        height: "8px",
      }}
    >
      <div
        style={{
          width: `${(progress ?? 0) * 10}%`,
          backgroundColor: color,
          height: "100%",
          borderRadius: "8px",
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );

  const handleViewDetails = (intern) => {
    setSelectedIntern(intern);
    setShowDetails(true);
  };

  return (
    <div className="dashboard-layout">
      <MentorSidebar />
      <div className="dashboard-content">
        <h2 className="page-title">Theo dõi Tiến độ Thực tập sinh</h2>

        {/* Thống kê tổng quan */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon mentor">👥</div>
            <div>
              <h4>Tổng thực tập sinh</h4>
              <p className="stat-value">{interns.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">✅</div>
            <div>
              <h4>Hoàn thành tốt</h4>
              <p className="stat-value">
                {interns.filter(
                  (i) => toScoreFromPercent(i.overallProgress) >= 9
                ).length}
              </p>
            </div>
          </div>
        </div>

        {/* Bảng tiến độ */}
        <div className="card">
          <table className="users-table">
            <thead>
              <tr>
                <th>Thực tập sinh</th>
                <th>Chương trình</th>
                <th>Phòng ban</th>
                <th>Điểm tổng</th>
                <th>Điểm chuyên môn</th>
                <th>Điểm kỹ năng mềm</th>
                <th>Điểm thái độ</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8">Đang tải dữ liệu tiến độ...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" style={{ color: "red" }}>
                    {error}
                  </td>
                </tr>
              ) : interns.length === 0 ? (
                <tr>
                  <td colSpan="8">Không có thực tập sinh nào</td>
                </tr>
              ) : (
                interns.map((intern) => (
                  <tr key={intern.id}>
                    <td>{intern.name}</td>
                    <td>{intern.programName}</td>
                    <td>{intern.department}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <ProgressBar
                          progress={toScoreFromPercent(intern.overallProgress)}
                          color={getProgressColor(
                            toScoreFromPercent(intern.overallProgress)
                          )}
                        />
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            minWidth: "35px",
                          }}
                        >
                          {toScoreFromPercent(intern.overallProgress) ?? "-"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <ProgressBar
                          progress={toScoreFromPercent(intern.technicalSkills)}
                          color={getProgressColor(
                            toScoreFromPercent(intern.technicalSkills)
                          )}
                        />
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            minWidth: "35px",
                          }}
                        >
                          {toScoreFromPercent(intern.technicalSkills) ?? "-"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <ProgressBar
                          progress={toScoreFromPercent(intern.softSkills)}
                          color={getProgressColor(
                            toScoreFromPercent(intern.softSkills)
                          )}
                        />
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            minWidth: "35px",
                          }}
                        >
                          {toScoreFromPercent(intern.softSkills) ?? "-"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <ProgressBar
                          progress={toScoreFromPercent(intern.attitude)}
                          color={getProgressColor(
                            toScoreFromPercent(intern.attitude)
                          )}
                        />
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            minWidth: "35px",
                          }}
                        >
                          {toScoreFromPercent(intern.attitude) ?? "-"}
                        </span>
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(
                        toScoreFromPercent(intern.overallProgress)
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal chi tiết */}
        {showDetails && selectedIntern && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "24px",
                borderRadius: "12px",
                maxWidth: "600px",
                width: "90%",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3 style={{ margin: 0 }}>
                  Chi tiết tiến độ - {selectedIntern.name}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#6b7280",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <p>
                  <strong>Phòng ban:</strong> {selectedIntern.department}
                </p>
                <p>
                  <strong>Kỳ thực tập:</strong> {selectedIntern.startDate} -
                  {" "}
                  {selectedIntern.endDate}
                </p>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  {getStatusBadge(
                    toScoreFromPercent(selectedIntern.overallProgress)
                  )}
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ marginBottom: "12px" }}>Đánh giá chi tiết</h4>
                <div style={{ display: "grid", gap: "12px" }}>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <span>Tiến độ tổng thể</span>
                      <span style={{ fontWeight: "600" }}>
                        {toScoreFromPercent(selectedIntern.overallProgress)}
                      </span>
                    </div>
                    <ProgressBar
                      progress={toScoreFromPercent(selectedIntern.overallProgress)}
                      color={getProgressColor(
                        toScoreFromPercent(selectedIntern.overallProgress)
                      )}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <span>Kỹ năng chuyên môn</span>
                      <span style={{ fontWeight: "600" }}>
                        {toScoreFromPercent(selectedIntern.technicalSkills)}
                      </span>
                    </div>
                    <ProgressBar
                      progress={toScoreFromPercent(selectedIntern.technicalSkills)}
                      color={getProgressColor(
                        toScoreFromPercent(selectedIntern.technicalSkills)
                      )}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <span>Kỹ năng mềm</span>
                      <span style={{ fontWeight: "600" }}>
                        {toScoreFromPercent(selectedIntern.softSkills)}
                      </span>
                    </div>
                    <ProgressBar
                      progress={toScoreFromPercent(selectedIntern.softSkills)}
                      color={getProgressColor(
                        toScoreFromPercent(selectedIntern.softSkills)
                      )}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <span>Thái độ học tập</span>
                      <span style={{ fontWeight: "600" }}>
                        {toScoreFromPercent(selectedIntern.attitude)}
                      </span>
                    </div>
                    <ProgressBar
                      progress={toScoreFromPercent(selectedIntern.attitude)}
                      color={getProgressColor(
                        toScoreFromPercent(selectedIntern.attitude)
                      )}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ marginBottom: "12px" }}>Thống kê hoạt động</h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      padding: "12px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#3b82f6",
                      }}
                    >
                      {selectedIntern.completedTasks}/
                      {selectedIntern.weeklyTasks}
                    </div>
                    <div
                      style={{ fontSize: "14px", color: "#6b7280" }}
                    >
                      Task hoàn thành
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "12px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#10b981",
                      }}
                    >
                      {selectedIntern.attendanceRate}%
                    </div>
                    <div
                      style={{ fontSize: "14px", color: "#6b7280" }}
                    >
                      Tỷ lệ điểm danh
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className="btn-secondary"
                  onClick={() => setShowDetails(false)}
                >
                  Đóng
                </button>
                <button className="btn-primary">Xuất báo cáo</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternProgress;