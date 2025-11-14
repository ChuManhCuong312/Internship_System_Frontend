import axios from "axios";

const API_URL = "http://localhost:8080/api/hr/interns";
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

};

export default hrApi;
