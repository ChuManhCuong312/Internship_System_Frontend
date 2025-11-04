import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement actual registration logic
      console.log("Register:", form);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to login after successful registration
      // navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Register">
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              className="form-input"
              placeholder="John Doe"
              value={form.fullName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-input"
              placeholder="yourname@gmail.com"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
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
