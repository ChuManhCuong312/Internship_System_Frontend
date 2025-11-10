import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSpring, animated } from "@react-spring/web";
import { FaHome, FaUser, FaChalkboardTeacher, FaTasks, FaClock, FaLifeRing, FaChartBar, FaSignOutAlt, FaBars } from "react-icons/fa";
import avatar from "../../assets/avatar.png";
import "../../styles/sideBar.css";

const HRSidebar = () => {
  const [expanded, setExpanded] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(false);
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
        <li onClick={() => setOpenSubMenu(!openSubMenu)} style={{ cursor: "pointer" }}>
          <FaUser /> {expanded && <span>Hồ sơ & Tiếp nhận</span>}
        </li>
        {expanded && openSubMenu && (
          <ul className="submenu">
            <li><Link to="/hr/manage-interns">Quản lý hồ sơ</Link></li>
            <li><Link to="/hr/approve-docs">Phê duyệt và phản hổi</Link></li>
          </ul>
        )}

        <li><FaChalkboardTeacher /> {expanded && <span>Chương trình & Mentor</span>}</li>
        <li><FaTasks /> {expanded && <span>Công việc & Đánh giá</span>}</li>
        <li><FaClock /> {expanded && <span>Chấm công & Thời gian</span>}</li>
        <li><FaLifeRing /> {expanded && <span>Hỗ trợ & Quyền lợi</span>}</li>
        <li><FaChartBar /> {expanded && <span>Báo cáo & Phân tích</span>}</li>
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
