import { useState, useCallback, useEffect } from 'react';
import taskApi from '../api/taskApi';
import { toast } from 'react-toastify';

export const useTasksLogic = (token, mentorId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('taskId');
  const [direction, setDirection] = useState('asc');
  const [activeFilters, setActiveFilters] = useState(null);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!token || !mentorId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await taskApi.getTasksByMentor(token, mentorId, page, size, sortBy, direction);

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
  }, [token, mentorId, page, size, sortBy, direction]);

  // Fetch filtered tasks
  const fetchFilteredTasks = useCallback(async (filters) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const response = await taskApi.filterTasks(token, filters, page, size);

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
  }, [token, page, size]);

  // Initial fetch
  useEffect(() => {
    if (activeFilters) {
      fetchFilteredTasks(activeFilters);
    } else {
      fetchTasks();
    }
  }, [token, mentorId, page, size, sortBy, direction, activeFilters, fetchTasks, fetchFilteredTasks]);

  // Create task
  const createTask = useCallback(async (taskData) => {
    try {
      const response = await taskApi.createTask(token, taskData);
      toast.success('Giao nhiệm vụ thành công!');
      setPage(0);
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi giao nhiệm vụ';
      toast.error(message);
      throw err;
    }
  }, [token]);

  // Update task
  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      const response = await taskApi.updateTask(token, taskId, taskData);
      toast.success('Cập nhật nhiệm vụ thành công!');
      setPage(0);
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi cập nhật nhiệm vụ';
      toast.error(message);
      throw err;
    }
  }, [token]);

  // Delete task
  const deleteTask = useCallback(async (taskId) => {
    try {
      await taskApi.deleteTask(token, taskId);
      toast.success('Xóa nhiệm vụ thành công!');
      setPage(0);
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi xóa nhiệm vụ';
      toast.error(message);
      throw err;
    }
  }, [token]);

  // Update task status
  const updateTaskStatus = useCallback(async (taskId, status) => {
    try {
      const response = await taskApi.updateTaskStatus(token, taskId, status);
      toast.success('Cập nhật trạng thái thành công!');
      fetchTasks();
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi cập nhật trạng thái';
      toast.error(message);
      throw err;
    }
  }, [token, fetchTasks]);

  // Get task progress by task ID
  const getTaskProgress = useCallback(async (taskId) => {
    try {
      const response = await taskApi.getTaskProgressByTaskId(token, taskId);
      return response;
    } catch (err) {
      console.error('Error fetching task progress:', err);
      return null;
    }
  }, [token]);

  // Update task progress percentage
  const updateProgressPercentage = useCallback(async (progressId, percentage) => {
    try {
      const response = await taskApi.updateProgressPercentage(token, progressId, percentage);
      toast.success('Cập nhật tiến độ thành công!');
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi cập nhật tiến độ';
      toast.error(message);
      throw err;
    }
  }, [token]);

  // Get files by task ID
  const getTaskFiles = useCallback(async (taskId) => {
    try {
      const response = await taskApi.getFilesByTaskId(token, taskId);
      return response;
    } catch (err) {
      console.error('Error fetching task files:', err);
      return [];
    }
  }, [token]);

  // Create task file
  const createTaskFile = useCallback(async (fileData) => {
    try {
      const response = await taskApi.createTaskFile(token, fileData);
      toast.success('Tải lên tệp thành công!');
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi tải lên tệp';
      toast.error(message);
      throw err;
    }
  }, [token]);

  // Delete task file
  const deleteTaskFile = useCallback(async (fileId) => {
    try {
      await taskApi.deleteTaskFileById(token, fileId);
      toast.success('Xóa tệp thành công!');
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi xóa tệp';
      toast.error(message);
      throw err;
    }
  }, [token]);

  // Get team assignments by task ID
  const getTaskAssignments = useCallback(async (taskId) => {
    try {
      const response = await taskApi.getAssignmentsByTaskId(token, taskId);
      return response;
    } catch (err) {
      console.error('Error fetching task assignments:', err);
      return [];
    }
  }, [token]);

  // Create team assignment
  const createTeamAssignment = useCallback(async (assignmentData) => {
    try {
      const response = await taskApi.createTeamAssignment(token, assignmentData);
      toast.success('Gán nhóm thành công!');
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi gán nhóm';
      toast.error(message);
      throw err;
    }
  }, [token]);

  // Delete team assignment
  const deleteTeamAssignment = useCallback(async (assignmentId) => {
    try {
      await taskApi.deleteTeamAssignment(token, assignmentId);
      toast.success('Xóa gán nhóm thành công!');
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi xóa gán nhóm';
      toast.error(message);
      throw err;
    }
  }, [token]);

  // Handle sort
  const handleSort = useCallback((column) => {
    if (sortBy === column) {
      setDirection(direction === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setDirection('asc');
    }
    setPage(0);
  }, [sortBy, direction]);

  // Handle filter
  const handleApplyFilter = useCallback((filters) => {
    setActiveFilters(filters);
    setPage(0);
  }, []);

  // Handle reset filter
  const handleResetFilter = useCallback(() => {
    setActiveFilters(null);
    setPage(0);
  }, []);

  return {
    // State
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
    // Setters
    setPage,
    setSize,
    setSortBy,
    setDirection,
    // Task CRUD
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    // Task Progress
    getTaskProgress,
    updateProgressPercentage,
    // Task Files
    getTaskFiles,
    createTaskFile,
    deleteTaskFile,
    // Team Assignments
    getTaskAssignments,
    createTeamAssignment,
    deleteTeamAssignment,
    // Handlers
    handleSort,
    handleApplyFilter,
    handleResetFilter,
  };
};
