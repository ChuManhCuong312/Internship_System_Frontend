import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { authService } from "../services/authService";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const cookieToken = Cookies.get("token");
    return cookieToken;
  });
  const [loading, setLoading] = useState(true);

  // Cookie configuration for secure storage
  const cookieOptions = {
    expires: 1, // 1 day
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    path: "/"
  };

  useEffect(() => {
    // Check cookies for token and user data
    const cookieToken = Cookies.get("token");
    const storedUser = Cookies.get("user");

    console.log("Checking for stored credentials:", {
      hasToken: !!cookieToken,
      hasUser: !!storedUser
    });

    if (cookieToken && storedUser) {
      try {
        const payload = jwtDecode(cookieToken);
        // Check token expiration
        if (payload.exp * 1000 < Date.now()) {
          console.warn("Token expired");
          Cookies.remove("token");
          Cookies.remove("user");
          Cookies.remove("userId");
          Cookies.remove("role");
          Cookies.remove("internId");
        } else {
          // Parse stored user data from cookie
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(cookieToken);
          console.log("Credentials restored from cookies:", {
            email: userData.email,
            userId: userData.userId,
            internId: userData.internId,
            role: userData.role
          });
        }
      } catch (err) {
        console.error("Invalid token or user data", err);
        Cookies.remove("token");
        Cookies.remove("user");
        Cookies.remove("userId");
        Cookies.remove("role");
        Cookies.remove("internId");
      }
    } else {
      console.log("No stored credentials found");
    }
    setLoading(false);
  }, []);


  // Login and store all sensitive data in secure cookies
  const login = async (email, password) => {
    try {
      console.log("Attempting login for:", email);
      const res = await authService.login({ email, password });
      console.log("Login response:", res);

      // Handle different token formats
      let jwt = res.token;
      if (typeof jwt === "string") {
        jwt = jwt.replace("Bearer ", ""); // Remove "Bearer " prefix if present
      }

      if (!jwt) {
        throw new Error("No token received from server");
      }

      console.log("Token to store:", jwt.substring(0, 20) + "...");

      // Prepare user data
      const userData = {
        email: res.email,
        role: res.role,
        userId: res.userId,
        fullName: res.fullName || res["fullName:"],
        internId: res.internId // internId from login response (may be undefined)
      };

      // Store all sensitive data in secure cookies
      Cookies.set("token", jwt, cookieOptions);
      Cookies.set("user", JSON.stringify(userData), cookieOptions);
      Cookies.set("userId", String(userData.userId), cookieOptions);
      Cookies.set("role", userData.role, cookieOptions);
      
      if (userData.internId) {
        Cookies.set("internId", String(userData.internId), cookieOptions);
      }

      console.log("All credentials stored in secure cookies");
      console.log("User data:", userData);

      setUser(userData);
      setToken(jwt);
      return userData;
    } catch (err) {
      console.error("Login error:", err);
      // Clear any partial storage on error
      Cookies.remove("token");
      Cookies.remove("user");
      Cookies.remove("userId");
      Cookies.remove("role");
      Cookies.remove("internId");
      throw err;
    }
  };

  const logout = () => {
    // Clear all sensitive data from cookies
    Cookies.remove("token");
    Cookies.remove("user");
    Cookies.remove("userId");
    Cookies.remove("role");
    Cookies.remove("internId");
    
    // Clear any remaining localStorage data
    localStorage.removeItem("lastRoute");
    
    setUser(null);
    setToken(null);
    console.log("User logged out, all credentials cleared");
  };

  useEffect(() => {
      const interceptor = axios.interceptors.response.use(
        res => res,
        err => {
          if (err.response && err.response.status === 401) {
            logout();
            window.location.href = "/login";
          }
          return Promise.reject(err);
        }
      );

      return () => axios.interceptors.response.eject(interceptor);
    }, []);
  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
