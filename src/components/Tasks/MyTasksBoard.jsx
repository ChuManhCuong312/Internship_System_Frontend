import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import taskApi from '../../api/taskApi';
import taskManagementApi from '../../api/taskManagementApi';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import '../../styles/taskBoard.css';

const getStatusLabel = (status) => {
  const map = {
    TODO: 'Chưa bắt đầu',
    IN_PROGRESS: 'Đang thực hiện',
    REVIEWED: 'Đã xem xét',
    DONE: 'Hoàn thành',
  };
  return map[status] || status;
};

const getPriorityLabel = (priority) => {
  const map = {
    LOW: 'Thấp',
    MEDIUM: 'Trung bình',
    HIGH: 'Cao',
  };
  return map[priority] || priority;
};

const STATUS_COLUMNS = [
  { id: 'TODO', label: 'Chưa bắt đầu', color: '#3b82f6', icon: '📋' },
  { id: 'IN_PROGRESS', label: 'Đang thực hiện', color: '#f59e0b', icon: '⚡' },
  { id: 'REVIEWED', label: 'Đã xem xét', color: '#8b5cf6', icon: '👀' },
  { id: 'DONE', label: 'Hoàn thành', color: '#10b981', icon: '✅' },
];

const MyTasksBoard = ({ 
  statusFilter = 'ALL', 
  openToStatus = null, 
  onOpenedStatus = () => {}, 
  filters = null,
  onTagsLoaded = () => {},
}) => {
  const { token, user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [historyMap, setHistoryMap] = useState({});
  const [reminders, setReminders] = useState({});
  const [filesMap, setFilesMap] = useState({});
  const [expandedTask, setExpandedTask] = useState(null);
  const [uploading, setUploading] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [draggingFrom, setDraggingFrom] = useState(null);

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
      onTagsLoaded([]);
      return;
    }

    const fetchTasksForIntern = async () => {
      try {
        setLoading(true);
        setError(null);

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
          onTagsLoaded([]);
          return;
        }

        setTasks(validTasks);
        try {
          const uniqueTags = {};
          validTasks.forEach(task => {
            (task.tags || []).forEach(tag => {
              if (tag.tagId && !uniqueTags[tag.tagId]) {
                uniqueTags[tag.tagId] = tag;
              }
            });
          });
          onTagsLoaded(Object.values(uniqueTags));
        } catch (tagErr) {
          console.warn('Could not extract tags from tasks', tagErr);
          onTagsLoaded([]);
        }

        const newReminders = {};
        for (const t of validTasks) {
          const deadline = t.deadline ? new Date(t.deadline) : null;
          if (deadline) {
            const diffMs = deadline - new Date();
            const dueSoon = diffMs <= 24 * 3600 * 1000 && diffMs > 0;
            newReminders[t.taskId] = dueSoon;
          }
        }
        setReminders(newReminders);

        try {
          const allProgress = await taskManagementApi.getAllProgress(token);
          const grouped = {};
          (Array.isArray(allProgress) ? allProgress : []).forEach(p => {
            if (!grouped[p.taskId]) grouped[p.taskId] = [];
            grouped[p.taskId].push(p);
          });
          setHistoryMap(grouped);

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
        onTagsLoaded([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasksForIntern();
  }, [internId, token]);

  const handleStatusChange = async (taskId, newStatus) => {
    const prevStatus = tasks.find(t => t.taskId === taskId)?.status;
    setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t));
    try {
      await taskApi.updateTaskStatus(token, taskId, newStatus);
      toast.success('Cập nhật trạng thái thành công!');
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Lỗi cập nhật trạng thái. Vui lòng thử lại.');
      // revert
      setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: prevStatus } : t));
    }
  };

  const handleSaveProgress = async (taskId) => {
    const entry = progressMap[taskId] || { percentComplete: 0, note: '' };
    const percent = parseInt(entry.percentComplete || 0, 10);
    const note = entry.note || '';

    if (percent < 0 || percent > 100) {
      toast.error('Phần trăm phải nằm từ 0 đến 100');
      return;
    }

    try {
      await taskManagementApi.createProgress(token, { taskId, percentComplete: percent, note });
      
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
      
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await axiosClient.post(
        `/task-management/files`,
        { taskId, fileName: file.name, fileUrl: file.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
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

  const matchesFilters = (task) => {
    const applied = filters || {};

    if (statusFilter && statusFilter !== 'ALL' && task.status !== statusFilter) {
      return false;
    }
    if (applied.status && task.status !== applied.status) return false;
    if (applied.priority && task.priority !== applied.priority) return false;
    if (applied.searchText) {
      const search = applied.searchText.toLowerCase();
      const titleMatch = task.title?.toLowerCase().includes(search);
      const descMatch = task.description?.toLowerCase().includes(search);
      if (!titleMatch && !descMatch) return false;
    }
    if (applied.tagIds && applied.tagIds.length > 0) {
      const taskTagIds = (task.tags || []).map(tag => tag.tagId);
      const hasAllTags = applied.tagIds.every(id => taskTagIds.includes(id));
      if (!hasAllTags) return false;
    }
    return true;
  };

  const displayedTasks = tasks.filter(matchesFilters);

  const getTasksByStatus = (status) => {
    return displayedTasks.filter(task => task.status === status);
  };

  const handleDragStart = (task) => {
    setDraggingTaskId(task.taskId);
    setDraggingFrom(task.status);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (status) => {
    if (!draggingTaskId) return;
    if (draggingFrom === status) {
      setDraggingTaskId(null);
      setDraggingFrom(null);
      return;
    }
    handleStatusChange(draggingTaskId, status);
    setDraggingTaskId(null);
    setDraggingFrom(null);
  };

  useEffect(() => {
    if (!openToStatus) return;
    const first = tasks.find(t => t.status === openToStatus);
    if (first) {
      setExpandedTask(first.taskId);
      setTimeout(() => {
        const el = document.querySelector(`[data-taskid="${first.taskId}"]`);
        if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      try { onOpenedStatus(openToStatus); } catch (e) {}
    }
  }, [openToStatus, tasks]);

  if (loading) {
    return (
      <div className="jira-board-loading">
        <div className="loading-table"></div>
        <p>Đang tải nhiệm vụ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="jira-board-error">
        <p>⚠️ {error}</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="jira-board-empty">
        <p>Không có nhiệm vụ nào</p>
      </div>
    );
  }

  const TaskCard = ({ task }) => {
    const prog = progressMap[task.taskId] || { percentComplete: 0, note: '' };
    const isDueSoon = reminders[task.taskId];
    const deadlineStr = task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : null;
    const isExpanded = expandedTask === task.taskId;
    const taskFiles = filesMap[task.taskId] || [];
    const overdue = isOverdue(task.deadline) && task.status !== 'DONE';
    const approaching = isApproachingDeadline(task.deadline) && task.status !== 'DONE';

    return (
      <div 
        className={`jira-task-card ${overdue ? 'overdue' : approaching ? 'approaching' : ''}`}
        data-taskid={task.taskId}
        draggable
        onDragStart={() => handleDragStart(task)}
      >
        <div className="task-card-header">
          <div className="task-card-id">#{task.taskId}</div>
          <span className="task-status-pill">{getStatusLabel(task.status)}</span>
        </div>

        <div 
          className="task-card-title"
          onClick={() => setExpandedTask(isExpanded ? null : task.taskId)}
        >
          {task.title}
        </div>

        {task.description && (
          <div className="task-card-description">
            {task.description.length > 100 
              ? `${task.description.substring(0, 100)}...` 
              : task.description}
          </div>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="task-card-tags">
            {task.tags.slice(0, 3).map(tag => (
              <span
                key={tag.tagId}
                className="task-tag-chip"
                style={{ backgroundColor: tag.color || '#3b82f6' }}
                title={tag.name}
              >
                {tag.name}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="task-tag-more">+{task.tags.length - 3}</span>
            )}
          </div>
        )}

        <div className="task-card-footer">
          <div className="task-card-meta">
            <span className={`priority-badge priority-${task.priority?.toLowerCase() || 'low'}`}>
              {getPriorityLabel(task.priority || 'LOW')}
            </span>
            {deadlineStr && (
              <span className={`task-deadline ${overdue ? 'overdue' : approaching ? 'approaching' : ''}`}>
                📅 {deadlineStr}
              </span>
            )}
          </div>
          {prog.percentComplete > 0 && (
            <div className="task-progress-bar">
              <div 
                className="task-progress-fill"
                style={{ width: `${prog.percentComplete}%` }}
              />
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="task-card-expanded">
            <div className="expanded-section">
              <h4>Mô tả</h4>
              <p>{task.description || 'Không có mô tả'}</p>
            </div>

            <div className="expanded-section">
              <h4>Cập nhật tiến độ</h4>
              <textarea
                rows={3}
                value={prog.note || ''}
                onChange={(e) => handleNoteChange(task.taskId, e.target.value)}
                placeholder="Ghi chú tiến độ..."
                className="progress-note-input"
              />
              <div className="progress-control">
                <label>Tiến độ: {prog.percentComplete || 0}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={prog.percentComplete || 0}
                  onChange={(e) => handleSliderChange(task.taskId, e.target.value)}
                  className="progress-slider"
                />
              </div>
              <button 
                onClick={() => handleSaveProgress(task.taskId)}
                className="btn-save-progress"
              >
                💾 Lưu tiến độ
              </button>
            </div>

            {(historyMap[task.taskId] || []).length > 0 && (
              <div className="expanded-section">
                <h4>Lịch sử tiến độ</h4>
                <div className="progress-history">
                  {(historyMap[task.taskId] || []).slice(0, 5).map((h, idx) => (
                    <div key={h.progressId || idx} className="history-item">
                      <div className="history-percent">{h.percentComplete}%</div>
                      <div className="history-details">
                        <div className="history-date">
                          {new Date(h.updatedAt).toLocaleString('vi-VN')}
                        </div>
                        {h.note && <div className="history-note">"{h.note}"</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="expanded-section">
              <h4>Tệp đính kèm</h4>
              <input
                type="file"
                onChange={(e) => handleFileUpload(task.taskId, e)}
                disabled={uploading[task.taskId]}
                className="file-input"
              />
              {uploading[task.taskId] && <p className="uploading-text">⏳ Đang upload...</p>}
              <div className="files-list">
                {taskFiles.length === 0 ? (
                  <p className="no-files">Chưa có file</p>
                ) : (
                  taskFiles.map(file => (
                    <div key={file.taskFilesId} className="file-item">
                      <span>📄 {file.fileName || file.fileUrl}</span>
                      <button
                        onClick={() => handleDeleteFile(file.taskFilesId, task.taskId)}
                        className="btn-delete-file"
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="jira-board-container">
      <div className="jira-board-columns">
        {STATUS_COLUMNS.map(column => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <div 
              key={column.id} 
              className={`jira-board-column ${draggingFrom && draggingFrom !== column.id ? 'column-dimmed' : ''}`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="column-header" style={{ borderTopColor: column.color }}>
                <div className="column-title">
                  <span className="column-icon">{column.icon}</span>
                  <span>{column.label}</span>
                </div>
                <div className="column-count">{columnTasks.length}</div>
              </div>
              <div className="column-content">
                {columnTasks.length === 0 ? (
                  <div className="column-empty">Không có nhiệm vụ</div>
                ) : (
                  columnTasks.map(task => (
                    <TaskCard key={task.taskId} task={task} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyTasksBoard;

