import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";

// Admin Pages
import AdminDashboard from "../pages/Admin/Dashboard";
import ManageUsers from "../pages/Admin/ManageUsers";
import Reports from "../pages/Admin/Reports";
import RolePermission from "../pages/Admin/RolePermission";

// HR Pages
import HRDashboard from "../pages/HR/Dashboard";
import ManageInterns from "../pages/HR/ManageInterns";
import ManagePrograms from "../pages/HR/ManagePrograms";
import Allowances from "../pages/HR/Allowances";
import ApproveDocs from "../pages/HR/ApproveDocs";

// Mentor Pages
import MentorDashboard from "../pages/Mentor/Dashboard";
import ManageTasks from "../pages/Mentor/ManageTasks";
import InternProgress from "../pages/Mentor/InternProgress";
import EvaluateIntern from "../pages/Mentor/EvaluateIntern";

// Intern Pages
import InternDashboard from "../pages/Intern/Dashboard";
import MyProfile from "../pages/Intern/MyProfile";
import MyTasks from "../pages/Intern/MyTasks";
import Attendance from "../pages/Intern/Attendance";
import AllowanceRequest from "../pages/Intern/AllowanceRequest";
import SupportRequest from "../pages/Intern/SupportRequest";

// Shared Pages
import NotFound from "../pages/Shared/NotFound";
import Forbidden from "../pages/Shared/Forbidden";

// Components
import PrivateRoute from "../components/Common/PrivateRoute";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute requiredRole="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute requiredRole="admin">
              <ManageUsers />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <PrivateRoute requiredRole="admin">
              <Reports />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <PrivateRoute requiredRole="admin">
              <RolePermission />
            </PrivateRoute>
          }
        />

        {/* HR Routes */}
        <Route
          path="/hr/dashboard"
          element={
            <PrivateRoute requiredRole="hr">
              <HRDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/interns"
          element={
            <PrivateRoute requiredRole="hr">
              <ManageInterns />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/programs"
          element={
            <PrivateRoute requiredRole="hr">
              <ManagePrograms />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/allowances"
          element={
            <PrivateRoute requiredRole="hr">
              <Allowances />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/approve-docs"
          element={
            <PrivateRoute requiredRole="hr">
              <ApproveDocs />
            </PrivateRoute>
          }
        />

        {/* Mentor Routes */}
        <Route
          path="/mentor/dashboard"
          element={
            <PrivateRoute requiredRole="mentor">
              <MentorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/mentor/tasks"
          element={
            <PrivateRoute requiredRole="mentor">
              <ManageTasks />
            </PrivateRoute>
          }
        />
        <Route
          path="/mentor/progress"
          element={
            <PrivateRoute requiredRole="mentor">
              <InternProgress />
            </PrivateRoute>
          }
        />
        <Route
          path="/mentor/evaluate"
          element={
            <PrivateRoute requiredRole="mentor">
              <EvaluateIntern />
            </PrivateRoute>
          }
        />

        {/* Intern Routes */}
        <Route
          path="/intern/dashboard"
          element={
            <PrivateRoute requiredRole="intern">
              <InternDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/intern/profile"
          element={
            <PrivateRoute requiredRole="intern">
              <MyProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/intern/tasks"
          element={
            <PrivateRoute requiredRole="intern">
              <MyTasks />
            </PrivateRoute>
          }
        />
        <Route
          path="/intern/attendance"
          element={
            <PrivateRoute requiredRole="intern">
              <Attendance />
            </PrivateRoute>
          }
        />
        <Route
          path="/intern/allowance"
          element={
            <PrivateRoute requiredRole="intern">
              <AllowanceRequest />
            </PrivateRoute>
          }
        />
        <Route
          path="/intern/support"
          element={
            <PrivateRoute requiredRole="intern">
              <SupportRequest />
            </PrivateRoute>
          }
        />

        {/* Error Pages */}
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/404" element={<NotFound />} />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
