import React from "react";

const normalize = (status) => {
  if (!status) return "unknown";
  const map = {
    PENDING: "Đang chờ",
    ACTIVE: "Đang hiệu lực",
    APPROVED: "Đang hiệu lực",
    REJECTED: "Bị từ chối",
    CANCELLED: "Đã huỷ",
    COMPLETED: "Hoàn thành",
  };
  return map[status] ? map[status] : status;
};

const ContractStatusBadge = ({ status }) => {
  const label = normalize(status);
  
  let statusClass = "unknown";
  if (status === 'PENDING') statusClass = 'pending';
  // Cả ACTIVE và APPROVED đều hiện màu xanh
  if (status === 'ACTIVE' || status === 'APPROVED') statusClass = 'active';
  if (status === 'REJECTED' || status === 'CANCELLED') statusClass = 'rejected';

  return (
    <span className={`status-badge ${statusClass}`}>
      {label}
    </span>
  );
};

export default ContractStatusBadge;