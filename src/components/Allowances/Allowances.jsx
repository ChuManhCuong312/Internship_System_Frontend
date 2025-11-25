import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import HRSidebar from "../Layout/HRSidebar";
import AllowancesTable from "./AllowancesTable";
import AllowancesFilter from "./AllowancesFilter";
import AllowancesPagination from "./AllowancesPagination";
import AllowancesModal from "./AllowancesModal";
import { useAllowancesLogic } from "./useAllowancesLogic";
import { handleSaveAllowance, handleDeleteAllowance } from "./AllowancesActions";
import { exportAllowancesToExcel } from "../../utils/excelExport";
import allowanceApi from "../../api/allowanceApi";
import { toast } from "react-toastify";
import "../../styles/allowances.css";

const Allowances = () => {
  const { token } = useContext(AuthContext);
  const logic = useAllowancesLogic(token);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      
      // Fetch all allowances without pagination
      const response = await allowanceApi.getAllAllowancesForExport(token);
      const allData = response.content || response;
      
      if (!allData || allData.length === 0) {
        toast.warning("Không có dữ liệu để xuất");
        return;
      }
      
      await exportAllowancesToExcel(allData);
      toast.success("Xuất Excel thành công");
    } catch (error) {
      console.error("Error exporting:", error);
      toast.error("Lỗi khi xuất Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = async () => {
    const newErrors = logic.validateForm();
    if (Object.keys(newErrors).length > 0) {
      logic.setErrors(newErrors);
      return;
    }

    await handleSaveAllowance(logic.editingAllowance, logic.formData, token, () => {
      logic.setShowModal(false);
      logic.resetForm();
      logic.setPage(0);
      logic.fetchAllowances(true);
    });
  };

  const handleDelete = async (id) => {
    await handleDeleteAllowance(id, token, () => {
      logic.fetchAllowances();
    });
  };

  const handleFilterChange = (field, value) => {
    logic.setFilterData({ ...logic.filterData, [field]: value });
  };

  if (logic.loading && logic.allowances.length === 0) {
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
              onClick={() => logic.setShowFilter(!logic.showFilter)}
              style={{ background: logic.showFilter ? "#764ba2" : "#667eea" }}
            >
              🔍 {logic.showFilter ? "Ẩn" : "Lọc"}
            </button>
            <button
              className="btn-add-allowance"
              onClick={handleExportExcel}
              disabled={isExporting || logic.allowances.length === 0}
              style={{ background: "#10b981" }}
            >
              📊 {isExporting ? "Đang xuất..." : "Xuất Excel"}
            </button>
            <button
              className="btn-add-allowance"
              onClick={() => {
                logic.setEditingAllowance(null);
                logic.resetForm();
                logic.setShowModal(true);
              }}
            >
              + Thêm trợ cấp
            </button>
          </div>
        </div>

        <AllowancesFilter
          showFilter={logic.showFilter}
          filterData={logic.filterData}
          isFiltering={logic.isFiltering}
          onToggleFilter={() => logic.setShowFilter(!logic.showFilter)}
          onFilterChange={handleFilterChange}
          onApplyFilter={logic.handleApplyFilter}
          onResetFilter={logic.handleResetFilter}
        />

        <AllowancesTable
          allowances={logic.allowances}
          sortBy={logic.sortBy}
          direction={logic.direction}
          onSort={logic.handleSort}
          onEdit={logic.handleEditAllowance}
          onDelete={handleDelete}
        />

        <AllowancesPagination
          page={logic.page}
          size={logic.size}
          totalPages={logic.totalPages}
          totalElements={logic.totalElements}
          onPageChange={(newPage) => {
            logic.setPage(newPage);
          }}
          onSizeChange={(newSize) => {
            logic.setSize(newSize);
            logic.setPage(0);
          }}
        />

        <AllowancesModal
          showModal={logic.showModal}
          editingAllowance={logic.editingAllowance}
          formData={logic.formData}
          errors={logic.errors}
          onFormChange={(field, value) => {
            logic.setFormData({ ...logic.formData, [field]: value });
          }}
          onSave={handleSave}
          onClose={logic.handleCloseModal}
        />
      </div>
    </div>
  );
};

export default Allowances;
