import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/Auth/AuthLayout";
import AuthCard from "../../components/Auth/AuthCard";
import { authService } from "../../services/authService";
import "../../styles/auth.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // 60s cooldown for resend

  // Countdown effect for resend
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Initial send
  const handleSendLink = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await authService.sendResetLink(email);
      console.log(res);
      setSuccess(true);
      setCooldown(60); // start cooldown after sending
    } catch (err) {
      setError(err?.response?.data || "Không thể gửi link reset. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Resend button click
  const handleResendLink = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await authService.resendResetLink(email);
      console.log(res);
      setCooldown(60); // restart cooldown
    } catch (err) {
      setError(err?.response?.data || "Không thể gửi lại link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Quên mật khẩu">
        {!success && (
          <form onSubmit={handleSendLink} className="auth-form">
            {error && <div className="error-message">{error}</div>}

            <p className="auth-footer-text" style={{ marginBottom: "20px", textAlign: "left" }}>
              Nhập địa chỉ email của bạn và hệ thống sẽ gửi link reset mật khẩu đến bạn.
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
                disabled={loading || cooldown > 0}
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading || cooldown > 0}>
              {loading
                ? "Đang gửi..."
                : "Gửi link reset"}
            </button>
          </form>
        )}

        {success && (
          <div>
            <div className="success-message">
              Link reset mật khẩu đã được gửi tới email của bạn. Hãy kiểm tra hộp thư đến.
            </div>
            <button
              onClick={handleResendLink}
              className="auth-btn"
              disabled={cooldown > 0 || loading}
              style={{
                marginTop: "16px",
                background: cooldown > 0 ? "#94a3b8" : "#475569",
              }}
            >
              {cooldown > 0 ? `Gửi lại link (${cooldown}s)` : "Gửi lại link"}
            </button>
            {error && <div className="error-message" style={{ marginTop: "8px" }}>{error}</div>}
          </div>
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
