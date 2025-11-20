import React from "react";
import Modal from "../../../../components/Layout/Modal";

const ViewProfileModal = ({ intern, onClose }) => (
  <Modal title={`Chi tiết hồ sơ: ${intern.fullName}`} onClose={onClose}>
    <div className="profile-details">
      <div className="detail-row">
        <label>Họ tên:</label>
        <span>{intern.fullName}</span>
      </div>

      <div className="detail-row">
        <label>Email:</label>
        <span>{intern.email}</span>
      </div>

      <div className="detail-row">
        <label>Số điện thoại:</label>
        <span>{intern.phone}</span>
      </div>

      <div className="detail-row">
        <label>Giới tính:</label>
        <span>{intern.gender === "MALE" ? "Nam" : "Nữ"}</span>
      </div>

      <div className="detail-row">
        <label>Ngày sinh:</label>
        <span>{new Date(intern.dob).toLocaleDateString('vi-VN')}</span>
      </div>

      <div className="detail-row">
        <label>Trường:</label>
        <span>{intern.school}</span>
      </div>

      <div className="detail-row">
        <label>Ngành:</label>
        <span>{intern.major}</span>
      </div>

      <div className="detail-row">
        <label>GPA:</label>
        <span>{intern.gpa}</span>
      </div>

      <div className="detail-row">
        <label>Địa chỉ:</label>
        <span>{intern.address}</span>
      </div>

      {(intern.cvPath || intern.permissionFile) && (
        <div className="detail-row">
          <label>Tài liệu:</label>
          <div className="document-links">
            {intern.cvPath && (
              <a href={intern.cvPath} target="_blank" rel="noopener noreferrer" className="doc-link">
                📄 Xem CV
              </a>
            )}
            {intern.permissionFile && (
              <a href={intern.permissionFile} target="_blank" rel="noopener noreferrer" className="doc-link">
                📄 Xem đơn xin
              </a>
            )}
          </div>
        </div>
      )}
    </div>

    <div className="modal-actions">
      <button className="btn-cancel" onClick={onClose}>Đóng</button>
    </div>
  </Modal>
);

export default ViewProfileModal;