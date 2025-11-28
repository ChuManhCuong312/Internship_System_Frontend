import axiosClient from './axiosClient';

// Note: backend endpoints might differ; these are reasonable defaults and
// can be adjusted to match server API.

export const getMyTasks = async (token, internId) => {
  const url = `/tasks/my${internId ? `?internId=${internId}` : ''}`;
  const res = await axiosClient.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateTaskProgress = async (token, taskId, internId, progress, note) => {
  const url = `/tasks/${taskId}/progress${internId ? `?internId=${internId}` : ''}`;
  const body = { progress, note };
  const res = await axiosClient.put(url, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateTaskStatus = async (token, taskId, internId, status) => {
  const url = `/tasks/${taskId}/status${internId ? `?internId=${internId}` : ''}`;
  const body = { status };
  const res = await axiosClient.put(url, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const logProgressHistory = async (token, taskId, entry) => {
  const url = `/tasks/${taskId}/history`;
  const res = await axiosClient.post(url, entry, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getTaskHistory = async (token, taskId) => {
  const url = `/tasks/${taskId}/history`;
  const res = await axiosClient.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export default {
  getMyTasks,
  updateTaskProgress,
  updateTaskStatus,
  logProgressHistory,
  getTaskHistory,
};
