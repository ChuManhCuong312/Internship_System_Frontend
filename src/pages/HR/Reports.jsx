import React, { useContext, useEffect, useMemo, useState } from "react";
import HRSidebar from "../../components/Layout/HRSidebar";
import { AuthContext } from "../../context/AuthContext";
import hrApi from "../../api/hrApi";
import reportApi from "../../api/reportApi";
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
        if (!selectedProgramId && data.length > 0) {
          setSelectedProgramId(data[0].programId);
        }
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
    if (!token || !selectedProgramId) {
      setReport(null);
      return;
    }

    const loadReport = async () => {
      try {
        setLoading(true);
        const data = await reportApi.getFinalEvaluationReportByProgram(
          token,
          selectedProgramId
        );
        setReport(data);
      } catch (err) {
        console.error("Không thể tải báo cáo", err);
        toast.error("Không thể tải báo cáo");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [token, selectedProgramId]);

  const handleExport = async () => {
    if (!selectedProgramId) {
      toast.error("Vui lòng chọn chương trình");
      return;
    }

    try {
      setExporting(true);
      const blobData = await reportApi.exportFinalEvaluationReportByProgram(
        token,
        selectedProgramId,
        selectedTeamId || null
      );

      const blob = new Blob([blobData], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = `final_evaluations_program_${selectedProgramId}${
        selectedTeamId ? `_team_${selectedTeamId}` : ""
      }.xlsx`;

      link.href = url;
      link.setAttribute("download", filename.replace(/\s+/g, "_"));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Không thể xuất Excel", err);
      toast.error("Không thể xuất Excel");
    } finally {
      setExporting(false);
    }
  };

  const internRows = useMemo(() => {
    if (!report?.interns) return [];
    if (!selectedTeamName) return report.interns;
    return report.interns.filter(
      (intern) => intern.teamName === selectedTeamName
    );
  }, [report, selectedTeamName]);

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
              <label>Chương trình</label>
              <select
                value={selectedProgramId}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedProgramId(value);
                  setSelectedTeamId("");
                  setSelectedTeamName("");
                  setTeams([]);
                }}
              >
                <option value="">-- Chọn chương trình --</option>
                {programs.map((p) => (
                  <option key={p.programId} value={p.programId}>
                    {p.name}
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
                    <th>Mã TTS</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>SĐT</th>
                    <th>Trường</th>
                    <th>Ngành</th>
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
                      <td colSpan="13" style={{ textAlign: "center" }}>
                        Không có dữ liệu báo cáo
                      </td>
                    </tr>
                  )}
                  {internRows.map((intern) => (
                    <tr key={intern.internId}>
                      <td>{intern.internId}</td>
                      <td>{intern.fullName}</td>
                      <td>{intern.email}</td>
                      <td>{intern.phone}</td>
                      <td>{intern.school}</td>
                      <td>{intern.major}</td>
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
