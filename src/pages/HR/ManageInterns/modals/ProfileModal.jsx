import React from "react";
import Modal from "../../../../components/Layout/Modal";
import { LoadingButton } from "../../../../components/common/LoadingSpinner";

const ProfileModal = ({
  isEdit,
  intern,
  profileData,
  setProfileData,
  onClose,
  onSubmit,
  errors,
  isLoading
}) => (
  <Modal title={isEdit ? `Chỉnh sửa hồ sơ: ${intern?.fullName || ""}` : "Thêm hồ sơ mới"} onClose={onClose}>

    {/* Họ tên */}
    <div className="form-group">
      <label>Họ tên *</label>
      <input
        className="form-input"
        value={profileData?.full_name || ""}
        onChange={e => setProfileData({ ...profileData, full_name: e.target.value })}
        disabled={isLoading}
      />
      {errors?.full_name && <p className="field-error">{errors.full_name}</p>}
    </div>

    {/* Giới tính */}
    <div className="form-group">
      <label>Giới tính *</label>
      <select
        className="form-input"
        value={profileData?.gender || ""}
        onChange={e => setProfileData({ ...profileData, gender: e.target.value })}
        disabled={isLoading}
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
        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
        disabled={isLoading}
      />
      {errors?.dob && <p className="field-error">{errors.dob}</p>}
    </div>

    {/* Trường */}
    <div className="form-group">
      <label>Trường *</label>
      <select
        className="form-input"
        value={profileData?.school || ""}
        onChange={e => setProfileData({ ...profileData, school: e.target.value })}
        disabled={isLoading}
      >
        <option value="">-- Chọn trường --</option>
        <option value="CMC University">CMC University</option>
        <option value="Đại học Quốc gia Hà Nội">Đại học Quốc gia Hà Nội</option>
        <option value="Đại học Bách Khoa Hà Nội">Đại học Bách Khoa Hà Nội</option>
        <option value="Đại học Kinh tế Quốc dân">Đại học Kinh tế Quốc dân</option>
        <option value="OTHER">Khác...</option>
      </select>

      {profileData?.school === "OTHER" && (
        <input
          className="form-input"
          placeholder="Nhập tên trường"
          value={profileData?.customSchool || ""}
          onChange={e => setProfileData({ ...profileData, customSchool: e.target.value })}
          disabled={isLoading}
        />
      )}

      {errors?.school && <p className="field-error">{errors.school}</p>}
    </div>

    {/* Ngành */}
    <div className="form-group">
      <label>Ngành *</label>
      <select
        className="form-input"
        value={profileData?.major || ""}
        onChange={e => setProfileData({ ...profileData, major: e.target.value })}
        disabled={isLoading}
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
        onChange={e => setProfileData({ ...profileData, gpa: e.target.value })}
        onInput={e => {
          if (parseFloat(e.target.value) > 4) {
            e.target.value = "4";
          }
          if (parseFloat(e.target.value) < 0) {
            e.target.value = "0.01";
          }
        }}
        disabled={isLoading}
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
        onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
        placeholder="Ví dụ: 0987654321"
        disabled={isLoading}
      />
      {errors?.phone && <p className="field-error">{errors.phone}</p>}
    </div>

    {/* Địa chỉ */}
    <div className="form-group">
      <label>Địa chỉ *</label>
      <input
        className="form-input"
        value={profileData?.address || ""}
        onChange={e => setProfileData({ ...profileData, address: e.target.value })}
        disabled={isLoading}
      />
      {errors?.address && <p className="field-error">{errors.address}</p>}
    </div>

    {/* Nút hành động */}
    <div className="modal-actions">
      <button className="btn-cancel" onClick={onClose} disabled={isLoading}>
        Hủy
      </button>
      <LoadingButton
        className="btn-save"
        onClick={onSubmit}
        isLoading={isLoading}
      >
        {isEdit ? "Cập nhật" : "Thêm hồ sơ"}
      </LoadingButton>
    </div>
  </Modal>
);

export default ProfileModal;