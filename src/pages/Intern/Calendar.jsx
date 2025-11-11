import React from 'react';
import InternSidebar from '../../components/Layout/InternSidebar';
import '../../styles/dashBoard.css';

const Calendar = () => {
  return (
    <div className="dashboard-layout">
      <InternSidebar />
      <div className="dashboard-content">
        <div className="header-grid">
          <div className="card"><h4>Sự kiện tuần này</h4><p>--</p></div>
          <div className="card"><h4>Buổi training</h4><p>--</p></div>
          <div className="card"><h4>Deadline sắp tới</h4><p>--</p></div>
          <div className="card"><h4>Thông báo</h4><p>--</p></div>
        </div>

        <div className="main-grid">
          <div className="card col-span-2">
            <h4>Lịch</h4>
            <div style={{ height: 360, border: '1px dashed #cbd5e0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>
              Lịch tháng (placeholder)
            </div>
          </div>
          <div className="card">
            <h4>Sắp diễn ra</h4>
            <ul style={{ margin: 0, paddingLeft: 16, color: '#4a5568' }}>
              <li>Chưa có sự kiện</li>
            </ul>
          </div>
        </div>

        <div className="bottom-grid">
          <div className="card col-span-2">
            <h4>Lịch trình chi tiết</h4>
            <table className="task-table">
              <thead>
                <tr><th>Thời gian</th><th>Sự kiện</th><th>Người phụ trách</th><th>Ghi chú</th></tr>
              </thead>
              <tbody>
                <tr><td colSpan="4" style={{ textAlign: 'center', color: '#718096' }}>Chưa có dữ liệu</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;

