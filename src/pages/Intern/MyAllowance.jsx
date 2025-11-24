import React, { useEffect, useState, useContext } from 'react';
import InternSidebar from '../../components/Layout/InternSidebar';
import { AuthContext } from '../../context/AuthContext';
import allowanceApi from '../../api/allowanceApi';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import '../../styles/myAllowance.css';

const MyAllowance = () => {
  const { token, user } = useContext(AuthContext);
  const [allowances, setAllowances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [internId, setInternId] = useState(null);
  const [sortBy, setSortBy] = useState("dateApplied");
  const [direction, setDirection] = useState("desc");

  // Get internId from cookie or user context
  useEffect(() => {
    try {
      // Try to get internId from cookie first
      const cookieInternId = Cookies.get('internId');
      if (cookieInternId) {
        setInternId(parseInt(cookieInternId));
        return;
      }

      // Fallback to user context
      if (user?.internId) {
        setInternId(user.internId);
        return;
      }

      // If no internId found, set loading to false
      setLoading(false);
    } catch (err) {
      console.error('Error getting intern ID:', err);
      setLoading(false);
    }
  }, [user]);

  // Fetch allowances for current intern
  const fetchAllowances = async () => {
    try {
      if (!token || !internId) {
        setAllowances([]);
        setLoading(false);
        return;
      }

      const response = await allowanceApi.getAllowancesByInternId(
        token,
        internId,
        page,
        size,
        sortBy,
        direction
      );

      // Handle both array and paginated responses
      if (Array.isArray(response)) {
        setAllowances(response);
        setTotalElements(response.length);
        setTotalPages(1);
      } else if (response.content) {
        setAllowances(response.content);
        setTotalElements(response.totalElements || 0);
        setTotalPages(response.totalPages || 1);
      } else {
        setAllowances([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching allowances:', err);
      toast.error('Không thể tải danh sách trợ cấp');
      setAllowances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAllowances();
  }, [token, internId, page, size, sortBy, direction]);

  // Calculate statistics
  const totalAmount = allowances.reduce((sum, a) => sum + (a.amount || 0), 0);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthlyAllowance = allowances.filter(a => {
    const date = new Date(a.dateApplied);
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
  }).reduce((sum, a) => sum + (a.amount || 0), 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getTypeColor = (type) => {
    const colors = {
      'MONTHLY': '#667eea',
      'BONUS': '#48bb78',
      'SPECIAL': '#ed8936',
      'OTHER': '#718096'
    };
    return colors[type] || '#667eea';
  };

  const getTypeBadge = (type) => {
    const badges = {
      'MONTHLY': 'Hàng tháng',
      'BONUS': 'Thưởng',
      'SPECIAL': 'Đặc biệt',
      'OTHER': 'Khác'
    };
    return badges[type] || type;
  };

  if (loading) {
    return (
      <div className="allowance-layout">
        <InternSidebar />
        <div className="allowance-content">
          <div className="loading-state">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="allowance-layout">
      <InternSidebar />
      <div className="allowance-content">
        {/* Header */}
        <div className="allowance-header">
          <div className="header-title">
            <h2>Trợ cấp của tôi</h2>
            <p>Danh sách tất cả các trợ cấp bạn đã nhận</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">Tháng này</span>
              <span className="stat-value">{formatCurrency(monthlyAllowance)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tổng cộng</span>
              <span className="stat-value">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Số lần</span>
              <span className="stat-value">{allowances.length}</span>
            </div>
          </div>
        </div>

        {/* Allowance List */}
        <div className="allowance-container">
          {allowances.length > 0 ? (
            <>
              <div className="allowance-list">
                {allowances.map((allowance) => (
                  <div key={allowance.allowanceId} className="allowance-card">
                    <div className="card-header">
                      <div className="card-title">
                        <span 
                          className="type-badge" 
                          style={{ backgroundColor: getTypeColor(allowance.type) }}
                        >
                          {getTypeBadge(allowance.type)}
                        </span>
                        <span className="date">
                          {new Date(allowance.dateApplied).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="card-amount">
                        {formatCurrency(allowance.amount)}
                      </div>
                    </div>
                    {allowance.note && (
                      <div className="card-note">
                        <p>{allowance.note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                  >
                    ← Trước
                  </button>
                  <span className="pagination-info">
                    Trang {page + 1} / {totalPages}
                  </span>
                  <select
                    value={size}
                    onChange={(e) => {
                      setSize(parseInt(e.target.value));
                      setPage(0);
                    }}
                    className="pagination-select"
                  >
                    <option value={5}>5 bản ghi</option>
                    <option value={10}>10 bản ghi</option>
                    <option value={20}>20 bản ghi</option>
                  </select>
                  <button
                    className="pagination-btn"
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Tiếp →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>Chưa có trợ cấp</h3>
              <p>Bạn chưa nhận được trợ cấp nào. Vui lòng liên hệ HR để biết thêm chi tiết.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAllowance;