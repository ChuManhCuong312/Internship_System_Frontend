import React, { useEffect, useState, useContext } from "react";
import hrApi from "../../../api/hrApi";
import HRInternTable from "./component/HRInternTable";
import HRSidebar from "../../../components/Layout/HRSidebar";
import { AuthContext } from "../../../context/AuthContext";
import HRInternHeader from "./component/HRInternHeader";
import { useNavigate } from "react-router-dom";
import CandidatesModal from "./CandidatesModal";
import ProfileModal from "./modals/ProfileModal"

const ManageInterns = () => {
  const { token } = useContext(AuthContext);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [majorFilter, setMajorFilter] = useState("");

  // phân trang
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [editingIntern, setEditingIntern] = useState(null);

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
        res = await hrApi.getAllInterns(token, 0, 1000);
      }

      const sorted = (res.content || []).sort((a, b) => b.internId - a.internId);
      setInterns(sorted);
      setTotalPages(res.totalPages || 0);

      if (resetPage) setPage(0);
    } catch (err) {
      console.error("Error fetching interns:", err);
      setInterns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, [token, searchTerm, statusFilter, majorFilter, page, size]);

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

  if (loading) return <p>Đang tải dữ liệu...</p>;

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
        onSubmit={async () => {
          await hrApi.updateInternProfile(token, editingIntern.internId, editingIntern);
          setEditingIntern(null);
          fetchInterns();
        }}
        errors={{}}
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
