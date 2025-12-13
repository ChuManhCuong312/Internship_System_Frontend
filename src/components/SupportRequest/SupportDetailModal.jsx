import React, { useState, useEffect } from 'react';
import Modal from '../Layout/Modal';
// import { LoadingButton } from '../Common/LoadingSpinner';
import { getSupportRequestHistory } from '../../api/supportApi';
import '../../styles/modal.css';
import '../../styles/supportRequest.css';
import { toast } from 'react-toastify';
import { hr } from 'date-fns/locale';

const SupportDetailModal = ({ request, onClose, onApprove, onReject, onHandleStatus, token }) => {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [hrResponse, setHrResponse] = useState(request.response);

    const [handleStatus, setHandleStatus] = useState(request.status);

    useEffect(() => {
        setHrResponse(request?.response || '');
    }, [request]);

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
            if ((handleStatus == 'REJECTED') && !hrResponse) {
                toast.error("Bạn phải ghi rõ lý do từ chối");
                return;
            }
            await onHandleStatus(request.supportId, handleStatus, hrResponse)
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
                        <DetailRow label="Tên Thực tập sinh" value={request.internFullName} />
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
                                disabled={request.status === 'RESOLVED' || request.status === 'REJECTED'}
                            >
                                {['IN_PROGRESS', 'RESOLVED', 'REJECTED']
                                    .map(s => (
                                        <option key={s} value={s} selected={handleStatus == s}>{getStatusText(s)}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <DetailRow label="Ngày yêu cầu" value={formatDate(request.createdAt)} />
                        {request.processedDate && (
                            <>
                                <DetailRow label="Người xử lý" value={`${request.processedByName}`} />
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

                <div className="detail-section response-section">
                    <h3>Phản hồi</h3>
                    <textarea name="" id=""
                        value={hrResponse}
                        onChange={(e) => setHrResponse(e.target.value)}
                        className="response-textarea"
                        disabled={handleStatus == request.status}
                        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', outline: "none" }}
                        placeholder={`Lý do ${handleStatus === 'RESOLVED' ? 'duyệt' : handleStatus === 'REJECTED' ? 'từ chối' : ''}`}
                    />
                </div>

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
                                            <p>Người thực hiện: {item.changedByName}</p>
                                            {item.remarks && <p className="history-remarks">{item.remarks}</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="modal-actions">
                    <button
                        disabled={handleStatus == request.status || request.status === 'RESOLVED' || request.status === 'REJECTED'}
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
