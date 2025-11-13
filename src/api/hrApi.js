import axios from "axios";

const API_URL = "http://localhost:8080/api/hr/interns";
const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const hrApi = {
  getAllInterns: async (token) => {
    const response = await axios.get(API_URL, authHeader(token));
    return response.data;
  },

  searchInterns: async (token, { searchTerm, major, status }) => {
    const params = {};
    if (searchTerm) params.searchTerm = searchTerm;
    if (major) params.major = major;
    if (status) params.status = status;

    const res = await axios.get(`${API_URL}/search`, {
      ...authHeader(token),
      params,
    });
    return res.data;
  },
};

export default hrApi;


