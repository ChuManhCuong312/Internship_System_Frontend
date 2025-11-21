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

 useEffect(() => {
   // Check  cookies
   const cookieToken = Cookies.get("token");

   console.log("Checking for cookieToken token:", {
     hasCookie: !!cookieToken
   });

   if (cookieToken) {
     try {
       const payload = jwtDecode(cookieToken);
       // Kiểm tra hết hạn
       if (payload.exp * 1000 < Date.now()) {
         console.warn("Token expired");
         Cookies.remove("token");
       } else {
         // Try to get userId from token payload, or fall back to stored userId
         const userId = payload.userId;
         const fullName = payload.fullName;

         setUser({
           email: payload.sub || payload.email,
           role: payload.role || "INTERN",
           userId: userId,
           fullName: fullName
         });
         setToken(cookieToken);
         console.log("Token restored, user:", {
           email: payload.sub || payload.email,
           userId: userId
         });
       }
     } catch (err) {
       console.error("Invalid token", err);
       Cookies.remove("token");
     }
   } else {
     console.log("No cookieToken token found");
   }
   setLoading(false);
 }, []);


  // Đăng nhập và lưu token
  const login = async (email, password) => {
    try {
      console.log("Attempting login for:", email);
      const res = await authService.login({ email, password });
      console.log("Login response:", res);

      // Handle different token formats
      let jwt = res.token;
      if (typeof jwt === "string") {
        jwt = jwt.replace("Bearer ", ""); // bỏ tiền tố "Bearer " nếu có
      }

      if (!jwt) {
        throw new Error("No token received from server");
      }

      console.log("Token to store:", jwt.substring(0, 20) + "...");

      // Store in both localStorage and cookies for reliability
      Cookies.set("token", jwt, {
        expires: 1, // 1 ngày
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      console.log("Token stored cookies");

      // Store full user data from login response
      const userData = {
        email: res.email,
        role: res.role,
        userId: res.userId,
        fullName: res.fullName || res["fullName:"] // Handle both formats
      };

      // Store userId and fullName in localStorage for persistence across page refreshes
      // (since the JWT token doesn't contain userId)
      if (userData.userId) {
        localStorage.setItem("userId", String(userData.userId));
      }
      if (userData.fullName) {
        localStorage.setItem("fullName", userData.fullName);
      }

      console.log("User data:", userData);

      setUser(userData);
      setToken(jwt);
      return userData;
    } catch (err) {
      console.error("Login error:", err);
      // Clear any partial storage on error
      Cookies.remove("token");
      throw err;
    }
  };

  const logout = () => {
    Cookies.remove("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("fullName");
    localStorage.removeItem("lastRoute");
    setUser(null);
    setToken(null);
    console.log("User logged out, token cleared");
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
