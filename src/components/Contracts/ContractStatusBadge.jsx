import React from "react";
import StatusBadge from "../Common/StatusBadge";

// Wrapper để map status tiếng Việt/English nếu cần mở rộng
const normalize = (status) => {
  if (!status) return "unknown";
  // Chuẩn hóa về các class friendly
  const map = {
    PENDING: "Đang chờ",
    ACTIVE: "Đang hiệu lực",
    REJECTED: "Bị từ chối",
    CANCELLED: "Đã huỷ",
    COMPLETED: "Hoàn thành",
  };
  return map[status] ? map[status] : status;
};

const ContractStatusBadge = ({ status }) => {
  return <StatusBadge status={normalize(status)} />;
};

export default ContractStatusBadge;

