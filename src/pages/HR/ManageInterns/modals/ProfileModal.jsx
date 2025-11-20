import React, { useState, useEffect } from "react";
import Modal from "../../../../components/Layout/Modal";

const ProfileModal = ({ isEdit, intern, profileData, setProfileData, onClose, onSubmit, errors: externalErrors = {} }) => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!profileData?.full_name) {
      newErrors.full_name = "Vui lòng nhập họ tên";
    } else if (profileData.full_name.length < 3) {
      newErrors.full_name = "Họ tên phải có ít nhất 3 ký tự";
    } else if (profileData.full_name.length > 100) {
      newErrors.full_name = "Họ tên không được vượt quá 100 ký tự";
    }

    // Gender validation
    if (!profileData?.gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }

    // Date of birth validation
    if (!profileData?.dob) {
      newErrors.dob = "Vui lòng nhập ngày sinh";
    } else {
      const dob = new Date(profileData.dob);
      const today = new Date();
      
      if (dob > today) {
        newErrors.dob = "Ngày sinh không thể là ngày trong tương lai";
      } else {
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        
        if (age < 18) {
          newErrors.dob = "Sinh viên phải ít nhất 18 tuổi";
        } else if (age > 100) {
          newErrors.dob = "Ngày sinh không hợp lệ";
        }
      }
    }

    // Major validation
    if (!profileData?.major) {
      newErrors.major = "Vui lòng chọn ngành học";
    }

    // GPA validation
    if (!profileData?.gpa) {
      newErrors.gpa = "Vui lòng nhập GPA";
    } else {
      const gpa = parseFloat(profileData.gpa);
      if (isNaN(gpa)) {
        newErrors.gpa = "GPA phải là số";
      } else if (gpa < 0.01) {
        newErrors.gpa = "GPA phải lớn hơn hoặc bằng 0.01";
      } else if (gpa > 4.0) {
        newErrors.gpa = "GPA không được vượt quá 4.0";
      }
    }

    // Phone validation
    if (!profileData?.phone) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^0\d{9}$/.test(profileData.phone)) {
      newErrors.phone = "Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số";
    }

    // Address validation
    if (!profileData?.address) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    } else if (profileData.address.length < 5) {
      newErrors.address = "Địa chỉ phải có ít nhất 5 ký tự";
    } else if (profileData.address.length > 200) {
      newErrors.address = "Địa chỉ không được vượt quá 200 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit with validation
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit();
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  };

  // Clear error for a specific field when user starts editing
  const updateField = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <Modal title={isEdit ? `Chỉnh sửa hồ sơ: ${intern?.fullName || ""}` : "Thêm hồ sơ mới"} onClose={onClose}>

    {/* Họ tên */}
    <div className="form-group">
      <label>Họ tên *</label>
      <input
        className="form-input"
        value={profileData?.full_name || ""}
        onChange={e => updateField('full_name', e.target.value)}
      />
      {errors?.full_name && <p className="field-error">{errors.full_name}</p>}
    </div>

    {/* Giới tính */}
    <div className="form-group">
      <label>Giới tính *</label>
      <select
        className="form-input"
        value={profileData?.gender || ""}
        onChange={e => updateField('gender', e.target.value)}
      >
        <option value="">-- Chọn giới tính --</option>
        <option value="MALE">Nam</option>
        <option value="FEMALE">Nữ</option>
      </select>
      {errors?.gender && <p className="field-error">{errors.gender}</p>}
    </div>

    {/* Ngày sinh */}
    <div className="form-group">
      <label>Ngày sinh *</label>
      <input
        type="date"
        className="form-input"
        value={profileData?.dob || ""}
        onChange={e => updateField('dob', e.target.value)}
      />
      {errors?.dob && <p className="field-error">{errors.dob}</p>}
    </div>

    {/* Trường (mặc định CMC University) */}
    <div className="form-group">
      <label>Trường *</label>
      <input
        className="form-input"
        value={profileData?.school || "CMC University"}
        readOnly
      />
    </div>

    {/* Ngành */}
    <div className="form-group">
      <label>Ngành *</label>
      <select
        className="form-input"
        value={profileData?.major || ""}
        onChange={e => updateField('major', e.target.value)}
      >
        <option value="">-- Chọn ngành --</option>
        <option value="Công nghệ thông tin">Công nghệ thông tin</option>
        <option value="Quản trị kinh doanh">Quản trị kinh doanh</option>
        <option value="Thiết kế đồ họa">Thiết kế đồ họa</option>
        <option value="Phân tích dữ liệu">Phân tích dữ liệu</option>
      </select>
      {errors?.major && <p className="field-error">{errors.major}</p>}
    </div>

    {/* GPA */}
    <div className="form-group">
      <label>GPA *</label>
      <input
        type="number"
        step="0.01"
        min="0.01"
        max="4"
        className="form-input"
        value={profileData?.gpa || ""}
        onChange={e => updateField('gpa', e.target.value)}
        onInput={e => {
          if (parseFloat(e.target.value) > 4) {
            e.target.value = "4";
          }
          if (parseFloat(e.target.value) < 0) {
            e.target.value = "0.01";
          }
        }}
        required
      />
      {errors?.gpa && <p className="field-error">{errors.gpa}</p>}
    </div>

    {/* Số điện thoại */}
    <div className="form-group">
      <label>Số điện thoại *</label>
      <input
        className="form-input"
        value={profileData?.phone || ""}
        onChange={e => updateField('phone', e.target.value)}
        placeholder="Ví dụ: 0987654321"
      />
      {errors?.phone && <p className="field-error">{errors.phone}</p>}
    </div>

    {/* Địa chỉ */}
    <div className="form-group">
      <label>Địa chỉ *</label>
      <input
        className="form-input"
        value={profileData?.address || ""}
        onChange={e => updateField('address', e.target.value)}
      />
      {errors?.address && <p className="field-error">{errors.address}</p>}
    </div>

    {/* Nút hành động */}
    <div className="modal-actions">
      <button className="btn-cancel" onClick={onClose} disabled={isSubmitting}>Hủy</button>
      <button 
        className="btn-save" 
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Đang xử lý..." : isEdit ? "Cập nhật" : "Thêm hồ sơ"}
      </button>
    </div>
    </Modal>
  );
};

export default ProfileModal;
