import { Plus } from "lucide-react";
import "../../../styles/program-management.css";
import HRSidebar from "../../../components/Layout/HRSidebar";
import ProgramFormModal from "./modals/ProgramFormModal";
import AddEditTeamModal from "./modals/AddEditTeamModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import AssignMentorToProgramModal from "./modals/AssignMentorToProgramModal";
import Pagination from "../../../components/Common/Pagination";
import ProgramList from "./components/ProgramList";
import TeamsView from "./components/TeamsView";
import FilterSection from "./components/FilterSection";
import { useProgramManagement } from "./hooks/useProgramManagement";
import { useProgramActions } from "./hooks/useProgramActions";
import { useTeamActions } from "./hooks/useTeamActions";

export default function ProgramManagement() {
  // Custom hooks
  const programData = useProgramManagement();
  const programActions = useProgramActions(
    programData.token,
    programData.programs,
    programData.setPrograms,
    programData.setProgramOverview
  );
  const teamActions = useTeamActions(
    programData.token,
    programData.programs,
    programData.setPrograms,
    programActions.selectedProgram,
    programActions.setSelectedProgram
  );

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
        <div className="max-width-container">
          {/* Header */}
          <div className="header-section">
            <div className="header-content">
              <div>
                <h1 className="header-title">
                  {!teamActions.viewingProgramTeams
                    ? "Quản lý chương trình thực tập"
                    : `Teams of ${teamActions.viewingProgramTeams.name}`}
                </h1>
                <p className="header-subtitle">
                  {!teamActions.viewingProgramTeams
                    ? "Quản lý thực tập sinh, teams, và phân công mentor"
                    : "Quản lý các teams và phân công mentor trong chương trình này"}
                </p>
              </div>
              <button
                className={`btn ${!teamActions.viewingProgramTeams ? "btn-primary" : "btn-secondary"}`}
                onClick={!teamActions.viewingProgramTeams ? programActions.handleAddProgram : teamActions.handleAddTeam}
              >
                <Plus size={16} />{" "}
                {!teamActions.viewingProgramTeams ? "Thêm Chương trình" : "Thêm Team"}
              </button>
            </div>

            {/* Filters */}
            {!teamActions.viewingProgramTeams && (
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
            )}
          </div>

          {/* Main Content */}
          {!teamActions.viewingProgramTeams ? (
            <ProgramList
              programs={filteredPrograms}
              programOverview={programData.programOverview}
              onViewTeams={teamActions.handleViewTeams}
              onEditProgram={programActions.handleEditProgram}
              onDeleteProgram={(program) => {
                programActions.setProgramToDelete(program);
                programActions.setIsDeleteModalOpen(true);
              }}
              onCloneProgram={programActions.handleCloneProgram}
              onAssignMentor={programActions.openAssignMentorProgramModal}
              formatLocalDate={formatLocalDate}
              getStatusColor={getStatusColor}
            />
          ) : (
            <TeamsView
              program={teamActions.viewingProgramTeams}
              assignedMentors={programData.assignedMentors}
              onEditTeam={teamActions.handleEditTeam}
              onDeleteTeam={teamActions.handleDeleteTeam}
              onBack={() => teamActions.setViewingProgramTeams(null)}
            />
          )}
        </div>

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
          programMentors={programActions.selectedProgram?.mentorPrograms || []}
        />

        {!teamActions.viewingProgramTeams && (
          <Pagination
            currentPage={programData.currentPage}
            totalPages={programData.totalPages}
            totalItems={programData.totalItems}
            onPageChange={(page) => programData.setCurrentPage(page)}
          />
        )}
      </div>
    </div>
  );
}