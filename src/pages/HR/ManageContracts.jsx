import React, { useEffect, useState, useContext } from "react";
import HRSidebar from "../../components/Layout/HRSidebar";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import hrApi from "../../api/hrApi";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import UploadContractModal from "./ManageContracts/UploadContractModal";
import ContractTable from "./ManageContracts/ContractTable";
import "../../styles/manageContracts.css";

const ManageContracts = () => {
  const { token } = useContext(AuthContext);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch contracts
  const fetchContracts = async (resetPage = false) => {
    try {
      if (!token) {
        setContracts([]);
        return;
      }

      const currentPage = resetPage ? 0 : page;
      const response = await hrApi.getContracts(token, {
        searchTerm,
        status: statusFilter || undefined,
        page: currentPage,
        size,
      });

      // Handle paginated response
      if (response.content) {
        setContracts(response.content);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      } else if (Array.isArray(response)) {
        setContracts(response);
        setTotalPages(1);
        setTotalElements(response.length);
      } else {
        setContracts([]);
        setTotalPages(0);
        setTotalElements(0);
      }

      if (resetPage) setPage(0);
    } catch (err) {
      console.error("Error fetching contracts:", err);
      toast.error("Không thể tải danh sách hợp đồng");
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchContracts(true);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (token) {
      fetchContracts();
    }
  }, [token, page, size]);

  // Handle upload/replace contract
  const handleUploadContract = async (file, note) => {
    if (!selectedContract) return;

    try {
      setUploading(true);
      
        // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error("Kích thước file không được vượt quá 10MB");
        return;
      }

      // Check file type
      const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Chỉ chấp nhận file PDF hoặc DOCX");
        return;
      }

      let result;
      const documentId = selectedContract.documentId || selectedContract.document_id;
      const internId = selectedContract.internId || selectedContract.intern_id;
      
      if (documentId) {
        // Replace existing contract
        result = await hrApi.replaceContract(token, documentId, file, note);
        toast.success("Thay thế hợp đồng thành công");
      } else {
        // Upload new contract
        result = await hrApi.uploadContract(token, internId, file, note);
        toast.success("Upload hợp đồng thành công");
      }

      setShowUploadModal(false);
      setSelectedContract(null);
      fetchContracts();
    } catch (err) {
      console.error("Error uploading contract:", err);
      toast.error(err.response?.data?.message || "Upload hợp đồng thất bại");
    } finally {
      setUploading(false);
    }
  };

  // Handle delete contract
  const handleDeleteContract = async (contract) => {
    const documentId = contract.documentId || contract.document_id;
    const filePath = contract.filePath || contract.file_path;
    if (!documentId || !filePath) {
      toast.warning("Không có hợp đồng để xóa");
      return;
    }

    const result = await Swal.fire({
      title: "Xác nhận xóa hợp đồng",
      text: `Bạn có chắc chắn muốn xóa hợp đồng của ${contract.fullName}? Hành động này không thể hoàn tác.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const documentId = contract.documentId || contract.document_id;
        await hrApi.deleteContract(token, documentId);
        toast.success("Xóa hợp đồng thành công");
        fetchContracts();
      } catch (err) {
        console.error("Error deleting contract:", err);
        toast.error("Xóa hợp đồng thất bại");
      }
    }
  };

  // Handle download contract
  const handleDownloadContract = async (contract) => {
    const documentId = contract.documentId || contract.document_id;
    const filePath = contract.filePath || contract.file_path;
    if (!documentId || !filePath) {
      toast.warning("Không có hợp đồng để tải xuống");
      return;
    }

    try {
      const blob = await hrApi.downloadContract(token, documentId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Extract filename from file_path or use default
      const fileName = filePath.split("/").pop() || `hop-dong-${contract.fullName}.pdf`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Tải xuống hợp đồng thành công");
    } catch (err) {
      console.error("Error downloading contract:", err);
      toast.error("Tải xuống hợp đồng thất bại");
    }
  };

  // Handle open upload modal
  const handleOpenUploadModal = (contract, isReplace = false) => {
    setSelectedContract(contract);
    setShowUploadModal(true);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPage(0);
  };

  if (loading && contracts.length === 0) {
    return (
      <div className="dashboard-layout">
        <HRSidebar />
        <div className="dashboard-content">
          <div className="loading-card">
            <LoadingSpinner size="large" />
            <p className="loading-text">Đang tải danh sách hợp đồng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="dashboard-content contract-content">
        <div className="contract-header">
          <h2 className="page-title">Quản lý hợp đồng</h2>
        </div>

        {/* Filters */}
        <div className="contract-filters">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="NOT_UPLOAD">Chưa upload</option>
            <option value="UPLOAD">Đã upload</option>
            <option value="PENDING">Chờ TTS xác nhận</option>
            <option value="APPROVED">TTS đã xác nhận</option>
          </select>

          <button className="clear-filter-btn" onClick={handleClearFilters}>
            ✖ Clear filter
          </button>
        </div>

        {/* Contract Table */}
        <ContractTable
          contracts={contracts}
          page={page}
          size={size}
          onUpload={handleOpenUploadModal}
          onReplace={handleOpenUploadModal}
          onDelete={handleDeleteContract}
          onDownload={handleDownloadContract}
        />

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

            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="pagination-btn"
            >
              Tiếp →
            </button>
          </div>
        )}

        {/* Upload/Replace Modal */}
        {showUploadModal && selectedContract && (
          <UploadContractModal
            contract={selectedContract}
            onClose={() => {
              setShowUploadModal(false);
              setSelectedContract(null);
            }}
            onSubmit={handleUploadContract}
            isLoading={uploading}
            isReplace={!!(selectedContract.documentId || selectedContract.document_id)}
          />
        )}
      </div>
    </div>
  );
};

export default ManageContracts;

