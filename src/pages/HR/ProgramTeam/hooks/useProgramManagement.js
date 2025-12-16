import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import hrApi from "../../../../api/hrApi";
import { toast } from "react-toastify";

export const useProgramManagement = () => {
  const { token } = useContext(AuthContext);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 4;

  // Data
  const [programs, setPrograms] = useState([]);
  const [programOverview, setProgramOverview] = useState({});
  const [allDepartments, setAllDepartments] = useState([]);
  const [assignedMentors, setAssignedMentors] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all-departments");
  const [filterMentor, setFilterMentor] = useState("all-mentors");

  // Refresh trigger for refetching data after create/update
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const cleanErrorMessage = (message) => {
    if (!message) return "Đã xảy ra lỗi. Vui lòng thử lại.";

    return message.replace(/^An unexpected error occurred:\s*/i, "");
  };

  // Load departments and mentors
  useEffect(() => {
    if (!token) return;

    const loadFilters = async () => {
      try {
        const deps = await hrApi.getDepartments(token);
        setAllDepartments(deps);

        const mentors = await hrApi.getAssignedMentorsDropdown(token);
        setAssignedMentors(mentors);
      } catch (err) {
        console.error("Error loading filter lists:", err);
        toast.error(cleanErrorMessage(err?.response?.data?.message) || "Lỗi lấy danh sách lọc");
      }
    };

    loadFilters();
  }, [token]);

  // Fetch programs
  const fetchPrograms = useCallback(async (page = 1) => {
    if (!token) return;

    try {
      let data;

      if (searchTerm) {
        data = await hrApi.searchPrograms(token, searchTerm);
      } else if (filterDepartment !== "all-departments") {
        data = await hrApi.filterProgramsByDepartment(token, filterDepartment);
      } else if (filterMentor !== "all-mentors") {
        data = await hrApi.filterProgramsByMentor(token, filterMentor);
      } else {
        data = await hrApi.getAllPrograms(token, { page, size: itemsPerPage });
      }

      setPrograms(data.data || data);
      setCurrentPage(data.currentPage || page);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || (data.data?.length || 0));

      // Fetch overview for each program
      const overviewData = {};
      for (const program of data.data || data) {
        const overview = await hrApi.getProgramOverview(token, program.programId);
        overviewData[program.programId] = overview;
      }
      setProgramOverview(overviewData);
    } catch (err) {
      console.error("Error fetching programs:", err);
      toast.error(cleanErrorMessage(err?.response?.data?.message)|| "Lỗi lấy danh sách chương trình")
    }
  }, [token, searchTerm, filterDepartment, filterMentor, itemsPerPage]);

  useEffect(() => {
    fetchPrograms(currentPage);
  }, [fetchPrograms, currentPage, refreshTrigger]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterDepartment("all-departments");
    setFilterMentor("all-mentors");
  };

  // Trigger refresh and go to first page to see new/updated program
  const triggerRefresh = useCallback(() => {
    setCurrentPage(1);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    token,
    programs,
    setPrograms,
    programOverview,
    setProgramOverview,
    allDepartments,
    assignedMentors,
    searchTerm,
    setSearchTerm,
    filterDepartment,
    setFilterDepartment,
    filterMentor,
    setFilterMentor,
    resetFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    triggerRefresh,
    fetchPrograms,
  };
};