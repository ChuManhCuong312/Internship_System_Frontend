import React, { useState, useEffect, useContext } from 'react';
import { getAllSupportRequests, filterSupportRequests, approveSupportRequest, rejectSupportRequest, handleRequestStatus } from '../../../api/supportApi';
import SupportDetailModal from '../../../components/SupportRequest/SupportDetailModal';
import HRSidebar from '../../../components/Layout/HRSidebar';
import { AuthContext } from '../../../context/AuthContext';
import '../../../styles/dashBoard.css';
import '../../../styles/supportRequest.css';
import '../../../styles/table.css';

const ManageSupportRequests = () => {
    const [supportRequests, setSupportRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [paging, setPaging] = useState(null);
    const [pageSize, setPageSize] = useState(10);

    // Filter states
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [keyword, setKeyword] = useState('');

    const { token, user } = useContext(AuthContext);
    const hrId = user?.userId;

    useEffect(() => {
        fetchSupportRequests();
    }, []);

    const fetchSupportRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!token) {
                setSupportRequests([]);
                setFilteredRequests([]);
                return;
            }
            const data = await getAllSupportRequests(token);
            setSupportRequests(data.data);
            setFilteredRequests(data.data);
            setPaging(data);
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách yêu cầu hỗ trợ');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = async (currentPage) => {
        setLoading(true);
        setError(null);
        try {
            const filters = {};
            if (filterStatus) filters.status = filterStatus;
            if (filterType) filters.type = filterType;
            if (keyword) filters.keyword = keyword;
            filters.page = currentPage;
            filters.size = pageSize;
            const data = await filterSupportRequests(token, filters);
            setSupportRequests(data.data);
            setFilteredRequests(data.data);
            setPaging(data);
        } catch (err) {
            setError(err.message || 'Lỗi khi lọc dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilter = () => {
        setFilterType('');
        setFilterStatus('');
        setFilterInternId('');
        setFilteredRequests(supportRequests);
    };

    const handleViewDetail = (request) => {
        setSelectedRequest(request);
        setShowDetailModal(true);
    };

    const handleApprove = async (id, response) => {
        try {
            await approveSupportRequest(token, id, hrId, response);
            fetchSupportRequests();
            setShowDetailModal(false);
            alert('Đã duyệt yêu cầu hỗ trợ thành công!');
        } catch (err) {
            alert(err.message || 'Lỗi khi duyệt yêu cầu');
        }
    };

    const handleReject = async (id, response) => {
        try {
            await rejectSupportRequest(token, id, hrId, response);
            fetchSupportRequests();
            setShowDetailModal(false);
            alert('Đã từ chối yêu cầu hỗ trợ!');
        } catch (err) {
            alert(err.message || 'Lỗi khi từ chối yêu cầu');
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await handleRequestStatus(token, id, hrId, status);
            fetchSupportRequests();
            setShowDetailModal(false);
            alert('Đã cật nhật trạng thái của yêu cầu!');
        } catch (err) {
            alert(err.message || 'Lỗi khi cật nhật trạng thái của yêu cầu');
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'PENDING': return 'status-pending';
            case 'APPROVED': return 'status-approved';
            case 'REJECTED': return 'status-rejected';
            case 'IN_PROGRESS': return 'status-pending';
            case 'RESOLVED': return 'status-approved';
            case 'REJECTED': return 'status-rejected';
            default: return '';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'OPEN':
                return 'Chờ xử lý';
            case 'IN_PROGRESS':
                return 'Đang xử lý';
            case 'RESOLVED':
                return 'Đã giải quyết';
            case 'REJECTED':
                return 'Đã từ chối';
            default:
                return status || 'Trạng thái không hợp lệ';
        }
    };

    const getTypeText = (type) => {
        switch (type) {
            case 'TECHNICAL': return 'Kỹ thuật';
            case 'HR': return 'Nhân sự';
            case 'ADMINISTRATIVE': return 'Hành chính';
            case 'OTHER': return 'Khác';
            default: return type;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <div className="dashboard-layout">
            <HRSidebar />
            <div className="dashboard-content">
                <div className="manage-support-container">
                    <div className="page-header">
                        <h1>Quản lý yêu cầu hỗ trợ</h1>
                    </div>

                    {/* Filter Section */}
                    <div className="filter-section">
                        <div className="filter-group">
                            <label>Loại:</label>
                            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                <option value="">Tất cả</option>
                                <option value="TECHNICAL">Kỹ thuật</option>
                                <option value="HR">Nhân sự</option>
                                <option value="ADMINISTRATIVE">Hành chính</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Trạng thái:</label>
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="">Tất cả</option>
                                <option value="OPEN">Đang mở</option>
                                <option value="IN_PROGRESS">Đang chờ xử lý</option>
                                <option value="RESOLVED">Đã duyệt</option>
                                <option value="REJECTED">Đã từ chối</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Tìm kiếm:</label>
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Tìm kiếm..."
                            />
                        </div>

                        <div className="filter-actions">
                            <button className="btn-filter" onClick={handleFilter}>
                                Lọc
                            </button>
                            <button className="btn-reset" onClick={handleResetFilter}>
                                Đặt lại
                            </button>
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {/* Table Section */}
                    {loading ? (
                        <div className="loading-spinner">Đang tải...</div>
                    ) : (
                        <div>
                            <div className="table-container">
                                <table className="support-table">
                                    <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th>Tên TTS</th>
                                            <th>Loại</th>
                                            <th>Tiêu đề</th>
                                            <th>Trạng thái</th>
                                            <th>Ngày yêu cầu</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="no-data">
                                                    Không có dữ liệu
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredRequests.map((request, index) => (
                                                <tr key={request.supportId}>
                                                    <td>{index + 1}</td>
                                                    <td>{request.fullName}</td>
                                                    <td>
                                                        <span className="type-badge" style={{
                                                            color: "#856404"
                                                        }}>{getTypeText(request.supportType)}</span>
                                                    </td>
                                                    <td className="title-cell">{request.title}</td>
                                                    <td>
                                                        <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                                                            {getStatusText(request.status)}
                                                        </span>
                                                    </td>
                                                    <td>{formatDate(request.requestDate)}</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button
                                                                className="btn-detail"
                                                                onClick={() => handleViewDetail(request)}
                                                            >
                                                                Chi tiết
                                                            </button>
                                                            {request.status === 'PENDING' && (
                                                                <>
                                                                    <button
                                                                        className="btn-approve"
                                                                        onClick={() => handleApprove(request.supportId)}
                                                                    >
                                                                        Duyệt
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>

                            </div>
                            {
                                paging !== null && (
                                    <div className="pagination">
                                        <button
                                            disabled={paging.page === 0}
                                            onClick={() => handleFilter(paging.page - 1)}
                                            className="pagination-btn"
                                        >
                                            Trang trước
                                        </button>

                                        <span className="pagination-info">
                                            Trang {paging.page + 1} / {paging.totalPages}
                                        </span>

                                        <button
                                            className="pagination-btn"
                                            disabled={paging.page + 1 >= paging.totalPages}
                                            onClick={() => handleFilter(paging.page + 1)}
                                        >
                                            Trang sau
                                        </button>
                                    </div>
                                )
                            }
                        </div>
                    )}

                    {/* Detail Modal */}
                    {showDetailModal && selectedRequest && (
                        <SupportDetailModal
                            request={selectedRequest}
                            onClose={() => setShowDetailModal(false)}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onHandleStatus={handleUpdateStatus}
                            token={token}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageSupportRequests;
