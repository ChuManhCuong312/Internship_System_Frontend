// src/pages/Auth/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/authService";
import AuthLayout from "../../components/Auth/AuthLayout";
import AuthCard from "../../components/Auth/AuthCard";
import SocialLoginButtons from "../../components/Auth/SocialLoginButtons";
import "../../styles/auth.css";
import PasswordInput from "../../components/Common/PasswordInput";

const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu không trùng với xác nhận mật khẩu");
      return;
    }

    if (form.password.length < 6) {
      setError("Mật khẩu ko được ngắn hơn 6 ký tự");
      return;
    }

    const requestData = {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,        // ✅ gửi phone
      password: form.password,
    };

    try {
      setLoading(true);
      const res = await authService.registerIntern(requestData); // sử dụng endpoint intern
      setSuccess(res);
      setError("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Đăng ký không thành công");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Đăng ký">
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="fullName">Họ và tên</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              required
              disabled={loading}
              className="form-input"
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="form-input"
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">SĐT</label>
            <input
              id="phone"
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              className="form-input"
              placeholder="0123456789"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <PasswordInput
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <PasswordInput
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
        </form>

        <SocialLoginButtons />

        <div className="auth-footer">
          <p className="auth-footer-text">
            Đã có tài khoản?{" "}
            <Link to="/login" className="auth-footer-link">
             Đăng nhập
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default RegisterPage;
