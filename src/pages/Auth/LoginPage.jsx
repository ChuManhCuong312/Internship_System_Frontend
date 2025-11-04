import React, { useState, useContext } from "react";
import "../../styles/auth.css";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loggedInUser = await login(email, password);

      // Redirect based on role
      if (loggedInUser.role === "ADMIN") navigate("/Admin/Dashboard");
      else if (loggedInUser.role === "HR") navigate("/HR/Dashboard");
      else navigate("/Intern/Dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Nhập email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button type="submit" className="auth-btn">Đăng nhập</button>
        </form>

        <div className="auth-footer">
          <a href="/forgot-password">Quên mật khẩu?</a>
          <p>
            Chưa có tài khoản? <a href="/register">Đăng ký</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
