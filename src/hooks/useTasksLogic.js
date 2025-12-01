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

  // Update task progress
  const updateProgress = useCallback(async (taskId, progressData) => {
    try {
      const response = await taskApi.updateTaskProgress(token, taskId, progressData);
      toast.success('Cập nhật tiến độ thành công!');
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi cập nhật tiến độ';
      toast.error(message);
      throw err;
    }
  }, [token]);

  // Upload file
  const uploadFile = useCallback(async (taskId, file) => {
    try {
      const response = await taskApi.uploadTaskFile(token, taskId, file);
      toast.success('Tải lên tệp thành công!');
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi tải lên tệp';
      toast.error(message);
      throw err;
    }
  }, [token]);

  // Delete file
  const deleteFile = useCallback(async (fileId) => {
    try {
      await taskApi.deleteTaskFile(token, fileId);
      toast.success('Xóa tệp thành công!');
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi xóa tệp';
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
    setSortBy,
    setDirection,
    createTask,
    updateTask,
    deleteTask,
    updateProgress,
    uploadFile,
    deleteFile,
    handleSort,
    handleApplyFilter,
    handleResetFilter,
    fetchTasks,
  };
};
