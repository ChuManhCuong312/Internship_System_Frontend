import { useState } from "react";
import hrApi from "../../../../api/hrApi";

export const useProgramActions = (token, programs, setPrograms, setProgramOverview) => {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [formData, setFormData] = useState({});
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [isEditProgramOpen, setIsEditProgramOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);
  const [isAssignMentorProgramOpen, setIsAssignMentorProgramOpen] = useState(false);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    date.setHours(23, 59, 59, 0);
    const pad = (n) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const handleAddProgram = () => {
    setFormData({ programStatus: "UPCOMING", maxInterns: 50 });
    setSelectedProgram(null);
    setIsAddProgramOpen(true);
  };

  const handleEditProgram = (program) => {
    setFormData(program);
    setSelectedProgram(program);
    setIsEditProgramOpen(true);
  };

  const handleDeleteProgram = async () => {
    if (!programToDelete) return;

    try {
      await hrApi.deleteProgram(token, programToDelete.programId);
      setPrograms(programs.filter((p) => p.programId !== programToDelete.programId));
      setIsDeleteModalOpen(false);
      setProgramToDelete(null);
    } catch (err) {
      console.error("Error deleting program:", err);
    }
  };

  const handleSaveProgram = async () => {
    try {
      const payload = {
        ...formData,
        startDate: formatDateTime(formData.startDate),
        endDate: formatDateTime(formData.endDate),
      };

      if (selectedProgram) {
        const updatedProgram = await hrApi.updateProgram(token, selectedProgram.programId, payload);
        setPrograms((prevPrograms) => {
          const others = prevPrograms.filter((p) => p.programId !== updatedProgram.programId);
          return [updatedProgram, ...others];
        });
        setIsEditProgramOpen(false);
      } else {
        const newProgram = await hrApi.createProgram(token, payload);
        setPrograms((prevPrograms) => [newProgram, ...prevPrograms]);
        setIsAddProgramOpen(false);
      }

      setFormData({});
    } catch (err) {
      console.error("Error saving program:", err);
    }
  };

  const handleCloneProgram = async (program) => {
    try {
      const template = await hrApi.getCloneTemplate(token, program.programId);
      console.log(template);
      setFormData({
        name: template.name || "",
        detail: template.details || "", // API returns 'details', form expects 'detail'
        department: template.department || "",
        programStatus: "UPCOMING", // Default for cloned programs
        maxInterns: template.maxInterns || 50,
        startDate: "",
        endDate: "",
      });
      setSelectedProgram(null);
      setIsAddProgramOpen(true);
    } catch (err) {
      console.error("Cannot clone program:", err);
    }
  };

  const openAssignMentorProgramModal = async (program) => {
    setSelectedProgram(program);
    try {
      const assigned = await hrApi.getMentorsAssignedToProgram(token, program.programId);
      setSelectedProgram((prev) => ({ ...prev, mentorPrograms: assigned }));
    } catch (err) {
      console.error("Error fetching assigned mentors:", err);
    }
    setIsAssignMentorProgramOpen(true);
  };

  const handleAssignProgramMentor = async () => {
    try {
      const updatedProgramMentors = await hrApi.getMentorsAssignedToProgram(token, selectedProgram.programId);

      setPrograms((prevPrograms) =>
        prevPrograms.map((p) =>
          p.programId === selectedProgram.programId ? { ...p, mentorPrograms: updatedProgramMentors } : p
        )
      );

      const overview = await hrApi.getProgramOverview(token, selectedProgram.programId);
      setProgramOverview((prev) => ({
        ...prev,
        [selectedProgram.programId]: overview,
      }));
    } catch (err) {
      console.error("Error refreshing program mentors:", err);
    }
  };

  return {
    selectedProgram,
    setSelectedProgram,
    formData,
    setFormData,
    isAddProgramOpen,
    setIsAddProgramOpen,
    isEditProgramOpen,
    setIsEditProgramOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    programToDelete,
    setProgramToDelete,
    isAssignMentorProgramOpen,
    setIsAssignMentorProgramOpen,
    handleAddProgram,
    handleEditProgram,
    handleDeleteProgram,
    handleSaveProgram,
    handleCloneProgram,
    openAssignMentorProgramModal,
    handleAssignProgramMentor,
  };
};