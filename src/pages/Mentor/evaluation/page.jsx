
import ProgramListPage from "./ProgramListPage";
import TeamListPage from "./TeamListPage";
import EvaluationPage from "./EvaluationPage";
import { useState, useEffect } from "react";

export default function Page() {
  const [currentPage, setCurrentPage] = useState("programs");
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [displayName, setDisplayName] = useState(null);

  const handleSelectProgram = (programId) => {
    setSelectedProgram(programId);
    setCurrentPage("teams");
  };

  const handleSelectTeam = (teamId,display_name) => {
    setSelectedTeam(teamId);
    setDisplayName(display_name);
    setCurrentPage("evaluation");
  };

  const handleBackToPrograms = () => {
    setSelectedProgram(null);
    setSelectedTeam(null);
    setCurrentPage("programs");
  };

  const handleBackToTeams = () => {
    setSelectedTeam(null);
    setCurrentPage("teams");
  };

  useEffect(() => {
    if (selectedTeam != null) {
      console.log("selectedteam state updated:", selectedTeam);
    }
  }, [selectedTeam]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      {currentPage === "programs" && (
        <ProgramListPage onSelectProgram={handleSelectProgram} />
      )}

      {currentPage === "teams" && selectedProgram && (
        <TeamListPage
          programId={selectedProgram}
          onSelectTeam={handleSelectTeam}
          onBack={handleBackToPrograms}
        />
      )}

      {currentPage === "evaluation" && selectedTeam && (
        <EvaluationPage teamId={selectedTeam} display_name={displayName} onBack={handleBackToTeams} />
      )}
    </div>
  );
}
