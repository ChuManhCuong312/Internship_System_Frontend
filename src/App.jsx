import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext.jsx";
import { InternsProvider } from "./context/InternsContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import MentorDashboard from "./pages/Mentor/Dashboard";
import InternProgress from "./pages/Mentor/InternProgress";
import Tasks from "./pages/Mentor/Tasks";
import MentorFeedback from "./pages/Mentor/MentorFeedback";
import EvaluateIntern from "./pages/Mentor/EvaluateIntern";
import Dashboard from "./pages/Intern/Dashboard";
import MyProfile from "./pages/Intern/MyProfile";
import HRDashboard from "./pages/HR/Dashboard";
import ManageInterns from "./pages/HR/ManageInterns/ManageInterns";
import ApproveInterns from "./pages/HR/ManageInterns/ApproveInterns";
import Programs from "./pages/HR/ProgramTeam/ProgramManagement";
import ManageSupportRequests from "./pages/HR/ProgramTeam/ManageSupportRequests";
import MentorAssigns from "./pages/HR/ManageProgramMentor/MentorAssigns";
import AdminDashboard from "./pages/Admin/Dashboard";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import VerifyOtpPage from "./pages/Auth/VerifyOtpPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ManageUsers from "./pages/Admin/ManageUsers";
import OAuthSuccess from "./pages/Auth/OAuthSuccess";
import { UserProvider } from "./context/UserContext.jsx"
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";
import MyTasks from "./pages/Intern/MyTasks";
import Attendance from "./pages/Intern/Attendance";
import MyAllowance from "./pages/Intern/MyAllowance";
import SupportRequest from "./pages/Intern/SupportRequest";
import MySupport from "./pages/Intern/MySupport";
import Calendar from "./pages/Intern/Calendar";
import Notifications from "./pages/Intern/Notifications";
import Allowances from "./components/Allowances/Allowances";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HrProvider } from "./context/HrContext.jsx";
import LeaveRequest from "./pages/Intern/LeaveRequest";
import ManageContracts from "./pages/HR/ManageContracts"
import AttendanceManagement from "./pages/HR/AttendanceManagement/AttendanceManagement";
import LeaveManagement from "./pages/HR/LeaveManagement/LeaveManagement";
import ContractPage from "./pages/Intern/ContractPage.jsx"
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!token || !user) return <Navigate to="/login" replace />;

  // Save last visited route
  const currentPath = window.location.pathname;
  if (currentPath !== "/login" && currentPath !== "/register") {
    localStorage.setItem("lastRoute", currentPath);
  }

  if (allowedRoles && !allowedRoles.includes(user.role?.toUpperCase())) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


function App() {
  return (
    <UserProvider>
      <InternsProvider>
        <NotificationProvider>
          <HrProvider>
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
                  path="/hr/approve-interns"
                  element={
                    <PrivateRoute allowedRoles={["HR"]}>
                      <ApproveInterns />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/hr/support-requests"
                  element={
                    <PrivateRoute allowedRoles={["HR"]}>
                      <ManageSupportRequests />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/hr/mentor-assigns"
                  element={
                    <PrivateRoute allowedRoles={["HR"]}>
                      <MentorAssigns />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/hr/program"
                  element={
                    <PrivateRoute allowedRoles={["HR"]}>
                      <Programs />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/hr/allowances"
                  element={
                    <PrivateRoute allowedRoles={["HR"]}>
                      <Allowances />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/hr/contracts"
                  element={
                    <PrivateRoute allowedRoles={["HR"]}>
                      <ManageContracts />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/hr/attendance"
                  element={
                    <PrivateRoute allowedRoles={["HR"]}>
                      <AttendanceManagement />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/hr/leave-requests"
                  element={
                    <PrivateRoute allowedRoles={["HR"]}>
                      <LeaveManagement />
                    </PrivateRoute>
                  }
                />


                {/* Mentor routes */}
                <Route
                  path="/mentor/dashboard"
                  element={
                    <PrivateRoute allowedRoles={["MENTOR"]}>
                      <MentorDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/mentor/interns"
                  element={
                    <PrivateRoute allowedRoles={["MENTOR"]}>
                      <InternProgress />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/mentor/tasks"
                  element={
                    <PrivateRoute allowedRoles={["MENTOR"]}>
                      <Tasks />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/mentor/feedback"
                  element={
                    <PrivateRoute allowedRoles={["MENTOR"]}>
                      <MentorFeedback />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/mentor/evaluations"
                  element={
                    <PrivateRoute allowedRoles={["MENTOR"]}>
                      <EvaluateIntern />
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
                  path="/intern/leave-request"
                  element={
                    <PrivateRoute allowedRoles={["INTERN"]}>
                      <LeaveRequest />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/intern/allowance"
                  element={
                    <PrivateRoute allowedRoles={["INTERN"]}>
                      <MyAllowance />
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
                <Route
                  path="/intern/my-support"
                  element={
                    <PrivateRoute allowedRoles={["INTERN"]}>
                      <MySupport />
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
                <Route
                  path="/intern/notifications"
                  element={
                    <PrivateRoute allowedRoles={["INTERN"]}>
                      <Notifications />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/intern/contracts"
                  element={
                    <PrivateRoute allowedRoles={["INTERN"]}>
                      <ContractPage />
                    </PrivateRoute>
                  }
                />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
            </Router>
          </HrProvider>
        </NotificationProvider>
      </InternsProvider>
    </UserProvider>
  );
}

export default App;
