import { useState, useEffect} from "react";
import hrApi from "../../../../api/hrApi";

export const useTeamActions = (token, programs, setPrograms, selectedProgram, setSelectedProgram) => {
  const [viewingProgramTeams, setViewingProgramTeams] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamFormData, setTeamFormData] = useState({});
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [teamMentorSearch, setTeamMentorSearch] = useState("");
  const [programMentors, setProgramMentors] = useState([]);

    useEffect(() => {
      if (!selectedProgram || !token) return;

      const loadMentors = async () => {
        const res = await hrApi.getMentorsAssignedToProgram(token, selectedProgram.programId);
        setProgramMentors(res);
      };

      loadMentors();
    }, [selectedProgram, token]);
   const fetchProgramMentors = async (programId) => {
      try {
        const mentors = await hrApi.getMentorsForProgram(token, programId);
        setProgramMentors(mentors);
      } catch (err) {
        console.error("Error fetching program mentors:", err);
        setProgramMentors([]);
      }
    };

const handleViewTeams = async (program) => {
  try {
    const teams = await hrApi.getTeamsInProgram(token, program.programId);

    // Fetch all mentors assigned to this program
    const mentors = await hrApi.getMentorsForProgram(token, program.programId);

    const programWithTeams = { ...program, teams, mentorPrograms: mentors };

    setViewingProgramTeams(programWithTeams);
    setSelectedProgram(programWithTeams);

    // Reset selected team when switching programs
    setSelectedTeam(null);
  } catch (err) {
    console.error("Error fetching teams:", err);
  }
};


const handleRefreshCurrentTeam = async () => {
  if (!selectedTeam || !viewingProgramTeams) return;

  try {
    const teams = await hrApi.getTeamsInProgram(token, viewingProgramTeams.programId);
    const updatedSelectedTeam = teams.find((t) => t.teamId === selectedTeam.teamId);

    // Fetch full intern details for this team
    const interns = await hrApi.getInternsInTeam(token, selectedTeam.teamId);
    const selectedTeamWithInterns = { ...updatedSelectedTeam, interns };

    const updatedProgram = { ...viewingProgramTeams, teams };
    setViewingProgramTeams(updatedProgram);
    setSelectedProgram(updatedProgram);
    setSelectedTeam(selectedTeamWithInterns);

    setPrograms((prev) =>
      prev.map((p) =>
        p.programId === viewingProgramTeams.programId ? updatedProgram : p
      )
    );
  } catch (err) {
    console.error("Error refreshing team:", err);
  }
};


  const handleAddTeam = () => {
    setSelectedTeam(null); // important
    setTeamFormData({ mentorId: null, name: "", description: "" });
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

    // Fetch updated list from backend instead of filtering
    const teams = await hrApi.getTeamsInProgram(token, selectedProgram.programId);

    const updatedProgram = { ...selectedProgram, teams };

    setPrograms(prev =>
      prev.map(p =>
        p.programId === selectedProgram.programId ? updatedProgram : p
      )
    );

    setSelectedProgram(updatedProgram);
    setViewingProgramTeams(updatedProgram);

    if (selectedTeam?.teamId === teamId) setSelectedTeam(null);
    await fetchProgramMentors(updatedProgram.programId);
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
      setTeamFormData({ mentorId: null, name: "", description: "" });
      await fetchProgramMentors(selectedProgram.programId);
    } catch (err) {
      console.error("Error saving team:", err);
    }
  };

const handleAssignMentorToTeam = async (mentorId, teamId) => {
  try {
    // Update team in backend
    await hrApi.updateTeam(token, teamId, { mentorId });

    // 1. Update the selected team locally
    if (selectedTeam?.teamId === teamId) {
      setSelectedTeam({ ...selectedTeam, mentorId });
    }

    // 2. Update the program's teams list
    const updatedProgram = {
      ...selectedProgram,
      teams: selectedProgram.teams.map((t) =>
        t.teamId === teamId ? { ...t, mentorId } : t
      ),
    };
    setSelectedProgram(updatedProgram);
    setViewingProgramTeams(updatedProgram);
    setPrograms((prev) =>
      prev.map((p) =>
        p.programId === selectedProgram.programId ? updatedProgram : p
      )
    );

    // 3. Refresh mentors assigned to this program
    const mentors = await hrApi.getMentorsForProgram(token, selectedProgram.programId);
    setProgramMentors(mentors);

  } catch (err) {
    console.error("Error assigning mentor:", err);
  }
};



  const handleSelectTeam = async (team) => {
    try {
      // Fetch interns for this team
      const interns = await hrApi.getInternsInTeam(token, team.teamId);

      const teamWithInterns = { ...team, interns };
      setSelectedTeam(teamWithInterns);
    //  await fetchProgramMentors(selectedProgram.programId);
    } catch (err) {
      console.error("Error fetching interns for team:", err);
      setSelectedTeam({ ...team, interns: [] });
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
    programMentors,
    setProgramMentors,
    teamMentorSearch,
    setTeamMentorSearch,
    handleViewTeams,
    handleRefreshCurrentTeam,
    handleAddTeam,
    handleEditTeam,
    handleDeleteTeam,
    handleSaveTeam,
    handleAssignMentorToTeam,
    handleSelectTeam,
  };
};