import React from "react";
import Modal from "../../../../components/Layout/Modal";

const ViewProfileModal = ({ intern, onClose }) => (
  <Modal title={`📋 Chi tiết hồ sơ: ${intern.fullName}`} onClose={onClose}>
    <div className="profile-details">

      {/* Thông tin cá nhân */}
      <h3 className="section-title">👤 Thông tin cá nhân</h3>
      <div className="profile-header">
        {intern.avatar && (
          <div className="profile-avatar">
            <img src={intern.avatar} alt={intern.fullName} />
          </div>
        )}
        <div className="profile-info">
          <div className="detail-row"><label>Họ tên:</label><span>{intern.fullName}</span></div>
          <div className="detail-row"><label>Email:</label><span>{intern.email}</span></div>
          <div className="detail-row"><label>Số điện thoại:</label><span>{intern.phone}</span></div>
          <div className="detail-row"><label>Giới tính:</label><span>{intern.gender === "MALE" ? "Nam" : "Nữ"}</span></div>
          <div className="detail-row"><label>Ngày sinh:</label><span>{new Date(intern.dob).toLocaleDateString('vi-VN')}</span></div>
          <div className="detail-row"><label>Địa chỉ:</label><span>{intern.address}</span></div>
        </div>
      </div>

      {/* Thông tin học tập */}
      <h3 className="section-title">🎓 Thông tin học tập</h3>
      <div className="detail-row"><label>Trường:</label><span>{intern.school}</span></div>
      <div className="detail-row"><label>Ngành:</label><span>{intern.major}</span></div>
      <div className="detail-row"><label>GPA:</label><span>{intern.gpa}</span></div>

      {/* Tài liệu đính kèm */}
      <h3 className="section-title">📁 Tài liệu đính kèm</h3>
      <ul className="document-list">
        {intern.cvPath && (
          <li><a href={intern.cvPath} target="_blank" rel="noopener noreferrer">📄 CV</a></li>
        )}
        {intern.permissionFile && (
          <li><a href={intern.permissionFile} target="_blank" rel="noopener noreferrer">📄 Đơn xin</a></li>
        )}
        {intern.universityConfirm && (
          <li><a href={intern.universityConfirm} target="_blank" rel="noopener noreferrer">🎓 Xác nhận trường</a></li>
        )}
      </ul>
    </div>

    <div className="modal-actions">
      <button className="btn-cancel" onClick={onClose}>Đóng</button>
    </div>
  </Modal>
);

export default ViewProfileModal;
