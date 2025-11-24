import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import InternSidebar from '../../components/Layout/InternSidebar';
import notificationApi from '../../api/notificationApi';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import '../../styles/notifications.css';

const Notifications = () => {
  const { token, user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [internId, setInternId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // Fetch notifications
  useEffect(() => {
    if (!token || !internId) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationApi.getInternNotifications(token, internId);
        
        if (Array.isArray(response)) {
          setNotifications(response);
          const unread = response.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        } else if (response.content) {
          setNotifications(response.content);
          const unread = response.content.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        toast.error('Không thể tải thông báo');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token, internId]);

  const getNotificationIcon = (type) => {
    const icons = {
      'ALLOWANCE': '💰',
      'TASK': '📋',
      'ATTENDANCE': '📍',
      'LEAVE': '🏖️',
      'SYSTEM': '⚙️',
      'OTHER': '📢'
    };
    return icons[type] || '📢';
  };

  const getNotificationColor = (type) => {
    const colors = {
      'ALLOWANCE': '#10b981',
      'TASK': '#3b82f6',
      'ATTENDANCE': '#f59e0b',
      'LEAVE': '#8b5cf6',
      'SYSTEM': '#6b7280',
      'OTHER': '#667eea'
    };
    return colors[type] || '#667eea';
  };

  if (loading) {
    return (
      <div className="notification-layout">
        <InternSidebar />
        <div className="notification-content">
          <div className="loading-state">Đang tải thông báo...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-layout">
      <InternSidebar />
      <div className="notification-content">
        {/* Header */}
        <div className="notification-header">
          <div className="header-title">
            <h2>Thông báo</h2>
            
          </div>
        
        </div>

        {/* Notifications List */}
        <div className="notifications-container">
          {notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div 
                  key={notification.notificationId} 
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                >
                  <div className="notification-icon">
                    <span style={{ fontSize: '24px' }}>
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  
                  <div className="notification-content-main">
                    <div className="notification-title">
                      <h4>{notification.title}</h4>
                      <span className="notification-type" style={{ 
                        backgroundColor: getNotificationColor(notification.type) 
                      }}>
                        {notification.type}
                      </span>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>Không có thông báo</h3>
              <p>Bạn không có thông báo nào. Quay lại sau!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
