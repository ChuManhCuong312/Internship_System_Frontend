import { useState } from "react";
import hrApi from "../../../../api/hrApi";
import { toast } from "react-toastify";

export const useProgramActions = (token, programs, setPrograms, setProgramOverview) => {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [formData, setFormData] = useState({});
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [isEditProgramOpen, setIsEditProgramOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);
  const [isAssignMentorProgramOpen, setIsAssignMentorProgramOpen] = useState(false);

  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [programToFinish, setProgramToFinish] = useState(null);

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
      toast.success("Xóa chương trình thành công!");
      setIsDeleteModalOpen(false);
      setProgramToDelete(null);
    } catch (err) {
      console.error("Error deleting program:", err);
      toast.error(err?.response?.data?.message || "Xóa chương trình thất bại!");
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
        toast.success("Cập nhật chương trình thành công!");
        setIsEditProgramOpen(false);
      } else {
        const newProgram = await hrApi.createProgram(token, payload);
        setPrograms((prevPrograms) => [newProgram, ...prevPrograms]);
        toast.success("Thêm chương trình thành công!");
        setIsAddProgramOpen(false);
      }

      setFormData({});
    } catch (err) {
      console.error("Error saving program:", err);
      toast.error(err?.response?.data?.message || "Lưu chương trình thất bại!");
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
      toast.success("Tải dữ liệu nhân bản thành công! Bạn có thể chỉnh sửa và lưu.");
      setSelectedProgram(null);
      setIsAddProgramOpen(true);
    } catch (err) {
      console.error("Cannot clone program:", err);
      toast.error(err?.response?.data?.message || "Không thể nhân bản chương trình!");
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

      toast.success("Phân công mentor thành công!");
    } catch (err) {
      console.error("Error refreshing program mentors:", err);
      toast.error(err?.response?.data?.message || "Phân công mentor thất bại!");
    }
  };

   const handleFinishProgramClick = (program) => {
      setProgramToFinish(program);
      setIsFinishModalOpen(true);
    };

  const handleConfirmFinishProgram = async () => {
    if (!programToFinish) return;

    try {
      const response = await hrApi.finishProgram(token, programToFinish.programId);

      // Update the program status in the UI
      setPrograms((prevPrograms) =>
        prevPrograms.map((p) =>
          p.programId === programToFinish.programId
            ? { ...p, programStatus: "FINISHED" }
            : p
        )
      );

      // Show success toast with details
      toast.success(
        `Chương trình "${programToFinish.name}" đã được kết thúc. ${response.updatedInterns} tài khoản thực tập sinh đã bị vô hiệu hóa.`,
        {
          position: "top-right",
          autoClose: 5000,
        }
      );

      // Close modal and reset
      setIsFinishModalOpen(false);
      setProgramToFinish(null);
    } catch (err) {
      console.error("Error finishing program:", err);
      toast.error(
        err?.response?.data?.message || "Không thể kết thúc chương trình. Vui lòng thử lại.",
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
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
    isFinishModalOpen,
    setIsFinishModalOpen,
    programToFinish,
    handleFinishProgramClick,
    handleConfirmFinishProgram,
  };
};