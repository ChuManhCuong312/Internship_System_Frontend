import React, { useState, useEffect } from 'react';
import Modal from '../Layout/Modal';
import { LoadingButton } from '../common/LoadingSpinner';
import { getSupportRequestHistory } from '../../api/supportApi';
import '../../styles/modal.css';
import '../../styles/supportRequest.css';

const SupportDetailModal = ({ request, onClose, onApprove, onReject, token }) => {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

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
            await onApprove(request.supportId);
        } finally {
            setIsApproving(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Vui lòng nhập lý do từ chối');
            return;
        }
        setIsRejecting(true);
        try {
            await onReject(request.supportId, rejectionReason);
        } finally {
            setIsRejecting(false);
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING': return 'Chờ xử lý';
            case 'APPROVED': return 'Đã duyệt';
            case 'REJECTED': return 'Từ chối';
            default: return status;
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
                        <DetailRow label="ID Thực tập sinh" value={request.internId} />
                        <DetailRow label="Loại" value={getTypeText(request.supportType)} />
                        <DetailRow
                            label="Trạng thái"
                            value={getStatusText(request.status)}
                            highlight={true}
                        />
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

                {/* Lý do từ chối (nếu có) */}
                {request.rejectionReason && (
                    <div className="detail-section rejection-section">
                        <h3>Lý do từ chối</h3>
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

                {/* Form từ chối */}
                {showRejectForm && request.status === 'PENDING' && (
                    <div className="detail-section reject-form-section">
                        <h3>Lý do từ chối</h3>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Nhập lý do từ chối..."
                            rows={4}
                            className="reject-textarea"
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="modal-actions">
                    <button
                        className="btn-cancel"
                        onClick={onClose}
                        disabled={isApproving || isRejecting}
                    >
                        Đóng
                    </button>

                    {request.status === 'PENDING' && !showRejectForm && (
                        <>
                            <LoadingButton
                                className="btn-save"
                                onClick={handleApprove}
                                isLoading={isApproving}
                                disabled={isRejecting}
                            >
                                Duyệt
                            </LoadingButton>
                            <button
                                className="btn-danger"
                                onClick={() => setShowRejectForm(true)}
                                disabled={isApproving || isRejecting}
                            >
                                Từ chối
                            </button>
                        </>
                    )}

                    {showRejectForm && request.status === 'PENDING' && (
                        <>
                            <button
                                className="btn-cancel"
                                onClick={() => {
                                    setShowRejectForm(false);
                                    setRejectionReason('');
                                }}
                                disabled={isRejecting}
                            >
                                Hủy
                            </button>
                            <LoadingButton
                                className="btn-danger"
                                onClick={handleReject}
                                isLoading={isRejecting}
                            >
                                Xác nhận từ chối
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
