import React, { useState } from "react";
import ProgramSelectPage from "./ProgramSelectPage";
import TasksManagementPage from "./TasksManagementPage";

export default function TasksWrapper() {
  const [currentPage, setCurrentPage] = useState("programs");
  const [selectedProgram, setSelectedProgram] = useState(null);

  const handleSelectProgram = (programId) => {
    setSelectedProgram(programId);
    setCurrentPage("tasks");
  };

  const handleBackToPrograms = () => {
    setSelectedProgram(null);
    setCurrentPage("programs");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      {currentPage === "programs" && (
        <ProgramSelectPage onSelectProgram={handleSelectProgram} />
      )}
      {currentPage === "tasks" && selectedProgram && (
        <TasksManagementPage
          programId={selectedProgram}
          onBack={handleBackToPrograms}
        />
      )}
    </div>
  );
}
