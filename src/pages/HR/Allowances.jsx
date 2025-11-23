import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import hrApi from "../../api/hrApi";
import HRSidebar from "../../components/Layout/HRSidebar";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "../../styles/allowances.css";

const Allowances = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
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
    internId: "",
    type: "",
    amount: "",
    dateApplied: "",
    note: "",
  });
  const [errors, setErrors] = useState({});

  // Filter states
  const [showFilter, setShowFilter] = useState(false);
  const [filterData, setFilterData] = useState({
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
      const response = await hrApi.getAllowances(
        token,
        currentPage,
        size,
        sortBy,
        direction
      );

      // Handle both paginated and non-paginated responses
      if (response.content) {
        setAllowances(response.content);
        setTotalElements(response.totalElements || 0);
        setTotalPages(response.totalPages || 0);
      } else if (Array.isArray(response)) {
        setAllowances(response);
        setTotalElements(response.length);
        setTotalPages(1);
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
      const response = await hrApi.filterAllowances(token, filters, currentPage, size);

      // Handle response
      if (response.content) {
        setAllowances(response.content);
        setTotalElements(response.totalElements || 0);
        setTotalPages(response.totalPages || 0);
      } else if (Array.isArray(response)) {
        setAllowances(response);
        setTotalElements(response.length);
        setTotalPages(1);
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
    if (!formData.internId || formData.internId === "")
      newErrors.internId = "ID thực tập sinh bắt buộc";
    if (!formData.type || formData.type === "")
      newErrors.type = "Loại trợ cấp bắt buộc";
    if (!formData.amount || formData.amount <= 0)
      newErrors.amount = "Số tiền phải lớn hơn 0";
    if (!formData.dateApplied) newErrors.dateApplied = "Ngày áp dụng bắt buộc";
    return newErrors;
  };

  // Handle add/edit
  const handleSaveAllowance = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingAllowance) {
        // Update existing
        await Swal.fire({
          title: "Xác nhận cập nhật",
          text: "Bạn có chắc chắn muốn cập nhật trợ cấp này?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Cập nhật",
          cancelButtonText: "Hủy",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await hrApi.updateAllowance(token, editingAllowance.allowanceId, formData);
            toast.success("Cập nhật trợ cấp thành công");
            setShowModal(false);
            resetForm();
            fetchAllowances();

            // Show success alert
            await Swal.fire({
              title: "Thành công!",
              text: "Trợ cấp đã được cập nhật.",
              icon: "success",
              confirmButtonColor: "#3085d6",
            });
          }
        });
      } else {
        // Create new
        await Swal.fire({
          title: "Xác nhận thêm mới",
          text: "Bạn có chắc chắn muốn thêm trợ cấp này?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Thêm mới",
          cancelButtonText: "Hủy",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await hrApi.createAllowance(token, formData);
            toast.success("Thêm trợ cấp thành công");
            setShowModal(false);
            resetForm();
            setPage(0);
            fetchAllowances(true);

            // Show success alert
            await Swal.fire({
              title: "Thành công!",
              text: "Trợ cấp đã được thêm mới.",
              icon: "success",
              confirmButtonColor: "#3085d6",
            });
          }
        });
      }
    } catch (err) {
      console.error("Error saving allowance:", err);
      toast.error(err.response?.data?.message || "Lỗi khi lưu trợ cấp");
    }
  };

  // Handle delete
  const handleDeleteAllowance = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Xác nhận xóa",
        text: "Bạn có chắc chắn muốn xóa trợ cấp này? Hành động này không thể hoàn tác.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        await hrApi.deleteAllowance(token, id);
        toast.success("Xóa trợ cấp thành công");
        fetchAllowances();

        // Show success alert
        await Swal.fire({
          title: "Đã xóa!",
          text: "Trợ cấp đã được xóa.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
      }
    } catch (err) {
      console.error("Error deleting allowance:", err);
      toast.error("Lỗi khi xóa trợ cấp");
    }
  };

  // Handle edit
  const handleEditAllowance = (allowance) => {
    setEditingAllowance(allowance);
    setFormData({
      internId: allowance.internId,
      type: allowance.type,
      amount: allowance.amount,
      dateApplied: allowance.dateApplied,
      note: allowance.note || "",
    });
    setShowModal(true);
    setErrors({});
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      internId: "",
      type: "",
      amount: "",
      dateApplied: "",
      note: "",
    });
    setEditingAllowance(null);
    setErrors({});
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
    fetchAllowances(true);
  };

  if (loading && allowances.length === 0) {
    return (
      <div className="allowance-layout">
        <HRSidebar />
        <div className="allowance-content">
          <div className="loading-spinner">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="allowance-layout">
      <HRSidebar />

      <div className="allowance-content">
        <div className="allowance-header">
          <h2>Quản lý Trợ cấp</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="btn-add-allowance"
              onClick={() => setShowFilter(!showFilter)}
              style={{ background: showFilter ? "#764ba2" : "#667eea" }}
            >
              🔍 {showFilter ? "Ẩn" : "Lọc"}
            </button>
            <button
              className="btn-add-allowance"
              onClick={() => {
                setEditingAllowance(null);
                resetForm();
                setShowModal(true);
              }}
            >
              + Thêm trợ cấp
            </button>
          </div>
        </div>

        {/* Filter Section */}
        {showFilter && (
          <div className="filter-container">
            <div className="filter-row">
              <div className="filter-group">
                <label>ID Thực tập sinh</label>
                <input
                  type="number"
                  value={filterData.internId}
                  onChange={(e) => setFilterData({ ...filterData, internId: e.target.value })}
                  placeholder="Nhập ID"
                />
              </div>
              <div className="filter-group">
                <label>Loại trợ cấp</label>
                <select
                  value={filterData.type}
                  onChange={(e) => setFilterData({ ...filterData, type: e.target.value })}
                >
                  <option value="">-- Tất cả --</option>
                  <option value="MONTHLY">Hàng tháng</option>
                  <option value="BONUS">Thưởng</option>
                  <option value="SPECIAL">Đặc biệt</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Từ tiền</label>
                <input
                  type="number"
                  value={filterData.minAmount}
                  onChange={(e) => setFilterData({ ...filterData, minAmount: e.target.value })}
                  placeholder="Tối thiểu"
                />
              </div>
              <div className="filter-group">
                <label>Đến tiền</label>
                <input
                  type="number"
                  value={filterData.maxAmount}
                  onChange={(e) => setFilterData({ ...filterData, maxAmount: e.target.value })}
                  placeholder="Tối đa"
                />
              </div>
            </div>
            <div className="filter-row">
              <div className="filter-group">
                <label>Từ ngày</label>
                <input
                  type="date"
                  value={filterData.startDate}
                  onChange={(e) => setFilterData({ ...filterData, startDate: e.target.value })}
                />
              </div>
              <div className="filter-group">
                <label>Đến ngày</label>
                <input
                  type="date"
                  value={filterData.endDate}
                  onChange={(e) => setFilterData({ ...filterData, endDate: e.target.value })}
                />
              </div>
              <div className="filter-actions">
                <button
                  className="btn-filter-apply"
                  onClick={handleApplyFilter}
                  disabled={isFiltering}
                >
                  {isFiltering ? "Đang lọc..." : "Áp dụng"}
                </button>
                <button
                  className="btn-filter-reset"
                  onClick={handleResetFilter}
                  disabled={isFiltering}
                >
                  Đặt lại
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="allowance-table-container">
          <table className="allowance-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("allowanceId")}>
                  ID {sortBy === "allowanceId" && (direction === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("internId")}>
                  ID TTS {sortBy === "internId" && (direction === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("type")}>
                  Loại {sortBy === "type" && (direction === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("amount")}>
                  Số tiền {sortBy === "amount" && (direction === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("dateApplied")}>
                  Ngày áp dụng {sortBy === "dateApplied" && (direction === "asc" ? "↑" : "↓")}
                </th>
                <th>Ghi chú</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {allowances.length > 0 ? (
                allowances.map((allowance) => (
                  <tr key={allowance.allowanceId}>
                    <td>{allowance.allowanceId}</td>
                    <td>{allowance.internId}</td>
                    <td>{allowance.type}</td>
                    <td className="amount">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(allowance.amount)}
                    </td>
                    <td>{new Date(allowance.dateApplied).toLocaleDateString("vi-VN")}</td>
                    <td>{allowance.note || "-"}</td>
                    <td className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditAllowance(allowance)}
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteAllowance(allowance.allowanceId)}
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    Không có dữ liệu trợ cấp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="pagination-btn"
            >
              ← Trước
            </button>

            <div className="pagination-info">
              Trang {page + 1} / {totalPages} (Tổng: {totalElements} bản ghi)
            </div>

            <select
              value={size}
              onChange={(e) => {
                setSize(parseInt(e.target.value));
                setPage(0);
              }}
              className="pagination-select"
            >
              <option value={5}>5 bản ghi</option>
              <option value={10}>10 bản ghi</option>
              <option value={20}>20 bản ghi</option>
              <option value={50}>50 bản ghi</option>
            </select>

            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="pagination-btn"
            >
              Tiếp →
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAllowance ? "Chỉnh sửa trợ cấp" : "Thêm trợ cấp mới"}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>ID Thực tập sinh *</label>
                <input
                  type="number"
                  value={formData.internId}
                  onChange={(e) =>
                    setFormData({ ...formData, internId: parseInt(e.target.value) || "" })
                  }
                  placeholder="Nhập ID thực tập sinh"
                  className={errors.internId ? "input-error" : ""}
                />
                {errors.internId && <span className="error-text">{errors.internId}</span>}
              </div>

              <div className="form-group">
                <label>Loại trợ cấp *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={errors.type ? "input-error" : ""}
                >
                  <option value="">-- Chọn loại trợ cấp --</option>
                  <option value="MONTHLY">Hàng tháng</option>
                  <option value="BONUS">Thưởng</option>
                  <option value="SPECIAL">Đặc biệt</option>
                  <option value="OTHER">Khác</option>
                </select>
                {errors.type && <span className="error-text">{errors.type}</span>}
              </div>

              <div className="form-group">
                <label>Số tiền (VND) *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: parseFloat(e.target.value) || "" })
                  }
                  placeholder="Nhập số tiền"
                  className={errors.amount ? "input-error" : ""}
                />
                {errors.amount && <span className="error-text">{errors.amount}</span>}
              </div>

              <div className="form-group">
                <label>Ngày áp dụng *</label>
                <input
                  type="date"
                  value={formData.dateApplied}
                  onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
                  className={errors.dateApplied ? "input-error" : ""}
                />
                {errors.dateApplied && (
                  <span className="error-text">{errors.dateApplied}</span>
                )}
              </div>

              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Nhập ghi chú (tùy chọn)"
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>
                Hủy
              </button>
              <button className="btn-submit" onClick={handleSaveAllowance}>
                {editingAllowance ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allowances;