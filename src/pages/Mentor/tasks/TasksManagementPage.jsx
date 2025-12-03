import React, { useState, useContext, useEffect, useCallback } from 'react';
import TaskModal from '../../../components/Tasks/TaskModal';
import { AuthContext } from '../../../context/AuthContext';
import taskApi from '../../../api/taskApi';
import teamApi from '../../../api/teamApi';
import mentorApi from '../../../api/mentorApi';
import programApi from '../../../api/programApi';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import styles from './TasksManagementPage.module.css';

const TasksManagementPage = ({ programId, onBack }) => {
  const { user, token } = useContext(AuthContext);
  const [mentorId, setMentorId] = useState(null);
  const [currentProgram, setCurrentProgram] = useState(null);
  const [teams, setTeams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskAssignments, setTaskAssignments] = useState([]); // Team assignments for selected task
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

  // Fetch tasks by program ID
  const fetchTasks = useCallback(async () => {
    if (!token || !programId) return;

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching tasks for programId:', programId);
      const response = await taskApi.getTasksByProgram(token, programId, page, size);
      console.log('Tasks response:', response);

      // Handle PaginatedTaskDTO format: { data, totalTasks, currentPage, pageSize, totalPages }
      if (response.data && Array.isArray(response.data)) {
        setTasks(response.data);
        setTotalElements(response.totalTasks || 0);
        setTotalPages(response.totalPages || 0);
      } 
      // Handle Spring Page format: { content, totalElements, totalPages }
      else if (response.content) {
        setTasks(response.content);
        setTotalElements(response.totalElements || 0);
        setTotalPages(response.totalPages || 0);
      } 
      // Handle array response (no pagination)
      else if (Array.isArray(response)) {
        setTasks(response);
        setTotalElements(response.length);
        setTotalPages(1);
      } else {
        // Handle case where response is empty or unexpected format
        setTasks([]);
        setTotalElements(0);
        setTotalPages(0);
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
      console.log('Filtered tasks response:', response);

      // Handle PaginatedTaskDTO format
      if (response.data && Array.isArray(response.data)) {
        setTasks(response.data);
        setTotalElements(response.totalTasks || 0);
        setTotalPages(response.totalPages || 0);
      } 
      // Handle Spring Page format
      else if (response.content) {
        setTasks(response.content);
        setTotalElements(response.totalElements || 0);
        setTotalPages(response.totalPages || 0);
      } 
      // Handle array response
      else if (Array.isArray(response)) {
        setTasks(response);
        setTotalElements(response.length);
        setTotalPages(1);
      } else {
        setTasks([]);
        setTotalElements(0);
        setTotalPages(0);
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
      // Format deadline to ISO string for LocalDateTime
      const formattedDeadline = taskData.deadline ? new Date(taskData.deadline).toISOString() : null;
      
      // Extract teamIds before sending to task API
      const { teamIds, ...taskPayload } = taskData;
      
      const payload = {
        ...taskPayload,
        programId,
        mentorId,
        assignedBy: mentorId, // assignedBy is the mentor who creates the task
        deadline: formattedDeadline,
      };
      
      console.log('Creating task with payload:', payload);
      
      const response = await taskApi.createTask(token, payload);
      const createdTaskId = response.taskId;
      
      // Create team assignments if teams were selected
      if (teamIds && teamIds.length > 0 && createdTaskId) {
        console.log('Creating team assignments for taskId:', createdTaskId, 'teamIds:', teamIds);
        
        for (const teamId of teamIds) {
          try {
            await taskApi.createTeamAssignment(token, {
              taskId: createdTaskId,
              teamId: teamId,
            });
          } catch (assignErr) {
            console.error('Error creating team assignment:', assignErr);
          }
        }
        toast.success(`Giao nhiệm vụ thành công cho ${teamIds.length} nhóm!`);
      } else {
        toast.success('Giao nhiệm vụ thành công!');
      }
      
      fetchTasks();
      return response;
    } catch (err) {
      console.error('Error creating task:', err.response?.data || err);
      const message = err.response?.data?.message || 'Lỗi khi giao nhiệm vụ';
      toast.error(message);
      throw err;
    }
  }, [token, programId, mentorId, fetchTasks]);

  // Update task
  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      // Format deadline to ISO string for LocalDateTime
      const formattedDeadline = taskData.deadline ? new Date(taskData.deadline).toISOString() : null;
      
      const payload = {
        ...taskData,
        deadline: formattedDeadline,
      };
      
      console.log('Updating task with payload:', payload);
      
      const response = await taskApi.updateTask(token, taskId, payload);
      toast.success('Cập nhật nhiệm vụ thành công!');
      fetchTasks();
      return response;
    } catch (err) {
      console.error('Error updating task:', err.response?.data || err);
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

  // Get mentor ID from user
  useEffect(() => {
    const fetchMentorId = async () => {
      if (!token || !user?.userId) return;
      try {
        const mentorData = await mentorApi.getMentorByUserId(token, user.userId);
        if (mentorData?.mentorId) {
          setMentorId(mentorData.mentorId);
        }
      } catch (err) {
        console.error('Error fetching mentor ID:', err);
      }
    };
    fetchMentorId();
  }, [token, user]);

  // Fetch program info and teams
  useEffect(() => {
    const fetchProgramAndTeams = async () => {
      if (!token || !programId) return;
      
      try {
        // Fetch program info
        const programsResponse = await programApi.getAllPrograms(token, 1, 100);
        const programs = programsResponse.data || [];
        const program = programs.find(p => p.programId === programId);
        if (program) {
          setCurrentProgram(program);
        }

        // Fetch teams for this program
        const teamsResponse = await teamApi.getTeamsByProgram(token, programId);
        setTeams(Array.isArray(teamsResponse) ? teamsResponse : []);
      } catch (err) {
        console.error('Error fetching program/teams:', err);
      }
    };
    fetchProgramAndTeams();
  }, [token, programId]);

  // Fetch team assignments when a task is selected
  const fetchTaskAssignments = useCallback(async (taskId) => {
    if (!token || !taskId) {
      setTaskAssignments([]);
      return;
    }
    
    try {
      const assignments = await taskApi.getAssignmentsByTaskId(token, taskId);
      console.log('Task assignments:', assignments);
      setTaskAssignments(Array.isArray(assignments) ? assignments : []);
    } catch (err) {
      console.error('Error fetching task assignments:', err);
      setTaskAssignments([]);
    }
  }, [token]);

  // Handle task selection
  const handleSelectTask = useCallback((task) => {
    setSelectedTask(task);
    if (task) {
      fetchTaskAssignments(task.taskId);
    } else {
      setTaskAssignments([]);
    }
  }, [fetchTaskAssignments]);

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

  const isApproachingDeadline = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffMs = deadlineDate - now;
    const diffHours = diffMs / (1000 * 60 * 60);
    // Sắp hết hạn: từ 24h trở lại < 0h (và chưa quá hạn)
    return diffHours <= 24 && diffHours > 0;
  };

  // Statistics
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
  };

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button className={styles.backButton} onClick={onBack}>
        ← Quay lại chọn chương trình
      </button>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.programInfo}>
          <h1 className={styles.programName}>{currentProgram?.name || 'Quản lý Nhiệm vụ'}</h1>
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
                    className={`${styles.taskItem} ${selectedTask?.taskId === task.taskId ? styles.active : ''} ${isOverdue(task.deadline) && task.status !== 'DONE' ? styles.overdue : ''} ${isApproachingDeadline(task.deadline) && task.status !== 'DONE' ? styles['approaching-deadline'] : ''}`}
                    onClick={() => handleSelectTask(task)}
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
                {/* Overdue/Approaching Warning */}
                {selectedTask.status !== 'DONE' && (
                  <>
                    {isOverdue(selectedTask.deadline) && (
                      <div className={styles.warningBanner + ' ' + styles.overdueBanner}>
                        <span style={{ marginRight: '8px' }}>⚠️</span>
                        <strong>Chậm nhiệm vụ!</strong> 
                      </div>
                    )}
                    {isApproachingDeadline(selectedTask.deadline) && (
                      <div className={styles.warningBanner + ' ' + styles.approachingBanner}>
                        <span style={{ marginRight: '8px' }}>⏰</span>
                        <strong>Sắp hết hạn!</strong> 
                      </div>
                    )}
                  </>
                )}

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

                {/* Assigned Teams Section */}
                <div className={styles.assignedTeamsSection}>
                  <h3 className={styles.sectionTitle}>Nhóm được giao ({taskAssignments.length})</h3>
                  {taskAssignments.length > 0 ? (
                    <div className={styles.assignedTeamsList}>
                      {taskAssignments.map(assignment => {
                        const team = teams.find(t => t.teamId === assignment.teamId);
                        return (
                          <div key={assignment.id} className={styles.assignedTeamCard}>
                            <div className={styles.assignedTeamHeader}>
                              <span className={styles.assignedTeamName}>Nhóm #{assignment.teamId}</span>
                              {team && <span className={styles.assignedTeamMentor}>👤 {team.mentorName}</span>}
                            </div>
                            {team && team.interns && team.interns.length > 0 && (
                              <div className={styles.assignedTeamInterns}>
                                {team.interns.map((intern, idx) => (
                                  <span key={idx} className={styles.internTag}>{intern.name}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className={styles.noTeamsAssigned}>Chưa giao cho nhóm nào</p>
                  )}
                </div>
              </div>

              <div className={styles.actionSection}>
                <button
                  className={styles.editButton}
                  onClick={() => handleOpenModal(selectedTask)}
                >
                  ✏️
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteTask(selectedTask.taskId)}
                >
                  🗑️
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
        teams={teams}
        programName={currentProgram?.name || ''}
      />
    </div>
  );
};

export default TasksManagementPage;
