import axios from "axios";

const BASE_URL = "http://localhost:8080";
const API_URL = `${BASE_URL}/api/mentors`;

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const mentorApi = {
  // Get all mentors
  getAllMentors: async (token) => {
    const res = await axios.get(API_URL, authHeader(token));
    return res.data;
  },

  // Get mentor by user ID
  getMentorByUserId: async (token, userId) => {
    const res = await axios.get(`${API_URL}/user/${userId}`, authHeader(token));
    return res.data;
  },
};

export default mentorApi;