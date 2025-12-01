import axiosClient from './axiosClient';

const API_URL = '/task-management';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const taskManagementApi = {
  // Progress
  getAllProgress: async (token) => {
    const res = await axiosClient.get(`${API_URL}/progress`, authHeader(token));
    return res.data;
  },

  getProgressByTaskId: async (token, taskId) => {
    const res = await axiosClient.get(`${API_URL}/progress/task/${taskId}`, authHeader(token));
    return res.data;
  },

  createProgress: async (token, progressData) => {
    const res = await axiosClient.post(`${API_URL}/progress`, progressData, authHeader(token));
    return res.data;
  },

  // Files
  getFilesByTaskId: async (token, taskId) => {
    const res = await axiosClient.get(`${API_URL}/files/task/${taskId}`, authHeader(token));
    return res.data;
  },

  createFileRecord: async (token, fileData) => {
    const res = await axiosClient.post(`${API_URL}/files`, fileData, authHeader(token));
    return res.data;
  },

  deleteFile: async (token, fileId) => {
    const res = await axiosClient.delete(`${API_URL}/files/${fileId}`, authHeader(token));
    return res.data;
  }
};

export default taskManagementApi;
