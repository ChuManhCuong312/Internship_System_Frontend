import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL_ADMIN = "http://localhost:8080/api/admin/users";
const BASE_URL_AUTH = "http://localhost:8080/api/auth";

export const authService = {
  register: async (formData, roleName) => {
    try {
      const token = Cookies.get("token"); // lấy từ cookie

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

  registerIntern: async (formData) => {
    try {
      const res = await axios.post(`${BASE_URL_AUTH}/register`, formData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const res = await axios.post(`${BASE_URL_AUTH}/login`, credentials);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};
