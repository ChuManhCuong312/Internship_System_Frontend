import React, { useState, useContext, useMemo, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useNavigate, useLocation, Link } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import {
  FaHome, FaUser, FaCalendarAlt, FaClock, FaTasks,
  FaLifeRing, FaBell, FaRobot, FaSignOutAlt, FaBars,
  FaPage4,
  FaPager,
  FaBook,
  FaClipboardList
} from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { getInternByUserId } from '../../api/internApi';
import notificationApi from '../../api/notificationApi';
import '../../styles/sideBar.css';

const InternSidebar = () => {
  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem('internSidebarExpanded');
    return saved ? JSON.parse(saved) : false;
  });
 const [attendanceSubmenuOpen, setAttendanceSubmenuOpen] = useState(() => {
   const saved = localStorage.getItem('attendanceSubmenuOpen');
   return saved ? JSON.parse(saved) : false;
 });
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout, loading: authLoading } = useContext(AuthContext);
  const { unreadCount, setUnreadCount } = useContext(NotificationContext);
  const [internData, setInternData] = useState(null);
  const [internId, setInternId] = useState(null);

  // Save expanded state to localStorage
  useEffect(() => {
    localStorage.setItem('internSidebarExpanded', JSON.stringify(expanded));
  }, [expanded]);

  useEffect(() => {
    localStorage.setItem('attendanceSubmenuOpen', JSON.stringify(attendanceSubmenuOpen));
  }, [attendanceSubmenuOpen]);

  // Get internId from cookie
  useEffect(() => {
    try {
      const cookieInternId = Cookies.get('internId');
      if (cookieInternId) {
        setInternId(parseInt(cookieInternId));
      } else if (user?.internId) {
        setInternId(user.internId);
      }
    } catch (err) {
      console.error('Error getting intern ID:', err);
    }
  }, [user]);

  // Fetch unread notifications count
  useEffect(() => {
    if (!token || !internId) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await notificationApi.getUnreadNotifications(token, internId);
        if (Array.isArray(response)) {
          setUnreadCount(response.length);
        } else if (response.content) {
          setUnreadCount(response.content.length);
        }
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token, internId]);

  // Fetch intern data to get avatar
  useEffect(() => {
    if (authLoading || !token || !user) return;

    const fetchInternData = async () => {
      try {
        // Get userId from user object or localStorage
        let userId = user?.userId;
        if (!userId) {
          const storedUserId = localStorage.getItem("userId");
          if (storedUserId) {
            userId = parseInt(storedUserId);
          } else {
            // Try to extract from token
            try {
              const payload = jwtDecode(token);
              userId = payload.userId || payload.id;
            } catch (err) {
              console.error("Failed to decode token:", err);
            }
          }
        }

        if (userId && !isNaN(userId)) {
          const response = await getInternByUserId(token, userId);
          if (response) {
            // Handle new response structure: { internProfile: {...}, phone: "..." }
            const data = response.internProfile || response;
            setInternData({
              avatar: data.avatar || data.avatarUrl || data.avatar_url || '',
              fullName: data.fullName || data.full_name || user?.fullName || ''
            });
          }
        }
      } catch (err) {
        // Silently fail - avatar is optional
        console.log("Could not fetch intern data for avatar:", err.message);
      }
    };

    fetchInternData();
  }, [token, user?.userId, authLoading]);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/intern/attendance') || path.includes('/intern/leave-request')) {
      setAttendanceSubmenuOpen(true);
    }
  }, [location.pathname]);

  // Animation cho width
  const sidebarStyle = useSpring({
    width: expanded ? 250 : 60,
    config: { tension: 220, friction: 20 }
  });

  // Get avatar from intern data or fallback to user avatar
  const avatar = internData?.avatar || user?.avatar || '';

  // Generate initials from fullName or email
  const initials = useMemo(() => {
    const source = internData?.fullName || user?.fullName || user?.email || '';
    const parts = source.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
  }, [internData?.fullName, user?.fullName, user?.email]);

  // Get role display name
  const roleDisplayName = useMemo(() => {
    const role = user?.role || 'INTERN';
    const roleMap = {
      'INTERN': 'Thực tập sinh',
    };
    return roleMap[role] || role;
  }, [user?.role]);

  // Handle logout
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

  const toggleAttendanceSubmenu = () => {
    setAttendanceSubmenuOpen(!attendanceSubmenuOpen);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const isAttendanceParentActive = () => {
    const path = location.pathname;
    return path.includes('/intern/attendance') || path.includes('/intern/leave-request');
  };

  return (
    <animated.div 
      className="sidebar" 
      style={sidebarStyle}
    >
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={() => setExpanded(!expanded)}>
          <FaBars />
        </button>
        <div className="avatar-container">
          {avatar ? (
            <img 
              src={avatar} 
              alt="avatar" 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                // Fallback to initials if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="avatar-initials" 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#4f46e5',
              color: 'white',
              display: avatar ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {initials}
          </div>
          {expanded && (
            <div className="avatar-info">
              <h4 style={{ color: 'white' }}>{internData?.fullName || user?.fullName || user?.email || 'Người dùng'}</h4>
              <p style={{ color: 'white' }}>{roleDisplayName}</p>
            </div>
          )}
        </div>
      </div>
      <ul className="sidebar-menu">

        <li
          onClick={() => navigate("/intern/dashboard")}
          className={isActiveRoute("/intern/dashboard") ? "active" : ""}
        >
          <FaHome /> {expanded && <span>Trang chủ</span>}
        </li>

        <li
          onClick={() => navigate("/intern/profiles")}
          className={isActiveRoute("/intern/profiles") ? "active" : ""}
        >
          <FaUser /> {expanded && <span>Hồ sơ cá nhân</span>}
        </li>

        <li
          onClick={() => navigate("/intern/contracts")}
          className={isActiveRoute("/intern/contracts") ? "active" : ""}
        >
          <FaBook /> {expanded && <span>Hợp đồng</span>}
        </li>

        <li
          onClick={() => navigate("/intern/calendar")}
          className={isActiveRoute("/intern/calendar") ? "active" : ""}
        >
          <FaCalendarAlt />
          {expanded && <span>Lịch</span>}
        </li>

        <li
          onClick={() => navigate("/intern/program")}
          className={isActiveRoute("/intern/program") ? "active" : ""}
        >
          <FaTasks />
          {expanded && <span>Chương trình</span>}
        </li>

        <li
          onClick={() => setAttendanceSubmenuOpen(!attendanceSubmenuOpen)}
          className={`menu-item ${isAttendanceParentActive() ? 'active' : ''}`}
        >
          <FaClock /> {expanded && <span>Chấm công & Nghỉ phép</span>}
        </li>
        {expanded && attendanceSubmenuOpen && (
          <ul className="submenu">
            <li className={isActiveRoute("/intern/attendance") ? "active" : ""}>
              <Link to="/intern/attendance">Chấm công</Link>
            </li>
            <li className={isActiveRoute("/intern/leave-request") ? "active" : ""}>
              <Link to="/intern/leave-request">Nghỉ phép</Link>
            </li>
          </ul>
        )}

        <li
          onClick={() => navigate("/intern/tasks")}
          className={isActiveRoute("/intern/tasks") ? "active" : ""}
        >
          <FaClipboardList /> {expanded && <span>Nhiệm vụ của tôi</span>}
        </li>

        <li
          onClick={() => navigate("/intern/allowance")}
          className={isActiveRoute("/intern/allowance") ? "active" : ""}
        >
          <FaLifeRing /> {expanded && <span>Quyền lợi & Phụ cấp</span>}
        </li>

        <li
          onClick={() => navigate("/intern/notifications")}
          style={{ position: 'relative' }}
          className={isActiveRoute("/intern/notifications") ? "active" : ""}
        >
          <FaBell /> 
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '10px',
              height: '10px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              display: 'inline-block'
            }}></span>
          )}
          {expanded && <span>Thông báo</span>}
        </li>

        <li
          onClick={() => navigate("/intern/support")}
          className={isActiveRoute("/intern/support") ? "active" : ""}
        >
          <FaRobot /> {expanded && <span>Hỗ trợ</span>}
        </li>
      </ul>
      {/* Footer */}
      <div className="sidebar-footer">
        <button onClick={handleLogout}>
          <FaSignOutAlt /> {expanded && <span>Đăng xuất</span>}
        </button>
      </div>
    </animated.div>
  );
};

export default InternSidebar;
