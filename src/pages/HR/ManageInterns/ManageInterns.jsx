import React, { useState, useContext, useEffect } from "react";
import HRSidebar from "../../../components/Layout/HRSidebar";
import Pagination from "../../../components/Common/Pagination";
import HRInternHeader from "./component/HRInternHeader";
import HRInternTable from "./component/HRInternTable";
import AssignMentorModal from "./modals/AssignMentorModal";
import ProfileModal from "./modals/ProfileModal";
import DeleteModal from "./modals/DeleteModal";
import { InternsContext } from "../../../context/InternsContext";
import { AuthContext } from "../../../context/AuthContext";
import "../../../styles/manageUsers.css";

const ManageInterns = () => {
  const { user: loggedInUser } = useContext(AuthContext);
  const isHR = loggedInUser?.role === "HR";

  const {
    interns,
    loading,
    addIntern,
    editIntern,
    removeIntern,
  } = useContext(InternsContext);

  const [filteredInterns, setFilteredInterns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [internsPerPage] = useState(10);
  const [modalSuccess, setModalSuccess] = useState("");
const [majorFilter, setMajorFilter] = useState("");

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [assignError, setAssignError] = useState("");

  // Profile state
  const [profileData, setProfileData] = useState({});
  const [profileError, setProfileError] = useState({});
  const [isEditProfile, setIsEditProfile] = useState(false);

  useEffect(() => {
    if (!loading) {
      let result = interns.filter((i) => i.status === "COMPLETED");
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        result = result.filter(
          (i) =>
            (i.fullName || "").toLowerCase().includes(q) ||
            (i.email || "").toLowerCase().includes(q)
        );
      }
  if (majorFilter) {
        result = result.filter((i) =>
          (i.major || "").toLowerCase().includes(majorFilter.toLowerCase())
        );
      }
      setFilteredInterns(result);
      setCurrentPage(1);
    }
  }, [searchTerm, majorFilter, interns, loading]);

  const indexOfLast = currentPage * internsPerPage;
  const indexOfFirst = indexOfLast - internsPerPage;
  const currentInterns = filteredInterns.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredInterns.length / internsPerPage);

  const notify = (msg) => {
    setModalSuccess(msg);
    setTimeout(() => setModalSuccess(""), 3000);
  };
// Assign mentor
const handleAssignMentor = (intern) => {
  setSelectedIntern(intern);
  setSelectedMentor("");
  setAssignError("");
  setShowAssignModal(true);
};

const confirmAssign = async () => {
  if (!selectedMentor) {
    setAssignError("Vui lòng chọn mentor");
    return;
  }
  try {
    await editIntern(selectedIntern.id, { ...selectedIntern, mentor: selectedMentor });
    setShowAssignModal(false);
    notify("👨‍🏫 Phân công mentor thành công");
  } catch (err) {
    console.error(err);
    notify("❌ Lỗi khi phân công mentor");
  }
};

// Add profile
const handleAddProfile = () => {
  setProfileData({
    full_name: "",
    gender: "Khác",
    dob: "",
    school: "CMC University",
    major: "",
    gpa: "",
    phone: "",
    address: "",
    photo_path: null,
    documents: [],
  });
  setProfileError({});
  setIsEditProfile(false);
  setShowProfileModal(true);
};

// Edit profile
const handleEditProfile = (intern) => {
  setSelectedIntern(intern);
  setProfileData({
    full_name: intern.fullName || "",
    gender: intern.gender || "Khác",
    dob: intern.dob || "",
    school: intern.school || "CMC University",
    major: intern.major || "",
    gpa: intern.gpa !== undefined ? String(intern.gpa) : "",
    phone: intern.phone || "",
    address: intern.address || "",
    photo_path: intern.photo_path || null,
    documents: intern.documents || [],
  });
  setProfileError({});
  setIsEditProfile(true);
  setShowProfileModal(true);
};

// Delete
const handleDelete = (intern) => {
  setSelectedIntern(intern);
  setShowDeleteModal(true);
};

  // Thêm/Sửa Profile
  const handleProfileSubmit = async () => {
    // Validate trước
    const errors = {};
    if (!profileData.full_name) errors.full_name = "Họ tên không được để trống";
    if (!profileData.major) errors.major = "Ngành không được để trống";
    if (Object.keys(errors).length > 0) {
      setProfileError(errors);
      return;
    }

    try {
      if (isEditProfile) {
        await editIntern(selectedIntern.id, { ...profileData, fullName: profileData.full_name });
        notify("✏️ Hồ sơ đã được cập nhật");
      } else {
        await addIntern({ ...profileData, status: "Chờ duyệt" });
        notify("➕ Hồ sơ mới đã được thêm");
      }
      setShowProfileModal(false);
    } catch (err) {
      console.error(err);
      notify("❌ Lỗi khi lưu hồ sơ");
    }
  };

  // Xóa
  const confirmDelete = async () => {
    try {
      await removeIntern(selectedIntern.id);
      setShowDeleteModal(false);
      notify("🗑️ Đã xóa hồ sơ thành công");
    } catch (err) {
      console.error(err);
      notify("❌ Lỗi khi xóa hồ sơ");
    }
  };

  if (!isHR) {
    return (
      <div className="dashboard-layout">
        <HRSidebar />
        <div className="dashboard-content">
          <h2 className="page-title">Bạn không có quyền truy cập trang này.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="dashboard-content manage-users-content">
        <HRInternHeader
          title="Quản lý hồ sơ thực tập sinh"
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
           majorFilter={majorFilter}
            setMajorFilter={setMajorFilter}
          onAdd={() => {
            setIsEditProfile(false);
            setProfileData({});
            setShowProfileModal(true);
          }}
        />

        {modalSuccess && <div className="success-message">{modalSuccess}</div>}

        <HRInternTable
          interns={currentInterns}
          handlers={{
            handleEdit: handleEditProfile,
            handleDelete: handleDelete
          }}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredInterns.length}
          onPageChange={setCurrentPage}
        />

        {showProfileModal && (
          <ProfileModal
            isEdit={isEditProfile}
            intern={selectedIntern}
            profileData={profileData}
            setProfileData={setProfileData}
            onClose={() => setShowProfileModal(false)}
            onSubmit={handleProfileSubmit}
            errors={profileError}
          />
        )}

        {showDeleteModal && (
          <DeleteModal
            intern={selectedIntern}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
          />
        )}
      </div>
    </div>
  );
};

export default ManageInterns;
