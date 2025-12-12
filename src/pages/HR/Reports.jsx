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
import ReportStats from "./Reports/component/ReportStats";
import ReportFilters from "./Reports/component/ReportFilters";
import ReportTable from "./Reports/component/ReportTable";
import InternDetailModal from "./Reports/modals/InternDetailModal";

const ITEMS_PER_PAGE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = useMemo(() => {
    if (!internRows.length) return 1;
    return Math.ceil(internRows.length / ITEMS_PER_PAGE);
  }, [internRows]);

  const paginatedInternRows = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return internRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [internRows, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [internRows]);

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

        <ReportStats report={report} />

        <ReportFilters
          programs={programs}
          pendingSearchKeyword={pendingSearchKeyword}
          setPendingSearchKeyword={setPendingSearchKeyword}
          pendingProgramId={pendingProgramId}
          setPendingProgramId={setPendingProgramId}
          pendingMajor={pendingMajor}
          setPendingMajor={setPendingMajor}
          pendingTeamName={pendingTeamName}
          setPendingTeamName={setPendingTeamName}
          pendingMentorName={pendingMentorName}
          setPendingMentorName={setPendingMentorName}
          majorOptions={majorOptions}
          mentorOptions={mentorOptions}
          teams={teams}
          sortedTeams={sortedTeams}
          report={report}
          loading={loading}
          token={token}
          exporting={exporting}
          handleSearchReport={handleSearchReport}
          handleExport={handleExport}
          handleClearFilters={handleClearFilters}
          setSelectedTeamId={setSelectedTeamId}
          setTeams={setTeams}
        />

        <ReportTable
          report={report}
          appliedProgramId={appliedProgramId}
          paginatedInternRows={paginatedInternRows}
          currentPage={currentPage}
          internRows={internRows}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          setSelectedIntern={setSelectedIntern}
        />
      </div>

      <InternDetailModal
        selectedIntern={selectedIntern}
        onClose={() => setSelectedIntern(null)}
      />
    </div>
  );
};

export default HRReports;