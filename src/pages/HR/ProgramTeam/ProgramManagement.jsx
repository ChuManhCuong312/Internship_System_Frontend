import { Plus } from "lucide-react";
import "../../../styles/program-management.css";
import HRSidebar from "../../../components/Layout/HRSidebar";
import ProgramFormModal from "./modals/ProgramFormModal";
import AddEditTeamModal from "./modals/AddEditTeamModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import FinishProgramModal from "./modals/FinishProgramModal";
import AssignMentorToProgramModal from "./modals/AssignMentorToProgramModal";
import Pagination from "../../../components/Common/Pagination";
import ProgramList from "./components/ProgramList";
import TeamList from "./components/TeamList";
import InternDetails from "./components/InternDetails";
import FilterSection from "./components/FilterSection";
import { useProgramManagement } from "./hooks/useProgramManagement";
import { useProgramActions } from "./hooks/useProgramActions";
import { useTeamActions } from "./hooks/useTeamActions";
import { useNavigate } from "react-router-dom";

export default function ProgramManagement() {
  // Custom hooks
  const programData = useProgramManagement();
  const programActions = useProgramActions(
    programData.token,
    programData.programs,
    programData.setPrograms,
    programData.setProgramOverview,
    programData.triggerRefresh
  );
  const teamActions = useTeamActions(
    programData.token,
    programData.programs,
    programData.setPrograms,
    programActions.selectedProgram,
    programActions.setSelectedProgram
  );
  const navigate = useNavigate();

  // Handler when clicking "Tự động tạo teams"
  const handleCreateAutoTeam = (program) => {
    // save full selected program to programActions so other components (and modals) can use it
    programActions.setSelectedProgram && programActions.setSelectedProgram(program);

    // persist programId to sessionStorage so CreateTeamAuto can recover after refresh
    if (program?.programId) {
      sessionStorage.setItem("autoTeamProgramId", String(program.programId));
    }

    // navigate to the CreateTeamAuto page and pass state (nice for first load)
    navigate("/create-teams-auto", { state: { programId: program.programId } });
  };
  // Utility functions
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

  const formatLocalDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-CA");
  };

  const filteredPrograms = programData.programs.filter((program) => {
    if (!program?.name) return false;
    return programData.searchTerm
      ? program.name.toLowerCase().includes(programData.searchTerm.toLowerCase())
      : true;
  });

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="dashboard-content">
        {/* PROGRAM LIST VIEW */}
        {!teamActions.viewingProgramTeams && (
          <div className="max-width-container">
            <div className="header-section">
              <div className="header-content">
                <div>
                  <h1 className="header-title">Quản lý chương trình thực tập</h1>
                  <p className="header-subtitle">
                    Quản lý thực tập sinh, teams, và phân công mentor
                  </p>
                </div>
                <button className="btn btn-primary" onClick={programActions.handleAddProgram}>
                  <Plus size={16} /> Thêm Chương trình
                </button>
              </div>

              <FilterSection
                searchTerm={programData.searchTerm}
                setSearchTerm={programData.setSearchTerm}
                filterDepartment={programData.filterDepartment}
                setFilterDepartment={programData.setFilterDepartment}
                filterMentor={programData.filterMentor}
                setFilterMentor={programData.setFilterMentor}
                allDepartments={programData.allDepartments}
                assignedMentors={programData.assignedMentors}
                onResetFilters={programData.resetFilters}
              />
            </div>

            <ProgramList
              programs={filteredPrograms}
              programOverview={programData.programOverview}
              onViewTeams={teamActions.handleViewTeams}
              onCreateAutoTeam={handleCreateAutoTeam}
              onEditProgram={programActions.handleEditProgram}
              onDeleteProgram={(program) => {
                programActions.setProgramToDelete(program);
                programActions.setIsDeleteModalOpen(true);
              }}
              onCloneProgram={programActions.handleCloneProgram}
              onAssignMentor={programActions.openAssignMentorProgramModal}
              onFinishProgram={programActions.handleFinishProgramClick}
              formatLocalDate={formatLocalDate}
              getStatusColor={getStatusColor}
            />

            <Pagination
              currentPage={programData.currentPage}
              totalPages={programData.totalPages}
              totalItems={programData.totalItems}
              onPageChange={(page) => programData.setCurrentPage(page)}
            />
          </div>
        )}

        {/* TEAM MANAGEMENT VIEW (Two-panel layout) */}
        {teamActions.viewingProgramTeams && (
          <div className="team-management-container">
            {/* Left Panel - Team List */}
            <div className="team-sidebar">
              <div className="team-sidebar-content">
                <button
                  className="back-button"
                  onClick={() => teamActions.setViewingProgramTeams(null)}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Quay lại
                </button>

                <div className="team-sidebar-header">
                  <div>
                    <h2 className="team-sidebar-title">
                      {teamActions.viewingProgramTeams.name}
                    </h2>
                    <p className="team-sidebar-subtitle">Mô tả chương trình: {teamActions.viewingProgramTeams.detail}</p>
                    <p className="team-sidebar-subtitle">Danh sách teams</p>
                  </div>
                  <button
                    className="add-team-button"
                    onClick={teamActions.handleAddTeam}
                    title="Thêm team"
                    disabled={teamActions.viewingProgramTeams.programStatus !== "UPCOMING"}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <TeamList
                  teams={teamActions.viewingProgramTeams.teams || []}
                  selectedTeamId={teamActions.selectedTeam?.teamId}
                  onSelectTeam={(team) => teamActions.handleSelectTeam(team)}
                  assignedMentors={programData.assignedMentors}
                  programStatus={teamActions.viewingProgramTeams.programStatus}
                />
              </div>
            </div>

            {/* Right Panel - Intern Details */}
            <div className="main-panel">
              {teamActions.selectedTeam ? (
                <InternDetails
                  team={teamActions.selectedTeam}
                  teamIndex={
                    teamActions.viewingProgramTeams.teams?.findIndex(
                      (t) => t.teamId === teamActions.selectedTeam.teamId
                    ) || 0
                  }
                  programMentors={teamActions.programMentors || []}
                  onUpdateTeam={(mentorId, teamId) => {
                      teamActions.handleAssignMentorToTeam(mentorId, teamId);
                    }}
                  onDeleteTeam={teamActions.handleDeleteTeam}
                  onRefreshTeam={teamActions.handleRefreshCurrentTeam}
                  token={programData.token}
                  programId={teamActions.viewingProgramTeams.programId}
                  programStatus={teamActions.viewingProgramTeams.programStatus}
                />
              ) : (
                <div className="empty-state">
                  <div className="empty-state-content">
                    <p className="empty-state-text">Chọn một team để xem chi tiết</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODALS */}
        <ProgramFormModal
          isOpen={programActions.isAddProgramOpen || programActions.isEditProgramOpen}
          onClose={() => {
            programActions.setIsAddProgramOpen(false);
            programActions.setIsEditProgramOpen(false);
          }}
          onSave={programActions.handleSaveProgram}
          formData={programActions.formData}
          setFormData={programActions.setFormData}
          selectedProgram={programActions.selectedProgram}
          allDepartments={programData.allDepartments}
          isDatePassed={isDatePassed}
        />

        <DeleteConfirmModal
          isOpen={programActions.isDeleteModalOpen}
          onClose={() => programActions.setIsDeleteModalOpen(false)}
          onConfirm={programActions.handleDeleteProgram}
          programName={programActions.programToDelete?.name}
        />

        <FinishProgramModal
          isOpen={programActions.isFinishModalOpen}
          onClose={() => programActions.setIsFinishModalOpen(false)}
          onConfirm={programActions.handleConfirmFinishProgram}
          programName={programActions.programToFinish?.name}
        />

        {programActions.isAssignMentorProgramOpen && (
          <AssignMentorToProgramModal
            isOpen={programActions.isAssignMentorProgramOpen}
            onClose={() => programActions.setIsAssignMentorProgramOpen(false)}
            onAssign={programActions.handleAssignProgramMentor}
            assignedMentors={programActions.selectedProgram?.mentorPrograms || []}
            programId={programActions.selectedProgram?.programId}
          />
        )}

        <AddEditTeamModal
          isOpen={teamActions.isAddTeamOpen || teamActions.isEditTeamOpen}
          onClose={() => {
            teamActions.setIsAddTeamOpen(false);
            teamActions.setIsEditTeamOpen(false);
          }}
          onSave={teamActions.handleSaveTeam}
          selectedTeam={teamActions.selectedTeam}
          teamFormData={teamActions.teamFormData}
          setTeamFormData={teamActions.setTeamFormData}
          teamMentorSearch={teamActions.teamMentorSearch}
          setTeamMentorSearch={teamActions.setTeamMentorSearch}
          selectedProgram={programActions.selectedProgram}
          token={programData.token}
          programMentors={teamActions.programMentors}
        />
      </div>
    </div>
  );
}