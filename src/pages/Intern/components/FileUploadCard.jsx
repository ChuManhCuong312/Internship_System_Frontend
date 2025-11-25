import React from 'react';
import { MdDescription, MdDownload, MdUpload } from 'react-icons/md';

const FileUploadCard = ({ label, fileUrl, downloadText, onFileChange }) => (
    <div className="info-card full-width">
        <MdDescription className="info-icon" />
        <div style={{ width: '100%' }}>
            <div className="info-label">{label}</div>
            <div className="file-actions">
                {fileUrl ? (
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                        <MdDownload /> {downloadText}
                    </a>
                ) : (
                    <span>Chưa tải lên</span>
                )}
                <label className="btn-upload-small">
                    <MdUpload /> Tải lên
                    <input type="file" accept=".pdf,.doc,.docx" onChange={onFileChange} />
                </label>
            </div>
        </div>
    </div>
);

export default FileUploadCard;
