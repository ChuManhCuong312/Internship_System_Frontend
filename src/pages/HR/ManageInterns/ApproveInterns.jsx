import React, { useEffect, useState, useContext } from "react";
import hrApi from "../../../api/hrApi";
import HRSidebar from "../../../components/Layout/HRSidebar";
import { AuthContext } from "../../../context/AuthContext";
import { LoadingSpinner, LoadingTable } from "../../../components/common/LoadingSpinner";
import { toast } from "react-toastify";
import HRInternTable from "../ManageInterns/component/HRInternTable";
import HRInternHeader from "../ManageInterns/component/HRInternHeader";
import CandidatesModal from "./modals/CandidatesModal";
import ProfileModal from "./modals/ProfileModal";
import CriteriaModal from "./modals/CriteriaModal";
import ApproveModal from "./modals/ApproveModal";
import { HrContext } from "../../../context/HrContext";
import "../../../styles/pagination.css";

const ApproveInterns = () => {
  const { token } = useContext(AuthContext);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [majorFilter, setMajorFilter] = useState("");
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [editingIntern, setEditingIntern] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [schoolFilter, setSchoolFilter] = useState("");

  const { schoolOptions, majorOptions, fetchFilters } = useContext(HrContext);
  const [errors, setErrors] = useState({});

  const [appliedCriteria, setAppliedCriteria] = useState(null);
  const [matchingInterns, setMatchingInterns] = useState(new Set());

const [approvingIntern, setApprovingIntern] = useState(null);
const [isApproving, setIsApproving] = useState(false);

  const validateIntern = (intern) => {
    const newErrors = {};
    if (!intern.fullName?.trim()) newErrors.full_name = "Họ tên bắt buộc";
    if (!intern.gender) newErrors.gender = "Giới tính bắt buộc";
    if (!intern.dob) newErrors.dob = "Ngày sinh bắt buộc";
    if (!intern.major) newErrors.major = "Ngành bắt buộc";
    if (!intern.gpa || intern.gpa <= 0 || intern.gpa > 4) newErrors.gpa = "GPA phải từ 0.01 đến 4";
    if (!intern.phone) newErrors.phone = "Số điện thoại bắt buộc";
    if (!intern.address?.trim()) newErrors.address = "Địa chỉ bắt buộc";
    return newErrors;
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Check if intern matches criteria
  const checkCriteria = (intern) => {
    if (!appliedCriteria) return false;

    let matches = true;

    // Check GPA
   if (appliedCriteria.gpa?.enabled && appliedCriteria.gpa?.value) {
     const gpaValue = parseFloat(appliedCriteria.gpa.value);
     const internGpa = parseFloat(intern.gpa);
     matches = matches && internGpa >= gpaValue;
   }

    if (appliedCriteria.age?.enabled) {
      const age = calculateAge(intern.dob);
      if (age !== null) {
        if (appliedCriteria.age.min) {
          matches = matches && age >= parseInt(appliedCriteria.age.min);
        }
        if (appliedCriteria.age.max) {
          matches = matches && age <= parseInt(appliedCriteria.age.max);
        }
      }
    }

    return matches;
  };

useEffect(() => {
  if (appliedCriteria) {
    const filteredInterns = interns.filter(intern => checkCriteria(intern));
    setInterns(filteredInterns);

    if (filteredInterns.length > 0) {
      toast.info(`🎯 Tìm thấy ${filteredInterns.length} hồ sơ phù hợp tiêu chí`);
    } else {
      toast.warning("⚠️ Không có hồ sơ nào phù hợp với tiêu chí đã chọn");
    }
  }
}, [appliedCriteria]);

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
        school: schoolFilter,
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
  }, [searchTerm, statusFilter, majorFilter, schoolFilter]);

  useEffect(() => {
    fetchInterns();
  }, [page, size, token]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("PENDING");
    setMajorFilter("");
    setSchoolFilter("");
    setPage(0);
    setAppliedCriteria(null)
    fetchInterns(true);
  };

  const handleAddProfilePage = () => {
    setShowCandidatesModal(true);
  };

  const handleApplyCriteria = (criteria) => {
    setAppliedCriteria(criteria);
  };

  const handleClearCriteria = () => {
    setAppliedCriteria(null);
    setMatchingInterns(new Set());
    toast.info("✨ Đã xóa tiêu chí phê duyệt");
    fetchInterns(true);
  };

  const handleUpdateIntern = async () => {
    const newErrors = validateIntern(editingIntern);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Object.values(newErrors).forEach(msg => toast.error(msg));
      return;
    }
    try {
      setIsUpdating(true);
      const updateData = {
                  school: editingIntern.school,
                  major: editingIntern.major,
                  dob: editingIntern.dob,
                  address: editingIntern.address,
                  gender: editingIntern.gender,
                  gpa: parseFloat(editingIntern.gpa),
                  phone: editingIntern.phone,
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
          if (match) msg = match[1];
        }
        toast.error(msg || "Dữ liệu không hợp lệ ❌");
      } else {
        toast.error("Cập nhật hồ sơ thất bại ❌");
      }
    } finally {
      setIsUpdating(false);
    }
  };

const handleApproveIntern = async () => {
  try {
    setIsApproving(true);
    await hrApi.updateInternStatus(token, approvingIntern.internId, "APPROVED");
    toast.success("Duyệt hồ sơ thành công ✅");
    setApprovingIntern(null);
    fetchInterns();
  } catch (err) {
    console.error("Error approving intern:", err);
    toast.error("Duyệt hồ sơ thất bại ❌");
  } finally {
    setIsApproving(false);
  }
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
          majorOptions={majorOptions}
          schoolOptions={schoolOptions}
          majorFilter={majorFilter}
          setMajorFilter={setMajorFilter}
          schoolFilter={schoolFilter}
          setSchoolFilter={setSchoolFilter}
          onClearFilters={handleClearFilters}
          showStatusFilter={true}
          statusOptions={[
            { value: "PENDING", label: "Chờ duyệt" },
            { value: "NO_FILE", label: "Chưa nộp tài liệu" },
            { value: "REJECTED", label: "Bị từ chối" },
          ]}
          onAdd={handleAddProfilePage}
          showCriteriaButton={true}
          onOpenCriteria={() => setShowCriteriaModal(true)}
          appliedCriteria={appliedCriteria}
          onClearCriteria={handleClearCriteria}
        />

        <HRInternTable
          interns={interns}
          page={page}
          size={size}
          fetchInterns={fetchInterns}
          onEdit={setEditingIntern}
          onApprove={setApprovingIntern}
          showDocuments={true}
          showApproveActions={true}
          showStatus={true}
          matchingInterns={matchingInterns}
          appliedCriteria={appliedCriteria}
        />

        {showCandidatesModal && (
          <CandidatesModal
            onClose={() => setShowCandidatesModal(false)}
            onSuccess={(reset) => {
              setStatusFilter("NO_FILE");
              fetchInterns(reset);
            }}
          />
        )}

        {showCriteriaModal && (
          <CriteriaModal
            onClose={() => setShowCriteriaModal(false)}
            onApply={handleApplyCriteria}
            initialCriteria={appliedCriteria}
          />
        )}

    {approvingIntern && (
      <ApproveModal
        intern={approvingIntern}
        onClose={() => setApprovingIntern(null)}
        onConfirm={handleApproveIntern}
        isLoading={isApproving}
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
              address: editingIntern.address,
            }}
            setProfileData={(data) => setEditingIntern({ ...editingIntern, ...data })}
            onClose={() => setEditingIntern(null)}
            onSubmit={handleUpdateIntern}
            isLoading={isUpdating}
            errors={errors}
            majorOptions={majorOptions}
            schoolOptions={schoolOptions}
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