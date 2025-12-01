import React, { useState, useContext, useEffect, useCallback } from 'react';
import TaskModal from '../../../components/Tasks/TaskModal';
import { AuthContext } from '../../../context/AuthContext';
import taskApi from '../../../api/taskApi';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import styles from './TasksManagementPage.module.css';

const TasksManagementPage = ({ programId, onBack }) => {
  const { user, token } = useContext(AuthContext);
  const [mentorId, setMentorId] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterData, setFilterData] = useState({
    status: '',
    priority: '',
    searchText: '',
  });

  // Task state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeFilters, setActiveFilters] = useState(null);

  // Get mentor ID from user
  useEffect(() => {
    if (user?.userId) {
      setMentorId(user.userId);
    }
  }, [user]);

  // Fetch tasks by program ID
  const fetchTasks = useCallback(async () => {
    if (!token || !programId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await taskApi.getTasksByProgram(token, programId, page, size);

      if (response.content) {
        setTasks(response.content);
        setTotalElements(response.totalElements || 0);
        setTotalPages(response.totalPages || 0);
      } else if (Array.isArray(response)) {
        setTasks(response);
        setTotalElements(response.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Không thể tải danh sách nhiệm vụ');
      toast.error('Lỗi khi tải nhiệm vụ');
    } finally {
      setLoading(false);
    }
  }, [token, programId, page, size]);

  // Fetch filtered tasks
  const fetchFilteredTasks = useCallback(async (filters) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const response = await taskApi.filterTasks(token, { ...filters, programId }, page, size);

      if (response.content) {
        setTasks(response.content);
        setTotalElements(response.totalElements || 0);
        setTotalPages(response.totalPages || 0);
      } else if (Array.isArray(response)) {
        setTasks(response);
        setTotalElements(response.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching filtered tasks:', err);
      setError('Không thể tải danh sách nhiệm vụ');
      toast.error('Lỗi khi tải nhiệm vụ');
    } finally {
      setLoading(false);
    }
  }, [token, programId, page, size]);

  // Initial fetch and refetch on dependencies change
  useEffect(() => {
    if (activeFilters) {
      fetchFilteredTasks(activeFilters);
    } else {
      fetchTasks();
    }
  }, [activeFilters, fetchTasks, fetchFilteredTasks]);

  // Create task
  const createTask = useCallback(async (taskData) => {
    try {
      const response = await taskApi.createTask(token, { ...taskData, programId, mentorId });
      toast.success('Giao nhiệm vụ thành công!');
      fetchTasks();
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi giao nhiệm vụ';
      toast.error(message);
      throw err;
    }
  }, [token, programId, mentorId, fetchTasks]);

  // Update task
  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      const response = await taskApi.updateTask(token, taskId, taskData);
      toast.success('Cập nhật nhiệm vụ thành công!');
      fetchTasks();
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi cập nhật nhiệm vụ';
      toast.error(message);
      throw err;
    }
  }, [token, fetchTasks]);

  // Delete task
  const deleteTask = useCallback(async (taskId) => {
    try {
      await taskApi.deleteTask(token, taskId);
      toast.success('Xóa nhiệm vụ thành công!');
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi xóa nhiệm vụ';
      toast.error(message);
      throw err;
    }
  }, [token, fetchTasks]);

  // Apply filter
  const applyFilterLogic = useCallback((filters) => {
    setActiveFilters(filters);
    setPage(0);
  }, []);

  // Reset filter
  const handleResetFilter = useCallback(() => {
    setActiveFilters(null);
    setPage(0);
  }, []);

  // Fetch programs and teams from API
  useEffect(() => {
    // TODO: Replace with actual API calls when endpoints are available
    setPrograms([
      { programId: 1, programName: 'Chương trình thực tập 2024' },
      { programId: 2, programName: 'Chương trình phát triển kỹ năng' },
      { programId: 3, programName: 'Chương trình quốc tế' },
    ]);

    setTeams([
      { teamId: 1, teamName: 'Nhóm Frontend' },
      { teamId: 2, teamName: 'Nhóm Backend' },
      { teamId: 3, teamName: 'Nhóm Design' },
    ]);
  }, []);

  const handleOpenModal = (task = null) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleSubmitTask = async (formData) => {
    try {
      if (selectedTask) {
        await updateTask(selectedTask.taskId, formData);
      } else {
        await createTask(formData);
      }
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const result = await Swal.fire({
      title: 'Xóa nhiệm vụ',
      text: 'Bạn có chắc chắn muốn xóa nhiệm vụ này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleApplyFilterClick = () => {
    const filters = {
      status: filterData.status || undefined,
      priority: filterData.priority || undefined,
      searchText: filterData.searchText || undefined,
    };
    applyFilterLogic(filters);
    setShowFilter(false);
  };

  const handleResetFilterClick = () => {
    setFilterData({ status: '', priority: '', searchText: '' });
    handleResetFilter();
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'TODO': { label: 'Chưa bắt đầu', class: 'status-todo' },
      'IN_PROGRESS': { label: 'Đang thực hiện', class: 'status-in-progress' },
      'DONE': { label: 'Hoàn thành', class: 'status-done' },
      'REVIEWED': { label: 'Đã xem xét', class: 'status-reviewed' },
    };
    const info = statusMap[status] || { label: status, class: 'status-default' };
    return <span className={`status-badge ${info.class}`}>{info.label}</span>;
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      'LOW': { label: 'Thấp', class: 'priority-low' },
      'MEDIUM': { label: 'Trung bình', class: 'priority-medium' },
      'HIGH': { label: 'Cao', class: 'priority-high' },
    };
    const info = priorityMap[priority] || { label: priority, class: 'priority-default' };
    return <span className={`priority-badge ${info.class}`}>{info.label}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  // Statistics
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
  };

  // Get program name
  const currentProgram = programs.find(p => p.programId === programId);

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button className={styles.backButton} onClick={onBack}>
        ← Quay lại chọn chương trình
      </button>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.programInfo}>
          <h1 className={styles.programName}>{currentProgram?.programName || 'Quản lý Nhiệm vụ'}</h1>
          <p className={styles.programDetails}>Tổng {stats.total} nhiệm vụ</p>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left Panel - Task List */}
        <div className={styles.leftPanel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Danh sách nhiệm vụ</h3>
            <button 
              className={styles.addTaskButton}
              onClick={() => handleOpenModal()}
              title="Thêm nhiệm vụ mới"
            >
              +
            </button>
          </div>

          {/* Filters */}
          <div className={styles.filterSection}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Trạng thái</label>
              <select
                value={filterData.status}
                onChange={(e) => setFilterData({ ...filterData, status: e.target.value })}
                className={styles.filterSelect}
              >
                <option value="">Tất cả</option>
                <option value="TODO">Chưa bắt đầu</option>
                <option value="IN_PROGRESS">Đang thực hiện</option>
                <option value="DONE">Hoàn thành</option>
                <option value="REVIEWED">Đã xem xét</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Độ ưu tiên</label>
              <select
                value={filterData.priority}
                onChange={(e) => setFilterData({ ...filterData, priority: e.target.value })}
                className={styles.filterSelect}
              >
                <option value="">Tất cả</option>
                <option value="LOW">Thấp</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HIGH">Cao</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={filterData.searchText}
                onChange={(e) => setFilterData({ ...filterData, searchText: e.target.value })}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterActions}>
              <button className={styles.btnApply} onClick={handleApplyFilterClick}>
                Áp dụng
              </button>
              {activeFilters && (
                <button className={styles.btnReset} onClick={handleResetFilterClick}>
                  Xóa
                </button>
              )}
            </div>
          </div>

          {/* Task List */}
          {error && <div className={styles.errorMessage}>{error}</div>}

          {loading ? (
            <div className={styles.loadingSpinner}>Đang tải...</div>
          ) : tasks.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Không có nhiệm vụ nào</p>
            </div>
          ) : (
            <>
              <div className={styles.taskList}>
                {tasks.map(task => (
                  <button
                    key={task.taskId}
                    className={`${styles.taskItem} ${selectedTask?.taskId === task.taskId ? styles.active : ''} ${isOverdue(task.deadline) && task.status !== 'DONE' ? styles.overdue : ''}`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className={styles.taskItemContent}>
                      <p className={styles.taskItemTitle}>{task.title}</p>
                      <div className={styles.taskItemFooter}>
                        <span className={styles.taskId}>#{task.taskId}</span>
                        <span className={styles.taskDeadline}>{formatDate(task.deadline)}</span>
                      </div>
                    </div>
                    <div className={styles.taskItemBadges}>
                      {getPriorityBadge(task.priority)}
                      {getStatusBadge(task.status)}
                    </div>
                  </button>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.paginationBtn}
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                  >
                    ← Trước
                  </button>
                  <span className={styles.pageInfo}>
                    {page + 1} / {totalPages} ({totalElements} nhiệm vụ)
                  </span>
                  <button
                    className={styles.paginationBtn}
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Tiếp →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Panel - Task Details */}
        <div className={styles.rightPanel}>
          {selectedTask ? (
            <>
              <div className={styles.taskDetailsHeader}>
                <h2 className={styles.taskDetailsTitle}>{selectedTask.title}</h2>
              </div>

              <div className={styles.taskDetailsContent}>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>ID</span>
                    <span className={styles.detailValue}>#{selectedTask.taskId}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Trạng thái</span>
                    <span className={styles.detailValue}>{getStatusBadge(selectedTask.status)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Độ ưu tiên</span>
                    <span className={styles.detailValue}>{getPriorityBadge(selectedTask.priority)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Hạn chót</span>
                    <span className={`${styles.detailValue} ${isOverdue(selectedTask.deadline) && selectedTask.status !== 'DONE' ? styles.overdueText : ''}`}>
                      {formatDate(selectedTask.deadline)}
                    </span>
                  </div>
                </div>

                {selectedTask.description && (
                  <div className={styles.descriptionSection}>
                    <h3 className={styles.sectionTitle}>Mô tả</h3>
                    <p className={styles.description}>{selectedTask.description}</p>
                  </div>
                )}
              </div>

              <div className={styles.actionSection}>
                <button
                  className={styles.editButton}
                  onClick={() => handleOpenModal(selectedTask)}
                >
                  ✏️ Chỉnh sửa
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteTask(selectedTask.taskId)}
                >
                  🗑️ Xóa
                </button>
              </div>
            </>
          ) : (
            <div className={styles.noSelection}>
              <p>Chọn một nhiệm vụ để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTask}
        task={selectedTask}
        programs={programs}
        teams={teams}
      />
    </div>
  );
};

export default TasksManagementPage;
