// src/pages/Auth/VerifyOtpPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import "../../styles/auth.css";

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email");

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🔹 Countdown effect for resend timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await authService.verifyOtp(email, otp);
      setMessage({
          type: "success",
          text: "Xác thực OTP thành công" });
      setTimeout(() => navigate("/login"), 4000);
    } catch (err) {
      setMessage({
        type: "error",
        text: "Xác thực OTP không thành công",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setMessage(null); // clear any previous messages

    try {
      const res = await authService.resendOtp(email);
      setMessage({
          type: "success",
          text: "Mã OTP mới đã được gửi đến gmail của bạn" });
      // Start the countdown when OTP is successfully sent
      setCooldown(60); // 60-second cooldown

    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data || "Lỗi gửi lại OTP",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h2 className="auth-title">Xác thực email</h2>
        <p className="auth-subtitle">
          Nhập mã OTP gửi đến <strong>{email}</strong>
        </p>

        {message && (
          <div
            className={
              message.type === "error"
                ? "error-message"
                : message.type === "success"
                ? "success-message"
                : "info-message"
            }
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleVerify} className="auth-form">
          <div className="form-group">
            <label htmlFor="otp">One-Time Password (OTP)</label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Nhập mã 6 chữ số"
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            className={`auth-btn ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Đang xác thực..." : "Xác thực OTP"}
          </button>
        </form>

        <button
          onClick={handleResend}
          className="auth-btn"
          disabled={cooldown > 0 || loading}
          style={{
            marginTop: "16px",
            background: cooldown > 0 ? "#94a3b8" : "#475569",
          }}
        >
          {cooldown > 0 ? `Gửi lại OTP (${cooldown}s)` : "Gửi lại OTP"}
        </button>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
