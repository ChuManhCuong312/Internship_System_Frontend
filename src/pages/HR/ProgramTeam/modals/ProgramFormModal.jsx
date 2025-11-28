import React, { useMemo, useState, useEffect } from "react";
import { X } from "lucide-react";

export default function ProgramFormModal({
  isOpen,
  onClose,
  onSave,
  formData,
  setFormData,
  selectedProgram,
}) {
  const [showNameError, setShowNameError] = useState(false);

  // Reset error when modal opens
  useEffect(() => {
    if (isOpen) setShowNameError(false);
  }, [isOpen]);

  // Calculate min start date (today + 2 weeks)
  const today = new Date();
  const minStartDate = new Date(today);
  minStartDate.setDate(today.getDate() + 14);
  const formatLocalDate = (date) => {
    const pad = (n) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  };
  const minStartDateStr = formatLocalDate(minStartDate);

  // Auto-set end date to startDate + 1 month
  useEffect(() => {
    if (formData.startDate) {
      const start = new Date(formData.startDate);
      const autoEnd = new Date(start);
      autoEnd.setMonth(start.getMonth() + 1);
      const autoEndStr = autoEnd.toISOString().split("T")[0];

      if (!formData.endDate || new Date(formData.endDate) < autoEnd) {
        setFormData(prev => ({ ...prev, endDate: autoEndStr }));
      }
    }
  }, [formData.startDate]);

  useEffect(() => {
    if (isOpen) {
      if (selectedProgram) {
        // Pre-fill with existing program data
        setFormData({
          name: selectedProgram.name,
          department: selectedProgram.department,
          startDate: selectedProgram.startDate?.split("T")[0], // keep only date part
          endDate: selectedProgram.endDate?.split("T")[0],
          detail: selectedProgram.detail,
          maxInterns: selectedProgram.maxInterns,
        });
      } else {
        // Reset for create mode
        setFormData({});
      }
      setShowNameError(false);
    }
  }, [isOpen, selectedProgram]);


  // Calculate min end date for input validation
  const minEndDateStr = useMemo(() => {
    if (!formData.startDate) return "";
    const start = new Date(formData.startDate);
    const minEnd = new Date(start);
    minEnd.setMonth(start.getMonth() + 1);
    return minEnd.toISOString().split("T")[0];
  }, [formData.startDate]);

  // Max interns validation
  const maxInternsError =
    formData.maxInterns > 50
      ? "Số lượng TTS tối đa không được vượt quá 50."
      : formData.maxInterns < 1
      ? "Số lượng TTS tối thiểu là 1."
      : "";

  // Determine if update should be disabled based on status
  const isUpdateDisabled =
    selectedProgram &&
    (selectedProgram.programStatus === "ON_GOING" ||
      selectedProgram.programStatus === "FINISHED");

  const handleSave = () => {
    if (!formData.name?.trim()) {
      setShowNameError(true);
      return;
    }
    if (!maxInternsError && !isUpdateDisabled) {
      setShowNameError(false);
      onSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {selectedProgram ? "Cập nhật chương trình" : "Thêm chương trình mới"}
          </h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Program Name & Department in the same row */}
          <div className="form-row">
            {/* Program Name */}
            <div className="form-group">
              <label>
                Tên chương trình <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (showNameError && e.target.value.trim()) setShowNameError(false);
                }}
                className="form-input"
              />
              {showNameError && (
                <p style={{ color: "red", fontStyle: "italic", marginTop: "4px" }}>
                  Tên chương trình là bắt buộc.
                </p>
              )}
            </div>

            {/* Department */}
            <div className="form-group">
              <label>Phòng ban</label>
              <input
                type="text"
                placeholder="Nhập tên phòng ban"
                value={formData.department || ""}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          {/* Start & End Dates */}
          <div className="form-row">
            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input
                type="date"
                value={formData.startDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value, endDate: "" })
                }
                className="form-input"
                min={
                  selectedProgram
                    ? selectedProgram.startDate?.split("T")[0] // old start date in edit mode
                    : minStartDateStr // today + 2 weeks in create mode
                }
                disabled={isUpdateDisabled}
              />
            </div>

            <div className="form-group">
              <label>Ngày kết thúc</label>
              <input
                type="date"
                value={formData.endDate || ""}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="form-input"
                min={minEndDateStr}
                disabled={isUpdateDisabled || !formData.startDate}
              />
            </div>
          </div>

          {/* Program Details */}
          <div className="form-group">
            <label>Chi tiết chương trình</label>
            <textarea
              value={formData.detail || ""}
              onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
              className="form-textarea"
              rows={3}
              disabled={isUpdateDisabled}
            />
          </div>

          {/* Max Interns */}
          <div className="form-group">
            <label>Số lượng TTS tối đa</label>
            <input
              type="number"
              value={formData.maxInterns || ""}
              onChange={(e) =>
                setFormData({ ...formData, maxInterns: Number.parseInt(e.target.value) })
              }
              className="form-input"
              max={50}
              min={1}
              disabled={isUpdateDisabled}
            />
            {maxInternsError && (
              <p style={{ color: "red", fontStyle: "italic", marginTop: "4px" }}>
                {maxInternsError}
              </p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Huỷ
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isUpdateDisabled}>
            Lưu chương trình
          </button>
        </div>
      </div>
    </div>
  );
}
