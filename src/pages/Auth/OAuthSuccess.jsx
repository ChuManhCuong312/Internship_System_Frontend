import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { token, user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (loading) return;

    if (token && user?.role === "INTERN") {
      console.log("Token found, redirecting to intern dashboard:", token);
      navigate("/intern/dashboard");
    } else {
      console.log("No token or unauthorized, redirecting to login");
      navigate("/login");
    }
  }, [token, user, loading, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "120px" }}>
      <h2>🎉 Đăng nhập thành công!</h2>
      <p>Đang chuyển hướng đến trang chính...</p>
    </div>
  );
};

export default OAuthSuccess;
