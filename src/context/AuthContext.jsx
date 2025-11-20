import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { authService } from "../services/authService";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const localToken = localStorage.getItem("token");
    const cookieToken = Cookies.get("token");
    return localToken || cookieToken || null;
  });
  const [loading, setLoading] = useState(true);

 useEffect(() => {
   // Check both localStorage and cookies
   const localToken = localStorage.getItem("token");
   const cookieToken = Cookies.get("token");
   const existingToken = localToken || cookieToken;
   
   // Also try to restore userId from localStorage (since token doesn't contain it)
   const storedUserId = localStorage.getItem("userId");
   const storedFullName = localStorage.getItem("fullName");
   
   console.log("Checking for existing token:", { 
     hasLocalStorage: !!localToken, 
     hasCookie: !!cookieToken,
     hasStoredUserId: !!storedUserId
   });
   
   if (existingToken) {
     try {
       const payload = jwtDecode(existingToken);
       // Kiểm tra hết hạn
       if (payload.exp * 1000 < Date.now()) {
         console.warn("Token expired");
         Cookies.remove("token");
         localStorage.removeItem("token");
         localStorage.removeItem("userId");
         localStorage.removeItem("fullName");
       } else {
         // Try to get userId from token payload, or fall back to stored userId
         const userId = payload.userId || (storedUserId ? parseInt(storedUserId) : null);
         const fullName = payload.fullName || storedFullName;
         
         setUser({ 
           email: payload.sub || payload.email, 
           role: payload.role || "INTERN",
           userId: userId,
           fullName: fullName
         });
         setToken(existingToken);
         console.log("Token restored, user:", { 
           email: payload.sub || payload.email, 
           userId: userId 
         });
       }
     } catch (err) {
       console.error("Invalid token", err);
       Cookies.remove("token");
       localStorage.removeItem("token");
       localStorage.removeItem("userId");
       localStorage.removeItem("fullName");
     }
   } else {
     console.log("No existing token found");
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
      localStorage.setItem("token", jwt);
      Cookies.set("token", jwt, {
        expires: 1, // 1 ngày
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      console.log("Token stored in localStorage and cookies");

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
      localStorage.removeItem("token");
      throw err;
    }
  };

  const logout = () => {
    Cookies.remove("token");
    localStorage.removeItem("token");
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
