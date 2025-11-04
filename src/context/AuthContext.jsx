// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode"; // ✅ make sure installed: npm i jwt-decode
import { authService } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => Cookies.get("token") || null);

  // Restore user from token on page load
  useEffect(() => {
    const existingToken = Cookies.get("token");
    if (existingToken) {
      try {
        const payload = jwtDecode(existingToken)
        setUser({ email: payload.sub, role: payload.role || "INTERN" });
        setToken(existingToken);
      } catch (err) {
        console.error("Invalid token", err);
        Cookies.remove("token");
      }
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      const jwt = res.token.replace("Bearer ", "");

      // Save JWT in cookies
      Cookies.set("token", jwt, {
        expires: 1,
        secure: true,
        sameSite: "Strict",
      });

      const payload = jwtDecode(jwt);
      const loggedInUser = { email: payload.sub, role: payload.role || "INTERN" };
      setUser(loggedInUser);
      setToken(jwt);

      return loggedInUser;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
