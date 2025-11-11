import axios from "axios";

const API_URL = "http://localhost:8080/api/admin/ManageUsers";

// Tạo axios config có Bearer token
const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ====== API ======

// 📄 Lấy danh sách user (phân trang, lọc, tìm kiếm)
export const getAllUsers = async (token, { page = 1, size = 10, roleId, status, nameOrEmail }) => {
  const params = { page, size };
  if (roleId) params.roleId = roleId;
  if (status) params.status = status;
  if (nameOrEmail) params.nameOrEmail = nameOrEmail;

  const res = await axios.get(API_URL, { ...authHeader(token), params });
  return res.data;
};

// ➕ Tạo user mới
export const createUser = async (token, userData) => {
  const res = await axios.post(`${API_URL}/create`, userData, authHeader(token));
  return res.data;
};

// ✏️ Cập nhật user
export const updateUser = async (token, userId, userData) => {
  const res = await axios.put(`${API_URL}/update/${userId}`, userData, authHeader(token));
  return res.data;
};

// 🔓 Mở khóa user (đưa về trạng thái PENDING_APPROVAL)
export const unlockUser = async (token, userId) => {
  const res = await axios.patch(`${API_URL}/unlockUser/${userId}`, {}, authHeader(token));
  return res.data;
};

// ✅ Kích hoạt user
export const activateUser = async (token, userId) => {
  const res = await axios.patch(`${API_URL}/activeUser/${userId}`, {}, authHeader(token));
  return res.data;
};

// ❌ Từ chối user
export const rejectUser = async (token, userId) => {
  const res = await axios.patch(`${API_URL}/rejectUser/${userId}`, {}, authHeader(token));
  return res.data;
};

// 🗑️ Xóa user
export const deleteUser = async (token, userId) => {
  const res = await axios.delete(`${API_URL}/delete/${userId}`, authHeader(token));
  return res.data;
};
