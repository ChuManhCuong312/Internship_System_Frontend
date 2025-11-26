import { useState, useEffect, useContext } from "react";
import { Plus, MoreVertical, Search } from "lucide-react";
import "../../../styles/program-management.css";
import HRSidebar from "../../../components/Layout/HRSidebar";
import ProgramFormModal from "./modals/ProgramFormModal";
import TeamManagementModal from "./modals/TeamManagementModal";
import AddEditTeamModal from "./modals/AddEditTeamModal";
import AddInternModal from "./modals/AddInternModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import hrApi from "../../../api/hrApi";
import { AuthContext } from "../../../context/AuthContext";
import Pagination from "../../../components/Common/Pagination";

export default function ProgramManagement() {
  const { token } = useContext(AuthContext);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10; // default

  // Program state
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all-departments");
  const [filterMentor, setFilterMentor] = useState("all-mentors");
  const [programOverview, setProgramOverview] = useState({});
  const [mentorsList, setMentorsList] = useState([]);


  // Modal state
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [isEditProgramOpen, setIsEditProgramOpen] = useState(false);
  const [isTeamManagementOpen, setIsTeamManagementOpen] = useState(false);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [isAddInternOpen, setIsAddInternOpen] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);

  // Selected program/team & forms
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({});
  const [teamFormData, setTeamFormData] = useState({});
  const [internFormData, setInternFormData] = useState({});
  const [internSearchQuery, setInternSearchQuery] = useState("");
  const [internSuggestions, setInternSuggestions] = useState([]);
  const [showInternSuggestions, setShowInternSuggestions] = useState(false);
  const [mentorSearch, setMentorSearch] = useState("");
  const [teamMentorSearch, setTeamMentorSearch] = useState("");

  const [allDepartments, setAllDepartments] = useState([]);
  const [assignedMentors, setAssignedMentors] = useState([]);

  // ---------------- LOAD DEPARTMENTS & ASSIGNED MENTORS ----------------
  useEffect(() => {
    if (!token) return;

    const loadFilters = async () => {
      try {
        const deps = await hrApi.getDepartments(token);
        setAllDepartments(deps);

        const mentors = await hrApi.getAssignedMentorsDropdown(token);
        setAssignedMentors(mentors); // [{ mentorId, mentorName }]
      } catch (err) {
        console.error("Error loading filter lists:", err);
      }
    };

    loadFilters();
  }, [token]);

  // ---------------- FETCH PROGRAMS ----------------
  useEffect(() => {
    const fetchPrograms = async (page = currentPage) => {
      try {
        let data;

        if (searchTerm) {
          data = await hrApi.searchPrograms(token, searchTerm); // optionally add pagination in backend
        // Filter by department (backend)
        } else if (filterDepartment !== "all-departments") {
          data = await hrApi.filterProgramsByDepartment(token, filterDepartment);

        // Filter by mentor (backend)
        } else if (filterMentor !== "all-mentors") {
          data = await hrApi.filterProgramsByMentor(token, filterMentor);
        } else {
          data = await hrApi.getAllPrograms(token, { page, size: itemsPerPage });
        }

        setPrograms(data.data || data); // `data.data` if backend returns {data, currentPage, totalPages, totalItems}
        setCurrentPage(data.currentPage || page);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || (data.data?.length || 0));

        // fetch overview for each program
        const overviewData = {};
        for (const program of data.data || data) {
          const overview = await hrApi.getProgramOverview(token, program.programId);
          overviewData[program.programId] = overview;
        }
        setProgramOverview(overviewData);
      } catch (err) {
        console.error("Error fetching programs:", err);
      }
    };

    if (token) fetchPrograms(currentPage);
  }, [token, searchTerm, filterDepartment, filterMentor, currentPage]);


  // ---------------- FILTER PROGRAMS ----------------
  const filteredPrograms = programs.filter((program) => {
    if (!program?.name) return false; // safeguard
    return searchTerm
      ? program.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
  });

  // ---------------- PROGRAM ACTIONS ----------------
  const handleAddProgram = () => {
    setFormData({ programStatus: "UPCOMING", maxInterns: 50 });
    setSelectedProgram(null);
    setIsAddProgramOpen(true);
  };

  const handleEditProgram = (program) => {
    setFormData(program);
    setSelectedProgram(program);
    setIsEditProgramOpen(true);
  };

  const handleDeleteProgram = async () => {
    if (!programToDelete) return;

    try {
      await hrApi.deleteProgram(token, programToDelete.programId);

      setPrograms(
        programs.filter((p) => p.programId !== programToDelete.programId)
      );

      setIsDeleteModalOpen(false);
      setProgramToDelete(null);
    } catch (err) {
      console.error("Error deleting program:", err);
    }
  };

  const handleSaveProgram = async () => {
    try {
      if (selectedProgram) {
        // Update program
        const updatedProgram = await hrApi.updateProgram(token, selectedProgram.programId, formData);
        setPrograms(prevPrograms => {
          // Move updated program to top
          const others = prevPrograms.filter(p => p.programId !== updatedProgram.programId);
          return [updatedProgram, ...others];
        });
        setIsEditProgramOpen(false);
      } else {
        // Create new program
        const newProgram = await hrApi.createProgram(token, formData);
        setPrograms(prevPrograms => [newProgram, ...prevPrograms]); // prepend to top
        setIsAddProgramOpen(false);
      }
      setFormData({});
    } catch (err) {
      console.error("Error saving program:", err);
    }
  };

const handleCloneProgram = async (program) => {
  try {
    // fetch template from backend
    const template = await hrApi.getCloneTemplate(token, program.programId);

    // prefill form
    setFormData({
      ...template,
      name: `${template.name}`,
      startDate: template.startDate || "", // or default safe date
      endDate: template.endDate || "",
      detail: template.details
    });

    setSelectedProgram(null); // new program
    setIsAddProgramOpen(true); // open modal
  } catch (err) {
    console.error("Cannot clone program:", err);
  }
};



  const getStatusColor = (status) => {
    switch (status) {
      case "ON_GOING":
        return "status-ongoing";
      case "UPCOMING":
        return "status-upcoming";
      case "FINISHED":
        return "status-finished";
      default:
        return "status-default";
    }
  };

  const isDatePassed = (startDate) => new Date(startDate) < new Date();

  // ---------------- TEAM ACTIONS ----------------
  const handleAddTeam = () => {
    setTeamFormData({});
    setIsAddTeamOpen(true);
  };

  const handleEditTeam = (team) => {
    setTeamFormData(team);
    setSelectedTeam(team);
    setIsEditTeamOpen(true);
  };

  const handleDeleteTeam = (teamId) => {
    if (selectedProgram) {
      const updatedProgram = {
        ...selectedProgram,
        teams: selectedProgram.teams.filter((t) => t.teamId !== teamId),
      };
      setPrograms(programs.map((p) => (p.programId === selectedProgram.programId ? updatedProgram : p)));
      setSelectedProgram(updatedProgram);
    }
  };

  const handleSaveTeam = () => {
    if (!selectedProgram) return;
    let updatedProgram = selectedProgram;

    if (selectedTeam) {
      updatedProgram = {
        ...selectedProgram,
        teams: selectedProgram.teams.map((t) =>
          t.teamId === selectedTeam.teamId ? { ...t, ...teamFormData } : t
        ),
      };
      setIsEditTeamOpen(false);
    } else {
      const newTeam = {
        teamId: Math.max(0, ...selectedProgram.teams.map((t) => t.teamId)) + 1,
        ...teamFormData,
        interns: [],
      };
      updatedProgram = { ...selectedProgram, teams: [...selectedProgram.teams, newTeam] };
      setIsAddTeamOpen(false);
    }

    setPrograms(programs.map((p) => (p.programId === selectedProgram.programId ? updatedProgram : p)));
    setSelectedProgram(updatedProgram);
    setTeamFormData({});
  };

  // ---------------- INTERN ACTIONS ----------------
  const handleAddIntern = () => {
    if (!selectedTeam || !selectedProgram || !internFormData.internId) return;

    const updatedTeam = {
      ...selectedTeam,
      interns: [...selectedTeam.interns, internFormData],
    };

    const updatedProgram = {
      ...selectedProgram,
      teams: selectedProgram.teams.map((t) => (t.teamId === selectedTeam.teamId ? updatedTeam : t)),
    };

    setPrograms(programs.map((p) => (p.programId === selectedProgram.programId ? updatedProgram : p)));
    setSelectedTeam(updatedTeam);
    setSelectedProgram(updatedProgram);
    setInternFormData({});
    setInternSearchQuery("");
    setIsAddInternOpen(false);
  };

  const handleRemoveIntern = (internId) => {
    if (!selectedTeam || !selectedProgram) return;

    const updatedTeam = {
      ...selectedTeam,
      interns: selectedTeam.interns.filter((i) => i.internId !== internId),
    };

    const updatedProgram = {
      ...selectedProgram,
      teams: selectedProgram.teams.map((t) => (t.teamId === selectedTeam.teamId ? updatedTeam : t)),
    };

    setPrograms(programs.map((p) => (p.programId === selectedProgram.programId ? updatedProgram : p)));
    setSelectedTeam(updatedTeam);
    setSelectedProgram(updatedProgram);
  };

  const handleInternSearch = (query, availableInterns) => {
    setInternSearchQuery(query);
    if (!query.trim()) {
      setInternSuggestions([]);
      setShowInternSuggestions(false);
      return;
    }

    const filtered = availableInterns.filter(
      (intern) =>
        intern.name.toLowerCase().includes(query.toLowerCase()) &&
        !selectedTeam?.interns.some((t) => t.internId === intern.internId)
    );
    setInternSuggestions(filtered);
    setShowInternSuggestions(true);
  };

  const handleSelectIntern = (intern) => {
    setInternFormData(intern);
    setInternSearchQuery(intern.name);
    setShowInternSuggestions(false);
  };

  const formatLocalDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-CA");
    // en-CA outputs YYYY-MM-DD
  };

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="dashboard-content">
        <div className="max-width-container">
          {/* Header */}
          <div className="header-section">
            <div className="header-content">
              <div>
                <h1 className="header-title">Quản lý chương trình thực tập</h1>
                <p className="header-subtitle">Quản lý thực tập sinh, teams, và phân công mentor</p>
              </div>
              <button className="btn btn-primary" onClick={handleAddProgram}>
                <Plus size={16} /> Thêm Chương trình
              </button>
            </div>

            {/* Search & Filters */}
            <div className="card filter-card">
              <div className="filter-content">
                <div className="search-container">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm chương trình theo tên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="filter-grid">
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="select"
                  >
                    <option value="all-departments">Lọc theo phòng ban</option>
                    {allDepartments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>

                  <select
                    value={filterMentor}
                    onChange={(e) => setFilterMentor(e.target.value)}
                    className="select"
                  >
                    <option value="all-mentors">Lọc theo mentor</option>
                    {assignedMentors.map((m) => (
                      <option key={m.mentorId} value={m.mentorId}>
                        {m.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {(searchTerm || filterDepartment !== "all-departments") && (
                  <div className="filter-actions">
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => {
                        setSearchTerm("");
                        setFilterDepartment("all-departments");
                        setFilterMentor("all-mentors");
                      }}
                    >
                      Bỏ bộ lọc
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Programs List */}
          <div className="programs-list">
            {filteredPrograms.length === 0 ? (
              <div className="card empty-state">
                <p className="empty-state-text">Không tìm thấy chương trình</p>
              </div>
            ) : (
              filteredPrograms.map((program) => (
                <div key={program.programId} className="card program-card">
                  <div className="program-header">
                    <div className="program-title-section">
                      <h2 className="program-title">{program.name}</h2>
                      <span className={`status-badge ${getStatusColor(program.programStatus)}`}>
                        {program.programStatus}
                      </span>
                    </div>
                    <div className="dropdown-menu-container">
                      <button className="btn-icon">
                        <MoreVertical size={16} />
                      </button>
                      <div className="dropdown-menu">
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setSelectedProgram(program);
                            setIsTeamManagementOpen(true);
                          }}
                        >
                          Xem teams
                        </button>
                        <button
                          className="dropdown-item"
                          onClick={() => handleEditProgram(program)}
                          disabled={["ON_GOING", "FINISHED"].includes(program.programStatus)}
                        >
                          Cập nhật chương trình
                        </button>
                        <button className="dropdown-item" onClick={() => handleCloneProgram(program)}>
                          Sao chép chương trình
                        </button>
                        <button
                          className="dropdown-item danger"
                          onClick={() => {
                            setProgramToDelete(program);
                            setIsDeleteModalOpen(true);
                          }}
                          disabled={program.programStatus === "ON_GOING"}
                        >
                          Xoá chương trình
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="program-detail">{program.description}</p>

                  <div className="program-stats">
                    <div className="stat-item">
                      <p className="stat-label">Phòng ban</p>
                      <p className="stat-value">{program.department}</p>
                    </div>
                    <div className="stat-item">
                      <p className="stat-label">Ngày bắt đầu</p>
                      <p className="stat-value">{formatLocalDate(program.startDate)}</p>
                    </div>
                    <div className="stat-item">
                      <p className="stat-label">Ngày kết thúc</p>
                      <p className="stat-value">{formatLocalDate(program.endDate)}</p>
                    </div>
                    <div className="stat-item">
                      <p className="stat-label">Số lượng mentor</p>
                      <p className="stat-value">{programOverview[program.programId]?.totalMentors || 0}</p>
                    </div>
                    <div className="stat-item">
                      <p className="stat-label">Số lượng interns</p>
                      <p className="stat-value">{programOverview[program.programId]?.totalInterns || 0}</p>
                    </div>
                    <div className="stat-item">
                      <p className="stat-label">Số lượng teams</p>
                      <p className="stat-value">{programOverview[program.programId]?.totalTeams || 0}</p>
                    </div>
                  </div>
                  {/* Mentor Names Section */}
                    <div className="program-mentors-section">
                      <h4 className="mentors-title">Mentor được phân công</h4>
                      <div className="mentors-list">
                        {programOverview[program.programId]?.mentorNames?.length > 0 ? (
                          programOverview[program.programId].mentorNames.map((name, idx) => (
                            <span key={idx} className="mentor-badge">
                              {name}
                            </span>
                          ))
                        ) : (
                          <span className="no-mentor">Chưa có mentor</span>
                        )}
                      </div>
                    </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MODALS */}
        <ProgramFormModal
          isOpen={isAddProgramOpen || isEditProgramOpen}
          onClose={() => {
            setIsAddProgramOpen(false);
            setIsEditProgramOpen(false);
          }}
          onSave={handleSaveProgram}
          formData={formData}
          setFormData={setFormData}
          selectedProgram={selectedProgram}
          allDepartments={allDepartments}
          isDatePassed={isDatePassed}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteProgram}
          programName={programToDelete?.name}
        />

        <TeamManagementModal
          isOpen={isTeamManagementOpen}
          onClose={() => setIsTeamManagementOpen(false)}
          selectedProgram={selectedProgram}
          handleAddTeam={handleAddTeam}
          handleEditTeam={handleEditTeam}
          handleDeleteTeam={handleDeleteTeam}
        />

        <AddEditTeamModal
          isOpen={isAddTeamOpen || isEditTeamOpen}
          onClose={() => {
            setIsAddTeamOpen(false);
            setIsEditTeamOpen(false);
          }}
          onSave={handleSaveTeam}
          selectedTeam={selectedTeam}
          teamFormData={teamFormData}
          setTeamFormData={setTeamFormData}
        />

        <AddInternModal
          isOpen={isAddInternOpen}
          onClose={() => setIsAddInternOpen(false)}
          internSearchQuery={internSearchQuery}
          handleInternSearch={handleInternSearch}
          showInternSuggestions={showInternSuggestions}
          internSuggestions={internSuggestions}
          handleSelectIntern={handleSelectIntern}
          internFormData={internFormData}
          handleAddIntern={handleAddIntern}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}
