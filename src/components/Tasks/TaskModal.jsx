import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { TextField } from '@mui/material';
import { vi } from 'date-fns/locale/vi';
import '../../styles/taskModal.css';

const TaskModal = ({ isOpen, onClose, onSubmit, task = null, teams = [], programName = '' }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    deadline: '',
    teamIds: [],
  });

  const [errors, setErrors] = useState({});

  // Format deadline for input
  const formatDeadlineForInput = (deadline) => {
    if (!deadline) return null;
    // Handle both ISO string and LocalDateTime format
    const date = new Date(deadline);
    return isNaN(date.getTime()) ? null : date;
  };

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'MEDIUM',
        status: task.status || 'TODO',
        deadline: formatDeadlineForInput(task.deadline),
        teamIds: task.teamIds || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
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
      newErrors.title = 'Tiêu đề không được để trống. Vui lòng nhập tiêu đề nhiệm vụ';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Tiêu đề phải có ít nhất 5 ký tự';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Hạn chót không được để trống. Vui lòng chọn ngày hoàn thành';
    } else {
      const selectedDate = new Date(formData.deadline);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (selectedDate < now && !task) {
        newErrors.deadline = 'Hạn chót không được trong quá khứ. Vui lòng chọn ngày trong tương lai';
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
        // Lỗi đã được xử lý bởi onSubmit (trong TasksManagementPage), không cần toast ở đây
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

          {/* Program Info (Read-only) */}
          {programName && (
            <div className="form-group">
              <label>Chương trình</label>
              <div className="program-display">{programName}</div>
            </div>
          )}

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả chi tiết nhiệm vụ"
              rows="4"
            />
          </div>

          <div className="form-row">
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
                <option value="REVIEWED">Đang xem xét</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div className="form-group">
            <label htmlFor="deadline">Hạn chót *</label>
            <LocalizationProvider dateAdapter={AdapterDateFns} dateLibInstance={vi} adapterLocale={vi}>
              <DateTimePicker
                label="Chọn ngày và giờ"
                value={formData.deadline}
                onChange={(newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    deadline: newValue
                  }));
                  if (errors.deadline) {
                    setErrors(prev => ({
                      ...prev,
                      deadline: ''
                    }));
                  }
                }}
                minDateTime={new Date()}
                ampm={false}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.deadline,
                    helperText: errors.deadline || '',
                    className: 'datetime-picker',
                    id: 'deadline',
                    name: 'deadline',
                  },
                  actionBar: {
                    actions: ['accept', 'cancel', 'today', 'clear']
                  },
                  field: {
                    clearable: true,
                    onClear: () => {
                      setFormData(prev => ({
                        ...prev,
                        deadline: null
                      }));
                    }
                  }
                }}
                disablePast
              />
            </LocalizationProvider>
          </div>

          {/* Teams */}
          {teams.length > 0 && (
            <div className="form-group">
              <label>Giao cho nhóm ({teams.length} nhóm)</label>
              <div className="teams-list">
                {teams.map(team => (
                  <div key={team.teamId} className={`team-card ${formData.teamIds.includes(team.teamId) ? 'selected' : ''}`}>
                    <label className="team-header">
                      <input
                        type="checkbox"
                        checked={formData.teamIds.includes(team.teamId)}
                        onChange={() => handleTeamToggle(team.teamId)}
                      />
                      <div className="team-info">
                        <span className="team-name">Nhóm #{team.teamId}</span>
                        <span className="team-mentor">👤 {team.mentorName || 'Chưa có mentor'}</span>
                      </div>
                    </label>
                    {team.interns && team.interns.length > 0 && (
                      <div className="team-interns">
                        <span className="interns-label">Thực tập sinh ({team.interns.length}):</span>
                        <ul className="interns-list">
                          {team.interns.map((intern, idx) => (
                            <li key={idx} className="intern-item">
                              <span className="intern-name">{intern.name}</span>
                              <span className="intern-email">{intern.email}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(!team.interns || team.interns.length === 0) && (
                      <div className="team-interns empty">
                        <span className="no-interns">Chưa có thực tập sinh</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {teams.length === 0 && (
            <div className="form-group">
              <label>Giao cho nhóm</label>
              <div className="no-teams-message">
                Chưa có nhóm nào trong chương trình này
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
