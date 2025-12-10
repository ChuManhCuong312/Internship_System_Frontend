import React, { useState, useEffect } from "react";
import ProgramSelectPage from "./ProgramSelectPage";
import TasksManagementPage from "./TasksManagementPage";

export default function TasksWrapper() {
  const [currentPage, setCurrentPage] = useState("programs");
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Initialize state from localStorage on mount
  useEffect(() => {
    const savedProgram = localStorage.getItem("selectedTaskProgram");
    const savedPage = localStorage.getItem("currentTaskPage");
    
    if (savedProgram && savedPage === "tasks") {
      setSelectedProgram(parseInt(savedProgram));
      setCurrentPage("tasks");
    }
  }, []);

  const handleSelectProgram = (programId) => {
    setSelectedProgram(programId);
    setCurrentPage("tasks");
    // Save to localStorage
    localStorage.setItem("selectedTaskProgram", programId);
    localStorage.setItem("currentTaskPage", "tasks");
  };

  const handleBackToPrograms = () => {
    setSelectedProgram(null);
    setCurrentPage("programs");
    // Clear localStorage
    localStorage.removeItem("selectedTaskProgram");
    localStorage.removeItem("currentTaskPage");
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
