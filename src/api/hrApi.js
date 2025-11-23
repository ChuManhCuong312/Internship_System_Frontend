import axios from "axios";

const API_URL = "http://localhost:8080/api/hr/interns";
const API_URL_MENTOR_ASSIGN = "http://localhost:8080/api/hr/mentor-assignments";
const API_URL_MENTOR = "http://localhost:8080/api/mentors";

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const hrApi = {
  AllInterns: async (token, page = 0, size = 10) => {
    const response = await axios.get(API_URL, {
      ...authHeader(token),
      params: { page, size },
    });
    return response.data;
  },

  searchInterns: async (token, { searchTerm, major, school, status, page = 0, size = 10 }) => {
    const params = { page, size };
    if (searchTerm) params.searchTerm = searchTerm;
    if (major) params.major = major;
    if (school) params.school = school;
    if (status) params.status = status;

    const res = await axios.get(`${API_URL}/search`, {
      ...authHeader(token),
      params,
    });
    return res.data;
  },

  updateInternStatus: async (token, id, status, rejectionReason = null) => {
    const params = { status };
    if (rejectionReason) params.rejectionReason = rejectionReason;

    const res = await axios.patch(`${API_URL}/${id}/status`, null, {
      ...authHeader(token),
      params,
    });
    return res.data;
  },

createInternProfile: async (token, userId, profileData) => {
  const formData = new FormData();
  formData.append("fullName", profileData.full_name);
  formData.append("gender", profileData.gender);
  formData.append("dob", profileData.dob);
  formData.append("major", profileData.major);
  formData.append("gpa", profileData.gpa);
  formData.append("school", profileData.school);
  formData.append("address", profileData.address);
  formData.append("universityConfirm", profileData.universityConfirm);
  formData.append("avatar", profileData.avatar);

  const res = await axios.post(`${API_URL}/${userId}/profile?phone=${profileData.phone}`, formData, {
    ...authHeader(token),
  });
  return res.data;
},

getAllMajors: async (token) => {
  const res = await axios.get(`${API_URL}/majors`, {
    ...authHeader(token),
  });
  return res.data;
},

getAllSchools: async (token) => {
  const res = await axios.get(`${API_URL}/schools`, {
    ...authHeader(token),
  });
  return res.data;
},

getInternCandidatesWithoutProfile: async (token, page = 0, size = 10) => {
  const response = await axios.get(`${API_URL}/candidates`, {
    ...authHeader(token),
    params: { page, size },
  });
  return response.data;
},

updateInternProfile: async (token, internId, profileData) => {
  try {
    const res = await axios.patch(`${API_URL}/${internId}/profile`, {
      school: profileData.school,
      major: profileData.major,
      dob: profileData.dob,
      address: profileData.address,
      phone: profileData.phone,
      gender: profileData.gender,
      gpa: profileData.gpa,
      universityConfirm: profileData.universityConfirm,
      avatar:profileData.avatar,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err) {

    throw err;
  }
},

getInternAssignments: async (token, { search = "", filter = "all", mentorId = null } = {}) => {
  const params = {};
  if (search) params.search = search;
  if (filter) params.filter = filter;

  const res = await axios.get(`${API_URL_MENTOR_ASSIGN}/interns`, {
    headers: { Authorization: `Bearer ${token}` },
    params  // Pass all params directly
  });
  return res.data;
},


assignMentor: async (token, { internId, mentorId }) => {
  const res = await axios.post(`${API_URL_MENTOR_ASSIGN}/assign`, {
    internId, mentorId
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
},

reassignMentor: async (token, { internId, mentorId }) => {
  const res = await axios.put(`${API_URL_MENTOR_ASSIGN}/reassign`, {
    internId, mentorId
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
},

getAllMentors: async (token) => {
  const res = await axios.get(`${API_URL_MENTOR_ASSIGN}/mentors`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
},

// Allowance API methods
getAllowances: async (token, page = 0, size = 10, sortBy = null, direction = "asc") => {
  const params = { page, size };
  if (sortBy) {
    params.sortBy = sortBy;
    params.direction = direction;
  }
  const res = await axios.get("http://localhost:8080/api/allowances", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return res.data;
},

getAllowanceById: async (token, id) => {
  const res = await axios.get(`http://localhost:8080/api/allowances/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
},

getAllowancesByInternId: async (token, internId, page = 0, size = 10, sortBy = null, direction = "asc") => {
  const params = { page, size };
  if (sortBy) {
    params.sortBy = sortBy;
    params.direction = direction;
  }
  const res = await axios.get(`http://localhost:8080/api/allowances/intern/${internId}`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return res.data;
},

createAllowance: async (token, allowanceData) => {
  const res = await axios.post("http://localhost:8080/api/allowances", allowanceData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
},

updateAllowance: async (token, id, allowanceData) => {
  const res = await axios.put(`http://localhost:8080/api/allowances/${id}`, allowanceData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
},

deleteAllowance: async (token, id) => {
  const res = await axios.delete(`http://localhost:8080/api/allowances/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
},

// Contract API methods
getContracts: async (token, { searchTerm, status, page = 0, size = 10 } = {}) => {
  const params = { page, size };
  if (searchTerm) params.searchTerm = searchTerm;
  if (status) params.status = status;

  const res = await axios.get("http://localhost:8080/api/hr/contracts", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return res.data;
},

uploadContract: async (token, internId, file, note = "") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("internId", internId);
  if (note) formData.append("note", note);

  const res = await axios.post(
    `http://localhost:8080/api/hr/contracts/${internId}/upload`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
},

replaceContract: async (token, documentId, file, note = "") => {
  const formData = new FormData();
  formData.append("file", file);
  if (note) formData.append("note", note);

  const res = await axios.patch(
    `http://localhost:8080/api/hr/contracts/${documentId}/replace`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
},

deleteContract: async (token, documentId) => {
  const res = await axios.delete(
    `http://localhost:8080/api/hr/contracts/${documentId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
},

downloadContract: async (token, documentId) => {
  const res = await axios.get(
    `http://localhost:8080/api/hr/contracts/${documentId}/download`,
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    }
  );
  return res.data;
},

updateContractNote: async (token, documentId, note) => {
  const res = await axios.patch(
    `http://localhost:8080/api/hr/contracts/${documentId}/note`,
    { note },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
},

};

export default hrApi;
