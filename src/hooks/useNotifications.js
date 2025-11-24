import { useState, useEffect, useCallback } from 'react';
import notificationApi from '../api/notificationApi';
import { toast } from 'react-toastify';

export const useNotifications = (token, internId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!token || !internId) return;

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
    } finally {
      setLoading(false);
    }
  }, [token, internId]);

  // Fetch unread notifications
  const fetchUnreadCount = useCallback(async () => {
    if (!token || !internId) return;

    try {
      const response = await notificationApi.getUnreadNotifications(token, internId);
      
      if (Array.isArray(response)) {
        setUnreadCount(response.length);
        return response.length;
      } else if (response.content) {
        setUnreadCount(response.content.length);
        return response.content.length;
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [token, internId]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationApi.markNotificationAsRead(token, notificationId);
      
      setNotifications(notifications.map(n => 
        n.notificationId === notificationId ? { ...n, isRead: true } : n
      ));
      
      const unread = notifications.filter(n => !n.isRead).length;
      setUnreadCount(Math.max(0, unread - 1));
      
      toast.success('Đã đánh dấu là đã đọc');
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Lỗi khi cập nhật thông báo');
    }
  }, [token, notifications]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationApi.deleteNotification(token, notificationId);
      
      const deletedNotif = notifications.find(n => n.notificationId === notificationId);
      setNotifications(notifications.filter(n => n.notificationId !== notificationId));
      
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
      
      toast.success('Đã xóa thông báo');
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Lỗi khi xóa thông báo');
    }
  }, [token, notifications, unreadCount]);

  // Show toast for new notification
  const showNotificationToast = useCallback((notification) => {
    const getIcon = (type) => {
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

    toast.info(
      <div style={{ fontSize: '14px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
          {getIcon(notification.type)} {notification.title}
        </div>
        <div>{notification.message}</div>
      </div>,
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    deleteNotification,
    showNotificationToast,
  };
};
