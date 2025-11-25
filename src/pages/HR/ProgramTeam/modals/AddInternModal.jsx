import React from "react";
import { X, Phone } from "lucide-react";

export default function AddInternModal({
  isOpen,
  onClose,
  internSearchQuery,
  handleInternSearch,
  showInternSuggestions,
  internSuggestions,
  handleSelectIntern,
  internFormData,
  handleAddIntern
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Thêm thực tập sinh vào Team</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Search Intern */}
          <div className="form-group">
            <label>Tìm thực tập sinh theo tên</label>
            <div className="search-container-form">
              <input
                type="text"
                placeholder="Type intern name..."
                value={internSearchQuery}
                onChange={(e) => handleInternSearch(e.target.value)}
                className="form-input"
              />

              {showInternSuggestions && internSuggestions.length > 0 && (
                <div className="suggestions-list">
                  {internSuggestions.map((intern) => (
                    <div
                      key={intern.intern_id}
                      className="suggestion-item"
                      onClick={() => handleSelectIntern(intern)}
                    >
                      <div>
                        <p className="suggestion-name">{intern.name}</p>
                        <p className="suggestion-info">
                          <Phone size={14} /> {intern.phone}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Intern Details */}
          {Object.keys(internFormData).length > 0 && (
            <div className="selected-intern">
              <div className="intern-details">
                <p className="detail-label">Tên:</p>
                <p className="detail-value">{internFormData.name}</p>
              </div>
              <div className="intern-details">
                <p className="detail-label">SĐT:</p>
                <p className="detail-value">{internFormData.phone}</p>
              </div>
              <div className="intern-details">
                <p className="detail-label">Email:</p>
                <p className="detail-value">{internFormData.email}</p>
              </div>
              <div className="intern-details">
                <p className="detail-label">Chuyên ngành:</p>
                <p className="detail-value">{internFormData.major}</p>
              </div>
              <div className="intern-details">
                <p className="detail-label">Trường:</p>
                <p className="detail-value">{internFormData.school}</p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Huỷ
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAddIntern}
            disabled={Object.keys(internFormData).length === 0}
          >
            Thêm thực tập sinh
          </button>
        </div>
      </div>
    </div>
  );
}
