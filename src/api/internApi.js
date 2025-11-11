import axios from "axios";

const API_URL = "http://localhost:8080/api/interns";

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ====== API ======

export const getAllInterns = async (token) => {
  console.log("Token gửi đi:", token);
  const response = await axios.get(API_URL, authHeader(token));
  return response.data;
};

export const searchInterns = async (token, { searchTerm, major, status }) => {
  const params = {};
  if (searchTerm) params.searchTerm = searchTerm;
  if (major) params.major = major;
  if (status) params.status = status;

  const res = await axios.get(`${API_URL}/search`, {
    ...authHeader(token),
    params
  });
  return res.data;
};

export const getMajors = async (token) => {
  const res = await axios.get(`${API_URL}/majors`, authHeader(token));
  return res.data;
};

// ✅ FIXED: Thêm validation và mapping đúng với entity
export const createIntern = async (token, internProfile) => {
  const payload = {
    userId: internProfile.userId,
    school: internProfile.school || "",
    major: internProfile.major || "",
    dob: internProfile.dob || "2000-01-01",
    address: internProfile.address || "",
    cvPath: internProfile.cvPath || "default.pdf",
    status: internProfile.status || "PENDING",
    phoneNumber: internProfile.phoneNumber || "",
    gpa: internProfile.gpa || 0.0
  };

  const res = await axios.post(API_URL, payload, authHeader(token));
  return res.data;
};

// ✅ FIXED: Sử dụng PATCH thay vì PUT để update một phần
export const updateIntern = async (token, id, internProfile) => {
  const payload = {
    userId: internProfile.userId,
    school: internProfile.school || "CMC University",
    major: internProfile.major || "Công nghệ thông tin",
    dob: internProfile.dob || "2000-01-01",
    address: internProfile.address?.length >= 5 ? internProfile.address : "Hà Nội",
    cvPath: internProfile.cvPath || "dummy.pdf",
    status: internProfile.status || "PENDING",
    phoneNumber: internProfile.phoneNumber || "0000000000",
    gpa: internProfile.gpa > 0 ? internProfile.gpa : 1.0
  };

  const res = await axios.patch(`${API_URL}/${id}`, payload, authHeader(token));
  return res.data;
};

export const deleteIntern = async (token, id) => {
  const res = await axios.delete(`${API_URL}/${id}`, authHeader(token));
  return res.data;
};

// ✅ ADDED: API lấy intern theo ID
export const getInternById = async (token, id) => {
  const res = await axios.get(`${API_URL}/${id}`, authHeader(token));
  return res.data;
};

// ✅ ADDED: API lấy intern theo userId
export const getInternByUserId = async (token, userId) => {
  const res = await axios.get(`${API_URL}/user/${userId}`, authHeader(token));
  return res.data;
};