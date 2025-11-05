import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/Auth/AuthLayout";
import AuthCard from "../../components/Auth/AuthCard";
import "../../styles/auth.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      // TODO: Implement actual forgot password logic
      console.log("Reset password for:", email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Quên mật khẩu">
        {success ? (
          <div className="success-message">
            Link reset mật khẩu đã đươc gửi tới email của bạn. Hãy xem tin nhắn.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            
            <p className="auth-footer-text" style={{ marginBottom: "20px", textAlign: "left" }}>
              Nhập địa chỉ email của bạn và hệ thống sẽ gửi link reset mật khẩu đên bạn.
            </p>

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

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi link reset"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p className="auth-footer-text">
            Nhớ mật khẩu của bạn?{" "}
            <Link to="/login" className="auth-footer-link">
              Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
