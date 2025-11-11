import React from 'react';
import InternSidebar from '../../components/Layout/InternSidebar';
import '../../styles/dashBoard.css';

const MyTasks = () => {
  return (
    <div className="dashboard-layout">
      <InternSidebar />
      <div className="dashboard-content">
        <div className="header-grid">
          <div className="card"><h4>Đang làm</h4><p>--</p></div>
          <div className="card"><h4>Chưa làm</h4><p>--</p></div>
          <div className="card"><h4>Đã xong</h4><p>--</p></div>
          <div className="card"><h4>Báo cáo tuần</h4><p>--</p></div>
        </div>

        <div className="main-grid">
          <div className="card col-span-2">
            <h4>Danh sách nhiệm vụ</h4>
            <table className="task-table">
              <thead>
                <tr><th>Nhiệm vụ</th><th>Trạng thái</th><th>Deadline</th><th>Hành động</th></tr>
              </thead>
              <tbody>
                <tr><td colSpan="4" style={{ textAlign: 'center', color: '#718096' }}>Chưa có dữ liệu</td></tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <h4>Báo cáo</h4>
            <p>Tạo báo cáo ngày/tuần</p>
            <button className="checkin-btn">Tạo báo cáo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasks;