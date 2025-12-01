import ProgramListPage from "./ProgramListPage";
import TeamListPage from "./TeamListPage";
import EvaluationPage from "./EvaluationPage";
import { useState } from "react"

export default function page() {
  const [currentPage, setCurrentPage] = useState("programs")
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)

  const handleSelectProgram = (programId) => {
    setSelectedProgram(programId)
    setCurrentPage("teams")
  }

  const handleSelectTeam = (teamId) => {
    setSelectedTeam(teamId)
    setCurrentPage("evaluation")
  }

  const handleBackToPrograms = () => {
    setSelectedProgram(null)
    setSelectedTeam(null)
    setCurrentPage("programs")
  }

  const handleBackToTeams = () => {
    setSelectedTeam(null)
    setCurrentPage("teams")
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      {currentPage === "programs" && <ProgramListPage onSelectProgram={handleSelectProgram} />}
      {currentPage === "teams" && selectedProgram && (
        <TeamListPage programId={selectedProgram} onSelectTeam={handleSelectTeam} onBack={handleBackToPrograms} />
      )}
      {currentPage === "evaluation" && selectedTeam && (
        <EvaluationPage teamId={selectedTeam} onBack={handleBackToTeams} />
      )}
    </div>
  )
}