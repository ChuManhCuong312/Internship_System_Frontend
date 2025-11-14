// src/pages/Auth/LoginPage.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import AuthLayout from "../../components/Auth/AuthLayout";
import AuthCard from "../../components/Auth/AuthCard";
import SocialLoginButtons from "../../components/Auth/SocialLoginButtons";
import "../../styles/auth.css";
import PasswordInput from "../../components/Common/PasswordInput";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call login from AuthContext
      const loggedInUser = await login(email, password);

      // Redirect based on role
      if (loggedInUser.role === "ADMIN") navigate("/admin/dashboard");
      else if (loggedInUser.role === "HR") navigate("/hr/dashboard");
      else if (loggedInUser.role === "MENTOR") navigate("/mentor/dashboard");
      else navigate("/intern/dashboard");
    } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            const data = err.response.data;
            const message = "Email hoặc mật khẩu không đúng.";
            setError(message);
          } else {
            setError("Đăng nhập thất bại. Vui lòng thử lại.");
          }
        } else if (err.request) {
          setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.");
        } else {
          setError("Đã xảy ra lỗi không xác định.");
        }
      } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Đăng nhập">
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="yourname@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <PasswordInput
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <Link to="/forgot-password" className="auth-link">
            Quên mật khẩu?
          </Link>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <SocialLoginButtons />

        <div className="auth-footer">
          <p className="auth-footer-text">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="auth-footer-link">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default LoginPage;
