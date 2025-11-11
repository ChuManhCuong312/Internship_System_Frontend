import { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restoreUser = async () => {
        try {
          const userInfo = await authService.getCurrentUser();
         setUser(userInfo);
        } catch (err) {
          console.warn("No valid session found.");
          setUser(null);
        } finally {
           setLoading(false);
        }
        };
        restoreUser();
    }, []);



  // Đăng nhập và lưu token
    const login = async (email, password) => {
        try {
         await authService.login({ email, password }); // cookie is set
          const userInfo = await authService.getCurrentUser(); // get user info
          setUser(userInfo);
          return userInfo;
        } catch (err) {
          console.error("Login error:", err);
          throw err;
        }
    };



    const logout = () => {
        setUser(null);
    // Later: call backend to clear cookie
    };


  return (
    <AuthContext.Provider value={{ user, login, logout, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
