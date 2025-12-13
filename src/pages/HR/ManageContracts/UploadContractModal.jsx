import React, { useState, useRef } from "react";
import Modal from "../../../components/Layout/Modal";
import { LoadingButton } from "../../../components/Common/LoadingSpinner";

const UploadContractModal = ({
  contract,
  onClose,
  onSubmit,
  isLoading,
  isReplace = false,
}) => {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState(contract?.note || "");
  const [fileError, setFileError] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setPreviewFileName("");
      setFileError("");
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setFileError("Chỉ chấp nhận file PDF hoặc DOCX");
      setFile(null);
      setPreviewFileName("");
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError(`Kích thước file không được vượt quá ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      setFile(null);
      setPreviewFileName("");
      return;
    }

    setFile(selectedFile);
    setPreviewFileName(selectedFile.name);
    setFileError("");
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewFileName("");
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!file && !isReplace) {
      setFileError("Vui lòng chọn file hợp đồng");
      return;
    }

    if (file && fileError) {
      return;
    }

    if (file) {
      onSubmit(file, note);
    } else if (isReplace) {
      // Allow updating note only if no new file selected
      onSubmit(null, note);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Modal
      title={
        isReplace
          ? `Thay thế hợp đồng: ${contract?.fullName || ""}`
          : `Upload hợp đồng: ${contract?.fullName || ""}`
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="upload-contract-form">
        {/* Intern Info */}
        <div className="form-group">
          <label>Thực tập sinh</label>
          <input
            type="text"
            value={`${contract?.fullName || ""} - ${contract?.phone || ""}`}
            readOnly
            className="form-input readonly"
          />
        </div>

        {/* File Upload */}
        <div className="form-group">
          <label>
            File hợp đồng * <span className="file-hint">(PDF, DOCX - Tối đa 10MB)</span>
          </label>
          <div className="file-upload-container">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="file-input"
              disabled={isLoading}
            />
            {previewFileName && (
              <div className="file-preview">
                <span className="file-name">📄 {previewFileName}</span>
                {file && (
                  <span className="file-size">
                    ({formatFileSize(file.size)})
                  </span>
                )}
                <button
                  type="button"
                  className="btn-remove-file"
                  onClick={handleRemoveFile}
                  disabled={isLoading}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          {fileError && <p className="field-error">{fileError}</p>}
        </div>

        {/* Note */}
        <div className="form-group">
          <label>Chú thích</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập ghi chú (tùy chọn)"
            rows="3"
            className="form-textarea"
            disabled={isLoading}
          />
        </div>

        {/* Current Contract Info (if replacing) */}
        {isReplace && (contract?.filePath || contract?.file_path) && (
          <div className="form-group">
            <label>Hợp đồng hiện tại</label>
            <div className="current-contract-info">
              <a
                href={contract.filePath || contract.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="current-contract-link"
              >
                📄 Xem hợp đồng hiện tại
              </a>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="modal-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </button>
          <LoadingButton
            type="submit"
            className="btn-submit"
            isLoading={isLoading}
            disabled={!file && !isReplace}
          >
            {isReplace ? "Thay thế" : "Upload"}
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
};

export default UploadContractModal;

