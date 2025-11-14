import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSpring, animated } from "@react-spring/web";
import { FaHome, FaUser, FaChalkboardTeacher, FaTasks, FaClock, FaLifeRing, FaChartBar, FaSignOutAlt, FaBars, FaRegUser } from "react-icons/fa";
import avatar from "../../assets/avatar.png";
import "../../styles/sideBar.css";

const HRSidebar = () => {
  const [expanded, setExpanded] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [openProgramMenu, setOpenProgramMenu] = useState(false);

  const navigate = useNavigate();
  const sidebarStyle = useSpring({
    width: expanded ? 250 : 60,
    config: { tension: 220, friction: 20 },
  });

  return (
    <animated.div className="sidebar" style={sidebarStyle}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={() => setExpanded(!expanded)}>
          <FaBars />
        </button>
        <div className="avatar-container">
          <img src={avatar} alt="avatar" />
          {expanded && (
            <div className="avatar-info">
              <h4>Andrew Smith</h4>
              <p>Human Resource</p>
            </div>
          )}
        </div>
      </div>

      <ul className="sidebar-menu">
        <li>
          <Link to="/hr/dashboard"><FaHome /> {expanded && <span>Trang chủ</span>}</Link>
        </li>

        {/* Hồ sơ & Tiếp nhận */}
        <li onClick={() => setOpenProfileMenu(!openProfileMenu)} style={{ cursor: "pointer" }}>
          <FaUser /> {expanded && <span>Hồ sơ & Tiếp nhận</span>}
        </li>
        {expanded && openProfileMenu && (
          <ul className="submenu">
            <li><Link to="/hr/manage-interns">Quản lý hồ sơ</Link></li>
          </ul>
        )}

        <li onClick={() => setOpenProgramMenu(!openProgramMenu)} style={{ cursor: "pointer" }}>
            <FaChalkboardTeacher /> {expanded && <span>Chương trình & Mentor</span>}</li>
        {expanded && openProgramMenu && (
                  <ul className="submenu">
                    <li><Link to="#">Quản lý chương trình thực tập</Link></li>
                    <li><Link to="/hr/mentor-assigns">Phân công mentor</Link></li>
                  </ul>
                )}

        <li><FaTasks /> {expanded && <span>Công việc & Đánh giá</span>}</li>
        <li><FaClock /> {expanded && <span>Chấm công & Thời gian</span>}</li>
        <li><FaLifeRing /> {expanded && <span>Hỗ trợ & Quyền lợi</span>}</li>
        <li><FaChartBar /> {expanded && <span>Báo cáo & Phân tích</span>}</li>
        <li onClick={() => navigate("/Admin/InternProfile")}>
          <FaRegUser /> {expanded && <span>Tìm kiếm profile intern</span>}
        </li>

      </ul>

      <div className="sidebar-footer">
        <button onClick={() => navigate("/login")}>
          <FaSignOutAlt /> {expanded && <span>Đăng xuất</span>}
        </button>
      </div>
    </animated.div>
  );
};

export default HRSidebar;
