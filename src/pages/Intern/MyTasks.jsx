import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import InternSidebar from '../../components/Layout/InternSidebar';
import '../../styles/dashBoard.css';
import MyTasksTableUpgrade from '../../components/Tasks/MyTasksTableUpgrade';
import Cookies from 'js-cookie';

const MyTasks = () => {
  const { token, user } = useContext(AuthContext);
  const [stats, setStats] = useState({ inProgress: 0, todo: 0, done: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const internId = (() => {
    try {
      const cookieInternId = Cookies.get('internId');
      if (cookieInternId) return parseInt(cookieInternId);
      return user?.internId;
    } catch (e) {
      return user?.internId;
    }
  })();

  useEffect(() => {
    if (!internId || !token) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/tasks/intern/${internId}/statistics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data || { inProgress: 0, todo: 0, done: 0, total: 0 });
      } catch (err) {
        console.error('Failed to fetch task statistics:', err);
        setStats({ inProgress: 0, todo: 0, done: 0, total: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [internId, token]);

  return (
    <div className="dashboard-layout">
      <InternSidebar />
      <div className="dashboard-content">
        <div className="header-grid">
          <div className="card">
            <h4>Đang làm</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2b6cb0' }}>
              {loading ? '--' : stats.inProgress}
            </p>
          </div>
          <div className="card">
            <h4>Chưa làm</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
              {loading ? '--' : stats.todo}
            </p>
          </div>
          <div className="card">
            <h4>Đã xong</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              {loading ? '--' : stats.done}
            </p>
          </div>
          <div className="card">
            <h4>Tổng cộng</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#4b5563' }}>
              {loading ? '--' : stats.total}
            </p>
          </div>
        </div>

        <div className="main-grid">
          <div className="card col-span-2">
            <h4>Danh sách nhiệm vụ</h4>
            <MyTasksTableUpgrade />
          </div>

          <div className="card">
            <h4>Báo cáo</h4>
            <p>Tạo báo cáo ngày/tuần</p>
            <button className="checkin-btn" onClick={() => alert('Tính năng báo cáo sẽ được cập nhật')}>Tạo báo cáo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasks;