import React, { useState, useEffect, useContext } from "react";
import HRSidebar from "../../../components/Layout/HRSidebar";
import Pagination from "../../../components/Common/Pagination";
import { AuthContext } from "../../../context/AuthContext";

import HRInternHeader from "./component/HRInternHeader";
import HRInternTable from "./component/HRInternTable";
import AssignMentorModal from "./modals/AssignMentorModal";
import RejectModal from "./modals/RejectModal";
import ContractModal from "./modals/ContractModal";
import ProfileModal from "./modals/ProfileModal";
import DeleteModal from "./modals/DeleteModal";

import "../../../styles/manageUsers.css";

const mockMentors = [
  { id: 1, name: "Nguyễn Văn Hướng" },
  { id: 2, name: "Trần Thị Hạnh" },
  { id: 3, name: "Phạm Quốc Bình" },
];

const mockInterns = [
  {
    id: 1,
    fullName: "Nguyễn Văn A",
    email: "a@example.com",
    phone: "0987765443",
    major: "Công nghệ thông tin",
    mentor: "-",
    status: "Chờ duyệt",
    createdAt: "2024-03-15",
    documents: ["CV_A.pdf", "DonXinTT_A.pdf"],
  },
  {
    id: 2,
    fullName: "Trần Thị B",
    email: "b@example.com",
    phone: "0987765442",
    major: "Công nghệ thông tin",
    mentor: "-",
    status: "Đã duyệt",
    createdAt: "2024-03-28",
    documents: ["CV_B.pdf"],
  },
  {
    id: 3,
    fullName: "Lê Văn C",
    email: "c@example.com",
    phone: "0987765441",
    major: "Quản trị kinh doanh",
    mentor: "Nguyễn Văn Hướng",
    status: "Hợp đồng hoàn tất",
    createdAt: "2024-04-02",
    documents: ["CV_C.pdf", "HopDong_C.pdf"],
  },
{
    id: 4,
    fullName: "Lê Văn D",
    email: "d@example.com",
    phone: "0987765442",
    major: "Thiết kế đồ họa",
    mentor: "-",
    status: "Hợp đồng hoàn tất",
    createdAt: "2024-04-03",
    documents: ["CV_C.pdf", "HopDong_C.pdf"],
  },
];

const ManageInterns = () => {
  const { user: loggedInUser } = useContext(AuthContext);
  const isHR = loggedInUser?.role === "HR";

  const [interns, setInterns] = useState(mockInterns);
  const [filteredInterns, setFilteredInterns] = useState(mockInterns);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [internsPerPage] = useState(10);
  const [modalSuccess, setModalSuccess] = useState("");

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedIntern, setSelectedIntern] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [contractFile, setContractFile] = useState(null);

  // Validation errors
  const [assignError, setAssignError] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [contractError, setContractError] = useState("");

const defaultSchool = "CMC University";

  // --- Filter + Search ---
  useEffect(() => {
    let result = interns;
    if (searchTerm) {
      result = result.filter(
        (i) =>
          i.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) {
      result = result.filter((i) => i.status === statusFilter);
    }
    setFilteredInterns(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, interns]);

  // --- Pagination ---
  const indexOfLast = currentPage * internsPerPage;
  const indexOfFirst = indexOfLast - internsPerPage;
  const currentInterns = filteredInterns.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredInterns.length / internsPerPage);

  // --- Action handlers ---
  const handleApprove = (id) => {
    setInterns((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "Đã duyệt" } : i))
    );
    notify("✅ Đã duyệt hồ sơ thành công");
  };

  const handleReject = (id) => {
    const intern = interns.find(i => i.id === id);
    setSelectedIntern(intern);
    setRejectReason("");
    setRejectError("");
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      setRejectError("Vui lòng nhập lý do từ chối");
      return;
    }
    setInterns((prev) =>
      prev.map((i) => (i.id === selectedIntern.id ? { ...i, status: "Bị từ chối" } : i))
    );
    setShowRejectModal(false);
    setRejectError("");
    notify("❌ Đã từ chối hồ sơ");
  };

  const handleSendContract = (id) => {
    const intern = interns.find(i => i.id === id);
    setSelectedIntern(intern);
    setContractFile(null);
    setContractError("");
    setShowContractModal(true);
  };

  const confirmSendContract = () => {
    if (!contractFile) {
      setContractError("Vui lòng chọn file hợp đồng");
      return;
    }
    setInterns((prev) =>
      prev.map((i) =>
        i.id === selectedIntern.id ? { ...i, status: "Hợp đồng hoàn tất" } : i
      )
    );
    setShowContractModal(false);
    setContractError("");
    notify("📤 Đã gửi hợp đồng và hoàn tất");
  };

  const handleDelete = (id) => {
    const intern = interns.find(i => i.id === id);
    setSelectedIntern(intern);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setInterns((prev) => prev.filter((i) => i.id !== selectedIntern.id));
    setShowDeleteModal(false);
    notify("🗑️ Đã xóa hồ sơ thành công");
  };

  const handleUnlock = (id) => {
    setInterns((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "Chờ duyệt" } : i))
    );
    notify("🔓 Hồ sơ đã được mở lại để duyệt");
  };

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

  const notify = (msg) => {
    setModalSuccess(msg);
    setTimeout(() => setModalSuccess(""), 3000);
  };

const [showProfileModal, setShowProfileModal] = useState(false);
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
});
const [profileError, setProfileError] = useState({});
const [isEditProfile, setIsEditProfile] = useState(false);

// Thêm hồ sơ mới
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
  });
  setProfileError({});
  setIsEditProfile(false);
  setShowProfileModal(true);
};

// Sửa hồ sơ
const handleEditProfile = (intern) => {
  setSelectedIntern(intern);
  setProfileData({
    full_name: intern.fullName || "",
    gender: intern.gender || "Khác",
    dob: intern.dob || "",
    school: intern.school || "",
    major: intern.major || "",
    gpa: intern.gpa || "",
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
  // Validation cơ bản
  const errors = {};

  if (!profileData.full_name.trim()) errors.full_name = "Họ tên không được để trống";
  if (!profileData.gender) errors.gender = "Vui lòng chọn giới tính";
  if (!profileData.dob) errors.dob = "Ngày sinh không được để trống";
  if (!profileData.school.trim()) errors.school = "Trường không được để trống";
  if (!profileData.major.trim()) errors.major = "Ngành không được để trống";
  if (!profileData.gpa || profileData.gpa <= 0 || profileData.gpa > 4)
    errors.gpa = "GPA phải lớn hơn 0 và nhỏ hơn hoặc bằng 4.00";
  if (!profileData.phone.trim()) {
    errors.phone = "Số điện thoại không được để trống";
  } else if (!/^0\d{9}$/.test(profileData.phone)) {
    errors.phone = "Số điện thoại phải 10 số và bắt đầu bằng 0";
  }
  if (!profileData.address.trim()) errors.address = "Địa chỉ không được để trống";
  if (!profileData.photo_path) errors.photo_path = "Vui lòng chọn ảnh hồ sơ";

  if (Object.keys(errors).length > 0) {
    setProfileError(errors);
    return;
  }

  if (isEditProfile) {
    setInterns(prev =>
      prev.map(i =>
        i.id === selectedIntern.id
          ? { ...i, ...profileData, fullName: profileData.full_name }
          : i
      )
    );
    notify("✏️ Hồ sơ đã được cập nhật");
  } else {
    const newId = Math.max(...interns.map(i => i.id)) + 1;
    setInterns(prev => [...prev, { id: newId, ...profileData, fullName: profileData.full_name, status: "Chờ duyệt" }]);
    notify("➕ Hồ sơ mới đã được thêm");
  }
  setShowProfileModal(false);
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
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onAdd={handleAddProfile}
          />

          {modalSuccess && <div className="success-message">{modalSuccess}</div>}

          <HRInternTable
            interns={currentInterns}
            handlers={{
              handleAssignMentor,
              handleApprove,
              handleReject,
              handleEdit: handleEditProfile,
              handleDelete,
              handleUnlock,
              handleSendContract
            }}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredInterns.length}
            onPageChange={setCurrentPage}
          />

          {showAssignModal && <AssignMentorModal intern={selectedIntern} mentors={mockMentors} selectedMentor={selectedMentor} setSelectedMentor={setSelectedMentor} onClose={() => setShowAssignModal(false)} onSave={confirmAssign} error={assignError} />}
          {showRejectModal && <RejectModal intern={selectedIntern} reason={rejectReason} setReason={setRejectReason} onClose={() => setShowRejectModal(false)} onConfirm={confirmReject} error={rejectError} />}
          {showContractModal && <ContractModal intern={selectedIntern} contractFile={contractFile} setContractFile={setContractFile} onClose={() => setShowContractModal(false)} onConfirm={confirmSendContract} error={contractError} />}
          {showProfileModal && <ProfileModal isEdit={isEditProfile} intern={selectedIntern} profileData={profileData} setProfileData={setProfileData} onClose={() => setShowProfileModal(false)} onSubmit={handleProfileSubmit} errors={profileError} />}
          {showDeleteModal && <DeleteModal intern={selectedIntern} onClose={() => setShowDeleteModal(false)} onConfirm={confirmDelete} />}
        </div>
      </div>
    );
  };

  export default ManageInterns;

