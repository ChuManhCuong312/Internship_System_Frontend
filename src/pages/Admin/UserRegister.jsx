// src/pages/Admin/UserRegister.jsx
import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import "../../styles/dashBoard.css";

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

  useEffect(() => {
    setRoles(mockRoles); // Load mock roles
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

  const handleSubmit = (e) => {
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

    // Demo: chỉ log dữ liệu (chưa gọi backend)
    console.log("Submit data:", { role: selectedRole, ...form });
    setSuccess(`User with role ${selectedRole} would be created (demo)`);
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
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />

      <div className="dashboard-content">
        <h2 className="page-title">Tạo tài khoản & Phân quyền (Demo)</h2>

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

            <button type="submit" className="checkin-btn">{loading ? "Creating..." : "Create User"}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
