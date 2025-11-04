// src/pages/Admin/UserRegister.jsx
import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import { authService } from "../../services/authService";
import "../../styles/dashBoard.css";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
const mockRoles = [
  { roleId: 1, name: "ADMIN" },
  { roleId: 2, name: "HR" },
  { roleId: 3, name: "Mentor" },
  { roleId: 4, name: "Intern" },
];

const UserRegister = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    position: "",      // ADMIN
    department: "",    // HR, Mentor
    expertise: "",     // Mentor
    school: "",        // Intern
    major: "",         // Intern
    dob: "",           // Intern
    address: "",       // Intern
  });

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Lấy user đã login từ localStorage
const { user: loggedInUser } = useContext(AuthContext);
const isAdmin = loggedInUser?.role === "ADMIN";

  useEffect(() => {
    setRoles(mockRoles); // dùng mock roles, sau này có thể gọi backend
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    const requestData = {
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      phone: form.phone,
      position: selectedRole === "ADMIN" ? form.position : undefined,
      department: selectedRole === "HR" || selectedRole === "Mentor" ? form.department : undefined,
      expertise: selectedRole === "Mentor" ? form.expertise : undefined,
      school: selectedRole === "Intern" ? form.school : undefined,
      major: selectedRole === "Intern" ? form.major : undefined,
      dob: selectedRole === "Intern" ? form.dob : undefined,
      address: selectedRole === "Intern" ? form.address : undefined,
    };

    try {
      setLoading(true);
      const res = await authService.register(requestData, selectedRole); // gọi backend với token
      setSuccess(`User created successfully with role ${selectedRole}`);
      setError("");
      setForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        position: "",
        department: "",
        expertise: "",
        school: "",
        major: "",
        dob: "",
        address: "",
      });
      setSelectedRole("");
    } catch (err) {
      setError(err.response?.data || err.message || "Registration failed");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="dashboard-layout">
        <AdminSidebar />
        <div className="dashboard-content">
          <h2 className="page-title">Bạn không có quyền tạo user.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <AdminSidebar />

      <div className="dashboard-content">
        <h2 className="page-title">Tạo tài khoản & Phân quyền</h2>

        <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label>
              Full Name
              <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" required className="form-input" />
            </label>

            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required className="form-input" />
            </label>

            <label>
              Phone
              <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="0123456789" className="form-input" />
            </label>

            <label>
              Password
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••" required className="form-input" />
            </label>

            <label>
              Confirm Password
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="••••••" required className="form-input" />
            </label>

            <label>
              Role
              <select name="role" value={selectedRole} onChange={handleRoleChange} required className="form-input">
                <option value="">-- Select role --</option>
                {roles.map(role => (
                  <option key={role.roleId} value={role.name}>{role.name}</option>
                ))}
              </select>
            </label>

            {/* ADMIN fields */}
            {selectedRole === "ADMIN" && (
              <label>
                Position
                <input type="text" name="position" value={form.position} onChange={handleChange} placeholder="System Administrator" className="form-input" />
              </label>
            )}

            {/* HR fields */}
            {selectedRole === "HR" && (
              <label>
                Department
                <input type="text" name="department" value={form.department} onChange={handleChange} placeholder="Human Resources" className="form-input" />
              </label>
            )}

            {/* Mentor fields */}
            {selectedRole === "Mentor" && (
              <>
                <label>
                  Department
                  <input type="text" name="department" value={form.department} onChange={handleChange} placeholder="IT Department" className="form-input" />
                </label>
                <label>
                  Expertise
                  <input type="text" name="expertise" value={form.expertise} onChange={handleChange} placeholder="React, Java" className="form-input" />
                </label>
              </>
            )}

            {/* Intern fields */}
            {selectedRole === "Intern" && (
              <>
                <label>
                  School
                  <input type="text" name="school" value={form.school} onChange={handleChange} placeholder="Example University" className="form-input" />
                </label>
                <label>
                  Major
                  <input type="text" name="major" value={form.major} onChange={handleChange} placeholder="Computer Science" className="form-input" />
                </label>
                <label>
                  Date of Birth
                  <input type="date" name="dob" value={form.dob} onChange={handleChange} className="form-input" />
                </label>
                <label>
                  Address
                  <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="123 Main St" className="form-input" />
                </label>
              </>
            )}

            <button type="submit" className="checkin-btn" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
