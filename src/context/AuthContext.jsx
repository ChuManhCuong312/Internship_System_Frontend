// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { authService } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => Cookies.get("token") || null);

  useEffect(() => {
    const existingToken = Cookies.get("token");
    if (existingToken) {
      setToken(existingToken);
      // optionally decode JWT here if you want to restore user state
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      const jwt = res.token.replace("Bearer ", ""); // just return JWT

      // Save JWT in cookies
      Cookies.set("token", jwt, {
        expires: 1, // 1 day
        secure: true,
        sameSite: "Strict",
      });

      setToken(jwt);
      return jwt; // ✅ return JWT string
    } catch (error) {
      console.error("Login error:", error);
      throw error;
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
