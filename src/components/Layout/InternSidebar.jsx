import React, { useState, useContext, useMemo, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import {
  FaHome, FaUser, FaCalendarAlt, FaClock, FaTasks,
  FaLifeRing, FaBell, FaRobot, FaSignOutAlt, FaBars
} from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { getInternByUserId } from '../../api/internApi';
import '../../styles/sideBar.css';

const InternSidebar = () => {
  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebarExpanded');
    return saved ? JSON.parse(saved) : false;
  });
  const navigate = useNavigate();
  const { user, token, logout, loading: authLoading } = useContext(AuthContext);
  const [internData, setInternData] = useState(null);

  // Save expanded state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarExpanded', JSON.stringify(expanded));
  }, [expanded]);

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
    logout();
    navigate("/login");
  };

  return (
    <animated.div 
      className="sidebar" 
      style={sidebarStyle}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="sidebar-header">
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

        <li onClick={() => navigate("/intern/dashboard")}><FaHome /> {expanded && <span>Trang chủ</span>}</li>

        <li onClick={() => navigate("/intern/profiles")}>
          <FaUser /> {expanded && <span>Hồ sơ cá nhân</span>}</li>
        <li onClick={() => navigate("/intern/calendar")}><FaCalendarAlt /> {expanded && <span>Lịch & Chương trình</span>}</li>
        <li onClick={() => navigate("/intern/attendance")}><FaClock /> {expanded && <span>Chấm công & Nghỉ phép</span>}</li>
        <li onClick={() => navigate("/intern/tasks")}><FaTasks /> {expanded && <span>Nhiệm vụ & Báo cáo</span>}</li>
        <li onClick={() => navigate("/intern/allowance")}><FaLifeRing /> {expanded && <span>Quyền lợi & Phụ cấp</span>}</li>
        <li><FaBell /> {expanded && <span>Thông báo</span>}</li>
        <li onClick={() => navigate("/intern/support")}><FaRobot /> {expanded && <span>Hỗ trợ</span>}</li>
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