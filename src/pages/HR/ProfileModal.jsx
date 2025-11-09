import React from "react";
import Modal from "../../components/Layout/Modal";

const ProfileModal = ({ isEdit, intern, profileData, setProfileData, onClose, onSubmit, errors }) => (
  <Modal title={isEdit ? `Chỉnh sửa hồ sơ: ${intern?.fullName}` : "Thêm hồ sơ mới"} onClose={onClose}>

    {/* Họ tên */}
    <div className="form-group">
      <label>Họ tên *</label>
      <input className="form-input" value={profileData.full_name} onChange={e => setProfileData({...profileData, full_name: e.target.value})}/>
      {errors.full_name && <p className="field-error">{errors.full_name}</p>}
    </div>

    {/* Ảnh hồ sơ */}
    <div className="form-group">
      <label>Ảnh hồ sơ *</label>
      <input type="file" accept="image/*" onChange={e => setProfileData({...profileData, photo_path: e.target.files[0]})}/>
      {errors.photo_path && <p className="field-error">{errors.photo_path}</p>}
      {profileData.photo_path && <p>Đã chọn: {profileData.photo_path.name}</p>}
    </div>

    {/* Giới tính */}
    <div className="form-group">
      <label>Giới tính *</label>
      <select className="form-input" value={profileData.gender} onChange={e => setProfileData({...profileData, gender: e.target.value})}>
        <option value="Nam">Nam</option>
        <option value="Nữ">Nữ</option>
        <option value="Khác">Khác</option>
      </select>
      {errors.gender && <p className="field-error">{errors.gender}</p>}
    </div>

    {/* Ngày sinh */}
    <div className="form-group">
      <label>Ngày sinh *</label>
      <input type="date" className="form-input" value={profileData.dob} onChange={e => setProfileData({...profileData, dob: e.target.value})}/>
      {errors.dob && <p className="field-error">{errors.dob}</p>}
    </div>

    {/* Trường */}
    <div className="form-group">
      <label>Trường *</label>
      <input className="form-input" value={profileData.school} readOnly/>
    </div>

    {/* Ngành */}
    <div className="form-group">
      <label>Ngành *</label>
      <select className="form-input" value={profileData.major} onChange={e => setProfileData({...profileData, major: e.target.value})}>
        <option value="">-- Chọn ngành --</option>
        <option value="CNTT">Công nghệ thông tin</option>
        <option value="QTKD">Quản trị kinh doanh</option>
        <option value="TKDH">Thiết kế đồ họa</option>
      </select>
      {errors.major && <p className="field-error">{errors.major}</p>}
    </div>

    {/* GPA */}
    <div className="form-group">
      <label>GPA</label>
      <input type="number" step="0.01" min="0.01" max="4" className="form-input" value={profileData.gpa} onChange={e => setProfileData({...profileData, gpa: e.target.value})}/>
      {errors.gpa && <p className="field-error">{errors.gpa}</p>}
    </div>

    {/* Số điện thoại */}
    <div className="form-group">
      <label>Số điện thoại *</label>
      <input className="form-input" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} placeholder="Ví dụ: 0987654321"/>
      {errors.phone && <p className="field-error">{errors.phone}</p>}
    </div>

    {/* Địa chỉ */}
    <div className="form-group">
      <label>Địa chỉ *</label>
      <input className="form-input" value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})}/>
      {errors.address && <p className="field-error">{errors.address}</p>}
    </div>

    {/* Tài liệu */}
    <div className="form-group">
      <label>Upload tài liệu (CV, Đơn xin TT)</label>
      <input
        type="file"
        multiple
        accept=".pdf,.doc,.docx"
        onChange={e => setProfileData({
          ...profileData,
          documents: [
            ...(profileData.documents || []),
            ...Array.from(e.target.files)
          ]
        })}
      />
      {profileData.documents && profileData.documents.length > 0 && (
        <ul className="file-list">
          {profileData.documents.map((file, idx) => (
            <li key={idx}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>

    {/* Nút hành động */}
    <div className="modal-actions">
      <button className="btn-cancel" onClick={onClose}>Hủy</button>
      <button className="btn-save" onClick={onSubmit}>{isEdit ? "Cập nhật" : "Thêm hồ sơ"}</button>
    </div>
  </Modal>
);

export default ProfileModal;
