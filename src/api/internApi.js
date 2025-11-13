import axios from "axios";

const API_URL = "http://localhost:8080/api/interns";

// Tạo axios config có Bearer token
const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ====== API ======

// GET /api/interns - Get all intern profiles
export const getAllInterns = async (token) => {
  console.log("Token gửi đi:", token);
  const response = await axios.get(API_URL, authHeader(token));
  return response.data;
};

// GET /api/interns/search - Search interns with filters
export const searchInterns = async (token, { searchTerm, major, status }) => {
  const params = {};
  if (searchTerm) params.searchTerm = searchTerm;
  if (major) params.major = major;
  if (status) params.status = status;

  const res = await axios.get(`${API_URL}/search`, { ...authHeader(token), params });
  return res.data;
};

// GET /api/interns/majors - Get distinct majors
export const getMajors = async (token) => {
  const res = await axios.get(`${API_URL}/majors`, authHeader(token));
  return res.data;
};

// GET /api/interns/{id} - Get intern profile by ID
export const getInternById = async (token, id) => {
  const res = await axios.get(`${API_URL}/${id}`, authHeader(token));
  return res.data;
};

// GET /api/interns/user/{userId} - Get intern profile by user ID
export const getInternByUserId = async (token, userId) => {
  const res = await axios.get(`${API_URL}/user/${userId}`, authHeader(token));
  return res.data;
};

// GET /api/interns/status/{status} - Get intern profiles by status
export const getInternsByStatus = async (token, status) => {
  const res = await axios.get(`${API_URL}/status/${status}`, authHeader(token));
  return res.data;
};

// POST /api/interns - Create new intern profile
export const createIntern = async (token, internProfile) => {
  const res = await axios.post(API_URL, internProfile, authHeader(token));
  return res.data;
};

// PUT /api/interns/{id} - Full update intern profile
export const updateIntern = async (token, id, internProfile) => {
  const res = await axios.put(`${API_URL}/${id}`, internProfile, authHeader(token));
  return res.data;
};

// PATCH /api/interns/{id} - Partial update intern profile
export const partialUpdateIntern = async (token, id, internProfile) => {
  const res = await axios.patch(`${API_URL}/${id}`, internProfile, authHeader(token));
  return res.data;
};

// DELETE /api/interns/{id} - Delete intern profile
export const deleteIntern = async (token, id) => {
  await axios.delete(`${API_URL}/${id}`, authHeader(token));
};