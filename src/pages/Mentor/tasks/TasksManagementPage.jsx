import React, { useState, useContext, useEffect, useCallback } from 'react';
import TaskModal from '../../../components/Tasks/TaskModal';
import TaskSearchForm from '../../../components/Tasks/TaskSearchForm';
import { AuthContext } from '../../../context/AuthContext';
import taskApi from '../../../api/taskApi';
import teamApi from '../../../api/teamApi';
import mentorApi from '../../../api/mentorApi';
import programApi from '../../../api/programApi';
import tagApi from '../../../api/tagApi';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import styles from './TasksManagementPage.module.css';

// MUI imports for Tag Manager
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Chip,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Tooltip,
  Stack,
  Skeleton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

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
    tagIds: [],
  });

  // Tag state
  const [tags, setTags] = useState([]);
  const [showTagManager, setShowTagManager] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [tagLoading, setTagLoading] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [editTagName, setEditTagName] = useState('');
  const [editTagColor, setEditTagColor] = useState('#3b82f6');

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
      const response = await taskApi.getTasksByProgram(token, programId, page, size);

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
      
      const response = await taskApi.createTask(token, payload);
      const createdTaskId = response.taskId;
      
      // Create team assignments if teams were selected
      if (teamIds && teamIds.length > 0 && createdTaskId) {
        
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

  // Fetch tags for this program
  const fetchTags = useCallback(async () => {
    if (!token || !programId) return;
    try {
      const response = await tagApi.getTagsByProgram(token, programId);
      setTags(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error fetching tags:', err);
      // If endpoint doesn't exist yet, use empty array
      setTags([]);
    }
  }, [token, programId]);

  // Create tag
  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Vui lòng nhập tên tag');
      return;
    }
    try {
      setTagLoading(true);
      await tagApi.createTag(token, {
        name: newTagName.trim(),
        color: newTagColor,
        programId: programId,
      });
      toast.success('Tạo tag thành công!');
      setNewTagName('');
      setNewTagColor('#3b82f6');
      fetchTags();
    } catch (err) {
      console.error('Error creating tag:', err);
      toast.error(err.response?.data?.message || 'Lỗi khi tạo tag');
    } finally {
      setTagLoading(false);
    }
  };

  // Start editing tag
  const handleStartEditTag = (tag) => {
    setEditingTag(tag.tagId);
    setEditTagName(tag.name);
    setEditTagColor(tag.color || '#3b82f6');
  };

  // Cancel editing tag
  const handleCancelEditTag = () => {
    setEditingTag(null);
    setEditTagName('');
    setEditTagColor('#3b82f6');
  };

  // Save edited tag
  const handleSaveEditTag = async (tagId) => {
    if (!editTagName.trim()) {
      toast.error('Vui lòng nhập tên tag');
      return;
    }
    try {
      setTagLoading(true);
      await tagApi.updateTag(token, tagId, {
        name: editTagName.trim(),
        color: editTagColor,
      });
      toast.success('Cập nhật tag thành công!');
      setEditingTag(null);
      setEditTagName('');
      setEditTagColor('#3b82f6');
      fetchTags();
      // Refresh tasks to show updated tag names
      if (activeFilters) {
        fetchFilteredTasks(activeFilters);
      } else {
        fetchTasks();
      }
    } catch (err) {
      console.error('Error updating tag:', err);
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật tag');
    } finally {
      setTagLoading(false);
    }
  };

  // Delete tag
  const handleDeleteTag = async (tagId) => {
    const result = await Swal.fire({
      title: 'Xóa tag',
      text: 'Bạn có chắc chắn muốn xóa tag này? Tag sẽ bị xóa khỏi tất cả nhiệm vụ.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        setTagLoading(true);
        await tagApi.deleteTag(token, tagId);
        toast.success('Xóa tag thành công!');
        fetchTags();
        // Reset filter if deleted tag was selected
        if (filterData.tagIds.includes(tagId)) {
          setFilterData(prev => ({ ...prev, tagIds: prev.tagIds.filter(id => id !== tagId) }));
        }
      } catch (err) {
        console.error('Error deleting tag:', err);
        toast.error(err.response?.data?.message || 'Lỗi khi xóa tag');
      } finally {
        setTagLoading(false);
      }
    }
  };

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

  // Fetch tags when programId changes
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Fetch team assignments when a task is selected
  const fetchTaskAssignments = useCallback(async (taskId) => {
    if (!token || !taskId) {
      setTaskAssignments([]);
      return;
    }
    
    try {
      const assignments = await taskApi.getAssignmentsByTaskId(token, taskId);
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
    // Don't reset selectedTask here to keep the task selected when closing the modal
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

  // Mark task as complete
  const handleCompleteTask = async (taskId) => {
    try {
      await taskApi.updateTaskStatus(token, taskId, 'DONE');
      toast.success('Đánh dấu nhiệm vụ hoàn thành!');
      // Update the selected task status
      setSelectedTask(prev => prev ? { ...prev, status: 'DONE' } : null);
      // Refresh the task list
      if (activeFilters) {
        fetchFilteredTasks(activeFilters);
      } else {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Lỗi khi đánh dấu hoàn thành');
    }
  };

  const handleApplyFilterClick = () => {
    const filters = {
      status: filterData.status || undefined,
      priority: filterData.priority || undefined,
      searchText: filterData.searchText || undefined,
      tagIds: filterData.tagIds.length > 0 ? filterData.tagIds : undefined,
    };
    applyFilterLogic(filters);
    setShowFilter(false);
  };

  const handleResetFilterClick = () => {
    setFilterData({ status: '', priority: '', searchText: '', tagIds: [] });
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

          {/* Task Search Form */}
          <TaskSearchForm
            filterData={filterData}
            setFilterData={setFilterData}
            tags={tags}
            onSearch={handleApplyFilterClick}
            onReset={handleResetFilterClick}
            onManageTags={() => setShowTagManager(!showTagManager)}
          />

          {/* Tag Manager Dialog (MUI) */}
          <Dialog
              open={showTagManager}
              onClose={() => setShowTagManager(false)}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: { 
                  borderRadius: 3,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                pb: 2,
                borderBottom: '1px solid #e5e7eb'
              }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#1f2937' }}>
                  🏷️ Quản lý Tags
                </Typography>
                <IconButton onClick={() => setShowTagManager(false)} size="small" sx={{ color: '#9ca3af' }}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              
              <DialogContent sx={{ pt: 3 }}>
                {/* Create new tag */}
                <Box sx={{ mb: 3.5 }}>
                  <Typography variant="subtitle2" fontWeight={600} color="#374151" sx={{ mb: 2 }}>
                    ➕ Tạo tag mới
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      size="small"
                      placeholder="Nhập tên tag..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      inputProps={{ maxLength: 30 }}
                      sx={{ 
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                    <Tooltip title="Chọn màu">
                      <Box
                        component="input"
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        sx={{
                          width: 44,
                          height: 44,
                          border: '2px solid #e5e7eb',
                          borderRadius: 2,
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: '#3b82f6', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Thêm tag">
                      <span>
                        <IconButton
                          onClick={handleCreateTag}
                          disabled={tagLoading || !newTagName.trim()}
                          sx={{
                            bgcolor: '#3b82f6',
                            color: 'white',
                            borderRadius: 2,
                            width: 44,
                            height: 44,
                            '&:hover': { bgcolor: '#2563eb', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' },
                            '&:disabled': { bgcolor: '#d1d5db' },
                            transition: 'all 0.2s'
                          }}
                        >
                          {tagLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </Box>

                <Divider sx={{ mb: 3, borderColor: '#e5e7eb' }} />

                {/* Existing tags list */}
                <Typography variant="subtitle2" fontWeight={600} color="#374151" sx={{ mb: 2 }}>
                  📋 Danh sách tags ({tags.length})
                </Typography>
                
                {tags.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5, color: '#9ca3af' }}>
                    <Typography variant="body2" sx={{ fontSize: '15px' }}>Chưa có tag nào. Hãy tạo tag đầu tiên! 🎨</Typography>
                  </Box>
                ) : (
                  <Stack spacing={1.2}>
                    {tags.map(tag => (
                      <Box
                        key={tag.tagId}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.75,
                          borderRadius: 2.5,
                          bgcolor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          transition: 'all 0.2s',
                          '&:hover': { 
                            bgcolor: '#f3f4f6',
                            borderColor: '#d1d5db',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                          }
                        }}
                      >
                        {editingTag === tag.tagId ? (
                          // Edit mode
                          <>
                            <TextField
                              size="small"
                              value={editTagName}
                              onChange={(e) => setEditTagName(e.target.value)}
                              inputProps={{ maxLength: 30 }}
                              autoFocus
                              sx={{ 
                                flex: 1,
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                            />
                            <Tooltip title="Chọn màu">
                              <Box
                                component="input"
                                type="color"
                                value={editTagColor}
                                onChange={(e) => setEditTagColor(e.target.value)}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  border: '2px solid #e5e7eb',
                                  borderRadius: 1.5,
                                  cursor: 'pointer',
                                  padding: 0,
                                }}
                              />
                            </Tooltip>
                            <Tooltip title="Lưu">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleSaveEditTag(tag.tagId)}
                                  disabled={tagLoading || !editTagName.trim()}
                                  sx={{
                                    color: '#10b981',
                                    '&:hover': { bgcolor: '#ecfdf5' },
                                    '&:disabled': { color: '#d1d5db' }
                                  }}
                                >
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Hủy">
                              <IconButton
                                size="small"
                                onClick={handleCancelEditTag}
                                disabled={tagLoading}
                                sx={{
                                  color: '#6b7280',
                                  '&:hover': { bgcolor: '#f3f4f6' }
                                }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          // View mode
                          <>
                            <Chip
                              label={tag.name}
                              sx={{
                                bgcolor: tag.color || '#3b82f6',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '14px',
                                height: 32,
                                maxWidth: '150px',
                                '& .MuiChip-label': { 
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  px: 1.5
                                }
                              }}
                            />
                            <Box sx={{ flex: 1 }} />
                            <button
                              onClick={() => handleStartEditTag(tag)}
                              disabled={tagLoading}
                              style={{
                                padding: '4px 8px',
                                margin: '0 4px',
                                borderRadius: '4px',
                                border: '1px solid #3b82f6',
                                background: 'white',
                                color: '#3b82f6',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 500,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '24px',
                                minWidth: '50px',
                                '&:hover': {
                                  backgroundColor: '#dbeafe'
                                },
                                '&:disabled': {
                                  opacity: 0.5,
                                  cursor: 'not-allowed'
                                }
                              }}
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteTag(tag.tagId)}
                              disabled={tagLoading}
                              style={{
                                padding: '4px 8px',
                                margin: '0 4px',
                                borderRadius: '4px',
                                border: '1px solid #ef4444',
                                background: 'white',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 500,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '24px',
                                minWidth: '50px',
                                '&:hover': {
                                  backgroundColor: '#fee2e2'
                                },
                                '&:disabled': {
                                  opacity: 0.5,
                                  cursor: 'not-allowed'
                                }
                              }}
                            >
                              Xóa
                            </button>
                          </>
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
              </DialogContent>
          </Dialog>

          {/* Task List */}
          {error && <div className={styles.errorMessage}>{error}</div>}

          {loading ? (
            <div className={styles.taskList}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 1, mb: 1 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Skeleton variant="text" width={50} height={14} />
                      <Skeleton variant="text" width={80} height={14} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.75, ml: 1, flexShrink: 0 }}>
                    <Skeleton variant="rounded" width={50} height={20} />
                    <Skeleton variant="rounded" width={50} height={20} />
                    <Skeleton variant="rounded" width={50} height={20} />
                  </Box>
                </Box>
              ))}
            </div>
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
                      {task.tags && task.tags.length > 0 && (
                        <div className={styles.taskItemTags}>
                          {task.tags.slice(0, 2).map(tag => (
                            <span
                              key={tag.tagId}
                              className={styles.taskTagMini}
                              style={{ backgroundColor: tag.color || '#3b82f6' }}
                              title={tag.name}
                            >
                              {tag.name.length > 8 ? tag.name.substring(0, 8) + '...' : tag.name}
                            </span>
                          ))}
                          {task.tags.length > 2 && (
                            <span className={styles.moreTagsIndicator}>+{task.tags.length - 2}</span>
                          )}
                        </div>
                      )}
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

                {/* Tags Section */}
                <div className={styles.tagsSection}>
                  <h3 className={styles.sectionTitle}>Tags</h3>
                  {selectedTask.tags && selectedTask.tags.length > 0 ? (
                    <div className={styles.taskDetailTags}>
                      {selectedTask.tags.map(tag => (
                        <span
                          key={tag.tagId}
                          className={styles.taskDetailTag}
                          style={{ backgroundColor: tag.color || '#3b82f6' }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.noTagsText}>Chưa có tag nào</p>
                  )}
                </div>

                {/* Assigned Teams Section */}
                <div className={styles.assignedTeamsSection}>
                  <h3 className={styles.sectionTitle}>Nhóm được giao ({taskAssignments.length})</h3>
                  {taskAssignments.length > 0 ? (
                    <div className={styles.assignedTeamsList}>
                      {taskAssignments.map((assignment, index) => {
                        const team = teams.find(t => t.teamId === assignment.teamId);
                        return (
                          <div key={assignment.id} className={styles.assignedTeamCard}>
                            <div className={styles.assignedTeamHeader}>
                              <span className={styles.assignedTeamName}>Nhóm {index + 1}</span>
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
                {selectedTask.status !== 'DONE' && (
                  <button
                    className={styles.completeButton}
                    onClick={() => handleCompleteTask(selectedTask.taskId)}
                    title="Đánh dấu hoàn thành"
                  >
                    Hoàn thành
                  </button>
                )}
                <button
                  className={styles.editButton}
                  onClick={() => handleOpenModal(selectedTask)}
                >
                  Chỉnh sửa
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteTask(selectedTask.taskId)}
                >
                  Xóa
                </button>
              </div>
            </>
          ) : (
            <Box sx={{ p: 3 }}>
              <Skeleton variant="text" width="80%" height={32} sx={{ mb: 2 }} />
              <Box sx={{ mb: 3 }}>
                <Skeleton variant="text" width="30%" height={16} sx={{ mb: 1 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="100%" height={20} />
                </Box>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Skeleton variant="text" width="30%" height={16} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="70%" height={20} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Skeleton variant="rounded" width="100%" height={40} />
                <Skeleton variant="rounded" width="100%" height={40} />
              </Box>
            </Box>
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
        tags={tags}
      />
    </div>
  );
};

export default TasksManagementPage;
