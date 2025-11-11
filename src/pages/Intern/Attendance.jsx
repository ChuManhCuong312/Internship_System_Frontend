import React from 'react';
import InternSidebar from '../../components/Layout/InternSidebar';
import '../../styles/dashBoard.css';

const Attendance = () => {
  return (
    <div className="dashboard-layout">
      <InternSidebar />
      <div className="dashboard-content">
        <div className="header-grid">
          <div className="card"><h4>Tổng giờ tháng</h4><p>--:--</p></div>
          <div className="card"><h4>Ngày đi làm</h4><p>-- ngày</p></div>
          <div className="card"><h4>Ngày nghỉ phép</h4><p>-- ngày</p></div>
          <div className="card"><h4>Trạng thái hôm nay</h4><p>Chưa check-in</p></div>
        </div>

        <div className="main-grid">
          <div className="card col-span-2">
            <h4>Chấm công hôm nay</h4>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="checkin-btn">Check-in</button>
              <button className="checkin-btn" disabled>Check-out</button>
            </div>
          </div>
          <div className="card">
            <h4>Nghỉ phép</h4>
            <p>Gửi yêu cầu nghỉ phép nhanh</p>
            <button className="checkin-btn">Tạo yêu cầu</button>
          </div>
        </div>

        <div className="bottom-grid">
          <div className="card col-span-2">
            <h4>Lịch sử chấm công</h4>
            <table className="task-table">
              <thead>
                <tr><th>Ngày</th><th>Check-in</th><th>Check-out</th><th>Ghi chú</th></tr>
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

export default Attendance;