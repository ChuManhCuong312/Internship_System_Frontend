// src/services/authService.js
import axiosClient from "../api/axiosClient";

const BASE_URL_ADMIN = "/admin/users";
const BASE_URL_AUTH = "/auth";

export const authService = {
  // 🔹 Admin: create user manually (token sent via cookie)
  register: async (formData, roleName) => {
    try {
      const res = await axiosClient.post(
        `${BASE_URL_ADMIN}/create?roleName=${roleName}`,
        formData
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // 🔹 Normal user (intern) registration
  registerIntern: async (formData) => {
    try {
      const res = await axiosClient.post(`${BASE_URL_AUTH}/register`, formData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // 🔹 Login (cookie will be set by backend)
  login: async (credentials) => {
    try {
      const res = await axiosClient.post(`${BASE_URL_AUTH}/login`, credentials);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

    getCurrentUser: async () => {
    try {
        const res = await axiosClient.get("/auth/current-user");
        return res.data;
    } catch (error) {
        throw error;
    }
    },

  // 🔹 Verify OTP
  verifyOtp: async (email, otp) => {
    try {
      const res = await axiosClient.post(`${BASE_URL_AUTH}/verify-otp`, null, {
        params: { email, otp },
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // 🔹 Resend OTP
  resendOtp: async (email) => {
    try {
      const res = await axiosClient.post(`${BASE_URL_AUTH}/resend-otp`, null, {
        params: { email },
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // 🔹 Send reset link
  sendResetLink: async (email) => {
    try {
      const res = await axiosClient.post(`${BASE_URL_AUTH}/forgot-password`, null, {
        params: { email },
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // 🔹 Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const res = await axiosClient.post(`${BASE_URL_AUTH}/reset-password`, null, {
        params: { token, newPassword },
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // 🔹 Resend reset link
  resendResetLink: async (email) => {
    try {
      const res = await axiosClient.post(`${BASE_URL_AUTH}/resend-reset-link`, null, {
        params: { email },
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};