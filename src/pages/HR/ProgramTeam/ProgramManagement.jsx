import { useState } from "react"
import { Plus, MoreVertical, Search, X, Phone } from "lucide-react"
import "../../../styles/program-management.css"
import HRSidebar from "../../../components/Layout/HRSidebar";
import Pagination from "../../../components/Common/Pagination";
import hrApi from "../../../api/hrApi";
import { AuthContext } from "../../../context/AuthContext";



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
              <h1 className="header-title">Program Management</h1>
              <p className="header-subtitle">Manage internship programs, teams, and assignments</p>
            </div>
            <button className="btn btn-primary" onClick={handleAddProgram}>
              <Plus size={16} />
              Add Program
            </button>
          </div>

          {/* Search and Filter */}
          <div className="card filter-card">
            <div className="filter-content">
              <div className="search-container">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search programs by name..."
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
                  <option value="all-departments">All departments</option>
                  {allDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                <select value={filterMentor} onChange={(e) => setFilterMentor(e.target.value)} className="select">
                  <option value="all-mentors">All mentors</option>
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
                    Reset Filters
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
              <p className="empty-state-text">No programs found</p>
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
                        View Teams
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={() => handleEditProgram(program)}
                        disabled={isDatePassed(program.start_date)}
                      >
                        Edit Program
                      </button>
                      <button className="dropdown-item" onClick={() => handleCloneProgram(program)}>
                        Clone Program
                      </button>
                      <button className="dropdown-item danger" onClick={() => handleDeleteProgram(program.program_id)}>
                        Delete Program
                      </button>
                    </div>
                  </div>
                </div>

                <p className="program-detail">{program.description}</p>

                <div className="program-stats">
                  <div className="stat-item">
                    <p className="stat-label">Department</p>
                    <p className="stat-value">{program.department}</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-label">Start Date</p>
                    <p className="stat-value">{program.start_date}</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-label">Mentors</p>
                    <p className="stat-value">{program.mentors.length}</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-label">Teams</p>
                    <p className="stat-value">{program.teams.length}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Program Modal */}
      {(isAddProgramOpen || isEditProgramOpen) && (
        <div
          className="modal-overlay"
          onClick={() => {
            setIsAddProgramOpen(false)
            setIsEditProgramOpen(false)
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedProgram ? "Edit Program" : "Add New Program"}</h2>
              <button
                className="btn-close"
                onClick={() => {
                  setIsAddProgramOpen(false)
                  setIsEditProgramOpen(false)
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Program Name</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  value={formData.department || ""}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="select"
                >
                  <option value="">Select Department</option>
                  {allDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date || ""}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="form-input"
                    disabled={selectedProgram && isDatePassed(selectedProgram.start_date)}
                  />
                  {selectedProgram && isDatePassed(selectedProgram.start_date) && (
                    <p className="form-hint">Start date is locked (program already started)</p>
                  )}
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.end_date || ""}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Details</label>
                <textarea
                  value={formData.detail || ""}
                  onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                  className="form-textarea"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Max Interns</label>
                <input
                  type="number"
                  value={formData.max_interns || ""}
                  onChange={(e) => setFormData({ ...formData, max_interns: Number.parseInt(e.target.value) })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setIsAddProgramOpen(false)
                  setIsEditProgramOpen(false)
                }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveProgram}>
                Save Program
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Management Modal */}
      {isTeamManagementOpen && selectedProgram && (
        <div className="modal-overlay" onClick={() => setIsTeamManagementOpen(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Teams</h2>
              <button className="btn-close" onClick={() => setIsTeamManagementOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Teams Section */}
              <div className="teams-section">
                <div className="section-header">
                  <h3>Teams</h3>
                  <button className="btn btn-primary btn-small" onClick={handleAddTeam}>
                    <Plus size={16} />
                    Add Team
                  </button>
                </div>

                <div className="teams-list">
                  {selectedProgram.teams.map((team) => {
                    const assignedMentor = mockMentors.find((m) => m.mentor_id === team.mentor_id)
                    return (
                      <div key={team.team_id} className="team-card">
                        <div className="team-header">
                          <div>
                            <h4 className="team-name">{team.name}</h4>
                            <p className="team-description">{team.description}</p>
                            {assignedMentor && (
                              <div className="team-mentor-info">
                                <span className="mentor-badge">
                                  Mentor: <strong>{assignedMentor.name}</strong> ({assignedMentor.department})
                                </span>
                              </div>
                            )}
                            {!assignedMentor && <p className="team-no-mentor">No mentor assigned</p>}
                          </div>
                          <div className="dropdown-menu-container">
                            <button className="btn-icon">
                              <MoreVertical size={16} />
                            </button>
                            <div className="dropdown-menu">
                              <button className="dropdown-item" onClick={() => handleEditTeam(team)}>
                                Edit Team
                              </button>
                              <button className="dropdown-item danger" onClick={() => handleDeleteTeam(team.team_id)}>
                                Delete Team
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="team-stats">
                          <span className="interns-count">{team.interns?.length || 0} interns</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsTeamManagementOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Team Modal */}
      {(isAddTeamOpen || isEditTeamOpen) && (
        <div
          className="modal-overlay"
          onClick={() => {
            setIsAddTeamOpen(false)
            setIsEditTeamOpen(false)
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedTeam ? "Edit Team" : "Add New Team"}</h2>
              <button
                className="btn-close"
                onClick={() => {
                  setIsAddTeamOpen(false)
                  setIsEditTeamOpen(false)
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Team Name</label>
                <input
                  type="text"
                  value={teamFormData.name || ""}
                  onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={teamFormData.description || ""}
                  onChange={(e) => setTeamFormData({ ...teamFormData, description: e.target.value })}
                  className="form-textarea"
                  rows={2}
                />
              </div>

              {/* Mentor Autocomplete Search */}
              <div className="form-group">
                <label>Assign Mentor to Team</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    placeholder="Search mentor by name..."
                    value={teamMentorSearch}
                    onChange={(e) => setTeamMentorSearch(e.target.value)}
                    className="form-input"
                  />

                  {teamMentorSearch && (
                    <div className="suggestions-list">
                      {mockMentors
                        .filter((mentor) => mentor.name.toLowerCase().includes(teamMentorSearch.toLowerCase()))
                        .map((mentor) => (
                          <div
                            key={mentor.mentor_id}
                            className="suggestion-item"
                            onClick={() => {
                              setTeamFormData({ ...teamFormData, mentor_id: mentor.mentor_id })
                              setTeamMentorSearch(mentor.name)
                            }}
                          >
                            <div>
                              <p className="suggestion-name">{mentor.name}</p>
                              <p className="suggestion-info">{mentor.department}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {teamFormData.mentor_id && (
                    <div className="selected-mentor">
                      <span className="mentor-badge">
                        {mockMentors.find((m) => m.mentor_id === teamFormData.mentor_id)?.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setTeamFormData({ ...teamFormData, mentor_id: null })
                          setTeamMentorSearch("")
                        }}
                        className="btn-remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {selectedTeam && (
                <div className="interns-section">
                  <div className="section-header">
                    <h4>Team Interns</h4>
                    <button className="btn btn-primary btn-small" onClick={() => setIsAddInternOpen(true)}>
                      <Plus size={16} />
                      Add Intern
                    </button>
                  </div>

                  <div className="interns-list">
                    {selectedTeam.interns &&
                      selectedTeam.interns.map((intern) => (
                        <div key={intern.intern_id} className="intern-item">
                          <div>
                            <p className="intern-name">{intern.name}</p>
                            <p className="intern-info">{intern.phone}</p>
                          </div>
                          <button className="btn-remove" onClick={() => handleRemoveIntern(intern.intern_id)}>
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setIsAddTeamOpen(false)
                  setIsEditTeamOpen(false)
                }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveTeam}>
                Save Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Intern Modal */}
      {isAddInternOpen && (
        <div className="modal-overlay" onClick={() => setIsAddInternOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Intern to Team</h2>
              <button className="btn-close" onClick={() => setIsAddInternOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Search Intern by Name</label>
                <div className="search-container-form">
                  <input
                    type="text"
                    placeholder="Type intern name..."
                    value={internSearchQuery}
                    onChange={(e) => handleInternSearch(e.target.value)}
                    className="form-input"
                  />

                  {showInternSuggestions && internSuggestions.length > 0 && (
                    <div className="suggestions-list">
                      {internSuggestions.map((intern) => (
                        <div
                          key={intern.intern_id}
                          className="suggestion-item"
                          onClick={() => handleSelectIntern(intern)}
                        >
                          <div>
                            <p className="suggestion-name">{intern.name}</p>
                            <p className="suggestion-info">
                              <Phone size={14} /> {intern.phone}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {Object.keys(internFormData).length > 0 && (
                <div className="selected-intern">
                  <div className="intern-details">
                    <p className="detail-label">Name:</p>
                    <p className="detail-value">{internFormData.name}</p>
                  </div>
                  <div className="intern-details">
                    <p className="detail-label">Phone:</p>
                    <p className="detail-value">{internFormData.phone}</p>
                  </div>
                  <div className="intern-details">
                    <p className="detail-label">Email:</p>
                    <p className="detail-value">{internFormData.email}</p>
                  </div>
                  <div className="intern-details">
                    <p className="detail-label">Major:</p>
                    <p className="detail-value">{internFormData.major}</p>
                  </div>
                  <div className="intern-details">
                    <p className="detail-label">School:</p>
                    <p className="detail-value">{internFormData.school}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsAddInternOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddIntern}
                disabled={Object.keys(internFormData).length === 0}
              >
                Add Intern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}
