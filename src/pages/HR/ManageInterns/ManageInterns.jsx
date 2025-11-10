// src/pages/hr/ManageInterns.jsx
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import HRSidebar from "../../../components/Layout/HRSidebar";
import Pagination from "../../../components/Common/Pagination";
import { AuthContext } from "../../../context/AuthContext";

import HRInternHeader from "./component/HRInternHeader";
import HRInternTable from "./component/HRInternTable";
import AssignMentorModal from "./modals/AssignMentorModal";
import ProfileModal from "./modals/ProfileModal";
import DeleteModal from "./modals/DeleteModal";

import { InternsContext } from "../../../context/InternsContext";
import "../../../styles/manageUsers.css";

const defaultSchool = "CMC University";
const COMPLETED_STATUS = "Hợp đồng hoàn tất";

const ManageInterns = () => {
  const { user: loggedInUser } = useContext(AuthContext);
  const isHR = loggedInUser?.role === "HR";

  const { interns, setInterns, mockMentors } = useContext(InternsContext);

  const [filteredInterns, setFilteredInterns] = useState(
    interns.filter((i) => i.status === COMPLETED_STATUS)
  );
  const [searchTerm, setSearchTerm] = useState("");
  // keep statusFilter state for compatibility with HRInternHeader if needed
  const [statusFilter, setStatusFilter] = useState(COMPLETED_STATUS);
  const [currentPage, setCurrentPage] = useState(1);
  const [internsPerPage] = useState(10);
  const [modalSuccess, setModalSuccess] = useState("");

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedIntern, setSelectedIntern] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [assignError, setAssignError] = useState("");

  // Profile states
  const [profileData, setProfileData] = useState({
    full_name: "",
    gender: "Khác",
    dob: "",
    school: "",
    major: "",
    gpa: "",
    phone: "",
    address: "",
    photo_path: null,
    documents: [],
  });
  const [profileError, setProfileError] = useState({});
  const [isEditProfile, setIsEditProfile] = useState(false);

  useEffect(() => {
    let result = interns;

    // Search by name or email
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          (i.fullName || "").toLowerCase().includes(q) ||
          (i.email || "").toLowerCase().includes(q)
      );
    }

    // **Force filter**: only show completed contracts on this page
    result = result.filter((i) => i.status === COMPLETED_STATUS);

    setFilteredInterns(result);
    setCurrentPage(1);
  }, [searchTerm, interns]);

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

  const confirmAssign = () => {
    if (!selectedMentor) {
      setAssignError("Vui lòng chọn mentor");
      return;
    }
    setInterns((prev) =>
      prev.map((i) =>
        i.id === selectedIntern.id ? { ...i, mentor: selectedMentor } : i
      )
    );
    setShowAssignModal(false);
    setAssignError("");
    notify("👨‍🏫 Phân công mentor thành công");
  };

  // Profile add/edit
  const handleAddProfile = () => {
    setProfileData({
      full_name: "",
      gender: "Khác",
      dob: "",
      school: defaultSchool,
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

  const handleEditProfile = (intern) => {
    setSelectedIntern(intern);
    setProfileData({
      full_name: intern.fullName || "",
      gender: intern.gender || "Khác",
      dob: intern.dob || "",
      school: intern.school || defaultSchool,
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

  const handleProfileSubmit = () => {
    const errors = {};
    if (!profileData.full_name || !profileData.full_name.trim())
      errors.full_name = "Họ tên không được để trống";
    if (!profileData.gender) errors.gender = "Vui lòng chọn giới tính";
    if (!profileData.dob) errors.dob = "Ngày sinh không được để trống";
    if (!profileData.school || !profileData.school.trim())
      errors.school = "Trường không được để trống";
    if (!profileData.major || !profileData.major.trim())
      errors.major = "Ngành không được để trống";

    const gpaNum = parseFloat(profileData.gpa);
    if (isNaN(gpaNum) || gpaNum <= 0 || gpaNum > 4)
      errors.gpa = "GPA phải lớn hơn 0 và nhỏ hơn hoặc bằng 4.00";

    if (!profileData.phone || !profileData.phone.trim()) {
      errors.phone = "Số điện thoại không được để trống";
    } else if (!/^0\d{9}$/.test(profileData.phone)) {
      errors.phone = "Số điện thoại phải 10 số và bắt đầu bằng 0";
    }

    if (!profileData.address || !profileData.address.trim())
      errors.address = "Địa chỉ không được để trống";

    if (!profileData.photo_path) errors.photo_path = "Vui lòng chọn ảnh hồ sơ";

    if (Object.keys(errors).length > 0) {
      setProfileError(errors);
      return;
    }

    if (isEditProfile) {
      setInterns((prev) =>
        prev.map((i) =>
          i.id === selectedIntern.id
            ? {
                ...i,
                ...profileData,
                fullName: profileData.full_name,
                gpa: gpaNum,
              }
            : i
        )
      );
      notify("✏️ Hồ sơ đã được cập nhật");
    } else {
      const newId = interns.length > 0 ? Math.max(...interns.map((i) => i.id)) + 1 : 1;
      const createdAt = new Date().toISOString().slice(0, 10);
      setInterns((prev) => [
        ...prev,
        {
          id: newId,
          fullName: profileData.full_name,
          email: profileData.email || "",
          phone: profileData.phone,
          major: profileData.major,
          mentor: "-",
          status: "Chờ duyệt",
          createdAt,
          documents: profileData.documents || [],
          ...profileData,
          gpa: gpaNum,
        },
      ]);
      notify("➕ Hồ sơ mới đã được thêm");
    }
    setShowProfileModal(false);
  };

  // Delete
  const handleDelete = (id) => {
    const intern = interns.find((i) => i.id === id);
    setSelectedIntern(intern);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setInterns((prev) => prev.filter((i) => i.id !== selectedIntern.id));
    setShowDeleteModal(false);
    notify("🗑️ Đã xóa hồ sơ thành công");
  };

  if (!isHR) {
    return (
      <div className="dashboard-layout">
        <HRSidebar />
        <div className="dashboard-content">
          <h2 className="page-title">Bạn không có quyền truy cập trang này.</h2>
          <Link to="/hr/approve-docs">Chuyển sang Duyệt tài liệu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="dashboard-content manage-users-content">
        <HRInternHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onAdd={handleAddProfile}
          showStatusFilter={false}
        />

        {modalSuccess && <div className="success-message">{modalSuccess}</div>}

        <HRInternTable
          interns={currentInterns}
          handlers={{
            handleAssignMentor,
            handleEdit: handleEditProfile,
            handleDelete,
          }}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredInterns.length}
          onPageChange={setCurrentPage}
        />

        {showAssignModal && (
          <AssignMentorModal
            intern={selectedIntern}
            mentors={mockMentors}
            selectedMentor={selectedMentor}
            setSelectedMentor={setSelectedMentor}
            onClose={() => setShowAssignModal(false)}
            onSave={confirmAssign}
            error={assignError}
          />
        )}

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
