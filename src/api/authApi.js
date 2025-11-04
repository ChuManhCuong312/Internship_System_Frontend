// src/api/authAPI.js
import axiosClient from "./axiosClient";

const authAPI = {
  register: (data) => axiosClient.post("/auth/register", data),
  login: (data) => axiosClient.post("/auth/login", data),
  verifyEmail: (token) => axiosClient.get(`/auth/verify?token=${token}`),
};

export default authAPI;