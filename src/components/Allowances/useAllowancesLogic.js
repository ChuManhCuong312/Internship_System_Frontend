import { useState, useEffect } from "react";
import allowanceApi from "../../api/allowanceApi";
import { toast } from "react-toastify";

export const useAllowancesLogic = (token) => {
  const [allowances, setAllowances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState("dateApplied");
  const [direction, setDirection] = useState("desc");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState(null);
  const [formData, setFormData] = useState({
    internName: "",
    internId: "",
    type: "",
    amount: "",
    dateApplied: "",
    note: "",
  });
  const [errors, setErrors] = useState({});
  const [internSuggestions, setInternSuggestions] = useState([]);

  // Filter states
  const [showFilter, setShowFilter] = useState(false);
  const [filterData, setFilterData] = useState({
    internName: "",
    internId: "",
    type: "",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);

  // Fetch allowances
  const fetchAllowances = async (resetPage = false) => {
    try {
      if (!token) {
        setAllowances([]);
        return;
      }

      const currentPage = resetPage ? 0 : page;
      const response = await allowanceApi.getAllowances(
        token,
        currentPage,
        size,
        sortBy,
        direction
      );

      // Handle both paginated and non-paginated responses
      if (response.data) {
        // New format: { data: [...], totalAllowances, currentPage, pageSize, totalPages }
        setAllowances(response.data);
        setTotalElements(response.totalAllowances || 0);
        setTotalPages(response.totalPages || Math.ceil((response.totalAllowances || 0) / size) || 1);
      } else if (response.content) {
        // Old format: { content: [...], totalElements, totalPages }
        setAllowances(response.content);
        const total = response.totalElements || 0;
        const pages = response.totalPages || Math.ceil(total / size) || 1;
        setTotalElements(total);
        setTotalPages(pages);
      } else if (Array.isArray(response)) {
        setAllowances(response);
        setTotalElements(response.length);
        setTotalPages(Math.ceil(response.length / size) || 1);
      }

      if (resetPage) setPage(0);
    } catch (err) {
      console.error("Error fetching allowances:", err);
      toast.error("Không thể tải danh sách trợ cấp");
      setAllowances([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch filtered allowances
  const fetchFilteredAllowances = async (filters, currentPage = 0) => {
    try {
      setLoading(true);
      const response = await allowanceApi.filterAllowances(token, filters, currentPage, size);

      // Handle response
      if (response.data) {
        // New format: { data: [...], totalAllowances, currentPage, pageSize, totalPages }
        setAllowances(response.data);
        setTotalElements(response.totalAllowances || 0);
        setTotalPages(response.totalPages || Math.ceil((response.totalAllowances || 0) / size) || 1);
      } else if (response.content) {
        // Old format: { content: [...], totalElements, totalPages }
        setAllowances(response.content);
        const total = response.totalElements || 0;
        const pages = response.totalPages || Math.ceil(total / size) || 1;
        setTotalElements(total);
        setTotalPages(pages);
      } else if (Array.isArray(response)) {
        setAllowances(response);
        setTotalElements(response.length);
        setTotalPages(Math.ceil(response.length / size) || 1);
      }
    } catch (err) {
      console.error("Error filtering allowances:", err);
      toast.error("Lỗi khi lọc trợ cấp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    // If there are active filters, use filtered fetch
    if (activeFilters) {
      fetchFilteredAllowances(activeFilters, page);
    } else {
      fetchAllowances();
    }
  }, [token, page, size, sortBy, direction, activeFilters]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.internName || formData.internName.trim() === "")
      newErrors.internName = "Tên thực tập sinh bắt buộc";
    if (!formData.internId || formData.internId === "")
      newErrors.internName = "Vui lòng chọn thực tập sinh từ danh sách";
    if (!formData.type || formData.type === "")
      newErrors.type = "Loại trợ cấp bắt buộc";
    if (!formData.amount || formData.amount <= 0)
      newErrors.amount = "Số tiền phải lớn hơn 0";
    if (!formData.dateApplied) newErrors.dateApplied = "Ngày áp dụng bắt buộc";
    return newErrors;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      internName: "",
      internId: "",
      type: "",
      amount: "",
      dateApplied: "",
      note: "",
    });
    setEditingAllowance(null);
    setErrors({});
    setInternSuggestions([]);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setDirection("asc");
    }
    setPage(0);
  };

  // Handle edit
  const handleEditAllowance = (allowance) => {
    setEditingAllowance(allowance);
    setFormData({
      internName: allowance.internName || "",
      internId: allowance.internId,
      type: allowance.type,
      amount: allowance.amount,
      dateApplied: allowance.dateApplied,
      note: allowance.note || "",
    });
    setShowModal(true);
    setErrors({});
  };

  // Handle filter
  const handleApplyFilter = async () => {
    try {
      setIsFiltering(true);
      // Build filter object with only non-empty values
      const filters = {};
      if (filterData.internId) filters.internId = parseInt(filterData.internId);
      if (filterData.type) filters.type = filterData.type;
      if (filterData.minAmount) filters.minAmount = parseFloat(filterData.minAmount);
      if (filterData.maxAmount) filters.maxAmount = parseFloat(filterData.maxAmount);
      if (filterData.startDate) filters.startDate = filterData.startDate;
      if (filterData.endDate) filters.endDate = filterData.endDate;

      // Save active filters and reset page
      setActiveFilters(filters);
      setPage(0);

      // Fetch filtered data
      await fetchFilteredAllowances(filters, 0);

      toast.success("Lọc trợ cấp thành công");
      setShowFilter(false);
    } catch (err) {
      console.error("Error applying filter:", err);
      toast.error("Lỗi khi áp dụng lọc");
    } finally {
      setIsFiltering(false);
    }
  };

  // Handle reset filter
  const handleResetFilter = () => {
    setFilterData({
      internName: "",
      internId: "",
      type: "",
      minAmount: "",
      maxAmount: "",
      startDate: "",
      endDate: "",
    });
    setActiveFilters(null);
    setIsFiltering(false);
    setPage(0);
    setInternSuggestions([]);
    fetchAllowances(true);
  };

  // Search interns by name
  const handleSearchInterns = async (searchTerm) => {
    try {
      if (!searchTerm.trim()) {
        setInternSuggestions([]);
        return;
      }
      const results = await allowanceApi.searchInternsByName(token, searchTerm);
      setInternSuggestions(results || []);
    } catch (error) {
      console.error("Error searching interns:", error);
      setInternSuggestions([]);
    }
  };

  // Handle intern selection from dropdown
  const handleSelectIntern = (intern) => {
    setFormData({
      ...formData,
      internName: intern.fullName,
      internId: intern.internId,
    });
    setInternSuggestions([]);
  };

  return {
    // Data
    allowances,
    loading,
    page,
    size,
    totalElements,
    totalPages,
    sortBy,
    direction,
    showModal,
    editingAllowance,
    formData,
    errors,
    showFilter,
    filterData,
    isFiltering,
    internSuggestions,

    // Setters
    setAllowances,
    setLoading,
    setPage,
    setSize,
    setTotalElements,
    setTotalPages,
    setSortBy,
    setDirection,
    setShowModal,
    setEditingAllowance,
    setFormData,
    setErrors,
    setShowFilter,
    setFilterData,
    setIsFiltering,
    setActiveFilters,

    // Methods
    fetchAllowances,
    fetchFilteredAllowances,
    validateForm,
    resetForm,
    handleCloseModal,
    handleSort,
    handleEditAllowance,
    handleApplyFilter,
    handleResetFilter,
    handleSearchInterns,
    handleSelectIntern,
  };
};
