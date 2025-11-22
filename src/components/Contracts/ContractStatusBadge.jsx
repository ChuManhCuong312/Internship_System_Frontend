// src/components/Contracts/ContractStatusBadge.jsx
import React from "react";
// Giả sử bạn không dùng StatusBadge chung nữa mà dùng HTML thuần với class CSS vừa tạo
// Hoặc nếu dùng StatusBadge chung, hãy đảm bảo nó nhận className

const normalize = (status) => {
  if (!status) return "unknown";
  const map = {
    PENDING: "Đang chờ",
    ACTIVE: "Đang hiệu lực",
    APPROVED: "Đang hiệu lực", // Map thêm APPROVED
    REJECTED: "Bị từ chối",
    CANCELLED: "Đã huỷ",
    COMPLETED: "Hoàn thành",
  };
  return map[status] ? map[status] : status;
};

const ContractStatusBadge = ({ status }) => {
  const label = normalize(status);
  // Tạo class name an toàn (loại bỏ khoảng trắng) để CSS mapping
  // Ví dụ: "Đang chờ" -> "status-badge Đang chờ" (CSS sẽ dùng attribute selector hoặc class escape, 
  // nhưng đơn giản hơn là check status gốc)
  
  // Cách đơn giản nhất để map với CSS ở trên:
  let statusClass = "unknown";
  if(status === 'PENDING') statusClass = 'pending';
  if(status === 'ACTIVE' || status === 'APPROVED') statusClass = 'active';
  if(status === 'REJECTED') statusClass = 'rejected';

  return (
    <span className={`status-badge ${statusClass}`}>
      {label}
    </span>
  );
};

export default ContractStatusBadge;