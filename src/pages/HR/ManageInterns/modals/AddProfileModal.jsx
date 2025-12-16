import React, { useState, useEffect } from "react";
import Modal from "../../../../components/Layout/Modal";

const AddProfileModal = ({ isOpen, onClose, isCreating, intern, profileData, setProfileData, onSubmit, errors: externalErrors = {} }) => {
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validation function
    const validateForm = () => {
        const newErrors = {};

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

        // GPA validation - only required when editing, optional when creating
        if (profileData?.gpa) {
            const gpa = parseFloat(profileData.gpa);
            if (isNaN(gpa)) {
                newErrors.gpa = "GPA phải là số";
            } else if (gpa < 0.01) {
                newErrors.gpa = "GPA phải lớn hơn hoặc bằng 0.01";
            } else if (gpa > 4.0) {
                newErrors.gpa = "GPA không được vượt quá 4.0";
            }
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
        console.log("handleSubmit called");
        if (!validateForm()) {
            console.log("Form validation failed");
            return;
        }

        console.log("Form validation passed, calling onSubmit");
        setIsSubmitting(true);
        try {
            await onSubmit();
            console.log("onSubmit completed successfully");
            setIsSubmitting(false);
            // Refresh the page after successful submission
            window.location.reload();
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

    // Don't render modal if not open
    if (!isOpen) {
        return null;
    }

    return (
        <Modal title={isCreating ? `Tạo mới hồ sơ: ${profileData?.full_name || intern?.fullName || ""}` : "Thêm hồ sơ mới"} onClose={onClose}>

        {/* Họ tên */}
        {/* Giới tính */}
        <div className="form-group">
            <label>Giới tính *</label>
            <select
                className="form-input"
                value={profileData?.gender || ""}
                onChange={e => setProfileData({ ...profileData, gender: e.target.value })}
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
                onChange={e => setProfileData({ ...profileData, dob: e.target.value })}
            />
            {errors?.dob && <p className="field-error">{errors.dob}</p>}
        </div>

        {/* Trường (mặc định CMC University) */}
        <div className="form-group">
            <label>Trường *</label>
            <input
                className="form-input"
                value={profileData?.school || ""}
                readOnly
            />
        </div>

        {/* Ngành */}
        <div className="form-group">
            <label>Ngành *</label>
            <select
                className="form-input"
                value={profileData?.major || ""}
                onChange={e => setProfileData({ ...profileData, major: e.target.value })}
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
            <label>GPA (Tùy chọn)</label>
            <input
                type="number"
                step="0.01"
                min="0.01"
                max="4"
                className="form-input"
                value={profileData?.gpa || ""}
                onChange={e => setProfileData({ ...profileData, gpa: e.target.value })}
                onInput={e => {
                    if (parseFloat(e.target.value) > 4) {
                        e.target.value = "4";
                    }
                    if (parseFloat(e.target.value) < 0) {
                        e.target.value = "0.01";
                    }
                }}
            />
            {errors?.gpa && <p className="field-error">{errors.gpa}</p>}
        </div>

        {/* Địa chỉ */}
        <div className="form-group">
            <label>Địa chỉ *</label>
            <input
                className="form-input"
                value={profileData?.address || ""}
                onChange={e => setProfileData({ ...profileData, address: e.target.value })}
            />
            {errors?.address && <p className="field-error">{errors.address}</p>}
        </div>

        {/* Nút hành động */}
        <div className="modal-actions">
            <button 
                className="btn-save" 
                onClick={handleSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? "Đang xử lý..." : isCreating ? "Tạo hồ sơ" : "Thêm hồ sơ"}
            </button>
        </div>
    </Modal>
    );
};

export default AddProfileModal;