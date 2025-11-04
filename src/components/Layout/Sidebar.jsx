import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import {
  FaHome, FaUser, FaCalendarAlt, FaClock, FaTasks,
  FaLifeRing, FaBell, FaRobot, FaSignOutAlt, FaBars
} from 'react-icons/fa';
import avatar from "../../assets/avatar.png";
import '../../styles/sideBar.css';

const Sidebar = () => {
  const [expanded, setExpanded] = useState(false);

  // Animation cho width
  const sidebarStyle = useSpring({
    width: expanded ? 250 : 60,
    config: { tension: 220, friction: 20 }
  });

  return (
    <animated.div
      className="sidebar"
      style={sidebarStyle}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={() => setExpanded(!expanded)}>
          <FaBars />
        </button>
        <div className="avatar-container">
          <img src={avatar} alt="avatar" />
          {expanded && (
            <div className="avatar-info">
              <h4>Andrew Smith</h4>
              <p>Product Designer</p>
            </div>
          )}
        </div>
      </div>
      <ul className="sidebar-menu">
        <li><FaHome /> {expanded && <span>Trang chủ</span>}</li>
        <li><FaUser /> {expanded && <span>Hồ sơ cá nhân</span>}</li>
        <li><FaCalendarAlt /> {expanded && <span>Lịch & Chương trình</span>}</li>
        <li><FaClock /> {expanded && <span>Chấm công & Nghỉ phép</span>}</li>
        <li><FaTasks /> {expanded && <span>Nhiệm vụ & Báo cáo</span>}</li>
        <li><FaLifeRing /> {expanded && <span>Quyền lợi & Hỗ trợ</span>}</li>
        <li><FaBell /> {expanded && <span>Thông báo</span>}</li>
        <li><FaRobot /> {expanded && <span>Chatbot</span>}</li>
      </ul>
      <div className="sidebar-footer">
        <button><FaSignOutAlt /> {expanded && <span>Đăng xuất</span>}</button>
      </div>
    </animated.div>
  );
};

export default Sidebar;