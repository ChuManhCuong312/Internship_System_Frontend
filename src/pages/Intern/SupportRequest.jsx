import React, { useContext, useState } from 'react';
import InternSidebar from '../../components/Layout/InternSidebar';
import '../../styles/dashBoard.css';
import { AuthContext } from '../../context/AuthContext';
import Cookies from 'js-cookie';
import { createSupportRequest } from '../../api/supportApi';
import { useNavigate } from 'react-router-dom';

const SupportRequest = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('TECHNICAL');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const getInternId = () => {
    const cookieInternId = Cookies.get('internId');
    if (cookieInternId) return parseInt(cookieInternId);
    if (user?.internId) return user.internId;
    return null;
  };

  const handleSubmit = async () => {
    const internId = getInternId();
    if (!token || !internId) {
      alert('Không thể xác thực người dùng');
      return;
    }
    if (!title.trim() || !description.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và mô tả');
      return;
    }

    setLoading(true);
    try {
      await createSupportRequest(token, internId, {
        supportType: type,
        title,
        description,
      });
      alert('Gửi yêu cầu hỗ trợ thành công');
      navigate('/intern/my-support');
    } catch (err) {
      alert(err?.message || 'Không thể gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

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
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  placeholder="Ví dụ: Vấn đề tài khoản"
                />
              </label>
              <label>
                Loại yêu cầu
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                >
                  <option value="TECHNICAL">Kỹ thuật</option>
                  <option value="HR">Nhân sự</option>
                  <option value="ADMINISTRATIVE">Hành chính</option>
                  <option value="OTHER">Khác</option>
                </select>
              </label>
              <label>
                Mô tả
                <textarea
                  rows="5"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  placeholder="Mô tả chi tiết vấn đề..."
                />
              </label>
              <div>
                <button className="checkin-btn" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
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
