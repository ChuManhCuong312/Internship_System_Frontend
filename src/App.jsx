// src/App.jsx
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext.jsx";
import { InternsProvider } from "./context/InternsContext.jsx";

import Dashboard from "./pages/Intern/Dashboard";
import MyProfile from "./pages/Intern/MyProfile";
import HRDashboard from "./pages/HR/Dashboard";
import ManageInterns from "./pages/HR/ManageInterns/ManageInterns";
import ApproveDocs from "./pages/HR/ManageInterns/ApproveDocs";
import AdminDashboard from "./pages/Admin/Dashboard";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import VerifyOtpPage from "./pages/Auth/VerifyOtpPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ManageUsers from "./pages/Admin/ManageUsers";
import OAuthSuccess from "./pages/Auth/OAuthSuccess";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";
import MyTasks from "./pages/Intern/MyTasks";
import Attendance from "./pages/Intern/Attendance";
import AllowanceRequest from "./pages/Intern/AllowanceRequest";
import SupportRequest from "./pages/Intern/SupportRequest";
import Calendar from "./pages/Intern/Calendar";

// PrivateRoute component
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
    <InternsProvider>
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
          <Route path="/reset-password" element={<ResetPasswordPage />} />

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

          <Route
            path="/intern/calendar"
            element={
              <PrivateRoute allowedRoles={["INTERN"]}>
                <Calendar />
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

          <Route
            path="/hr/manage-interns"
            element={
              <PrivateRoute allowedRoles={["HR"]}>
                <ManageInterns />
              </PrivateRoute>
            }
          />

          <Route
            path="/hr/approve-docs"
            element={
              <PrivateRoute allowedRoles={["HR"]}>
                <ApproveDocs />
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
          <Route
            path="/intern/profiles"
            element={
              <PrivateRoute allowedRoles={["INTERN"]}>
                <MyProfile />
              </PrivateRoute>
            }
          />

          <Route
            path="/intern/tasks"
            element={
              <PrivateRoute allowedRoles={["INTERN"]}>
                <MyTasks />
              </PrivateRoute>
            }
          />
          <Route
            path="/intern/attendance"
            element={
              <PrivateRoute allowedRoles={["INTERN"]}>
                <Attendance />
              </PrivateRoute>
            }
          />
          <Route
            path="/intern/allowance"
            element={
              <PrivateRoute allowedRoles={["INTERN"]}>
                <AllowanceRequest />
              </PrivateRoute>
            }
          />
          <Route
            path="/intern/support"
            element={
              <PrivateRoute allowedRoles={["INTERN"]}>
                <SupportRequest />
              </PrivateRoute>
            }
          />


          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </InternsProvider>
  );
}

export default App;
