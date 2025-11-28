import React, { useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaClipboardList,
  FaUserGraduate,
  FaRegCommentDots,
  FaChartBar,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import "../../styles/sideBar.css";

const MentorSidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarStyle = useSpring({
    width: expanded ? 250 : 60,
    height: "100vh",
    config: { tension: 220, friction: 20 },
  });

  return (
    <animated.div className="sidebar" style={sidebarStyle}>
      {/* Header */}
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={() => setExpanded(!expanded)}>
          <FaBars />
        </button>
        <div className="avatar-container">
          {expanded && (
            <div className="avatar-info">
              <h4>Mentor</h4>
              <p>Hướng dẫn thực tập</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <ul className="sidebar-menu">
        <li
          className={location.pathname === "/mentor/dashboard" ? "active" : ""}
          onClick={() => {
            console.log("Navigating to dashboard");
            navigate("/mentor/dashboard");
          }}
        >
          <FaHome /> {expanded && <span>Trang chủ</span>}
        </li>
        <li
          className={location.pathname === "/mentor/interns" ? "active" : ""}
          onClick={() => {
            console.log("Navigating to interns");
            navigate("/mentor/interns");
          }}
        >
          <FaUserGraduate /> {expanded && <span>Thực tập sinh</span>}
        </li>
        <li
          className={location.pathname === "/mentor/tasks" ? "active" : ""}
          onClick={() => {
            console.log("Navigating to tasks");
            navigate("/mentor/tasks");
          }}
        >
          <FaClipboardList /> {expanded && <span>Giao nhiệm vụ</span>}
        </li>
        <li
          className={location.pathname === "/mentor/feedback" ? "active" : ""}
          onClick={() => {
            console.log("Navigating to feedback");
            navigate("/mentor/feedback");
          }}
        >
          <FaRegCommentDots /> {expanded && <span>Phản hồi báo cáo</span>}
        </li>
        <li
          className={location.pathname === "/mentor/evaluations" ? "active" : ""}
          onClick={() => {
            console.log("Navigating to evaluations");
            navigate("/mentor/evaluations");
          }}
        >
          <FaChartBar /> {expanded && <span>Đánh giá cuối kỳ</span>}
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

export default MentorSidebar;
