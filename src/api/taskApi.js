import axios from "axios";

const API_URL = "http://localhost:8080/api/tasks";

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const taskApi = {
  // Get all tasks with pagination
  getAllTasks: async (token, page = 0, size = 10, sortBy = "taskId", direction = "asc") => {
    const params = { page, size, sortBy, direction };
    const res = await axios.get(API_URL, {
      ...authHeader(token),
      params,
    });
    return res.data;
  },

  // Get tasks by mentor ID
  getTasksByMentor: async (token, mentorId, page = 0, size = 10, sortBy = "taskId", direction = "asc") => {
    const params = { page, size, sortBy, direction };
    const res = await axios.get(`${API_URL}/mentor/${mentorId}`, {
      ...authHeader(token),
      params,
    });
    return res.data;
  },

  // Get tasks by program ID
  getTasksByProgram: async (token, programId, page = 0, size = 10, sortBy = "taskId", direction = "asc") => {
    const params = { page, size, sortBy, direction };
    const res = await axios.get(`${API_URL}/program/${programId}`, {
      ...authHeader(token),
      params,
    });
    return res.data;
  },

  // Get task by ID
  getTaskById: async (token, taskId) => {
    const res = await axios.get(`${API_URL}/${taskId}`, authHeader(token));
    return res.data;
  },

  // Create new task
  createTask: async (token, taskData) => {
    const res = await axios.post(API_URL, taskData, authHeader(token));
    return res.data;
  },

  // Update task
  updateTask: async (token, taskId, taskData) => {
    const res = await axios.put(`${API_URL}/${taskId}`, taskData, authHeader(token));
    return res.data;
  },

  // Delete task
  deleteTask: async (token, taskId) => {
    const res = await axios.delete(`${API_URL}/${taskId}`, authHeader(token));
    return res.data;
  },

  // Assign task to team
  assignTaskToTeam: async (token, taskId, teamId) => {
    const res = await axios.post(`${API_URL}/${taskId}/assign-team`, { teamId }, authHeader(token));
    return res.data;
  },

  // Remove team assignment
  removeTeamAssignment: async (token, assignmentId) => {
    const res = await axios.delete(`${API_URL}/assignment/${assignmentId}`, authHeader(token));
    return res.data;
  },

  // Upload task file
  uploadTaskFile: async (token, taskId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post(`${API_URL}/${taskId}/upload-file`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  // Delete task file
  deleteTaskFile: async (token, fileId) => {
    const res = await axios.delete(`${API_URL}/file/${fileId}`, authHeader(token));
    return res.data;
  },

  // Update task progress
  updateTaskProgress: async (token, taskId, progressData) => {
    const res = await axios.put(`${API_URL}/${taskId}/progress`, progressData, authHeader(token));
    return res.data;
  },

  // Get task progress
  getTaskProgress: async (token, taskId) => {
    const res = await axios.get(`${API_URL}/${taskId}/progress`, authHeader(token));
    return res.data;
  },

  // Filter tasks
  filterTasks: async (token, filters = {}, page = 0, size = 10) => {
    const params = { page, size };

    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.programId) params.programId = filters.programId;
    if (filters.mentorId) params.mentorId = filters.mentorId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.searchText) params.searchText = filters.searchText;

    const res = await axios.get(`${API_URL}/filter/search`, {
      ...authHeader(token),
      params,
    });
    return res.data;
  },

  // Get tasks by status
  getTasksByStatus: async (token, status, page = 0, size = 10) => {
    const params = { page, size };
    const res = await axios.get(`${API_URL}/status/${status}`, {
      ...authHeader(token),
      params,
    });
    return res.data;
  },

  // Get tasks by priority
  getTasksByPriority: async (token, priority, page = 0, size = 10) => {
    const params = { page, size };
    const res = await axios.get(`${API_URL}/priority/${priority}`, {
      ...authHeader(token),
      params,
    });
    return res.data;
  },

  // Get overdue tasks
  getOverdueTasks: async (token, page = 0, size = 10) => {
    const params = { page, size };
    const res = await axios.get(`${API_URL}/overdue`, {
      ...authHeader(token),
      params,
    });
    return res.data;
  },

  // Get due soon tasks
  getDueSoonTasks: async (token, days = 7, page = 0, size = 10) => {
    const params = { page, size, days };
    const res = await axios.get(`${API_URL}/due-soon`, {
      ...authHeader(token),
      params,
    });
    return res.data;
  },
};

export default taskApi;
