
import React from "react";
import { X } from "lucide-react";

export default function ProgramFormModal({
  isOpen,
  onClose,
  onSave,
  formData,
  setFormData,
  selectedProgram,
  allDepartments,
  isDatePassed
}) {
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
          <div className="form-group">
            <label>Tên chương trình</label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Phòng ban</label>
            <select
              value={formData.department || ""}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="select"
            >
              <option value="">Chọn phòng ban</option>
              {allDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input
                type="date"
                value={formData.start_date || ""}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="form-input"
                disabled={selectedProgram && isDatePassed(selectedProgram.start_date)}
              />
              {selectedProgram && isDatePassed(selectedProgram.start_date) && (
                <p className="form-hint">Ngày bắt đầu đã bị khoá0 (chương trình đã bắt đầu)</p>
              )}
            </div>

            <div className="form-group">
              <label>Ngày kết thúc</label>
              <input
                type="date"
                value={formData.end_date || ""}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Chi tiết chương trình</label>
            <textarea
              value={formData.detail || ""}
              onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Số lượng TTS tối đa</label>
            <input
              type="number"
              value={formData.max_interns || ""}
              onChange={(e) => setFormData({ ...formData, max_interns: Number.parseInt(e.target.value) })}
              className="form-input"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Huỷ
          </button>
          <button className="btn btn-primary" onClick={onSave}>
            Lưu chương trình
          </button>
        </div>
      </div>
    </div>
  );
}
