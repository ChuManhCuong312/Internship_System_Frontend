import React, { useEffect, useState, useContext } from "react";
import hrApi from "../../../api/hrApi";
import HRInternTable from "./component/HRInternTable";
import HRSidebar from "../../../components/Layout/HRSidebar";
import { AuthContext } from "../../../context/AuthContext";
import HRInternHeader from "./component/HRInternHeader";
import CandidatesModal from "./CandidatesModal";
import ProfileModal from "./modals/ProfileModal";
import { LoadingSpinner, LoadingTable } from "../../../components/common/LoadingSpinner";
import { toast } from "react-toastify";

const ManageInterns = () => {
  const { token } = useContext(AuthContext);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [majorFilter, setMajorFilter] = useState("");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [editingIntern, setEditingIntern] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchInterns = async (resetPage = false) => {
    try {
      if (!token) {
        setInterns([]);
        return;
      }

      const currentPage = resetPage ? 0 : page;

      let res;
      if (searchTerm || statusFilter || majorFilter) {
        res = await hrApi.searchInterns(token, {
          searchTerm,
          major: majorFilter,
          status: statusFilter,
          page: currentPage,
          size,
        });
      } else {
        res = await hrApi.getAllInterns(token, currentPage, size);
      }

      setInterns(res.content || []);
      setTotalPages(res.totalPages || 0);

      if (resetPage) setPage(0);
    } catch (err) {
      console.error("Error fetching interns:", err);
      setInterns([]);
      toast.error("Không thể tải danh sách thực tập sinh");
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
    setStatusFilter("");
    setMajorFilter("");
    setPage(0);
    fetchInterns();
  };

  const handleAddProfilePage = () => {
    setShowCandidatesModal(true);
  };

  const handleUpdateIntern = async () => {
    try {
      setIsUpdating(true);

      const updateData = {
        school: editingIntern.school,
        major: editingIntern.major,
        dob: editingIntern.dob,
        address: editingIntern.address,
        gender: editingIntern.gender,
        gpa: parseFloat(editingIntern.gpa),
        phone: editingIntern.phone
      };

      await hrApi.updateInternProfile(token, editingIntern.internId, updateData);
      toast.success("Cập nhật hồ sơ thành công ✅");
      setEditingIntern(null);
      fetchInterns();
    } catch (err) {
      console.error("Error updating intern:", err);

      if (err.response?.status === 400) {
        let msg = err.response.data;

        if (typeof msg === "string") {
          const match = msg.match(/interpolatedMessage='([^']+)'/);
          if (match) {
            msg = match[1];
          }
        }

        toast.error(msg || "Dữ liệu không hợp lệ ❌");
      } else {
        toast.error("Cập nhật hồ sơ thất bại ❌");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <HRSidebar />
        <div className="dashboard-content">
          <div className="loading-card">
            <LoadingSpinner size="large" />
            <p className="loading-text">Đang tải danh sách thực tập sinh...</p>
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
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          majorFilter={majorFilter}
          setMajorFilter={setMajorFilter}
          onClearFilters={handleClearFilters}
          onAdd={handleAddProfilePage}
        />
        <HRInternTable
          interns={interns}
          page={page}
          size={size}
          fetchInterns={fetchInterns}
          onEdit={setEditingIntern}
        />

        {showCandidatesModal && (
          <CandidatesModal
            onClose={() => setShowCandidatesModal(false)}
            onSuccess={(reset) => fetchInterns(reset)}
          />
        )}

        {editingIntern && (
          <ProfileModal
            isEdit={true}
            intern={editingIntern}
            profileData={{
              full_name: editingIntern.fullName,
              gender: editingIntern.gender || "",
              dob: editingIntern.dob || "",
              major: editingIntern.major,
              gpa: editingIntern.gpa,
              school: editingIntern.school,
              phone: editingIntern.phone,
              address: editingIntern.address
            }}
            setProfileData={(data) => setEditingIntern({ ...editingIntern, ...data })}
            onClose={() => setEditingIntern(null)}
            onSubmit={handleUpdateIntern}
            isLoading={isUpdating}
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

export default ManageInterns;