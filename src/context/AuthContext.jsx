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
         setUser({ email: payload.sub, role: payload.role || "INTERN" });
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

      const payload = jwtDecode(jwt);
      setUser({ email: payload.sub, role: payload.role || "INTERN" });
      setToken(jwt);
      return payload;
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
