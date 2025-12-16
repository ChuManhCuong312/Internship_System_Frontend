import React from "react";
import Modal from "../../../../components/Layout/Modal";
import { LoadingButton } from "../../../../components/Common/LoadingSpinner";
import { Autocomplete, TextField } from "@mui/material";

const ProfileModal = ({
  isEdit,
  intern,
  profileData,
  setProfileData,
  onClose,
  onSubmit,
  errors,
  isLoading,
  schoolOptions = [],
  majorOptions = []
}) => {
      const handleGpaChange = (e) => {
        let value = e.target.value;
        
        if (value === "") {
          setProfileData({ ...profileData, gpa: "" });
          return;
        }

        value = value.replace(/[^0-9.]/g, '');
        
        const parts = value.split('.');
        if (parts.length > 2) {
          value = parts[0] + '.' + parts.slice(1).join('');
        }
        
        if (parts.length === 2 && parts[1].length > 2) {
          value = parts[0] + '.' + parts[1].substring(0, 2);
        }

        setProfileData({ ...profileData, gpa: value });
      };

      const handleGpaBlur = (e) => {
        let value = e.target.value;

        if (value === "" || value === null || value === undefined) {
          setProfileData({ ...profileData, gpa: "" });
          return;
        }

        const numValue = parseFloat(value);
        
        if (isNaN(numValue)) {
          setProfileData({ ...profileData, gpa: "" });
          return;
        }

        if (numValue > 4) {
          value = "4";
        } else if (numValue < 0) {
          value = "0";
        } else {

          const rounded = Math.round((numValue + Number.EPSILON) * 100) / 100;
          
          if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
            value = Math.round(rounded).toString();
          } else {
            const formatted = rounded.toFixed(2);
            value = formatted.replace(/\.?0+$/, '');
          }
        }

        setProfileData({ ...profileData, gpa: value });
      };

      return (
  <Modal title={isEdit ? `Chỉnh sửa hồ sơ: ${intern?.fullName || ""}` : "Thêm hồ sơ mới"} onClose={onClose}>

    {/* Họ tên */}
    <div className="form-group">
      <label>Họ tên *</label>
      <input
        className={`form-input ${isEdit ? "input-disabled" : ""}`}
        value={profileData?.full_name || ""}
        onChange={e => setProfileData({ ...profileData, full_name: e.target.value })}
        disabled={isEdit || isLoading}
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
       <input
              className="form-input"
              value={profileData?.school || ""}
              onChange={e => setProfileData({ ...profileData, school: e.target.value })}
              placeholder="Nhập tên trường"
              disabled={isLoading}
            />
      {errors?.school && <p className="field-error">{errors.school}</p>}
      </div>

    {/* Ngành */}
    <div className="form-group">
      <label>Ngành *</label>
      <Autocomplete
        freeSolo
        options={majorOptions}
        value={profileData?.major || ""}
        onChange={(event, newValue) => {
          setProfileData({ ...profileData, major: newValue });
        }}
        onInputChange={(event, newInputValue) => {
          setProfileData({ ...profileData, major: newInputValue });
        }}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" className="form-input" />
        )}
        disabled={isLoading}
      />
      {errors?.major && <p className="field-error">{errors.major}</p>}
      </div>

    {/* GPA */}
    <div className="form-group">
            <label>GPA *</label>
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]{0,2}"
              className="form-input"
              value={profileData?.gpa || ""}
              onChange={handleGpaChange}
              onBlur={handleGpaBlur}
              placeholder="0.00 - 4.00"
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
};
export default ProfileModal;