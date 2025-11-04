import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Intern/Dashboard";
import HRDashboard from "./pages/HR/Dashboard";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Mặc định chuyển hướng về /Intern/Dashboard */}
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Trang dành cho Intern */}
        <Route path="/Intern/Dashboard" element={<Dashboard />} />

        {/* Trang dành cho HR */}
        <Route path="/HR/Dashboard" element={<HRDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
