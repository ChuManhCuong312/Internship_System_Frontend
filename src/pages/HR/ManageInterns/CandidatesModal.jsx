import React, { useEffect, useState, useContext } from "react";
import hrApi from "../../../api/hrApi";
import { AuthContext } from "../../../context/AuthContext";
import ProfileModal from "./modals/ProfileModal";
import Modal from "../../../components/Layout/Modal";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner";
import "../../../styles/buttons.css";
import { toast } from "react-toastify";
import { HrContext } from "../../../context/HrContext";

const CandidatesModal = ({ onClose, onSuccess }) => {
  const { token } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const res = await hrApi.getInternCandidatesWithoutProfile(token, 0, 10);
        setCandidates(res.content || []);
      } catch (err) {
        console.error("Error fetching candidates:", err);
        toast.error("Không thể tải danh sách ứng viên");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchCandidates();
  }, [token]);

 const { schoolOptions, majorOptions, setSchoolOptions, setMajorOptions, fetchFilters } = useContext(HrContext);

  const handleOpenProfileModal = (candidate) => {
    setSelectedCandidate(candidate);
    setProfileData({
      full_name: candidate.fullName,
      phone: candidate.phone || "",
      gender: "",
      major: "",
      gpa: "",
      address: "",
      dob: "",
      school: "CMC University",
      photo_path: null,
      documents: []
    });
    setErrors({});
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
    const gpaValue = parseFloat(profileData.gpa);

    if (!profileData.full_name || profileData.full_name.trim().length < 2) {
      newErrors.full_name = "Họ tên phải có ít nhất 2 ký tự";
    }

    if (!profileData.gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }

    if (!profileData.dob) {
      newErrors.dob = "Ngày sinh bắt buộc";
    } else {
      const birthDate = new Date(profileData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18) {
        newErrors.dob = "Tuổi phải từ 18 trở lên";
      } else if (birthDate >= today) {
        newErrors.dob = "Ngày sinh phải là ngày trong quá khứ";
      }
    }

    if (!profileData.major) {
      newErrors.major = "Vui lòng chọn ngành";
    }

    if (isNaN(gpaValue) || gpaValue <= 0 || gpaValue > 4) {
      newErrors.gpa = "GPA phải là số trong khoảng 0.01 - 4.0";
    }

    if (!profileData.phone || !/^0\d{9}$/.test(profileData.phone)) {
      newErrors.phone = "Số điện thoại phải bắt đầu từ 0 và có 10 chữ số";
    }

    if (!profileData.address || profileData.address.length < 5) {
      newErrors.address = "Địa chỉ phải có ít nhất 5 ký tự";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      profileData.dob = dobISO;

      await hrApi.createInternProfile(token, selectedCandidate.userId, profileData);
      toast.success("Tạo hồ sơ thành công ✅");
      if (profileData.school && !schoolOptions.includes(profileData.school)) {
            setSchoolOptions([...schoolOptions, profileData.school]);
          }
      if (profileData.major && !majorOptions.includes(profileData.major)) {
            setMajorOptions([...majorOptions, profileData.major]);
      }
      fetchFilters();
      const [majors, schools] = await Promise.all([
        hrApi.getAllMajors(token),
        hrApi.getAllSchools(token)
      ]);
      setMajorOptions(majors || []);
      setSchoolOptions(schools || []);
      setSelectedCandidate(null);
      onClose();
      if (typeof onSuccess === "function") {
        onSuccess(true);
      }
    } catch (err) {
      console.error("Error creating profile:", err);

      if (err.response?.status === 400 && err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === "object") {
          Object.values(errors).forEach(msg => toast.error(msg));
        } else {
          toast.error(errors);
        }
      } else {
        toast.error("Có lỗi xảy ra khi tạo hồ sơ ❌");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Ứng viên chưa có hồ sơ" onClose={onClose} className="modal-large">
      {loading ? (
        <div className="loading-card">
          <LoadingSpinner size="medium" />
          <p className="loading-text">Đang tải danh sách ứng viên...</p>
        </div>
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
            {candidates.length > 0 ? (
              candidates.map((c, idx) => (
                <tr key={c.userId}>
                  <td>{idx + 1}</td>
                  <td>{c.fullName}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>
                    <button
                      className="btn-primary"
                      onClick={() => handleOpenProfileModal(c)}
                    >
                      ➕ Thêm hồ sơ
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  Không có ứng viên nào chưa có hồ sơ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {selectedCandidate && (
        <ProfileModal
          isEdit={false}
          intern={selectedCandidate}
          profileData={profileData}
          setProfileData={setProfileData}
          onClose={() => {
            setSelectedCandidate(null);
            setErrors({});
          }}
          onSubmit={handleSubmitProfile}
          errors={errors}
          isLoading={isSubmitting}
          schoolOptions={schoolOptions}
          majorOptions={majorOptions}
        />
      )}
    </Modal>
  );
};

export default CandidatesModal;