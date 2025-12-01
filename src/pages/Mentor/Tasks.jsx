import React, { useState, useContext, useEffect } from 'react';
import MentorSidebar from '../../components/Layout/MentorSidebar';
import TaskModal from '../../components/Tasks/TaskModal';
import { AuthContext } from '../../context/AuthContext';
import { useTasksLogic } from '../../hooks/useTasksLogic';
import taskApi from '../../api/taskApi';
import Swal from 'sweetalert2';
import '../../styles/taskManagement.css';
import '../../styles/dashBoard.css';

const Tasks = () => {
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

  const {
    tasks,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    sortBy,
    direction,
    activeFilters,
    setPage,
    setSize,
    handleSort,
    handleApplyFilter: applyFilterLogic,
    handleResetFilter,
    createTask,
    updateTask,
    deleteTask,
  } = useTasksLogic(token, mentorId);

  // Get mentor ID from user
  useEffect(() => {
    if (user?.userId) {
      // In a real scenario, you'd fetch the mentor ID from the API
      // For now, we'll use a placeholder
      setMentorId(user.userId);
    }
  }, [user]);

  // Mock programs and teams data
  useEffect(() => {
    // In a real scenario, fetch from API
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
    total: totalElements,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
  };

  return (
    <div className="dashboard-layout">
      <MentorSidebar />
      <div className="dashboard-content">
        {/* Header */}
        <div className="page-header">
          <h2 className="page-title">📋 Quản lý Nhiệm vụ</h2>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            + Giao nhiệm vụ mới
          </button>
        </div>

        {/* Statistics */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon mentor">📊</div>
            <div>
              <h4>Tổng nhiệm vụ</h4>
              <p className="stat-value">{stats.total}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">📝</div>
            <div>
              <h4>Chưa bắt đầu</h4>
              <p className="stat-value">{stats.todo}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">⏳</div>
            <div>
              <h4>Đang thực hiện</h4>
              <p className="stat-value">{stats.inProgress}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">✅</div>
            <div>
              <h4>Hoàn thành</h4>
              <p className="stat-value">{stats.done}</p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <button className="btn-filter" onClick={() => setShowFilter(!showFilter)}>
            🔍 Lọc
          </button>
          {activeFilters && (
            <button className="btn-reset-filter" onClick={handleResetFilterClick}>
              ✕ Xóa bộ lọc
            </button>
          )}
        </div>

        {showFilter && (
          <div className="filter-container">
            <div className="filter-row">
              <div className="filter-group">
                <label>Trạng thái</label>
                <select
                  value={filterData.status}
                  onChange={(e) => setFilterData({ ...filterData, status: e.target.value })}
                >
                  <option value="">-- Tất cả --</option>
                  <option value="TODO">Chưa bắt đầu</option>
                  <option value="IN_PROGRESS">Đang thực hiện</option>
                  <option value="DONE">Hoàn thành</option>
                  <option value="REVIEWED">Đã xem xét</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Độ ưu tiên</label>
                <select
                  value={filterData.priority}
                  onChange={(e) => setFilterData({ ...filterData, priority: e.target.value })}
                >
                  <option value="">-- Tất cả --</option>
                  <option value="LOW">Thấp</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HIGH">Cao</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Tìm kiếm</label>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tiêu đề..."
                  value={filterData.searchText}
                  onChange={(e) => setFilterData({ ...filterData, searchText: e.target.value })}
                />
              </div>
            </div>

            <div className="filter-actions">
              <button className="btn-filter-apply" onClick={handleApplyFilterClick}>
                Áp dụng
              </button>
              <button className="btn-filter-reset" onClick={() => setShowFilter(false)}>
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Tasks Table */}
        <div className="card">
          <div className="table-header">
            <h4>Danh sách nhiệm vụ</h4>
            <span className="record-count">Tổng: {totalElements} bản ghi</span>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading-spinner">Đang tải...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <p>Không có nhiệm vụ nào</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="task-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('taskId')} className="sortable">
                        ID {sortBy === 'taskId' && (direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('title')} className="sortable">
                        Tiêu đề {sortBy === 'title' && (direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('priority')} className="sortable">
                        Độ ưu tiên {sortBy === 'priority' && (direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('status')} className="sortable">
                        Trạng thái {sortBy === 'status' && (direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('deadline')} className="sortable">
                        Hạn chót {sortBy === 'deadline' && (direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.taskId} className={isOverdue(task.deadline) && task.status !== 'DONE' ? 'overdue' : ''}>
                        <td className="task-id">#{task.taskId}</td>
                        <td>
                          <div className="task-title-cell">
                            <strong>{task.title}</strong>
                            {task.description && (
                              <p className="task-description">{task.description.substring(0, 60)}...</p>
                            )}
                          </div>
                        </td>
                        <td>{getPriorityBadge(task.priority)}</td>
                        <td>{getStatusBadge(task.status)}</td>
                        <td className={isOverdue(task.deadline) && task.status !== 'DONE' ? 'overdue-date' : ''}>
                          {formatDate(task.deadline)}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-edit"
                              onClick={() => handleOpenModal(task)}
                              title="Chỉnh sửa"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDeleteTask(task.taskId)}
                              title="Xóa"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination">
                <div className="pagination-info">
                  Trang {page + 1} / {totalPages || 1} | Hiển thị {size} bản ghi
                </div>
                <div className="pagination-controls">
                  <button
                    className="btn-pagination"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                  >
                    ← Trước
                  </button>
                  <button
                    className="btn-pagination"
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Tiếp →
                  </button>
                  <select
                    value={size}
                    onChange={(e) => {
                      setSize(parseInt(e.target.value));
                      setPage(0);
                    }}
                    className="page-size-select"
                  >
                    <option value="5">5 bản ghi</option>
                    <option value="10">10 bản ghi</option>
                    <option value="20">20 bản ghi</option>
                    <option value="50">50 bản ghi</option>
                  </select>
                </div>
              </div>
            </>
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

export default Tasks;
