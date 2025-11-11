import React from 'react';
import InternSidebar from '../../components/Layout/InternSidebar';
import '../../styles/dashBoard.css';

const AllowanceRequest = () => {
  return (
    <div className="dashboard-layout">
      <InternSidebar />
      <div className="dashboard-content">
        <div className="header-grid">
          <div className="card"><h4>Phụ cấp tháng này</h4><p>-- VND</p></div>
          <div className="card"><h4>Đã giải ngân</h4><p>-- VND</p></div>
          <div className="card"><h4>Yêu cầu đang chờ</h4><p>--</p></div>
          <div className="card"><h4>Trạng thái</h4><p>--</p></div>
        </div>

        <div className="main-grid">
          <div className="card col-span-2">
            <h4>Tạo yêu cầu phụ cấp</h4>
            <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
              <label>
                Mục đích
                <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} placeholder="Ví dụ: Hỗ trợ đi lại" />
              </label>
              <label>
                Số tiền đề nghị
                <input type="number" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} placeholder="0" />
              </label>
              <label>
                Ghi chú
                <textarea rows="4" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} placeholder="Thông tin bổ sung..." />
              </label>
              <div>
                <button className="checkin-btn">Gửi yêu cầu</button>
              </div>
            </div>
          </div>

          <div className="card">
            <h4>Chính sách</h4>
            <p>Thông tin về chính sách phụ cấp sẽ hiển thị tại đây.</p>
          </div>
        </div>

        <div className="bottom-grid">
          <div className="card col-span-2">
            <h4>Lịch sử yêu cầu</h4>
            <table className="task-table">
              <thead>
                <tr><th>Ngày</th><th>Mục đích</th><th>Số tiền</th><th>Trạng thái</th></tr>
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

export default AllowanceRequest;