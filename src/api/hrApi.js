import axios from "axios";

const API_URL = "http://localhost:8080/api/hr/interns";
const API_URL_MENTOR_ASSIGN = "http://localhost:8080/api/hr/mentor-assignments";
const API_URL_MENTOR = "http://localhost:8080/api/mentors";

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const hrApi = {
  getAllInterns: async (token, page = 0, size = 10) => {
    const response = await axios.get(API_URL, {
      ...authHeader(token),
      params: { page, size },
    });
    return response.data;
  },

  searchInterns: async (token, { searchTerm, major, status, page = 0, size = 10 }) => {
    const params = { page, size };
    if (searchTerm) params.searchTerm = searchTerm;
    if (major) params.major = major;
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
  formData.append("dob", profileData.dob);
  formData.append("major", profileData.major);
  formData.append("gpa", profileData.gpa);
  formData.append("school", "CMC University");
  formData.append("address", profileData.address);

  const res = await axios.post(`${API_URL}/${userId}/profile?phone=${profileData.phone}`, formData, {
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
      gpa: profileData.gpa
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
  if (mentorId) params.mentorId = mentorId;

  const res = await axios.get(`${API_URL_MENTOR_ASSIGN}/interns`, {
    headers: { Authorization: `Bearer ${token}` },
    params
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
  const res = await axios.get(`${API_URL_MENTOR}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
},



};

export default hrApi;
