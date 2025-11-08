// src/App.jsx
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext.jsx";
import Dashboard from "./pages/Intern/Dashboard";
import HRDashboard from "./pages/HR/Dashboard";
import AdminDashboard from "./pages/Admin/Dashboard";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import VerifyOtpPage from "./pages/Auth/VerifyOtpPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ManageUsers from "./pages/Admin/ManageUsers";
import OAuthSuccess from "./pages/Auth/OAuthSuccess";

// 🔹 PrivateRoute component
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role?.toUpperCase())) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/manageusers"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <ManageUsers />
            </PrivateRoute>
          }
        />

        {/* HR routes */}
        <Route
          path="/hr/dashboard"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRDashboard />
            </PrivateRoute>
          }
        />

        {/* Intern routes */}
        <Route
          path="/intern/dashboard"
          element={
            <PrivateRoute allowedRoles={["INTERN"]}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;