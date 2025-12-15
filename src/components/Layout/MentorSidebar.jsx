import React, { useState, useContext, useEffect } from "react";
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
import Swal from "sweetalert2";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/sideBar.css";

const MentorSidebar = () => {
  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem("mentorSidebarExpanded");
    return saved ? JSON.parse(saved) : false;
  });

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarStyle = useSpring({
    width: expanded ? 250 : 60,
    height: "100vh",
    config: { tension: 220, friction: 20 },
  });

  const initials = (user?.fullName || user?.email || "Mentor")
    .split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    localStorage.setItem("mentorSidebarExpanded", JSON.stringify(expanded));
  }, [expanded]);

  const handleLogout = () => {
    Swal.fire({
      title: 'Đăng xuất',
      text: 'Bạn có chắc chắn muốn đăng xuất?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Có, đăng xuất',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login");
      }
    });
  };

  return (
    <animated.div
      className={`sidebar ${expanded ? "expanded" : "collapsed"}`}
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
              <h4>{user?.fullName || user?.email || "Mentor"}</h4>
              <p>{user?.role === "MENTOR" ? "Mentor" : user?.role}</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <ul className="sidebar-menu">
        <li
          className={location.pathname === "/mentor/dashboard" ? "active" : ""}
          onClick={() => navigate("/mentor/dashboard")}
        >
          <FaHome /> {expanded && <span>Trang chủ</span>}
        </li>
        <li
          className={location.pathname === "/mentor/interns" ? "active" : ""}
          onClick={() => navigate("/mentor/interns")}
        >
          <FaUserGraduate /> {expanded && <span>Thực tập sinh</span>}
        </li>
        <li
          className={location.pathname === "/mentor/tasks" ? "active" : ""}
          onClick={() => navigate("/mentor/tasks")}
        >
          <FaClipboardList /> {expanded && <span>Giao nhiệm vụ</span>}
        </li>
        <li
          className={location.pathname === "/mentor/evaluations" ? "active" : ""}
          onClick={() => navigate("/mentor/evaluations")}
        >
          <FaChartBar /> {expanded && <span>Đánh giá thực tập sinh</span>}
        </li>
      </ul>

      {/* Footer */}
      <div className="sidebar-footer">
        <button onClick={() => {
          handleLogout();
          navigate("/login");
        }}>
          <FaSignOutAlt /> {expanded && <span>Đăng xuất</span>}
        </button>
      </div>
    </animated.div>
  );
};

export default MentorSidebar;
