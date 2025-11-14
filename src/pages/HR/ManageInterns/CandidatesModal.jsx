import React, { useEffect, useState, useContext } from "react";
import hrApi from "../../../api/hrApi";
import { AuthContext } from "../../../context/AuthContext";
import ProfileModal from "./modals/ProfileModal";
import Modal from "../../../components/Layout/Modal";
import "../../../styles/buttons.css";

const CandidatesModal = ({ onClose, onSuccess }) => {
  const { token } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await hrApi.getInternCandidatesWithoutProfile(token, 0, 10);
        setCandidates(res.content || []);
      } catch (err) {
        console.error("Error fetching candidates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [token]);

  const handleOpenProfileModal = (candidate) => {
    setSelectedCandidate(candidate);
    setProfileData({
      full_name: candidate.fullName,
      phone: candidate.phone || "",
      major: "",
      gpa: "",
      address: "",
      gender: "",
      dob: "",
      photo_path: null,
      documents: []
    });
  };
const formatDateToISO = (dateStr) => {
  if (dateStr.includes("/")) {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

  const handleSubmitProfile = async () => {
    const newErrors = {};
const dobISO = formatDateToISO(profileData.dob);
profileData.dob = dobISO;

    if (!profileData.full_name || profileData.full_name.trim().length < 2) {
      newErrors.full_name = "Họ tên phải có ít nhất 2 ký tự";
    }

    if (!profileData.gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }

    if (!profileData.dob) {
      newErrors.dob = "Ngày sinh bắt buộc";
    } else if (new Date(profileData.dob) >= new Date()) {
      newErrors.dob = "Ngày sinh phải là ngày trong quá khứ";
    }

    if (!profileData.major) {
      newErrors.major = "Vui lòng chọn ngành";
    }

    if (!profileData.gpa || profileData.gpa <= 0 || profileData.gpa > 4) {
      newErrors.gpa = "GPA phải nằm trong khoảng 0.01 - 4.0";
    }

    if (!profileData.phone || !/^0\d{9}$/.test(profileData.phone)) {
      newErrors.phone = "Số điện thoại phải bắt đầu từ 0 và có 10 chữ số";
    }

    if (!profileData.address || profileData.address.trim().length < 5) {
      newErrors.address = "Địa chỉ phải có ít nhất 5 ký tự";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await hrApi.createInternProfile(token, selectedCandidate.userId, profileData);
      setSelectedCandidate(null);
      onClose();
      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (err) {
      console.error("Error creating profile:", err);
    }
};
  return (
<Modal title="Ứng viên chưa có hồ sơ" onClose={onClose} className="modal-large">
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c, idx) => (
              <tr key={c.userId}>
                <td>{idx + 1}</td>
                <td>{c.fullName}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>
                  <button className="btn-primary" onClick={() => handleOpenProfileModal(c)}>➕ Thêm hồ sơ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedCandidate && (
        <ProfileModal
          isEdit={false}
          intern={selectedCandidate}
          profileData={profileData}
          setProfileData={setProfileData}
          onClose={() => setSelectedCandidate(null)}
          onSubmit={handleSubmitProfile}
          errors={errors}
        />
      )}
    </Modal>
  );
};

export default CandidatesModal;
