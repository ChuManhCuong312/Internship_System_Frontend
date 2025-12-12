import React, { useState, useEffect } from 'react';
import Modal from '../Layout/Modal';
// import { LoadingButton } from '../Common/LoadingSpinner';
import { getSupportRequestHistory } from '../../api/supportApi';
import '../../styles/modal.css';
import '../../styles/supportRequest.css';

const SupportDetailModal = ({ request, onClose, onApprove, onReject, onHandleStatus, token }) => {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    // const [response, setResponse] = useState('');
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [handleStatus, setHandleStatus] = useState(request.status);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const data = await getSupportRequestHistory(token, request.supportId);
            setHistory(data);
        } catch (err) {
            console.error('Lỗi khi tải lịch sử:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleApprove = async () => {
        setIsApproving(true);
        try {
            await onApprove(request.supportId, response);
        } finally {
            setIsApproving(false);
        }
    };

    const handleReject = async () => {
        if (!response.trim()) {
            alert('Vui lòng nhập phản hồi để từ chối');
            return;
        }
        setIsRejecting(true);
        try {
            await onReject(request.supportId, response);
        } finally {
            setIsRejecting(false);
        }
    };

    const onHandledStatus = async () => {
        setIsRejecting(true);
        try {
            await onHandleStatus(request.supportId, handleStatus)
        }
        finally {
            setIsRejecting(false);
        }
    }

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
        <Modal title="Chi tiết yêu cầu hỗ trợ" onClose={onClose}>
            <div className="support-detail-modal">
                {/* Thông tin cơ bản */}
                <div className="detail-section">
                    <h3>Thông tin yêu cầu</h3>
                    <div className="detail-grid">
                        <DetailRow label="ID" value={request.supportId} />
                        <DetailRow label="Tên Thực tập sinh" value={request.fullName} />
                        <DetailRow label="Loại" value={getTypeText(request.supportType)} />
                        {/* <DetailRow
                            label="Trạng thái"
                            value={getStatusText(request.status)}
                            highlight={true}
                        >
                            
                        </DetailRow> */}
                        <div style={{
                            display: 'flex'
                        }}
                            className="detail-row">
                            <label className=''>Trạng thái:</label>
                            <select
                                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                                value={handleStatus}
                                className='highlight-value'
                                onChange={(e) => setHandleStatus(e.target.value)}
                            >
                                {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']
                                    .map(s => (
                                        <option key={s} value={s} selected={handleStatus == s}>{getStatusText(s)}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <DetailRow label="Ngày yêu cầu" value={formatDate(request.requestDate)} />
                        {request.processedDate && (
                            <>
                                <DetailRow label="Người xử lý" value={`ID: ${request.processedBy}`} />
                                <DetailRow label="Ngày xử lý" value={formatDate(request.processedDate)} />
                            </>
                        )}
                    </div>
                </div>

                {/* Nội dung */}
                <div className="detail-section">
                    <h3>Nội dung</h3>
                    <div className="content-box">
                        <h4>{request.title}</h4>
                        <p>{request.description}</p>
                    </div>
                </div>

                {/* Phản hồi (Hiển thị nếu đã xử lý) */}
                {(request.status !== 'PENDING' && request.response) && (
                    <div className="detail-section response-section">
                        <h3>Phản hồi từ HR</h3>
                        <p>{request.response}</p>
                    </div>
                )}
                {/* Hỗ trợ backward compatibility nếu response chưa có nhưng rejectionReason có */}
                {(request.status === 'REJECTED' && !request.response && request.rejectionReason) && (
                    <div className="detail-section response-section">
                        <h3>Phản hồi từ HR (Lý do từ chối)</h3>
                        <p>{request.rejectionReason}</p>
                    </div>
                )}

                {/* Lịch sử thay đổi */}
                <div className="detail-section">
                    <h3>Lịch sử thay đổi</h3>
                    {loadingHistory ? (
                        <p>Đang tải lịch sử...</p>
                    ) : history.length === 0 ? (
                        <p>Chưa có lịch sử thay đổi</p>
                    ) : (
                        <div className="history-timeline">
                            {history.map((item, index) => (
                                <div key={item.historyId} className="history-item">
                                    <div className="history-marker"></div>
                                    <div className="history-content">
                                        <div className="history-header">
                                            <span className="history-status">
                                                {item.oldStatus ? `${getStatusText(item.oldStatus)} → ` : ''}
                                                {getStatusText(item.newStatus)}
                                            </span>
                                            <span className="history-date">{formatDate(item.changeDate)}</span>
                                        </div>
                                        <div className="history-details">
                                            <p>Người thực hiện: ID {item.changedBy}</p>
                                            {item.remarks && <p className="history-remarks">{item.remarks}</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Form nhập phản hồi (Chỉ hiện khi PENDING) */}
                {request.status === 'PENDING' && (
                    <div className="detail-section response-form-section">
                        <h3>Phản hồi</h3>
                        <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Nhập phản hồi hoặc lý do từ chối..."
                            rows={4}
                            className="response-textarea"
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="modal-actions">
                    <button
                        disabled={handleStatus == request.status}
                        className='btn-primary'
                        onClick={onHandledStatus}
                    >
                        Cật nhật
                    </button>
                    <button
                        className="btn-cancel"
                        onClick={onClose}
                        disabled={isApproving || isRejecting}
                    >
                        Đóng
                    </button>

                    {request.status === 'PENDING' && (
                        <>
                            <LoadingButton
                                className="btn-save"
                                onClick={handleApprove}
                                isLoading={isApproving}
                                disabled={isRejecting}
                            >
                                Duyệt
                            </LoadingButton>
                            <LoadingButton
                                className="btn-danger"
                                onClick={handleReject}
                                isLoading={isRejecting}
                                disabled={isApproving}
                            >
                                Từ chối
                            </LoadingButton>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};

const DetailRow = ({ label, value, highlight }) => (
    <div className="detail-row">
        <label>{label}:</label>
        <span className={highlight ? 'highlight-value' : ''}>{value}</span>
    </div>
);

export default SupportDetailModal;
