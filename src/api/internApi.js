import axios from "axios";

const API_URL = "http://localhost:8080/api/interns";

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

  const res = await axios.get(`${API_URL}/search`, {
    ...authHeader(token),
    params,
  });
  return res.data;
};

// GET /api/interns/majors - Get distinct majors
export const getMajors = async (token) => {
  const res = await axios.get(`${API_URL}/majors`, authHeader(token));
  return res.data;
};

// ===== FEATURE: NEW API =====

// GET /api/interns/{id}
export const getInternById = async (token, id) => {
  const res = await axios.get(`${API_URL}/${id}`, authHeader(token));
  return res.data;
};

// GET /api/interns/user/{userId}
export const getInternByUserId = async (token, userId) => {
  const res = await axios.get(`${API_URL}/user/${userId}`, authHeader(token));
  return res.data;
};

// GET /api/interns/status/{status}
export const getInternsByStatus = async (token, status) => {
  const res = await axios.get(`${API_URL}/status/${status}`, authHeader(token));
  return res.data;
};

// ===== CREATE =====

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
    gpa: internProfile.gpa || 0.0,
  };

  const res = await axios.post(API_URL, payload, authHeader(token));
  return res.data;
};

// ===== UPDATE =====

// PATCH /api/interns/{id} - Full update
export const updateIntern = async (token, id, internProfile) => {
  const payload = {
    userId: internProfile.userId,
    school: internProfile.school || "CMC University",
    major: internProfile.major || "Công nghệ thông tin",
    dob: internProfile.dob || "2000-01-01",
    address:
      internProfile.address?.length >= 5
        ? internProfile.address
        : "Hà Nội",
    cvPath: internProfile.cvPath || "dummy.pdf",
    status: internProfile.status || "PENDING",
    phoneNumber: internProfile.phoneNumber || "0000000000",
    gpa: internProfile.gpa > 0 ? internProfile.gpa : 1.0,
  };

  const res = await axios.patch(`${API_URL}/${id}`, payload, authHeader(token));
  return res.data;
};

// PATCH /api/interns/{id} - Partial update
export const partialUpdateIntern = async (token, id, internProfile) => {
  const res = await axios.patch(`${API_URL}/${id}`, internProfile, authHeader(token));
  return res.data;
};

// ===== DELETE =====

// DELETE /api/interns/{id}
export const deleteIntern = async (token, id) => {
  await axios.delete(`${API_URL}/${id}`, authHeader(token));
};
