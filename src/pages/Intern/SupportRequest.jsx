import React, { useContext, useEffect, useState } from 'react';
import InternSidebar from '../../components/Layout/InternSidebar';
import '../../styles/dashBoard.css';
import { AuthContext } from '../../context/AuthContext';
import { createSupportRequest, getMySupportRequests } from '../../api/supportApi';
import { toast } from 'react-toastify';

const SupportRequest = () => {
  const { user, token } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [supportType, setSupportType] = useState('OTHER');
  const [loading, setLoading] = useState(false);

  // Get internId from user context (assuming user object has internId or we need to look it up)
  // Based on AuthContext, user object might have internId directly or we might need to rely on what AuthProvider sets.
  // AuthContext sets user as { ...res, internId: ... } so it should be there.
  const internId = user?.internId;

  useEffect(() => {
    if (token && internId) {
      fetchRequests();
    }
  }, [token, internId]);

  const fetchRequests = async () => {
    try {
      const data = await getMySupportRequests(token, internId);
      // Ensure data is an array
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      toast.error('Không thể tải lịch sử yêu cầu.');
    }
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      toast.warning('Vui lòng điền đầy đủ tiêu đề và mô tả.');
      return;
    }

    if (!internId) {
      toast.error('Không tìm thấy thông tin thực tập sinh.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        supportType
      };
      await createSupportRequest(token, internId, payload);
      toast.success('Gửi yêu cầu thành công!');
      setTitle('');
      setDescription('');
      setSupportType('OTHER');
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error('Create request error:', error);
      toast.error('Gửi yêu cầu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'OPEN': return <span className="status-badge pending">Đang mở</span>;
      case 'IN_PROGRESS': return <span className="status-badge pending">Đang chờ</span>;
      case 'RESOLVED': return <span className="status-badge success">Đã xử lý</span>;
      case 'REJECTED': return <span className="status-badge error">Từ chối</span>;
      default: return status;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'TECHNICAL': return 'Kỹ thuật';
      case 'HR': return 'Nhân sự';
      case 'ADMINISTRATIVE': return 'Hành chính';
      case 'OTHER': return 'Khác';
      default: return type;
    }
  };

  // Stats for the header cards
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;

  return (
    <div className="dashboard-layout">
      <InternSidebar />
      <div className="dashboard-content">
        <div className="stats-row">
          {/* <div className="card"><h4>Yêu cầu đang chờ</h4><p>{pendingCount}</p></div>
          <div className="card"><h4>Đã xử lý</h4><p>{approvedCount}</p></div>
          <div className="card"><h4>Trung bình phản hồi</h4><p>-- giờ</p></div>
          <div className="card"><h4>Kênh liên hệ</h4><p>Email/Chat</p></div> */}
          <div className="stat-card">
            <div className="stat-icon intern">📋</div>
            <div>
              <h4>Yêu cầu đang chờ</h4>
              <p className="stat-value">{pendingCount}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon intern">📋</div>
            <div>
              <h4>Đã xử lý</h4>
              <p className="stat-value">{approvedCount}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon intern">📋</div>
            <div>
              <h4>Trung bình phản hồi</h4>
              <p className="stat-value">-- giờ</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon intern">📋</div>
            <div>
              <h4>Kênh liên hệ</h4>
              <p className="stat-value">Email/Chat</p>
            </div>
          </div>
        </div>

        <div className="">
          <div className="card col-span-2" style={{
            padding: "1.5rem",
            width: "100%"
          }}>
            <h4>Tạo yêu cầu hỗ trợ</h4>
            <div style={{ display: 'grid', gap: 12, marginTop: "1rem"}}>
              <label>
                Chủ đề
                <input
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  placeholder="Ví dụ: Vấn đề tài khoản"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label>
                Loại hỗ trợ
                <select
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  value={supportType}
                  onChange={(e) => setSupportType(e.target.value)}
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
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  placeholder="Mô tả chi tiết vấn đề..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
              <div>
                <button
                  className="checkin-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bottom-grid" style={{
          marginTop: "1.5rem"
        }}>
          <div className="card col-span-2" style={{
          padding: "1.5rem"
        }}>
            <h4>Lịch sử yêu cầu hỗ trợ</h4>
            <table className="task-table" style={{
              marginTop: "1rem"
            }}>
              <thead>
                <tr><th>Ngày</th><th>Chủ đề</th><th>Loại hỗ trợ</th><th>Trạng thái</th></tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: '#718096' }}>Chưa có dữ liệu</td></tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.supportId}>
                      <td>{req.requestDate ? new Date(req.requestDate).toLocaleDateString('vi-VN') : ''}</td>
                      <td>{req.title}</td>
                      <td>{getTypeLabel(req.supportType)}</td>
                      <td>{getStatusLabel(req.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportRequest;
