import React from "react";
import Modal from "../../components/Layout/Modal";

const AssignMentorModal = ({ intern, mentors, selectedMentor, setSelectedMentor, onClose, onSave, error }) => (
  <Modal title={`Phân công mentor cho ${intern?.fullName}`} onClose={onClose}>
    <div className="form-group">
      <label>Chọn Mentor *</label>
      <select
        className="form-input"
        value={selectedMentor}
        onChange={(e) => setSelectedMentor(e.target.value)}
      >
        <option value="">-- Chọn mentor --</option>
        {mentors.map((m) => (
          <option key={m.id} value={m.name}>{m.name}</option>
        ))}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
    <div className="modal-actions">
      <button className="btn-cancel" onClick={onClose}>Hủy</button>
      <button className="btn-save" onClick={onSave}>Lưu</button>
    </div>
  </Modal>
);

export default AssignMentorModal;
