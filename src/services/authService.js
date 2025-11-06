// src/services/authService.js
import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL_ADMIN = "http://localhost:8080/api/admin/users";
const BASE_URL_AUTH = "http://localhost:8080/api/auth";

export const authService = {
  // 🔹 Admin: create user manually (with token)
  register: async (formData, roleName) => {
    try {
      const token = Cookies.get("token");

      const res = await axios.post(
        `${BASE_URL_ADMIN}/create?roleName=${roleName}`,
        formData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );
      return res.data;
    } catch (error) {
      console.error(error.response?.data || error.message);
      throw error;
    }
  },

  // 🔹 Normal user (intern) registration
  registerIntern: async (formData) => {
    try {
      const res = await axios.post(`${BASE_URL_AUTH}/register`, formData);
      return (
        res.data ||
        "Đăng ký thành công! Mã OTP đã được gửi tới email của bạn."
      );
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 🔹 Login
  login: async (credentials) => {
    try {
      const res = await axios.post(`${BASE_URL_AUTH}/login`, credentials);
      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 🔹 Verify OTP
  verifyOtp: async (email, otp) => {
    try {
      const res = await axios.post(`${BASE_URL_AUTH}/verify-otp`, null, {
        params: { email, otp },
      });
      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 🔹 Resend OTP
  resendOtp: async (email) => {
    try {
      const res = await axios.post(`${BASE_URL_AUTH}/resend-otp`, null, {
        params: { email },
      });
      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
