import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate,useLocation } from "react-router-dom";
import "../../..//styles/CreateTeamAuto.css";
import { ArrowLeft, ChevronDown, Zap, CheckCircle, AlertCircle } from "lucide-react";
import hrApi from "../../../api/hrApi"; // Adjust path to match your api folder
import { AuthContext } from "../../../context/AuthContext"; // From your bonus example
import { useContext } from "react";
import HRSidebar from "../../../components/Layout/HRSidebar";


export default function CreateTeamAuto() {
  const [selectedMajor, setSelectedMajor] = useState("Tất cả");
  const [teamCount, setTeamCount] = useState("");
  const [allInterns, setAllInterns] = useState([]); // Full list from API
  const [filteredInterns, setFilteredInterns] = useState([]); // Filtered by major
  const [availableMajors, setAvailableMajors] = useState(["Tất cả"]); // Dynamic majors
  const [selectedInterns, setSelectedInterns] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(null);
  const [createdTeams, setCreatedTeams] = useState([]); // List<AutoTeamResultDTO>

  const { token } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Try to get programId from navigation state first
  const programIdFromState = location?.state?.programId ?? null;

  // Initialize programId state from state OR sessionStorage
  const [programId, setProgramId] = useState(
    programIdFromState ? Number(programIdFromState) : Number(sessionStorage.getItem("autoTeamProgramId"))
  );

  const cleanErrorMessage = (message) => {
    if (!message) return "Đã xảy ra lỗi. Vui lòng thử lại.";

    return message.replace(/^An unexpected error occurred:\s*/i, "");
  };

  useEffect(() => {
    if (programIdFromState) {
      sessionStorage.setItem("autoTeamProgramId", String(programIdFromState));
      if (!programId) {
        setProgramId(Number(programIdFromState));
      }
    }

    if (!programId && !programIdFromState) {
      navigate("/hr/program");
    }
  }, [programIdFromState]);

  useEffect(() => {
    if (!programId) {
      navigate("/hr/program");
    }
  }, [programId]);
  // Load available interns on mount
  useEffect(() => {
    if (!token || !programId) {
      setError("Thiếu token hoặc programId");
      setLoading(false);
      return;
    }

    const fetchInterns = async () => {
      try {
        setLoading(true);
        setError(null);
        const interns = await hrApi.getAvailableInternsAuto(token, programId);
        setAllInterns(interns || []); // List<InternAutoDTO>

        // Extract unique majors for dropdown (sorted, with "All Majors" first)
        const uniqueMajors = ["Tất cả", ...new Set(interns.map(i => i.major?.trim()).filter(Boolean).sort())];
        setAvailableMajors(uniqueMajors);

        // Initial filter (All Majors)
        setFilteredInterns(interns || []);
      } catch (err) {
        console.error("Error fetching interns:", err);
        setError("Lỗi tải danh sách TTS. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterns();
  }, [token, programId]);

  // Filter interns when major changes (use API filter for efficiency)
  useEffect(() => {
    if (!token || !programId || loading) return;

    const applyFilter = async () => {
      try {
        if (selectedMajor === "Tất cả") {
          setFilteredInterns(allInterns);
          console.log("Filtered interns: All majors selected", allInterns);
        } else {
            console.log("Filtering by major:", selectedMajor);
          const filtered = await hrApi.filterInternsAutoByMajor(token, programId, selectedMajor);
          console.log("Filtered result:", filtered);
          setFilteredInterns(filtered || []);
        }
      } catch (err) {
        console.error("Error filtering interns:", err);
        setError("Không thể lọc TTS. Đang hiện toàn bộ danh sách TTS .");
        setFilteredInterns(allInterns);
      }
    };

    applyFilter();
  }, [selectedMajor, token, programId, allInterns, loading]);

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedInterns(new Set(filteredInterns.map((i) => i.internId)));
      setSelectAll(true);
    } else {
      setSelectedInterns(new Set());
      setSelectAll(false);
    }
  };

  // Handle individual selection
  const handleSelectIntern = (id) => {
    const newSelected = new Set(selectedInterns);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInterns(newSelected);

    // Update select all checkbox
    setSelectAll(newSelected.size === filteredInterns.length && filteredInterns.length > 0);
  };

  const handleCreateTeams = async () => {
    if (!teamCount || parseInt(teamCount) <= 0) {
      setError("Vui lòng nhập số lượng teams tạo hợp lệ (>=1)");
      return;
    }
    if (selectedInterns.size === 0) {
      setError("Vui lòng chọn ít nhất 1 TTS");
      return;
    }
    if (selectedInterns.size < parseInt(teamCount)) {
      setError("Số lượng TTS phải lớn hơn hoặc bằng số lượng Teams tạo");
      return;
    }

    try {
      setCreating(true);
      setError(null);
      setSuccess(null);

      const requestBody = {
        programId: parseInt(programId),
        internIds: Array.from(selectedInterns), // List<Integer> internIds
        numberOfTeams: parseInt(teamCount),
      };

      const results = await hrApi.createAutoTeams(token, programId, requestBody); // List<AutoTeamResultDTO>
      setCreatedTeams(results || []);

      setSuccess(`Tạo thành công ${results.length} team(s)! Các TTS đã được phân công đến các team(s) .`);
      // Optionally reset form or navigate back after delay
      setTimeout(() => {
        sessionStorage.removeItem("autoTeamProgramId");
        navigate(`/program/${programId}/teams`); // Redirect back to team management view (adjust route as needed)
      }, 3000);
    } catch (err) {
      console.error("Error creating teams:", err);
      setError(cleanErrorMessage(err?.response?.data?.message) || "Lỗi tạo team. Vui lòng kiểm tra lại danh sách đã chọn và thử lại sau.");
    } finally {
      setCreating(false);
    }
  };

  const handleBack = () => {
    // clear stored programId for auto-team flow
    sessionStorage.removeItem("autoTeamProgramId");
    navigate(`/program/${programId}/teams`);
  };

  if (loading) {
    return (
      <div className="create-team-auto-container">
        <main className="main-content">
          <div className="max-width-container">
            <div className="page-header">
              <h1>Đang tải trang...</h1>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
          <HRSidebar />
    <div className="create-team-auto-container">
      {/* Header with back button */}
      <header className="header">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
      </header>

      {/* Main content */}
      <main className="main-content">
        <div className="max-width-container">
          {/* Page title */}
          <div className="page-header">
            <div className="title-section">
              <h1>Tạo Teams Tự Động</h1>
            </div>
            <p className="subtitle">Tự động phân bố thực tập sinh vào các teams</p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          {/* Controls section */}
          <div className="controls-section">
            {/* Major filter dropdown */}
            <div className="control-group">
              <label className="control-label">Lọc theo chuyên ngành</label>
              <div className="dropdown-wrapper">
                <button className="dropdown-trigger" onClick={() => setShowDropdown(!showDropdown)}>
                  <span>{selectedMajor}</span>
                  <ChevronDown size={16} />
                </button>
                {showDropdown && (
                  <div className="dropdown-menu-auto">
                    {availableMajors.map((major) => (
                      <button
                        key={major}
                        className="dropdown-item"
                        onClick={() => {
                          console.log("Selected major:", major);
                          setSelectedMajor(major);
                          setShowDropdown(false);
                          setSelectAll(false);
                          setSelectedInterns(new Set()); // Reset selection on filter change
                        }}
                      >
                        {major}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Team count input */}
            <div className="control-group">
              <label className="control-label">Số lượng Teams tạo</label>
              <input
                type="number"
                placeholder="Nhập số"
                value={teamCount}
                onChange={(e) => setTeamCount(e.target.value)}
                min="1"
                className="team-count-input"
                disabled={creating}
              />
            </div>

            {/* Create button */}
            <button className="create-teams-button" onClick={handleCreateTeams} disabled={creating}>
              {creating ? "Đang tạo..." : "Tạo Teams"}
            </button>
          </div>

          {/* Interns table */}
          <div className="table-wrapper">
            <table className="interns-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      aria-label="Select all interns"
                      disabled={creating}
                    />
                  </th>
                  <th className="stt-col">STT</th>
                  <th className="name-col">Họ và tên</th>
                  <th className="email-col">Email</th>
                  <th className="phone-col">SĐT</th>
                  <th className="gpa-col">GPA</th>
                  <th className="major-col">Chuyên ngành</th>
                  <th className="school-col">Trường</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      Không có intern để lọc.
                    </td>
                  </tr>
                ) : (
                  filteredInterns.map((intern, index) => (
                    <tr key={intern.internId} className="table-row">
                      <td className="checkbox-col">
                        <input
                          type="checkbox"
                          checked={selectedInterns.has(intern.internId)}
                          onChange={() => handleSelectIntern(intern.internId)}
                          aria-label={`Select ${intern.fullName}`}
                          disabled={creating}
                        />
                      </td>
                      <td className="stt-col">{index + 1}</td> {/* Frontend STT */}
                      <td className="name-col">{intern.fullName}</td>
                      <td className="email-col">{intern.email}</td>
                      <td className="phone-col">{intern.phone}</td>
                      <td className="gpa-col">{intern.gpa}</td>
                      <td className="major-col">{intern.major}</td>
                      <td className="school-col">{intern.school}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Selected count footer */}
          <div className="footer-stats">
            <div className="selected-count">
              <span className="highlight-count">{selectedInterns.size}</span> TTS
               đã chọn
            </div>
            <div className="showing-count">
              Tổng {filteredInterns.length} / {allInterns.length} TTS
            </div>
          </div>

          {/* Success: Show created teams summary (bonus visualization) */}
          {createdTeams.length > 0 && (
            <div className="created-teams-summary">
              <h3>Tạo Teams:</h3>
              <ul>
                {createdTeams.map((team, idx) => (
                  <li key={idx}>
                    Team: {idx+1} (Số lượng TTS: {team.internIds.length})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
    </div>
  );
}