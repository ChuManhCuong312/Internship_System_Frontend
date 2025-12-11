import React, { useContext, useEffect, useMemo, useState } from "react";
import HRSidebar from "../../components/Layout/HRSidebar";
import Modal from "../../components/Layout/Modal";
import { AuthContext } from "../../context/AuthContext";
import hrApi from "../../api/hrApi";
import reportApi from "../../api/reportApi";
import { exportFinalReportsToExcel } from "../../utils/excelExport";
import { toast } from "react-toastify";
import "../../styles/manageInterns.css";
import "../../styles/table.css";
import "../../styles/allowances.css";
import "../../styles/buttons.css";

const HRReports = () => {
  const { token } = useContext(AuthContext);
  const [programs, setPrograms] = useState([]);
  
  const [pendingProgramId, setPendingProgramId] = useState("");
  const [pendingTeamName, setPendingTeamName] = useState("");
  const [pendingMentorName, setPendingMentorName] = useState("");
  const [pendingMajor, setPendingMajor] = useState("");
  const [pendingSearchKeyword, setPendingSearchKeyword] = useState("");
  
  const [appliedProgramId, setAppliedProgramId] = useState("");
  const [appliedTeamName, setAppliedTeamName] = useState("");
  const [appliedMentorName, setAppliedMentorName] = useState("");
  const [appliedMajor, setAppliedMajor] = useState("");
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState("");
  
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);

  useEffect(() => {
    if (!token) return;

    const loadPrograms = async () => {
      try {
        const res = await hrApi.getAllPrograms(token, {
          page: 1,
          size: 1000,
          sortBy: "programId",
          sortDir: "asc",
        });
        const data = res?.data || res?.content || [];
        setPrograms(data);
      } catch (err) {
        console.error("Không thể tải danh sách chương trình", err);
        toast.error("Không thể tải danh sách chương trình");
      }
    };

    loadPrograms();
  }, [token]);

  useEffect(() => {
    if (!token || !pendingProgramId) {
      setTeams([]);
      setSelectedTeamId("");
      setPendingTeamName("");
      return;
    }

    const loadTeams = async () => {
      try {
        const res = await hrApi.getTeamsInProgram(token, pendingProgramId);
        setTeams(res || []);
      } catch (err) {
        console.error("Không thể tải danh sách team", err);
        toast.error("Không thể tải danh sách team");
      }
    };

    loadTeams();
  }, [token, pendingProgramId]);

  useEffect(() => {
    if (!token) {
      setReport(null);
    }
  }, [token]);

  const handleSearchReport = async (forceAll = false) => {
    if (!token) {
      toast.error("Phiên đăng nhập không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      let effectiveProgramId = pendingProgramId;
      let teamName = pendingTeamName;
      let mentorName = pendingMentorName;
      let major = pendingMajor;
      let searchKeyword = pendingSearchKeyword;

      if (forceAll) {
        effectiveProgramId = "";
        teamName = "";
        mentorName = "";
        major = "";
        searchKeyword = "";
      }

      setAppliedProgramId(effectiveProgramId);
      setAppliedTeamName(teamName);
      setAppliedMentorName(mentorName);
      setAppliedMajor(major);
      setAppliedSearchKeyword(searchKeyword);

      if (effectiveProgramId) {
        const data = await reportApi.getFinalEvaluationReportByProgram(
          token,
          effectiveProgramId
        );
        setReport(data);
        return;
      }

      if (!programs || programs.length === 0) {
        toast.error("Chưa có dữ liệu chương trình để tìm kiếm");
        setReport(null);
        return;
      }

      let allInterns = [];

      for (const p of programs) {
        try {
          const data = await reportApi.getFinalEvaluationReportByProgram(
            token,
            p.programId
          );
          if (data?.interns) {
            const mapped = data.interns.map((intern) => ({
              ...intern,
              programId: data.programId ?? p.programId,
              programName: data.programName ?? p.name,
            }));
            allInterns = allInterns.concat(mapped);
          }
        } catch (innerErr) {
          console.error(
            "Không thể tải báo cáo cho chương trình",
            p.programId,
            innerErr
          );
        }
      }

      const totalInterns = allInterns.length;
      let internsWithEvaluations = 0;
      let sumFinalScore = 0;
      let countFinalScore = 0;

      allInterns.forEach((intern) => {
        if (intern.evaluationCount != null && intern.evaluationCount > 0) {
          internsWithEvaluations++;
        }
        if (intern.finalScore != null) {
          sumFinalScore += intern.finalScore;
          countFinalScore++;
        }
      });

      const avgFinalScore =
        countFinalScore > 0 ? sumFinalScore / countFinalScore : null;

      setReport({
        programId: null,
        programName: "Tất cả chương trình",
        department: null,
        interns: allInterns,
        totalInterns,
        internsWithEvaluations,
        avgFinalScore,
      });
    } catch (err) {
      console.error("Không thể tải báo cáo", err);
      toast.error("Không thể tải báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    if (!programs || programs.length === 0) return;
    if (report || loading) return;

    const doInitialLoad = async () => {
      try {
        setLoading(true);

        setAppliedProgramId("");
        setAppliedTeamName("");
        setAppliedMentorName("");
        setAppliedMajor("");
        setAppliedSearchKeyword("");

        let allInterns = [];

        for (const p of programs) {
          try {
            const data = await reportApi.getFinalEvaluationReportByProgram(
              token,
              p.programId
            );
            if (data?.interns) {
              const mapped = data.interns.map((intern) => ({
                ...intern,
                programId: data.programId ?? p.programId,
                programName: data.programName ?? p.name,
              }));
              allInterns = allInterns.concat(mapped);
            }
          } catch (innerErr) {
            console.error(
              "Không thể tải báo cáo cho chương trình",
              p.programId,
              innerErr
            );
          }
        }

        const totalInterns = allInterns.length;
        let internsWithEvaluations = 0;
        let sumFinalScore = 0;
        let countFinalScore = 0;

        allInterns.forEach((intern) => {
          if (intern.evaluationCount != null && intern.evaluationCount > 0) {
            internsWithEvaluations++;
          }
          if (intern.finalScore != null) {
            sumFinalScore += intern.finalScore;
            countFinalScore++;
          }
        });

        const avgFinalScore =
          countFinalScore > 0 ? sumFinalScore / countFinalScore : null;

        setReport({
          programId: null,
          programName: "Tất cả chương trình",
          department: null,
          interns: allInterns,
          totalInterns,
          internsWithEvaluations,
          avgFinalScore,
        });
      } catch (err) {
        console.error("Không thể tải báo cáo", err);
        toast.error("Không thể tải báo cáo");
      } finally {
        setLoading(false);
      }
    };

    doInitialLoad();
  }, [token, programs]);

  const handleClearFilters = () => {
    setPendingProgramId("");
    setPendingTeamName("");
    setPendingMentorName("");
    setPendingMajor("");
    setPendingSearchKeyword("");
    
    setAppliedProgramId("");
    setAppliedTeamName("");
    setAppliedMentorName("");
    setAppliedMajor("");
    setAppliedSearchKeyword("");
    
    setSelectedTeamId("");
    setTeams([]);
    setReport(null);
    
    handleSearchReport(true);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      if (!report || !Array.isArray(report.interns) || report.interns.length === 0) {
        toast.error("Không có dữ liệu để xuất");
        return;
      }

      let rowsToExport = report.interns;

      if (appliedTeamName) {
        rowsToExport = rowsToExport.filter(
          (intern) => intern.teamName === appliedTeamName
        );
      }

      if (appliedMentorName) {
        rowsToExport = rowsToExport.filter(
          (intern) => intern.mentorName === appliedMentorName
        );
      }

      if (appliedMajor) {
        rowsToExport = rowsToExport.filter(
          (intern) => intern.major === appliedMajor
        );
      }

      if (appliedSearchKeyword.trim()) {
        const keyword = appliedSearchKeyword.trim().toLowerCase();
        rowsToExport = rowsToExport.filter((intern) => {
          const name = intern.fullName ? intern.fullName.toLowerCase() : "";
          const email = intern.email ? intern.email.toLowerCase() : "";
          const phone = intern.phone ? intern.phone.toLowerCase() : "";
          return (
            name.includes(keyword) ||
            email.includes(keyword) ||
            phone.includes(keyword)
          );
        });
      }

      if (!rowsToExport.length) {
        toast.error("Không có dữ liệu để xuất theo bộ lọc hiện tại");
        return;
      }

      const includeProgram = !appliedProgramId;

      let filename = "Bao_cao_thuc_tap_sinh.xlsx";
      if (!appliedProgramId) {
        filename = "Bao_cao_tat_ca_chuong_trinh.xlsx";
      } else {
        const currentProgram = programs.find(
          (p) => String(p.programId) === String(appliedProgramId)
        );
        const baseName = currentProgram?.name || `Program_${appliedProgramId}`;
        filename = `Bao_cao_${baseName.replace(/\s+/g, "_")}.xlsx`;
      }

      await exportFinalReportsToExcel(rowsToExport, {
        filename,
        includeProgram,
      });
    } catch (err) {
      console.error("Không thể xuất Excel", err);
      toast.error("Không thể xuất Excel");
    } finally {
      setExporting(false);
    }
  };

  const internRows = useMemo(() => {
    if (!report?.interns) return [];

    let filtered = report.interns;

    if (appliedTeamName) {
      filtered = filtered.filter(
        (intern) => intern.teamName === appliedTeamName
      );
    }

    if (appliedMentorName) {
      filtered = filtered.filter(
        (intern) => intern.mentorName === appliedMentorName
      );
    }

    if (appliedMajor) {
      filtered = filtered.filter((intern) => intern.major === appliedMajor);
    }

    if (appliedSearchKeyword.trim()) {
      const keyword = appliedSearchKeyword.trim().toLowerCase();
      filtered = filtered.filter((intern) => {
        const name = intern.fullName ? intern.fullName.toLowerCase() : "";
        const email = intern.email ? intern.email.toLowerCase() : "";
        const phone = intern.phone ? intern.phone.toLowerCase() : "";
        return (
          name.includes(keyword) ||
          email.includes(keyword) ||
          phone.includes(keyword)
        );
      });
    }

    return filtered;
  }, [report, appliedTeamName, appliedMentorName, appliedMajor, appliedSearchKeyword]);

  const mentorOptions = useMemo(() => {
    if (!report?.interns) return [];

    const names = Array.from(
      new Set(
        report.interns
          .map((intern) => intern.mentorName)
          .filter((name) => !!name)
      )
    );

    return names.sort((a, b) => a.localeCompare(b));
  }, [report]);

  const majorOptions = useMemo(() => {
    if (!report?.interns) return [];

    let internsSource = report.interns;

    if (report.programId == null) {
      const effectiveProgramId = pendingProgramId || appliedProgramId || "";
      if (effectiveProgramId) {
        internsSource = internsSource.filter(
          (intern) =>
            intern.programId != null &&
            String(intern.programId) === String(effectiveProgramId)
        );
      }
    }

    const majors = Array.from(
      new Set(
        internsSource
          .map((intern) => intern.major)
          .filter((major) => !!major)
      )
    );

    return majors.sort((a, b) => a.localeCompare(b));
  }, [report, pendingProgramId, appliedProgramId]);

  const sortedTeams = useMemo(() => {
    if (!teams) return [];
    return [...teams].sort((a, b) => a.teamId - b.teamId);
  }, [teams]);

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="dashboard-content">
        <h2 className="page-title">Báo cáo đánh giá cuối kỳ</h2>

        {report && (
          <div className="stats-row">
            <div className="stat-card">
              <div>
                <h4>Tổng số thực tập sinh</h4>
                <p className="stat-value">{report.totalInterns ?? 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div>
                <h4>Số thực tập sinh đã được đánh giá</h4>
                <p className="stat-value">{report.internsWithEvaluations ?? 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div>
                <h4>Điểm trung bình cuối kỳ</h4>
                <p className="stat-value">
                  {report.avgFinalScore != null
                    ? report.avgFinalScore.toFixed(2)
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="filter-container">
          <div className="filter-row">
            <div className="filter-group">
              <label>Tìm kiếm (tên / SĐT / email)</label>
              <input
                type="text"
                value={pendingSearchKeyword}
                onChange={(e) => setPendingSearchKeyword(e.target.value)}
                placeholder="Nhập tên, SĐT hoặc email"
              />
            </div>
            <div className="filter-group">
              <label>Chương trình</label>
              <select
                value={pendingProgramId}
                onChange={(e) => {
                  const value = e.target.value;
                  setPendingProgramId(value);
                  setSelectedTeamId("");
                  setPendingTeamName("");
                  setTeams([]);
                }}
              >
                <option value="">-- Tất cả chương trình --</option>
                {programs.map((p) => (
                  <option key={p.programId} value={p.programId}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Ngành (tuỳ chọn)</label>
              <select
                value={pendingMajor}
                onChange={(e) => setPendingMajor(e.target.value)}
                disabled={!report?.interns?.length}
              >
                <option value="">-- Tất cả ngành --</option>
                {majorOptions.map((major) => (
                  <option key={major} value={major}>
                    {major}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Team (tuỳ chọn)</label>
              <select
                value={pendingTeamName}
                onChange={(e) => {
                  const name = e.target.value;
                  setPendingTeamName(name);
                  const team = sortedTeams.find((t, idx) => {
                    const generatedName = `Team ${idx + 1}`;
                    return generatedName === name;
                  });
                  setSelectedTeamId(team ? team.teamId : "");
                }}
                disabled={!teams.length}
              >
                <option value="">-- Tất cả team --</option>
                {sortedTeams.map((t, idx) => {
                  const name = `Team ${idx + 1}`;
                  return (
                    <option key={t.teamId} value={name}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="filter-group">
              <label>Mentor (tuỳ chọn)</label>
              <select
                value={pendingMentorName}
                onChange={(e) => setPendingMentorName(e.target.value)}
                disabled={!report?.interns?.length}
              >
                <option value="">-- Tất cả mentor --</option>
                {mentorOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-actions">
              <button
                className="btn-filter-apply"
                onClick={() => handleSearchReport(false)}
                disabled={loading || !token}
              >
                {loading ? "Đang tải..." : "Tìm kiếm"}
              </button>
              <button
                className="btn-filter-apply"
                onClick={handleExport}
                disabled={exporting || !report}
              >
                {exporting ? "Đang xuất..." : "Xuất Excel"}
              </button>
            </div>
          </div>
          <div className="clear-filter-container">
            <button className="clear-filter-btn" onClick={handleClearFilters}>
              ✖ Clear filter
            </button>
          </div>
        </div>

        {report && (
          <>
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>SĐT</th>
                    <th>Trường</th>
                    <th>Ngành</th>
                    {!appliedProgramId && <th>Chương trình</th>}
                    <th>Nhóm</th>
                    <th>Mentor</th>
                    <th>Kỹ thuật</th>
                    <th>Giao tiếp</th>
                    <th>Kỷ luật</th>
                    <th>Thái độ</th>
                    <th>Điểm cuối kỳ</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {internRows.length === 0 && (
                    <tr>
                      <td colSpan="15" style={{ textAlign: "center" }}>
                        Không có dữ liệu báo cáo
                      </td>
                    </tr>
                  )}
                  {internRows.map((intern, index) => (
                    <tr key={intern.internId}>
                      <td>{index + 1}</td>
                      <td>{intern.fullName}</td>
                      <td>{intern.email}</td>
                      <td>{intern.phone}</td>
                      <td>{intern.school}</td>
                      <td>{intern.major}</td>
                      {!appliedProgramId && (
                        <td>{intern.programName}</td>
                      )}
                      <td>{intern.teamName}</td>
                      <td>{intern.mentorName}</td>
                      <td>
                        {intern.avgTechnical != null
                          ? intern.avgTechnical.toFixed(2)
                          : "-"}
                      </td>
                      <td>
                        {intern.avgCommunication != null
                          ? intern.avgCommunication.toFixed(2)
                          : "-"}
                      </td>
                      <td>
                        {intern.avgDiscipline != null
                          ? intern.avgDiscipline.toFixed(2)
                          : "-"}
                      </td>
                      <td>
                        {intern.avgAttitude != null
                          ? intern.avgAttitude.toFixed(2)
                          : "-"}
                      </td>
                      <td>
                        {intern.finalScore != null
                          ? intern.finalScore.toFixed(2)
                          : "-"}
                      </td>
                      <td
                        title={intern.allNotes || ""}
                        style={{
                          cursor:
                            intern.allNotes || intern.latestNote
                              ? "pointer"
                              : "default",
                          color:
                            intern.allNotes || intern.latestNote
                              ? "#01579b"
                              : "inherit",
                          textDecoration:
                            intern.allNotes || intern.latestNote
                              ? "underline"
                              : "none",
                        }}
                        onClick={() => {
                          if (intern.allNotes || intern.latestNote) {
                            setSelectedIntern(intern);
                          }
                        }}
                      >
                        {intern.latestNote ||
                          (intern.allNotes ? "Xem chi tiết" : "-")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      {selectedIntern && (
        <Modal
          title="Chi tiết đánh giá"
          onClose={() => setSelectedIntern(null)}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                borderBottom: "1px solid #e0e0e0",
                paddingBottom: 10,
                marginBottom: 4,
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Thông tin thực tập sinh
              </h4>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 8,
                rowGap: 4,
              }}
            >
              <p style={{ margin: 0 }}>
                <strong>Họ tên:</strong> {selectedIntern.fullName || "-"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Email:</strong> {selectedIntern.email || "-"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>SĐT:</strong> {selectedIntern.phone || "-"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Trường / Ngành:</strong> {selectedIntern.school || "-"} /{" "}
                {selectedIntern.major || "-"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Chương trình:</strong> {selectedIntern.programName || "-"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Team / Mentor:</strong> {selectedIntern.teamName || "-"} /{" "}
                {selectedIntern.mentorName || "-"}
              </p>
            </div>

            <div
              style={{
                borderTop: "1px solid #f3f4f6",
                paddingTop: 12,
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Thống kê đánh giá
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 8,
                }}
              >
                <p style={{ margin: 0 }}>
                  <strong>Số lần đánh giá:</strong>{" "}
                  {selectedIntern.evaluationCount ?? 0}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Điểm kỹ thuật:</strong>{" "}
                  {selectedIntern.avgTechnical != null
                    ? selectedIntern.avgTechnical.toFixed(2)
                    : "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Giao tiếp:</strong>{" "}
                  {selectedIntern.avgCommunication != null
                    ? selectedIntern.avgCommunication.toFixed(2)
                    : "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Kỷ luật:</strong>{" "}
                  {selectedIntern.avgDiscipline != null
                    ? selectedIntern.avgDiscipline.toFixed(2)
                    : "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Thái độ:</strong>{" "}
                  {selectedIntern.avgAttitude != null
                    ? selectedIntern.avgAttitude.toFixed(2)
                    : "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Điểm cuối kỳ:</strong>{" "}
                  {selectedIntern.finalScore != null
                    ? selectedIntern.finalScore.toFixed(2)
                    : "-"}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div>
                <h4
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Ghi chú gần nhất
                </h4>
                <div
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    backgroundColor: "#f9fafb",
                    minHeight: 40,
                    fontSize: 14,
                  }}
                >
                  {selectedIntern.latestNote || "Không có ghi chú"}
                </div>
              </div>

              <div>
                <h4
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Tất cả ghi chú
                </h4>
                <div
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    backgroundColor: "#f9fafb",
                    minHeight: 60,
                    whiteSpace: "pre-line",
                    fontSize: 14,
                  }}
                >
                  {selectedIntern.allNotes || "Không có ghi chú"}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default HRReports;