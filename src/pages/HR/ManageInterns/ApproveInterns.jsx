import React, { useEffect, useState, useContext } from "react";
import hrApi from "../../../api/hrApi";
import HRSidebar from "../../../components/Layout/HRSidebar";
import { AuthContext } from "../../../context/AuthContext";
import { LoadingSpinner, LoadingTable } from "../../../components/common/LoadingSpinner";
import { toast } from "react-toastify";
import HRInternTable from "../ManageInterns/component/HRInternTable";
import HRInternHeader from "../ManageInterns/component/HRInternHeader";
import CandidatesModal from "./CandidatesModal";

const ApproveInterns = () => {
  const { token } = useContext(AuthContext);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [majorFilter, setMajorFilter] = useState("");
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const fetchInterns = async (resetPage = false) => {
    try {
      if (!token) {
        setInterns([]);
        return;
      }

      const currentPage = resetPage ? 0 : page;

      const res = await hrApi.searchInterns(token, {
        searchTerm,
        major: majorFilter,
        status: statusFilter,
        page: currentPage,
        size,
      });

      setInterns(res.content || []);
      setTotalPages(res.totalPages || 0);

      if (resetPage) setPage(0);
    } catch (err) {
      console.error("Error fetching interns:", err);
      setInterns([]);
      toast.error("Không thể tải danh sách hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns(true);
  }, [searchTerm, statusFilter, majorFilter]);

  useEffect(() => {
    fetchInterns();
  }, [page, size, token]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("PENDING");
    setMajorFilter("");
    setPage(0);
  };

  const handleAddProfilePage = () => {
      setShowCandidatesModal(true);
    };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <HRSidebar />
        <div className="dashboard-content">
          <div className="loading-card">
            <LoadingSpinner size="large" />
            <p className="loading-text">Đang tải danh sách hồ sơ...</p>
          </div>
          <LoadingTable />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="dashboard-content">
        <HRInternHeader
          title="Duyệt hồ sơ thực tập sinh"
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          majorFilter={majorFilter}
          setMajorFilter={setMajorFilter}
          onClearFilters={handleClearFilters}
          showStatusFilter={true}
          statusOptions={[
            { value: "PENDING", label: "Chờ duyệt" },
            { value: "NO_FILE", label: "Chưa nộp tài liệu" },
            { value: "REJECTED", label: "Bị từ chối" },
          ]}
          onAdd={handleAddProfilePage}
        />

        <HRInternTable
          interns={interns}
          page={page}
          size={size}
          fetchInterns={fetchInterns}
          onEdit={null}
          showDocuments={true}
          showApproveActions={true}
        />
        {showCandidatesModal && (
          <CandidatesModal
            onClose={() => setShowCandidatesModal(false)}
            onSuccess={(reset) => {
              fetchInterns(reset);
            }}
          />
        )}

        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Trang trước
          </button>

          <span className="pagination-info">
            Trang {page + 1} / {totalPages}
          </span>

          <button
            className="pagination-btn"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveInterns;