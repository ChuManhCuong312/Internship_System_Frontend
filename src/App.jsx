// src/App.jsx
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext.jsx";
import Dashboard from "./pages/Intern/Dashboard";
import HRDashboard from "./pages/HR/Dashboard";
import AdminDashboard from "./pages/Admin/Dashboard";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import VerifyEmailPage from "./pages/Auth/VerifyEmailPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";

// 🔹 PrivateRoute component
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, token } = useContext(AuthContext);

  // Not logged in
  if (!token || !user) return <Navigate to="/login" replace />;

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />; // Or a 403 page
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected dashboard routes */}
        <Route
          path="/Admin/Dashboard"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/HR/Dashboard"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/Intern/Dashboard"
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
