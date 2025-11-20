import React, { useState, useContext } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUsersCog,
  FaCogs,
  FaDatabase,
  FaShieldAlt,
  FaThLarge,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/sideBar.css";

const AdminSidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const sidebarStyle = useSpring({
    width: expanded ? 250 : 60,
    height: "100vh",
    config: { tension: 220, friction: 20 },
  });

  // Tạo initials từ thông tin user
  const initials = (user?.fullName || user?.email || "AD")
    .split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <animated.div
      className="sidebar"
      style={sidebarStyle}
    >
      {/* Header */}
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={() => setExpanded(!expanded)}>
          <FaBars />
        </button>
        <div className="avatar-container">
          <div className="avatar-initials">{initials}</div>
          {expanded && (
            <div className="avatar-info">
              <h4>{user?.fullName || user?.email || "Admin"}</h4>
              <p>Hệ thống quản trị</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu chính */}
      <ul className="sidebar-menu">
        <li onClick={() => navigate("/Admin/Dashboard")}>
          <FaHome /> {expanded && <span>Trang chủ</span>}
        </li>
        <li onClick={() => navigate("/Admin/ManageUsers")}>
          <FaUsersCog /> {expanded && <span>Quản trị người dùng</span>}
        </li>
        <li>
          <FaCogs /> {expanded && <span>Cấu hình & Tích hợp hệ thống</span>}
        </li>
        <li>
          <FaDatabase /> {expanded && <span>Sao lưu & Bảo mật</span>}
        </li>
        <li>
          <FaShieldAlt /> {expanded && <span>Giám sát & Thống kê</span>}
        </li>
        <li>
          <FaThLarge /> {expanded && <span>Cài đặt chung</span>}
        </li>
      </ul>

      {/* Footer */}
      <div className="sidebar-footer">
        <button onClick={() => {
          logout();
          navigate("/login");
        }}>
          <FaSignOutAlt /> {expanded && <span>Đăng xuất</span>}
        </button>
      </div>
    </animated.div>
  );
};

export default AdminSidebar;