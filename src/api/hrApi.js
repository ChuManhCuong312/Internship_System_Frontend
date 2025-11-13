import axios from "axios";

const API_URL = "http://localhost:8080/api/hr/interns";
const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const hrApi = {
  getAllInterns: async (token) => {
    console.log("Token gửi đi:", token);
    const response = await axios.get(API_URL, authHeader(token));
    return response.data;
  },
};

export default hrApi;
