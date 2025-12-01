import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../../styles/taskModal.css';

const TaskModal = ({ isOpen, onClose, onSubmit, task = null, programs = [], teams = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    programId: '',
    priority: 'MEDIUM',
    status: 'TODO',
    deadline: '',
    teamIds: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        programId: task.programId || '',
        priority: task.priority || 'MEDIUM',
        status: task.status || 'TODO',
        deadline: task.deadline || '',
        teamIds: task.teamIds || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        programId: '',
        priority: 'MEDIUM',
        status: 'TODO',
        deadline: '',
        teamIds: [],
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả không được để trống';
    }
    if (!formData.programId) {
      newErrors.programId = 'Vui lòng chọn chương trình';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Vui lòng chọn hạn chót';
    } else {
      const selectedDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.deadline = 'Hạn chót không được trong quá khứ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTeamToggle = (teamId) => {
    setFormData(prev => ({
      ...prev,
      teamIds: prev.teamIds.includes(teamId)
        ? prev.teamIds.filter(id => id !== teamId)
        : [...prev.teamIds, teamId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const confirmText = task ? 'Cập nhật nhiệm vụ?' : 'Giao nhiệm vụ mới?';
    const result = await Swal.fire({
      title: 'Xác nhận',
      text: confirmText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Có',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await onSubmit(formData);
        onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-modal-header">
          <h3>{task ? 'Cập nhật nhiệm vụ' : 'Giao nhiệm vụ mới'}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Tiêu đề *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nhập tiêu đề nhiệm vụ"
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Mô tả *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả chi tiết nhiệm vụ"
              rows="4"
              className={errors.description ? 'input-error' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-row">
            {/* Program */}
            <div className="form-group">
              <label htmlFor="programId">Chương trình *</label>
              <select
                id="programId"
                name="programId"
                value={formData.programId}
                onChange={handleChange}
                className={errors.programId ? 'input-error' : ''}
              >
                <option value="">-- Chọn chương trình --</option>
                {programs.map(program => (
                  <option key={program.programId} value={program.programId}>
                    {program.programName}
                  </option>
                ))}
              </select>
              {errors.programId && <span className="error-message">{errors.programId}</span>}
            </div>

            {/* Priority */}
            <div className="form-group">
              <label htmlFor="priority">Độ ưu tiên</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="LOW">Thấp</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HIGH">Cao</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            {/* Status */}
            <div className="form-group">
              <label htmlFor="status">Trạng thái</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="TODO">Chưa bắt đầu</option>
                <option value="IN_PROGRESS">Đang thực hiện</option>
                <option value="DONE">Hoàn thành</option>
                <option value="REVIEWED">Đã xem xét</option>
              </select>
            </div>

            {/* Deadline */}
            <div className="form-group">
              <label htmlFor="deadline">Hạn chót *</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className={errors.deadline ? 'input-error' : ''}
              />
              {errors.deadline && <span className="error-message">{errors.deadline}</span>}
            </div>
          </div>

          {/* Teams */}
          {teams.length > 0 && (
            <div className="form-group">
              <label>Giao cho nhóm</label>
              <div className="teams-checkbox-group">
                {teams.map(team => (
                  <label key={team.teamId} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.teamIds.includes(team.teamId)}
                      onChange={() => handleTeamToggle(team.teamId)}
                    />
                    <span>{team.teamName}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {task ? 'Cập nhật' : 'Giao nhiệm vụ'}
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
