// src/api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api", // backend base URL
  withCredentials: true, // ✅ this tells the browser to send cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosClient;
