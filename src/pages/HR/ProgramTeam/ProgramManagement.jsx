import { useState } from "react"
import { Plus, MoreVertical, Search, X, Phone } from "lucide-react"
import "../../../styles/program-management.css"
import HRSidebar from "../../../components/Layout/HRSidebar";
import Pagination from "../../../components/Common/Pagination";
import hrApi from "../../../api/hrApi";
import { AuthContext } from "../../../context/AuthContext";
import ProgramFormModal from "./modals/ProgramFormModal";
import TeamManagementModal from "./modals/TeamManagementModal";
import AddEditTeamModal from "./modals/AddEditTeamModal";
import AddInternModal from "./modals/AddInternModal";



// ✅ Mock Data
const mockMentors = [
  { mentor_id: 1, name: "Dr. Sarah Johnson", department: "Engineering", expertise: "Software Development", assigned_interns: 8 },
  { mentor_id: 2, name: "Prof. Mike Chen", department: "Engineering", expertise: "Systems Design", assigned_interns: 5 },
  { mentor_id: 3, name: "Jane Williams", department: "Product", expertise: "Product Strategy", assigned_interns: 3 },
  { mentor_id: 4, name: "Dr. Alex Rodriguez", department: "Data Science", expertise: "Machine Learning", assigned_interns: 6 },
  { mentor_id: 5, name: "Dr. Emily Brown", department: "Design", expertise: "UX/UI", assigned_interns: 4 },
];

const availableInterns = [
  { intern_id: "1", name: "Sarah Johnson", phone: "555-0101", email: "sarah.j@email.com", major: "Computer Science", school: "State University" },
  { intern_id: "2", name: "Michael Chen", phone: "555-0102", email: "m.chen@email.com", major: "Engineering", school: "Tech Institute" },
  { intern_id: "3", name: "Emma Davis", phone: "555-0103", email: "emma.d@email.com", major: "Business", school: "Commerce College" },
  { intern_id: "4", name: "James Wilson", phone: "555-0104", email: "j.wilson@email.com", major: "Software Engineering", school: "Tech Institute" },
  { intern_id: "5", name: "Sophia Martinez", phone: "555-0105", email: "s.martinez@email.com", major: "Data Science", school: "State University" },
];


const mockPrograms = [
  {
    program_id: 1,
    name: "Summer Internship 2024",
    department: "Engineering",
    start_date: "2024-06-01",
    end_date: "2024-08-31",
    max_interns: 30,
    description: "A comprehensive summer internship program",
    mentors: [],
    teams: [
      {
        team_id: 1,
        name: "Backend Team",
        description: "Core backend services",
        mentor_id: null,
        interns: [],
      },
      {
        team_id: 2,
        name: "Frontend Team",
        description: "User interface development",
        mentor_id: null,
        interns: [],
      },
    ],
  },
]

export default function ProgramManagement() {
  const [programs, setPrograms] = useState(mockPrograms)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all-departments")
  const [filterMentor, setFilterMentor] = useState("all-mentors")

  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false)
  const [isEditProgramOpen, setIsEditProgramOpen] = useState(false)
  const [isAssignMentorOpen, setIsAssignMentorOpen] = useState(false)
  const [isTeamManagementOpen, setIsTeamManagementOpen] = useState(false)
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false)
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false)
  const [isAddInternOpen, setIsAddInternOpen] = useState(false)

  const [selectedProgram, setSelectedProgram] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [mentorSearch, setMentorSearch] = useState("")
  const [teamMentorSearch, setTeamMentorSearch] = useState("")
  const [formData, setFormData] = useState({})
  const [teamFormData, setTeamFormData] = useState({})
  const [internFormData, setInternFormData] = useState({})
  const [internSearchQuery, setInternSearchQuery] = useState("")
  const [internSuggestions, setInternSuggestions] = useState([])
  const [showInternSuggestions, setShowInternSuggestions] = useState(false)

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = filterDepartment === "all-departments" || program.department === filterDepartment
    const matchesMentor = filterMentor === "all-mentors" || program.mentors.some((m) => m.name === filterMentor)
    return matchesSearch && matchesDepartment && matchesMentor
  })

  const filteredMentors = mockMentors.filter((mentor) => mentor.name.toLowerCase().includes(mentorSearch.toLowerCase()))

  const allDepartments = ["Engineering", "Product", "Data Science", "Design", "Marketing", "Finance"]
  const allMentorNames = mockMentors.map((m) => m.name)

  const handleAddProgram = () => {
    setFormData({ program_status: "UPCOMING", max_interns: 50 })
    setSelectedProgram(null)
    setIsAddProgramOpen(true)
  }

  const handleEditProgram = (program) => {
    setFormData(program)
    setSelectedProgram(program)
    setIsEditProgramOpen(true)
  }

  const handleCloneProgram = (program) => {
    const newProgram = {
      ...program,
      program_id: Math.max(...programs.map((p) => p.program_id), 0) + 1,
      name: `${program.name} (Copy)`,
      program_status: "UPCOMING",
      start_date: "",
      end_date: "",
      mentors: [],
      teams: [],
    }
    setFormData(newProgram)
    setSelectedProgram(null)
    setIsAddProgramOpen(true)
  }

  const handleDeleteProgram = (programId) => {
    setPrograms(programs.filter((p) => p.program_id !== programId))
  }

  const handleSaveProgram = () => {
    if (selectedProgram) {
      setPrograms(programs.map((p) => (p.program_id === selectedProgram.program_id ? { ...p, ...formData } : p)))
      setIsEditProgramOpen(false)
    } else {
      const newProgram = {
        program_id: Math.max(...programs.map((p) => p.program_id), 0) + 1,
        name: formData.name || "",
        department: formData.department || "",
        start_date: formData.start_date || "",
        end_date: formData.end_date || "",
        program_status: formData.program_status,
        detail: formData.detail || "",
        max_interns: formData.max_interns || 50,
        mentors: formData.mentors || [],
        teams: formData.teams || [],
      }
      setPrograms([...programs, newProgram])
      setIsAddProgramOpen(false)
    }
    setFormData({})
  }

  const handleAddTeam = () => {
    setTeamFormData({})
    setIsAddTeamOpen(true)
  }

  const handleEditTeam = (team) => {
    setTeamFormData(team)
    setSelectedTeam(team)
    setIsEditTeamOpen(true)
  }

  const handleDeleteTeam = (teamId) => {
    if (selectedProgram) {
      const updatedProgram = {
        ...selectedProgram,
        teams: selectedProgram.teams.filter((t) => t.team_id !== teamId),
      }
      setPrograms(programs.map((p) => (p.program_id === selectedProgram.program_id ? updatedProgram : p)))
      setSelectedProgram(updatedProgram)
    }
  }

  const handleSaveTeam = () => {
    if (selectedProgram) {
      let updatedProgram = selectedProgram
      if (selectedTeam) {
        updatedProgram = {
          ...selectedProgram,
          teams: selectedProgram.teams.map((t) => (t.team_id === selectedTeam.team_id ? { ...t, ...teamFormData } : t)),
        }
        setIsEditTeamOpen(false)
      } else {
        const newTeam = {
          team_id: Math.max(...selectedProgram.teams.map((t) => t.team_id), 0) + 1,
          name: teamFormData.name || "",
          description: teamFormData.description || "",
          mentor_id: teamFormData.mentor_id || null,
          interns: teamFormData.interns || [],
        }
        updatedProgram = {
          ...selectedProgram,
          teams: [...selectedProgram.teams, newTeam],
        }
        setIsAddTeamOpen(false)
      }
      setPrograms(programs.map((p) => (p.program_id === selectedProgram.program_id ? updatedProgram : p)))
      setSelectedProgram(updatedProgram)
      setTeamFormData({})
    }
  }

  const handleAddIntern = () => {
    if (selectedTeam && selectedProgram && Object.keys(internFormData).length > 0) {
      const updatedTeam = {
        ...selectedTeam,
        interns: [...selectedTeam.interns, { ...internFormData, intern_id: Math.random().toString() }],
      }
      const updatedProgram = {
        ...selectedProgram,
        teams: selectedProgram.teams.map((t) => (t.team_id === selectedTeam.team_id ? updatedTeam : t)),
      }
      setPrograms(programs.map((p) => (p.program_id === selectedProgram.program_id ? updatedProgram : p)))
      setSelectedTeam(updatedTeam)
      setSelectedProgram(updatedProgram)
      setInternFormData({})
      setInternSearchQuery("")
      setIsAddInternOpen(false)
    }
  }

  const handleRemoveIntern = (internId) => {
    if (selectedTeam && selectedProgram) {
      const updatedTeam = {
        ...selectedTeam,
        interns: selectedTeam.interns.filter((i) => i.intern_id !== internId),
      }
      const updatedProgram = {
        ...selectedProgram,
        teams: selectedProgram.teams.map((t) => (t.team_id === selectedTeam.team_id ? updatedTeam : t)),
      }
      setPrograms(programs.map((p) => (p.program_id === selectedProgram.program_id ? updatedProgram : p)))
      setSelectedTeam(updatedTeam)
      setSelectedProgram(updatedProgram)
    }
  }

  const handleInternSearch = (query) => {
    setInternSearchQuery(query)
    if (query.trim().length > 0) {
      const filtered = availableInterns.filter(
        (intern) =>
          intern.name.toLowerCase().includes(query.toLowerCase()) &&
          !selectedTeam?.interns.some((t) => t.intern_id === intern.intern_id),
      )
      setInternSuggestions(filtered)
      setShowInternSuggestions(true)
    } else {
      setInternSuggestions([])
      setShowInternSuggestions(false)
    }
  }

  const handleSelectIntern = (intern) => {
    setInternFormData({
      intern_id: intern.intern_id,
      name: intern.name,
      phone: intern.phone,
      email: intern.email,
      major: intern.major,
      school: intern.school,
    })
    setInternSearchQuery(intern.name)
    setShowInternSuggestions(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "ON_GOING":
        return "status-ongoing"
      case "UPCOMING":
        return "status-upcoming"
      case "FINISHED":
        return "status-finished"
      default:
        return "status-default"
    }
  }

  const isDatePassed = (startDate) => {
    return new Date(startDate) < new Date()
  }

  return (
      <div className="dashboard-layout">
              <HRSidebar />
    <div className="program-management-container">
      <div className="max-width-container">
        {/* Header */}
        <div className="header-section">
          <div className="header-content">
            <div>
              <h1 className="header-title">Quản lý chương trình thực tập</h1>
              <p className="header-subtitle">Quản lý thực tập sinh, teams, và phân công mentor</p>
            </div>
            <button className="btn btn-primary" onClick={handleAddProgram}>
              <Plus size={16} />
              Thêm Chương trình
            </button>
          </div>

          {/* Search and Filter */}
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
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                <select value={filterMentor} onChange={(e) => setFilterMentor(e.target.value)} className="select">
                  <option value="all-mentors">Lọc theo mentor</option>
                  {allMentorNames.map((mentor) => (
                    <option key={mentor} value={mentor}>
                      {mentor}
                    </option>
                  ))}
                </select>
              </div>

              {(searchTerm || filterDepartment !== "all-departments" || filterMentor !== "all-mentors") && (
                <div className="filter-actions">
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => {
                      setSearchTerm("")
                      setFilterDepartment("all-departments")
                      setFilterMentor("all-mentors")
                    }}
                  >
                    Bỏ bộ lọc
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="programs-list">
          {filteredPrograms.length === 0 ? (
            <div className="card empty-state">
              <p className="empty-state-text">Không tìm thấy chương trình</p>
            </div>
          ) : (
            filteredPrograms.map((program) => (
              <div key={program.program_id} className="card program-card">
                <div className="program-header">
                  <div className="program-title-section">
                    <h2 className="program-title">{program.name}</h2>
                    <span className={`status-badge ${getStatusColor(program.program_status)}`}>
                      {program.program_status}
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
                          setSelectedProgram(program)
                          setIsTeamManagementOpen(true)
                        }}
                      >
                        Xem teams
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={() => handleEditProgram(program)}
                        disabled={isDatePassed(program.start_date)}
                      >
                        Cập nhật chương trình
                      </button>
                      <button className="dropdown-item" onClick={() => handleCloneProgram(program)}>
                        Sao chép chương trình
                      </button>
                      <button className="dropdown-item danger" onClick={() => handleDeleteProgram(program.program_id)}>
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
                    <p className="stat-value">{program.start_date}</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-label">Ngày kết thúc</p>
                    <p className="stat-value">{program.end_date}</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-label">Số lượng mentor</p>
                    <p className="stat-value">{program.mentors.length}</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-label">Số lượng teams</p>
                    <p className="stat-value">{program.teams.length}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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

      <TeamManagementModal
        isOpen={isTeamManagementOpen}
        onClose={() => setIsTeamManagementOpen(false)}
        selectedProgram={selectedProgram}
        handleAddTeam={handleAddTeam}
        handleEditTeam={handleEditTeam}
        handleDeleteTeam={handleDeleteTeam}
        mockMentors={mockMentors}
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
        teamMentorSearch={teamMentorSearch}
        setTeamMentorSearch={setTeamMentorSearch}
        mockMentors={mockMentors}
        handleRemoveIntern={handleRemoveIntern}
        setIsAddInternOpen={setIsAddInternOpen}
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

    </div>
    </div>
  )
}
