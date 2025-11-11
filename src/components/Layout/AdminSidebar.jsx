import React, { useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUsersCog,
  FaCogs,
  FaDatabase,
  FaShieldAlt,
  FaChartLine,
  FaThLarge,
  FaSignOutAlt,
  FaRegUser,
  FaBars,
} from "react-icons/fa";
import avatar from "../../assets/avatar.png";
import "../../styles/sideBar.css";

const AdminSidebar = () => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const sidebarStyle = useSpring({
    width: expanded ? 250 : 60,
    height: "100vh",
    config: { tension: 220, friction: 20 },
  });

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
          <img src={avatar} alt="Admin Avatar" />
          {expanded && (
            <div className="avatar-info">
              <h4>Admin</h4>
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
        <li>
          <FaRegUser /> {expanded && <span>Tìm kiếm profile intern</span>}
        </li>

      </ul>

      {/* Footer */}
      <div className="sidebar-footer">
        <button onClick={() => navigate("/login")}>
          <FaSignOutAlt /> {expanded && <span>Đăng xuất</span>}
        </button>
      </div>
    </animated.div>
  );
};

export default AdminSidebar;
