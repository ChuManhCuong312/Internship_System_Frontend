import axios from "axios";

const API_URL = "http://localhost:8080/api/interns";

// Tạo axios config có Bearer token
const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ====== API ======

export const getAllInterns = async (token) => {
console.log("Token gửi đi:", token);

  const response = await axios.get(API_URL, authHeader(token));
  // gọi /api/interns thay vì /api/interns/search
  return response.data;
};


export const searchInterns = async (token, { searchTerm, major, status }) => {
  const params = {};
  if (searchTerm) params.searchTerm = searchTerm;
  if (major) params.major = major;
  if (status) params.status = status;

  const res = await axios.get(`${API_URL}/search`, { ...authHeader(token), params });
  return res.data;
};

export const getMajors = async (token) => {
  const res = await axios.get(`${API_URL}/majors`, authHeader(token));
  return res.data;
};

export const createIntern = async (token, internProfile) => {
  const res = await axios.post(API_URL, internProfile, authHeader(token));
  return res.data;
};

export const updateIntern = async (token, id, internProfile) => {
  const res = await axios.put(`${API_URL}/${id}`, internProfile, authHeader(token));
  return res.data;
};

export const deleteIntern = async (token, id) => {
  const res = await axios.delete(`${API_URL}/${id}`, authHeader(token));
  return res.data;
};
