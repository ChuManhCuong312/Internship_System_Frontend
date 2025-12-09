import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../components/Auth/AuthLayout";
import AuthCard from "../../components/Auth/AuthCard";
import "../../styles/auth.css";

const OAuthFailed = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: Auto redirect to login after 5 seconds
    const timer = setTimeout(() => {
      navigate("/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AuthLayout>
      <AuthCard>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          {/* Error Icon */}
          <div style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 24px",
            background: "linear-gradient(135deg, rgba(254, 226, 226, 0.9) 0%, rgba(254, 202, 202, 0.9) 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                fill="#ef4444"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h2 className="auth-title" style={{ marginBottom: "16px" }}>
            Đăng nhập thất bại
          </h2>

          <div className="error-message" style={{ textAlign: "left" }}>
            Đăng nhập bằng tài khoản bên thứ ba không thành công. Vui lòng thử lại sau.
          </div>

          <p className="auth-subtitle" style={{ marginBottom: "32px" }}>
            Có thể có sự cố với dịch vụ xác thực hoặc tài khoản của bạn đã bị vô hiệu hóa.
          </p>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <button className="auth-btn">
                Quay lại đăng nhập
              </button>
            </Link>

            <Link to="/register" style={{ textDecoration: "none" }}>
              <button
                className="auth-btn"
                style={{
                  background: "white",
                  color: "#2563eb",
                  border: "2px solid #2563eb"
                }}
              >
                Tạo tài khoản mới
              </button>
            </Link>
          </div>

          {/* Auto redirect message */}
          <p style={{
            marginTop: "24px",
            fontSize: "13px",
            color: "#94a3b8",
            fontStyle: "italic"
          }}>
            Tự động chuyển hướng sau 5 giây...
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default OAuthFailed;