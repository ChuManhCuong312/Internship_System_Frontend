import React, { useEffect, useState } from 'react';
import notificationApi from '../../api/notificationApi';
import '../../styles/latestNotificationsWidget.css';

const LatestNotificationsWidget = ({ token, internId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestNotifications = async () => {
      if (!token || !internId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await notificationApi.getInternNotifications(token, internId);
        
        let allNotifications = [];
        if (Array.isArray(response)) {
          allNotifications = response;
        } else if (response.content) {
          allNotifications = response.content;
        }

        // Sort by date (newest first) and get top 2
        const sorted = allNotifications
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || a.dateCreated || 0);
            const dateB = new Date(b.createdAt || b.dateCreated || 0);
            return dateB - dateA;
          })
          .slice(0, 2);

        setNotifications(sorted);
      } catch (err) {
        console.error('Error fetching latest notifications:', err);
        setError('Không thể tải thông báo');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestNotifications();
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="latest-notifications-widget">
      <div className="widget-header">
        <h4>🔔 Thông báo mới nhất</h4>
      </div>

      <div className="widget-content">
        {loading && (
          <div className="notification-item loading">
            <p>Đang tải...</p>
          </div>
        )}

        {error && !loading && (
          <div className="notification-item error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="notification-item empty">
            <p>Không có thông báo nào</p>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div className="notifications-list">
            {notifications.map((notif, index) => (
              <div key={notif.notificationId || index} className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}>
                <div className="notification-icon">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notif.title}</div>
                  <div className="notification-message">{notif.message}</div>
                  <div className="notification-time">{formatDate(notif.createdAt || notif.dateCreated)}</div>
                </div>
                {!notif.isRead && <div className="unread-badge"></div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="widget-footer">
        <a href="/intern/notifications" className="view-all-link">
          Xem tất cả →
        </a>
      </div>
    </div>
  );
};

export default LatestNotificationsWidget;
