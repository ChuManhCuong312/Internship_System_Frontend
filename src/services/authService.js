// src/services/authService.js
import authAPI from "../api/authAPI";

export const authService = {
  register: async (formData) => {
    try {
      const res = await authAPI.register(formData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const res = await authAPI.login(credentials);
      return res.data; // contains "Bearer <token>"
    } catch (error) {
      throw error;
    }
  },

  verifyEmail: async (token) => {
    try {
      const res = await authAPI.verifyEmail(token);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};
