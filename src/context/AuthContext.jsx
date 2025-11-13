import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { authService } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => Cookies.get("token") || null);
  const [loading, setLoading] = useState(true);

  // Khôi phục user khi reload trang
 useEffect(() => {
   const existingToken = Cookies.get("token");
   if (existingToken) {
     try {
       const payload = jwtDecode(existingToken);
       // Kiểm tra hết hạn
       if (payload.exp * 1000 < Date.now()) {
         console.warn("Token expired");
         Cookies.remove("token");
       } else {
         // Try to get userId and fullName from token payload if available
         setUser({ 
           email: payload.sub || payload.email, 
           role: payload.role || "INTERN",
           userId: payload.userId,
           fullName: payload.fullName
         });
         setToken(existingToken);
       }
     } catch (err) {
       console.error("Invalid token", err);
       Cookies.remove("token");
     }
   }
   setLoading(false);
 }, []);


  // Đăng nhập và lưu token
  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      const jwt = res.token.replace("Bearer ", ""); // bỏ tiền tố "Bearer "

      Cookies.set("token", jwt, {
        expires: 1, // 1 ngày
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      // Store full user data from login response
      const userData = {
        email: res.email,
        role: res.role,
        userId: res.userId,
        fullName: res.fullName || res["fullName:"] // Handle both formats
      };
      
      setUser(userData);
      setToken(jwt);
      return userData;
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
    <AuthContext.Provider value={{ user, token, login, logout, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
