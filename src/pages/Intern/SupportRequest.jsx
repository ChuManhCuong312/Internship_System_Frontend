import React from 'react';
import InternSidebar from '../../components/Layout/InternSidebar';
import '../../styles/dashBoard.css';

const SupportRequest = () => {
  return (
    <div className="dashboard-layout">
      <InternSidebar />
      <div className="dashboard-content">
        <div className="header-grid">
          <div className="card"><h4>Yêu cầu đang chờ</h4><p>--</p></div>
          <div className="card"><h4>Đã xử lý</h4><p>--</p></div>
          <div className="card"><h4>Trung bình phản hồi</h4><p>-- giờ</p></div>
          <div className="card"><h4>Kênh liên hệ</h4><p>Email/Chat</p></div>
        </div>

        <div className="main-grid">
          <div className="card col-span-2">
            <h4>Tạo yêu cầu hỗ trợ</h4>
            <div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
              <label>
                Chủ đề
                <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} placeholder="Ví dụ: Vấn đề tài khoản" />
              </label>
              <label>
                Mức độ ưu tiên
                <select style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <option>Thấp</option>
                  <option>Trung bình</option>
                  <option>Cao</option>
                </select>
              </label>
              <label>
                Mô tả
                <textarea rows="5" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} placeholder="Mô tả chi tiết vấn đề..." />
              </label>
              <div>
                <button className="checkin-btn">Gửi yêu cầu</button>
              </div>
            </div>
          </div>
        </div>

        <div className="bottom-grid">
          <div className="card col-span-2">
            <h4>Lịch sử yêu cầu hỗ trợ</h4>
            <table className="task-table">
              <thead>
                <tr><th>Ngày</th><th>Chủ đề</th><th>Ưu tiên</th><th>Trạng thái</th></tr>
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

export default SupportRequest;