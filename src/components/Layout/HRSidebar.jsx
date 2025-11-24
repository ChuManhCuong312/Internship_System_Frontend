import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSpring, animated } from "@react-spring/web";
import {
  FaHome, FaUser, FaChalkboardTeacher, FaTasks, FaClock,
  FaLifeRing, FaChartBar, FaSignOutAlt, FaBars, FaRegUser, FaMoneyBillWave
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/sideBar.css";

const HRSidebar = () => {
    const [expanded, setExpanded] = useState(() => {
      const saved = localStorage.getItem("hrSidebarExpanded");
      return saved ? JSON.parse(saved) : false;
    });
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [openProgramMenu, setOpenProgramMenu] = useState(false);
  const [openBenefitsMenu, setOpenBenefitsMenu] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const sidebarStyle = useSpring({
    width: expanded ? 250 : 60,
    config: { tension: 220, friction: 20 },
  });

  const initials = (user?.fullName || user?.email || "HR")
    .split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

useEffect(() => {
  localStorage.setItem("hrSidebarExpanded", JSON.stringify(expanded));
}, [expanded]);

  return (
    <animated.div
      className="sidebar"
      style={sidebarStyle}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >

      <div className="sidebar-header">
        <div className="avatar-container">
          <div className="avatar-initials">{initials}</div>
          {expanded && (
            <div className="avatar-info">
              <h4>{user?.fullName || user?.email || "Người dùng"}</h4>
              <p>{user?.role === "HR" ? "Human Resource" : user?.role}</p>
            </div>
          )}
        </div>
      </div>

      <ul className="sidebar-menu">
        <li><Link to="/hr/dashboard"><FaHome /> {expanded && <span>Trang chủ</span>}</Link></li>
        <li onClick={() => setOpenProfileMenu(!openProfileMenu)} className="menu-item">
          <FaUser /> {expanded && <span>Hồ sơ & Tiếp nhận</span>}
        </li>
        {expanded && openProfileMenu && (
          <ul className="submenu">
            <li><Link to="/hr/manage-interns">Quản lý hồ sơ</Link></li>
            <li><Link to="/hr/approve-interns">Phê duyệt hồ sơ</Link></li>
          </ul>
        )}
        <li onClick={() => setOpenProgramMenu(!openProgramMenu)} className="menu-item">
          <FaChalkboardTeacher /> {expanded && <span>Chương trình & Mentor</span>}
        </li>
        {expanded && openProgramMenu && (
          <ul className="submenu">
            <li><Link to="/hr/program">Quản lý chương trình thực tập</Link></li>
            <li><Link to="/hr/mentor-assigns">Phân công mentor</Link></li>
          </ul>
        )}
        <li><FaTasks /> {expanded && <span>Công việc & Đánh giá</span>}</li>
        <li><FaClock /> {expanded && <span>Chấm công & Thời gian</span>}</li>
        <li onClick={() => setOpenBenefitsMenu(!openBenefitsMenu)} className="menu-item">
          <FaLifeRing /> {expanded && <span>Hỗ trợ & Quyền lợi</span>}
        </li>
        {expanded && openBenefitsMenu && (
          <ul className="submenu">
            <li><Link to="/hr/allowances">Quản lý trợ cấp</Link></li>
            <li><Link to="/hr/contracts">Quản lý hợp đồng</Link></li>
          </ul>
        )}
        <li><FaChartBar /> {expanded && <span>Báo cáo & Phân tích</span>}</li>
        <li onClick={() => navigate("/Admin/InternProfile")}>
          <FaRegUser /> {expanded && <span>Tìm kiếm profile intern</span>}
        </li>
      </ul>

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

export default HRSidebar;
