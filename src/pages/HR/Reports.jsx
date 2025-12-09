import React, { useContext, useEffect, useMemo, useState } from "react";
import HRSidebar from "../../components/Layout/HRSidebar";
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
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedTeamName, setSelectedTeamName] = useState("");
  const [selectedMentorName, setSelectedMentorName] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

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
    if (!token || !selectedProgramId) {
      setTeams([]);
      setSelectedTeamId("");
      setSelectedTeamName("");
      return;
    }

    const loadTeams = async () => {
      try {
        const res = await hrApi.getTeamsInProgram(token, selectedProgramId);
        setTeams(res || []);
      } catch (err) {
        console.error("Không thể tải danh sách team", err);
        toast.error("Không thể tải danh sách team");
      }
    };

    loadTeams();
  }, [token, selectedProgramId]);

  useEffect(() => {
    if (!token) {
      setReport(null);
      return;
    }

    const loadReport = async () => {
      try {
        setLoading(true);
        if (selectedProgramId) {
          const data = await reportApi.getFinalEvaluationReportByProgram(
            token,
            selectedProgramId
          );
          setReport(data);
          return;
        }

        if (!programs || programs.length === 0) {
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

    loadReport();
  }, [token, selectedProgramId, programs]);

  const handleExport = async () => {
    try {
      setExporting(true);
      if (!report || !Array.isArray(report.interns) || report.interns.length === 0) {
        toast.error("Không có dữ liệu để xuất");
        return;
      }

      let rowsToExport = report.interns;

      if (selectedTeamName) {
        rowsToExport = rowsToExport.filter(
          (intern) => intern.teamName === selectedTeamName
        );
      }

      if (selectedMentorName) {
        rowsToExport = rowsToExport.filter(
          (intern) => intern.mentorName === selectedMentorName
        );
      }

      if (selectedMajor) {
        rowsToExport = rowsToExport.filter(
          (intern) => intern.major === selectedMajor
        );
      }

      if (searchKeyword.trim()) {
        const keyword = searchKeyword.trim().toLowerCase();
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

      const includeProgram = !selectedProgramId;

      let filename = "Bao_cao_thuc_tap_sinh.xlsx";
      if (!selectedProgramId) {
        filename = "Bao_cao_tat_ca_chuong_trinh.xlsx";
      } else {
        const currentProgram = programs.find(
          (p) => String(p.programId) === String(selectedProgramId)
        );
        const baseName = currentProgram?.name || `Program_${selectedProgramId}`;
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

    if (selectedTeamName) {
      filtered = filtered.filter(
        (intern) => intern.teamName === selectedTeamName
      );
    }

    if (selectedMentorName) {
      filtered = filtered.filter(
        (intern) => intern.mentorName === selectedMentorName
      );
    }

    if (selectedMajor) {
      filtered = filtered.filter((intern) => intern.major === selectedMajor);
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
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
  }, [report, selectedTeamName, selectedMentorName, selectedMajor, searchKeyword]);

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

    const majors = Array.from(
      new Set(
        report.interns
          .map((intern) => intern.major)
          .filter((major) => !!major)
      )
    );

    return majors.sort((a, b) => a.localeCompare(b));
  }, [report]);

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
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Nhập tên, SĐT hoặc email"
              />
            </div>
            <div className="filter-group">
              <label>Chương trình</label>
              <select
                value={selectedProgramId}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedProgramId(value);
                  setSelectedTeamId("");
                  setSelectedTeamName("");
                  setSelectedMentorName("");
                  setSelectedMajor("");
                  setSearchKeyword("");
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
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
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
                value={selectedTeamName}
                onChange={(e) => {
                  const name = e.target.value;
                  setSelectedTeamName(name);
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
                value={selectedMentorName}
                onChange={(e) => setSelectedMentorName(e.target.value)}
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
                onClick={handleExport}
                disabled={exporting || !report}
              >
                {exporting ? "Đang xuất..." : "Xuất Excel"}
              </button>
            </div>
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
                    {!selectedProgramId && <th>Chương trình</th>}
                    <th>Nhóm</th>
                    <th>Mentor</th>
                    <th>Kỹ thuật</th>
                    <th>Giao tiếp</th>
                    <th>Kỷ luật</th>
                    <th>Thái độ</th>
                    <th>Điểm cuối kỳ</th>
                  </tr>
                </thead>
                <tbody>
                  {internRows.length === 0 && (
                    <tr>
                      <td colSpan="14" style={{ textAlign: "center" }}>
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
                      {!selectedProgramId && (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HRReports;
