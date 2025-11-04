// src/pages/Auth/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/authService";
import AuthLayout from "../../components/Auth/AuthLayout";
import AuthCard from "../../components/Auth/AuthCard";
import SocialLoginButtons from "../../components/Auth/SocialLoginButtons";
import "../../styles/auth.css";

const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // ✅ success message
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ basic frontend validation
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const requestData = {
      fullName: form.fullName,
      email: form.email,
      password: form.password,
    };

    try {
      setLoading(true);

      const res = await authService.register(requestData);

      // Spring backend returns a string message
      setSuccess(res);
      setError("");

      // Optional: redirect to login after a short delay
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      // Backend might return { message: "..."} or a string
      setError(err.response?.data?.message || err.message || "Registration failed");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Register">
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
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
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="form-input"
              placeholder="••••••"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              className="form-input"
              placeholder="••••••"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <SocialLoginButtons />

        <div className="auth-footer">
          <p className="auth-footer-text">
            Already have an account?{" "}
            <Link to="/login" className="auth-footer-link">
              Sign in
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default RegisterPage;
