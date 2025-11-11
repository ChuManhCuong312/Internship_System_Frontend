import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (loading) return;

    if (user?.role === "INTERN") {
      console.log("User found, redirecting to intern dashboard:", user);
      navigate("/intern/dashboard");
    } else {
      console.log("No user or unauthorized, redirecting to login");
      navigate("/login");
    }
  }, [user, loading, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "120px" }}>
      <h2>🎉 Đăng nhập thành công!</h2>
      <p>Đang chuyển hướng đến trang chính...</p>
    </div>
  );
};

export default OAuthSuccess;