import React, { useState } from "react";
import { MdUpload, MdCheckCircle, MdDescription } from "react-icons/md";
import Modal from "../../../../components/Layout/Modal";

const RequiredFilesModal = ({ onClose, onFilesUploaded, handleCvFileChange, handlePermissionFileChange, handleUniversityConfirmChange, cvFile, permissionFile, universityConfirm }) => {
  const [uploadedFiles, setUploadedFiles] = useState({
    cv: !!cvFile,
    permission: !!permissionFile,
    university: !!universityConfirm
  });

  const allFilesUploaded = uploadedFiles.cv && uploadedFiles.permission && uploadedFiles.university;

  const handleCvUpload = (e) => {
    if (e.target.files?.[0]) {
      setUploadedFiles(prev => ({ ...prev, cv: true }));
      handleCvFileChange(e);
    }
  };

  const handlePermissionUpload = (e) => {
    if (e.target.files?.[0]) {
      setUploadedFiles(prev => ({ ...prev, permission: true }));
      handlePermissionFileChange(e);
    }
  };

  const handleUniversityUpload = (e) => {
    if (e.target.files?.[0]) {
      setUploadedFiles(prev => ({ ...prev, university: true }));
      handleUniversityConfirmChange(e);
    }
  };

  const handleContinue = () => {
    if (allFilesUploaded) {
      onFilesUploaded();
    }
  };

  return (
    <Modal title="Hoàn thiện hồ sơ - Tải lên tài liệu bắt buộc" onClose={null}>
      <div style={{ padding: "20px 0" }}>
        <p style={{ marginBottom: "20px", color: "#333", fontWeight: "500" }}>
          Vui lòng tải lên 3 tài liệu sau để hoàn thiện hồ sơ của bạn:
        </p>

        {/* CV Upload */}
        <div className="form-group" style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "8px", border: uploadedFiles.cv ? "2px solid #27ae60" : "2px solid #e0e0e0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "600", color: "#333" }}>
              <MdDescription size={20} />
              CV của bạn
            </label>
            {uploadedFiles.cv && <MdCheckCircle size={24} color="#27ae60" />}
          </div>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: "#3498db", color: "white", borderRadius: "6px", cursor: "pointer", fontWeight: "500", transition: "background-color 0.3s" }} onMouseEnter={(e) => e.target.style.backgroundColor = "#2980b9"} onMouseLeave={(e) => e.target.style.backgroundColor = "#3498db"}>
            <MdUpload size={18} />
            {uploadedFiles.cv ? "Đã tải lên" : "Chọn file"}
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} style={{ display: "none" }} />
          </label>
          {uploadedFiles.cv && <p style={{ marginTop: "8px", color: "#27ae60", fontSize: "14px" }}>✓ File đã được tải lên</p>}
        </div>

        {/* Permission File Upload */}
        <div className="form-group" style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "8px", border: uploadedFiles.permission ? "2px solid #27ae60" : "2px solid #e0e0e0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "600", color: "#333" }}>
              <MdDescription size={20} />
              Đơn xin thực tập
            </label>
            {uploadedFiles.permission && <MdCheckCircle size={24} color="#27ae60" />}
          </div>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: "#3498db", color: "white", borderRadius: "6px", cursor: "pointer", fontWeight: "500", transition: "background-color 0.3s" }} onMouseEnter={(e) => e.target.style.backgroundColor = "#2980b9"} onMouseLeave={(e) => e.target.style.backgroundColor = "#3498db"}>
            <MdUpload size={18} />
            {uploadedFiles.permission ? "Đã tải lên" : "Chọn file"}
            <input type="file" accept=".pdf,.doc,.docx" onChange={handlePermissionUpload} style={{ display: "none" }} />
          </label>
          {uploadedFiles.permission && <p style={{ marginTop: "8px", color: "#27ae60", fontSize: "14px" }}>✓ File đã được tải lên</p>}
        </div>

        {/* University Confirmation Upload */}
        <div className="form-group" style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "8px", border: uploadedFiles.university ? "2px solid #27ae60" : "2px solid #e0e0e0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "600", color: "#333" }}>
              <MdDescription size={20} />
              Đơn xác nhận của trường
            </label>
            {uploadedFiles.university && <MdCheckCircle size={24} color="#27ae60" />}
          </div>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: "#3498db", color: "white", borderRadius: "6px", cursor: "pointer", fontWeight: "500", transition: "background-color 0.3s" }} onMouseEnter={(e) => e.target.style.backgroundColor = "#2980b9"} onMouseLeave={(e) => e.target.style.backgroundColor = "#3498db"}>
            <MdUpload size={18} />
            {uploadedFiles.university ? "Đã tải lên" : "Chọn file"}
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleUniversityUpload} style={{ display: "none" }} />
          </label>
          {uploadedFiles.university && <p style={{ marginTop: "8px", color: "#27ae60", fontSize: "14px" }}>✓ File đã được tải lên</p>}
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: "30px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#333" }}>Tiến độ:</span>
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#3498db" }}>{Object.values(uploadedFiles).filter(Boolean).length}/3</span>
          </div>
          <div style={{ width: "100%", height: "8px", backgroundColor: "#e0e0e0", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${(Object.values(uploadedFiles).filter(Boolean).length / 3) * 100}%`, height: "100%", backgroundColor: "#27ae60", transition: "width 0.3s ease" }} />
          </div>
        </div>

        {/* Continue Button */}
        <div className="modal-actions" style={{ marginTop: "30px" }}>
          <button
            className="btn-save"
            onClick={handleContinue}
            disabled={!allFilesUploaded}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: allFilesUploaded ? "#27ae60" : "#bdc3c7",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: allFilesUploaded ? "pointer" : "not-allowed",
              fontWeight: "600",
              fontSize: "16px",
              transition: "background-color 0.3s"
            }}
            onMouseEnter={(e) => {
              if (allFilesUploaded) e.target.style.backgroundColor = "#229954";
            }}
            onMouseLeave={(e) => {
              if (allFilesUploaded) e.target.style.backgroundColor = "#27ae60";
            }}
          >
            {allFilesUploaded ? "Tiếp tục" : "Vui lòng tải lên tất cả 3 tài liệu"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RequiredFilesModal;
