import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSpring, animated } from "@react-spring/web";
import {
  FaHome, FaUser, FaChalkboardTeacher, FaTasks, FaClock,
  FaLifeRing, FaChartBar, FaSignOutAlt, FaBars, FaRegUser, FaMoneyBillWave
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/sideBar.css";
import Swal from "sweetalert2";

const HRSidebar = () => {
  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem("hrSidebarExpanded");
    return saved ? JSON.parse(saved) : false;
  });

  const [openProfileMenu, setOpenProfileMenu] = useState(() => {
    const saved = localStorage.getItem("hrProfileMenuOpen");
    return saved ? JSON.parse(saved) : false;
  });

  const [openProgramMenu, setOpenProgramMenu] = useState(() => {
    const saved = localStorage.getItem("hrProgramMenuOpen");
    return saved ? JSON.parse(saved) : false;
  });

  const [openBenefitsMenu, setOpenBenefitsMenu] = useState(() => {
    const saved = localStorage.getItem("hrBenefitsMenuOpen");
    return saved ? JSON.parse(saved) : false;
  });

  const [openTaskMenu, setOpenTaskMenu] = useState(() => {
    const saved = localStorage.getItem("hrTaskMenuOpen");
    return saved ? JSON.parse(saved) : false;
  });

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarStyle = useSpring({
    width: expanded ? 250 : 60,
    config: { tension: 220, friction: 20 },
  });

  const AnimatedDiv = animated.div;

  const initials = (user?.fullName || user?.email || "HR")
    .split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    localStorage.setItem("hrSidebarExpanded", JSON.stringify(expanded));
  }, [expanded]);

  useEffect(() => {
    localStorage.setItem("hrProfileMenuOpen", JSON.stringify(openProfileMenu));
  }, [openProfileMenu]);

  useEffect(() => {
    localStorage.setItem("hrProgramMenuOpen", JSON.stringify(openProgramMenu));
  }, [openProgramMenu]);

  useEffect(() => {
    localStorage.setItem("hrBenefitsMenuOpen", JSON.stringify(openBenefitsMenu));
  }, [openBenefitsMenu]);

  useEffect(() => {
    localStorage.setItem("hrTaskMenuOpen", JSON.stringify(openTaskMenu));
  }, [openTaskMenu]);

  useEffect(() => {
    const path = location.pathname;

    if (path.includes('/hr/manage-interns') || path.includes('/hr/approve-interns')) {
      setOpenProfileMenu(true);
    }

    if (path.includes('/hr/program') || path.includes('/hr/mentor-assigns')) {
      setOpenProgramMenu(true);
    }

    if (path.includes('/hr/attendance') || path.includes('/hr/leave-requests')) {
      setOpenTaskMenu(true);
    }

    if (path.includes('/hr/allowances') || path.includes('/hr/contracts')) {
      setOpenBenefitsMenu(true);
    }
  }, [location.pathname]);

  const handleProfileMenuToggle = () => {
    setOpenProfileMenu(!openProfileMenu);
  };

  const handleProgramMenuToggle = () => {
    setOpenProgramMenu(!openProgramMenu);
  };

  const handleBenefitsMenuToggle = () => {
    setOpenBenefitsMenu(!openBenefitsMenu);
  };

  const handleTaskMenuToggle = () => {
    setOpenTaskMenu(!openTaskMenu);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isParentActive = (paths) => {
    return paths.some(path => location.pathname.includes(path));
  };

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
    <AnimatedDiv
      className={`sidebar ${expanded ? "expanded" : "collapsed"}`}
      style={sidebarStyle}
    >
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={() => setExpanded(!expanded)}>
          <FaBars />
        </button>
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
        <li className={isActive('/hr/dashboard') ? 'active' : ''}>
          <Link to="/hr/dashboard">
            <FaHome /> {expanded && <span>Trang chủ</span>}
          </Link>
        </li>

        <li
          onClick={handleProfileMenuToggle}
          className={`menu-item ${isParentActive(['/hr/manage-interns', '/hr/approve-interns']) ? 'active' : ''}`}
        >
          <FaUser />
          {expanded && <span>Hồ sơ & Tiếp nhận</span>}
        </li>
        {expanded && openProfileMenu && (
          <ul className="submenu">
            <li className={isActive('/hr/manage-interns') ? 'active' : ''}>
              <Link to="/hr/manage-interns">Quản lý hồ sơ</Link>
            </li>
            <li className={isActive('/hr/approve-interns') ? 'active' : ''}>
              <Link to="/hr/approve-interns">Phê duyệt hồ sơ</Link>
            </li>
          </ul>
        )}

        <li
          onClick={handleProgramMenuToggle}
          className={`menu-item ${isParentActive(['/hr/program', '/hr/mentor-assigns']) ? 'active' : ''}`}
        >
          <FaChalkboardTeacher /> {expanded && <span>Chương trình & Mentor</span>}
        </li>
        {expanded && openProgramMenu && (
          <ul className="submenu">
            <li className={isActive('/hr/program') ? 'active' : ''}>
              <Link to="/hr/program">Quản lý chương trình</Link>
            </li>
            <li className={isActive('/hr/mentor-assigns') ? 'active' : ''}>
              <Link to="/hr/mentor-assigns">Phân công mentor</Link>
            </li>
          </ul>
        )}

        <li
          onClick={handleTaskMenuToggle}
          className={`menu-item ${isParentActive(['/hr/attendance', '/hr/leave-requests']) ? 'active' : ''}`}
        >
          <FaTasks /> {expanded && <span>Chấm công & Nghỉ phép</span>}
        </li>
        {expanded && openTaskMenu && (
          <ul className="submenu">
            <li className={isActive('/hr/attendance') ? 'active' : ''}>
              <Link to="/hr/attendance">Quản lý chấm công</Link>
            </li>
            <li className={isActive('/hr/leave-requests') ? 'active' : ''}>
              <Link to="/hr/leave-requests">Quản lý đơn nghỉ phép</Link>
            </li>
          </ul>
        )}

        <li
          onClick={handleBenefitsMenuToggle}
          className={`menu-item ${isParentActive(['/hr/allowances', '/hr/contracts', '/hr/support-requests']) ? 'active' : ''}`}
        >
          <FaLifeRing /> {expanded && <span>Hỗ trợ & Quyền lợi</span>}
        </li>
        {expanded && openBenefitsMenu && (
          <ul className="submenu">
            <li className={isActive('/hr/allowances') ? 'active' : ''}>
              <Link to="/hr/allowances">Quản lý trợ cấp</Link>
            </li>
            <li className={isActive('/hr/contracts') ? 'active' : ''}>
              <Link to="/hr/contracts">Quản lý hợp đồng</Link>
            </li>
            <li className={isActive('/hr/support-requests') ? 'active' : ''}>
              <Link to="/hr/support-requests">Quản lý hỗ trợ</Link>
            </li>
          </ul>
        )}

        <li className={isActive('/hr/reports') ? 'active' : ''}>
          <Link to="/hr/reports">
            <FaChartBar /> {expanded && <span>Báo cáo & Phân tích</span>}
          </Link>
        </li>
        <li
          onClick={() => navigate("/Admin/InternProfile")}
          className={isActive('/Admin/InternProfile') ? 'active' : ''}
        >
          <FaRegUser /> {expanded && <span>Tìm kiếm profile intern</span>}
        </li>
      </ul>

      <div className="sidebar-footer">
        <button onClick={handleLogout}>
          <FaSignOutAlt /> {expanded && <span>Đăng xuất</span>}
        </button>
      </div>
    </AnimatedDiv>
  );
};

export default HRSidebar;
