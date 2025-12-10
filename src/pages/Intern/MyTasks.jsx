import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import InternSidebar from '../../components/Layout/InternSidebar';
import '../../styles/dashBoard.css';
import MyTasksTableUpgrade from '../../components/Tasks/MyTasksTableUpgrade';
import '../../styles/taskTable.css';
import Cookies from 'js-cookie';

const MyTasks = () => {
  const { token, user } = useContext(AuthContext);
  const [stats, setStats] = useState({ inProgress: 0, todo: 0, done: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [openToStatus, setOpenToStatus] = useState(null);

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
          <div
            role="button"
            tabIndex={0}
            onClick={() => { setStatusFilter('IN_PROGRESS'); setOpenToStatus('IN_PROGRESS'); }}
            className="card"
            style={{ borderLeft: '4px solid #2b6cb0', padding: '12px', cursor: 'pointer', minHeight: '72px' }}>
            <h5 style={{ color: '#2b6cb0', margin: 0, marginBottom: '6px' }}>📋 Đang làm</h5>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#2b6cb0', margin: 0 }}>
              {loading ? '--' : stats.inProgress}
            </p>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => { setStatusFilter('TODO'); setOpenToStatus('TODO'); }}
            className="card"
            style={{ borderLeft: '4px solid #f59e0b', padding: '12px', cursor: 'pointer', minHeight: '72px' }}>
            <h5 style={{ color: '#f59e0b', margin: 0, marginBottom: '6px' }}>⏳ Chưa làm</h5>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b', margin: 0 }}>
              {loading ? '--' : stats.todo}
            </p>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => { setStatusFilter('DONE'); setOpenToStatus('DONE'); }}
            className="card"
            style={{ borderLeft: '4px solid #10b981', padding: '12px', cursor: 'pointer', minHeight: '72px' }}>
            <h5 style={{ color: '#10b981', margin: 0, marginBottom: '6px' }}>✅ Đã xong</h5>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#10b981', margin: 0 }}>
              {loading ? '--' : stats.done}
            </p>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => { setStatusFilter('ALL'); setOpenToStatus(null); }}
            className="card"
            style={{ borderLeft: '4px solid #4b5563', padding: '12px', cursor: 'pointer', minHeight: '72px' }}>
            <h5 style={{ color: '#4b5563', margin: 0, marginBottom: '6px' }}>📊 Tổng cộng</h5>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#4b5563', margin: 0 }}>
              {loading ? '--' : stats.total}
            </p>
          </div>
        </div>

        <div className="main-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="card col-span-2">
            <h4>Danh sách nhiệm vụ</h4>
            <MyTasksTableUpgrade statusFilter={statusFilter} openToStatus={openToStatus} onOpenedStatus={() => setOpenToStatus(null)} />
          </div>

          {/* <div className="card">
            <h4>Báo cáo</h4>
            <p>Tạo báo cáo ngày/tuần</p>
            <button className="checkin-btn" onClick={() => {
              const msg = 'Tính năng báo cáo sẽ được cập nhật';
              alert(msg); // Keep alert for now since no toast is available here
            }}>Tạo báo cáo</button>
          </div> */}
        </div>
      </div>
    </div>
  );
};
export default MyTasks;