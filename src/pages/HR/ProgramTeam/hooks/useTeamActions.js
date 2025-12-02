import { useState } from "react";
import hrApi from "../../../../api/hrApi";

export const useTeamActions = (token, programs, setPrograms, selectedProgram, setSelectedProgram) => {
  const [viewingProgramTeams, setViewingProgramTeams] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamFormData, setTeamFormData] = useState({});
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [teamMentorSearch, setTeamMentorSearch] = useState("");

  const handleViewTeams = async (program) => {
    try {
      const teams = await hrApi.getTeamsInProgram(token, program.programId);
      setViewingProgramTeams({ ...program, teams });
      setSelectedProgram({ ...program, teams });
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  };

  const handleAddTeam = () => {
    setTeamFormData({});
    setIsAddTeamOpen(true);
  };

  const handleEditTeam = (team) => {
    setTeamFormData(team);
    setSelectedTeam(team);
    setIsEditTeamOpen(true);
  };

  const handleDeleteTeam = async (teamId) => {
    if (!selectedProgram) return;

    try {
      await hrApi.deleteTeam(token, teamId);

      const updatedProgram = {
        ...selectedProgram,
        teams: selectedProgram.teams.filter((t) => t.teamId !== teamId),
      };

      setPrograms((prev) =>
        prev.map((p) => (p.programId === selectedProgram.programId ? updatedProgram : p))
      );
      setSelectedProgram(updatedProgram);
      setViewingProgramTeams(updatedProgram);
    } catch (err) {
      console.error("Error deleting team:", err);
    }
  };

  const handleSaveTeam = async () => {
    if (!selectedProgram) return;

    try {
      let updatedProgram;

      if (selectedTeam) {
        const updatedTeam = await hrApi.updateTeam(token, selectedTeam.teamId, { ...teamFormData });

        updatedProgram = {
          ...selectedProgram,
          teams: selectedProgram.teams.map((t) => (t.teamId === selectedTeam.teamId ? updatedTeam : t)),
        };
        setIsEditTeamOpen(false);
      } else {
        const newTeam = await hrApi.createTeam(token, {
          programId: selectedProgram.programId,
          ...teamFormData,
        });

        updatedProgram = {
          ...selectedProgram,
          teams: [...(selectedProgram.teams || []), newTeam],
        };
        setIsAddTeamOpen(false);
      }

      setPrograms((prev) =>
        prev.map((p) => (p.programId === selectedProgram.programId ? updatedProgram : p))
      );
      setSelectedProgram(updatedProgram);
      setViewingProgramTeams(updatedProgram);
      setTeamFormData({ mentorId: null });
    } catch (err) {
      console.error("Error saving team:", err);
    }
  };

  const handleAssignMentorToTeam = async (mentorId, teamId) => {
    try {
      await hrApi.assignMentorToTeam(token, selectedProgram.programId, mentorId);

      const updatedProgram = {
        ...selectedProgram,
        teams: selectedProgram.teams.map((t) => (t.teamId === teamId ? { ...t, mentorId } : t)),
      };
      setSelectedProgram(updatedProgram);
      setPrograms((prev) =>
        prev.map((p) => (p.programId === selectedProgram.programId ? updatedProgram : p))
      );
    } catch (err) {
      console.error("Error assigning mentor:", err);
    }
  };

  return {
    viewingProgramTeams,
    setViewingProgramTeams,
    selectedTeam,
    setSelectedTeam,
    teamFormData,
    setTeamFormData,
    isAddTeamOpen,
    setIsAddTeamOpen,
    isEditTeamOpen,
    setIsEditTeamOpen,
    teamMentorSearch,
    setTeamMentorSearch,
    handleViewTeams,
    handleAddTeam,
    handleEditTeam,
    handleDeleteTeam,
    handleSaveTeam,
    handleAssignMentorToTeam,
  };
};