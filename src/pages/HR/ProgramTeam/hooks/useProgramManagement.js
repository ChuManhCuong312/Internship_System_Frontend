import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import hrApi from "../../../../api/hrApi";
import { toast } from "react-toastify";

export const useProgramManagement = () => {
  const { token } = useContext(AuthContext);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Data
  const [programs, setPrograms] = useState([]);
  const [programOverview, setProgramOverview] = useState({});
  const [allDepartments, setAllDepartments] = useState([]);
  const [assignedMentors, setAssignedMentors] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all-departments");
  const [filterMentor, setFilterMentor] = useState("all-mentors");

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
        toast.error("Lỗi lấy danh sách lọc");
      }
    };

    loadFilters();
  }, [token]);

  // Fetch programs
  useEffect(() => {
    const fetchPrograms = async (page = currentPage) => {
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
        toast.error("Lỗi lấy danh sách chương trình")
      }
    };

    if (token) fetchPrograms(currentPage);
  }, [token, searchTerm, filterDepartment, filterMentor, currentPage]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterDepartment("all-departments");
    setFilterMentor("all-mentors");
  };

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
  };
};