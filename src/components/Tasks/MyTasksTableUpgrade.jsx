import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import taskApi from '../../api/taskApi';
import taskManagementApi from '../../api/taskManagementApi';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import '../../styles/taskTable.css';

const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'REVIEWED', 'DONE'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];

const MyTasksTableUpgrade = ({ statusFilter = 'ALL', openToStatus = null, onOpenedStatus = () => {} }) => {
  const { token, user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [progressMap, setProgressMap] = useState({}); // taskId -> {percent, note, progressId}
  const [historyMap, setHistoryMap] = useState({}); // taskId -> [history]
  const [reminders, setReminders] = useState({}); // taskId -> bool
  const [filesMap, setFilesMap] = useState({}); // taskId -> [files]
  const [expandedTask, setExpandedTask] = useState(null); // taskId for expanded detail
  const [uploading, setUploading] = useState({}); // taskId -> bool
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const internId = (() => {
    try {
      const cookieInternId = Cookies.get('internId');
      if (cookieInternId) return parseInt(cookieInternId);
      return user?.internId;
    } catch (e) {
      return user?.internId;
    }
  })();

  useEffect(() => {
    if (!internId || !token) {
      setError('Không tìm thấy internId');
      setLoading(false);
      return;
    }

    const fetchTasksForIntern = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Fetch tasks directly from /api/tasks/intern/{internId}
        let validTasks = [];
        try {
          const tasksRes = await axiosClient.get(`/tasks/intern/${internId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          validTasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];
        } catch (taskErr) {
          console.error('Failed to fetch tasks for intern:', taskErr);
          setError('Lỗi tải danh sách nhiệm vụ');
          setTasks([]);
          return;
        }

        if (validTasks.length === 0) {
          setTasks([]);
          setReminders({});
          setHistoryMap({});
          setProgressMap({});
          return;
        }

        setTasks(validTasks);

        // compute reminders (deadline < 1 day)
        const newReminders = {};
        for (const t of validTasks) {
          const deadline = t.deadline ? new Date(t.deadline) : null;
          if (deadline) {
            const diffMs = deadline - new Date();
            const dueSoon = diffMs <= 24 * 3600 * 1000 && diffMs > 0;
            newReminders[t.taskId] = dueSoon;
            
            // Log reminder to console for easy integration later
            if (dueSoon) {
              console.warn(`⏰ REMINDER: Task "${t.title}" (ID: ${t.taskId}) deadline sắp hết hạn: ${deadline.toLocaleString()}`);
            }
          }
        }
        setReminders(newReminders);

        // load progress history
        try {
          const allProgress = await taskManagementApi.getAllProgress(token);
          const grouped = {};
          (Array.isArray(allProgress) ? allProgress : []).forEach(p => {
            if (!grouped[p.taskId]) grouped[p.taskId] = [];
            grouped[p.taskId].push(p);
          });
          setHistoryMap(grouped);

          // fill latest progress
          const latest = {};
          Object.keys(grouped).forEach(k => {
            const arr = grouped[k].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            latest[k] = arr[0];
          });
          setProgressMap(latest);
        } catch (progressErr) {
          console.warn('Could not fetch progress history:', progressErr);
          setProgressMap({});
          setHistoryMap({});
        }

        // load files for each task
        try {
          const filesData = {};
          for (const t of validTasks) {
            try {
              const filesRes = await taskManagementApi.getFilesByTaskId(token, t.taskId);
              filesData[t.taskId] = Array.isArray(filesRes) ? filesRes : [];
            } catch (err) {
              filesData[t.taskId] = [];
            }
          }
          setFilesMap(filesData);
        } catch (fileErr) {
          console.warn('Could not fetch task files:', fileErr);
        }

      } catch (err) {
        console.error('Error fetching tasks for intern:', err);
        setError('Lỗi khi tải nhiệm vụ');
      } finally {
        setLoading(false);
      }
    };

    fetchTasksForIntern();
  }, [internId, token]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskApi.updateTaskStatus(token, taskId, newStatus);
      setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t));
      toast.success('Cập nhật trạng thái thành công!');
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Lỗi cập nhật trạng thái. Vui lòng thử lại.');
    }
  };

  const handleSaveProgress = async (taskId) => {
    const entry = progressMap[taskId] || { percentComplete: 0, note: '' };
    const percent = parseInt(entry.percentComplete || 0, 10);
    const note = entry.note || '';

    if (percent < 0 || percent > 100) {
      toast.error('Phần trăm phải nằm từ 0 đến 100%');
      return;
    }

    try {
      await taskManagementApi.createProgress(token, { taskId, percentComplete: percent, note });
      
      // Reload progress history
      const allProgress = await taskManagementApi.getAllProgress(token);
      const grouped = {};
      (Array.isArray(allProgress) ? allProgress : []).forEach(p => {
        if (!grouped[p.taskId]) grouped[p.taskId] = [];
        grouped[p.taskId].push(p);
      });
      setHistoryMap(grouped);
      
      const arr = grouped[taskId] || [];
      setProgressMap(prev => ({ 
        ...prev, 
        [taskId]: arr.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] 
      }));
      
      toast.success('Tiến độ đã được lưu thành công!');
    } catch (err) {
      console.error('Failed to save progress', err);
      toast.error('Lỗi lưu tiến độ. Vui lòng kiểm tra lại dữ liệu.');
    }
  };

  const handleSliderChange = (taskId, value) => {
    setProgressMap(prev => ({
      ...prev,
      [taskId]: { ...(prev[taskId] || {}), percentComplete: parseInt(value, 10) }
    }));
  };

  const handleNoteChange = (taskId, value) => {
    setProgressMap(prev => ({
      ...prev,
      [taskId]: { ...(prev[taskId] || {}), note: value }
    }));
  };

  const handleFileUpload = async (taskId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(prev => ({ ...prev, [taskId]: true }));
      
      // Upload file (assumes backend endpoint exists or use formData)
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await axiosClient.post(
        `/task-management/files`,
        { taskId, fileName: file.name, fileUrl: file.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reload files
      const filesRes = await taskManagementApi.getFilesByTaskId(token, taskId);
      setFilesMap(prev => ({ ...prev, [taskId]: Array.isArray(filesRes) ? filesRes : [] }));
      
      toast.success('File đã được upload thành công!');
    } catch (err) {
      console.error('Failed to upload file', err);
      toast.error('Lỗi upload file. Vui lòng kiểm tra kích thước file và thử lại.');
    } finally {
      setUploading(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleDeleteFile = async (fileId, taskId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa file này?')) return;

    try {
      await taskManagementApi.deleteFile(token, fileId);
      
      // Reload files
      const filesRes = await taskManagementApi.getFilesByTaskId(token, taskId);
      setFilesMap(prev => ({ ...prev, [taskId]: Array.isArray(filesRes) ? filesRes : [] }));
      
      toast.success('File đã được xóa thành công!');
    } catch (err) {
      console.error('Failed to delete file', err);
      toast.error('Lỗi xóa file. Vui lòng thử lại.');
    }
  };

    const isOverdue = (deadline) => {
      if (!deadline) return false;
      return new Date(deadline) < new Date();
    };

    const isApproachingDeadline = (deadline) => {
      if (!deadline) return false;
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const diffMs = deadlineDate - now;
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours <= 24 && diffHours > 0;
    };

  // derive displayed tasks according to statusFilter
  const displayedTasks = (statusFilter && statusFilter !== 'ALL') ? tasks.filter(t => t.status === statusFilter) : tasks;

  // when openToStatus changes, expand first matching task and scroll to it
  useEffect(() => {
    if (!openToStatus) return;
    const first = tasks.find(t => t.status === openToStatus);
    if (first) {
      setExpandedTask(first.taskId);
      // scroll to row
      setTimeout(() => {
        const el = document.querySelector(`[data-taskid="${first.taskId}"]`);
        if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      // notify parent we opened
      try { onOpenedStatus(openToStatus); } catch (e) {}
    }
  }, [openToStatus]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>
        <p>⏳ Đang tải nhiệm vụ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#d32f2f' }}>
        <p>⚠️ {error}</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>
        <p>Không có nhiệm vụ nào</p>
      </div>
    );
  }

  return (
    <div className="my-tasks-container">
      <table className="task-table">
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Deadline</th>
            <th>Trạng thái</th>
            <th>Mức độ ưu tiên</th>
            <th>% Hoàn thành</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {displayedTasks.map(task => {
            const prog = progressMap[task.taskId] || { percentComplete: 0, note: '' };
            const isDueSoon = reminders[task.taskId];
            const deadlineStr = task.deadline ? new Date(task.deadline).toLocaleString('vi-VN') : '--';
            const isExpanded = expandedTask === task.taskId;
            const taskFiles = filesMap[task.taskId] || [];

            return (
              <React.Fragment key={task.taskId}>
                <tr data-taskid={task.taskId} className={isOverdue(task.deadline) && task.status !== 'DONE' ? 'row-overdue' : isDueSoon ? 'row-due-soon' : ''}>
                  <td>
                    <strong>{task.title}</strong>
                    {isDueSoon && <div style={{ color: '#b91c1c', fontSize: '12px' }}>🔔 Sắp hết hạn</div>}
                    {isOverdue(task.deadline) && task.status !== 'DONE' && <div style={{ color: '#b91c1c', fontSize: '12px' }}>⚠️ Chậm nhiệm vụ</div>}
                  </td>
                  <td style={{ 
                    color: isOverdue(task.deadline) && task.status !== 'DONE' ? '#b91c1c' : isDueSoon ? '#b91c1c' : 'inherit', 
                    fontWeight: isOverdue(task.deadline) && task.status !== 'DONE' || isDueSoon ? '700' : '400' 
                  }}>
                    {deadlineStr}
                  </td>
                  <td>
                    <select 
                      value={task.status || 'TODO'} 
                      onChange={(e) => handleStatusChange(task.taskId, e.target.value)}
                      className="status-select"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <span className={`badge badge-${task.priority?.toLowerCase() || 'low'}`}>
                      {task.priority || 'LOW'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={prog.percentComplete || 0}
                        onChange={(e) => handleSliderChange(task.taskId, e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <span style={{ minWidth: '50px', textAlign: 'center', fontWeight: '600' }}>
                        {prog.percentComplete || 0}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <button 
                      className="btn-expand"
                      onClick={() => setExpandedTask(isExpanded ? null : task.taskId)}
                    >
                      {isExpanded ? '▼ Ẩn' : '▶ Xem chi tiết'}
                    </button>
                  </td>
                </tr>

                {/* Expanded row */}
                {isExpanded && (
                  <tr className="row-expanded">
                    <td colSpan="6" style={{ padding: '20px' }}>
                      <div className="task-detail">
                        {/* Description */}
                        <div className="detail-section">
                          <h4>Mô tả:</h4>
                          <p>{task.description || 'Không có mô tả'}</p>
                        </div>

                        {/* Progress Update */}
                        <div className="detail-section">
                          <h4>Cập nhật tiến độ:</h4>
                          <textarea
                            rows={3}
                            value={prog.note || ''}
                            onChange={(e) => handleNoteChange(task.taskId, e.target.value)}
                            placeholder="Ghi chú tiến độ (ví dụ: Đang làm phần A, phần B chưa bắt đầu)..."
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                          />
                          <button 
                            onClick={() => handleSaveProgress(task.taskId)}
                            className="btn-save"
                          >
                            💾 Lưu tiến độ
                          </button>
                        </div>

                        {/* Progress History */}
                        <div className="detail-section">
                          <h4>Lịch sử tiến độ:</h4>
                          <div className="progress-timeline">
                            {(historyMap[task.taskId] || []).length === 0 && (
                              <p style={{ color: '#718096' }}>Chưa có lịch sử</p>
                            )}
                            {(historyMap[task.taskId] || []).map((h, idx) => (
                              <div key={h.progressId || idx} className="timeline-item">
                                <div className="timeline-marker"></div>
                                <div className="timeline-content">
                                  <div style={{ fontWeight: '600', color: '#2d3748' }}>
                                    {h.percentComplete}% ✓
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
                                    {new Date(h.updatedAt).toLocaleString('vi-VN')}
                                  </div>
                                  {h.note && (
                                    <div style={{ fontSize: '13px', color: '#4a5568', marginTop: '6px', fontStyle: 'italic' }}>
                                      "{h.note}"
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Files */}
                        <div className="detail-section">
                          <h4>Tệp đính kèm:</h4>
                          <div className="files-container">
                            <input
                              type="file"
                              onChange={(e) => handleFileUpload(task.taskId, e)}
                              disabled={uploading[task.taskId]}
                              style={{ marginBottom: '10px' }}
                            />
                            {uploading[task.taskId] && <p style={{ color: '#2b6cb0' }}>⏳ Đang upload...</p>}
                            
                            <div className="files-list">
                              {taskFiles.length === 0 ? (
                                <p style={{ color: '#718096' }}>Chưa có file</p>
                              ) : (
                                taskFiles.map(file => (
                                  <div key={file.taskFilesId} className="file-item">
                                    <span>📄 {file.fileName || file.fileUrl}</span>
                                    <button
                                      onClick={() => handleDeleteFile(file.taskFilesId, task.taskId)}
                                      className="btn-delete"
                                    >
                                      🗑️ Xóa
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MyTasksTableUpgrade;
