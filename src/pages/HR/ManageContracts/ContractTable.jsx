import React from "react";
import ContractRow from "./ContractRow";

const ContractTable = ({
  contracts,
  page,
  size,
  onUpload,
  onReplace,
  onDelete,
  onDownload,
}) => {
  const translateStatus = (contractStatus, internConfirmStatus) => {
    if (contractStatus === "NOT_UPLOAD") {
      return "Chưa upload";
    }
    if (contractStatus === "UPLOAD") {
      if (internConfirmStatus === "APPROVED") {
        return "Đã xác nhận";
      }
      if (internConfirmStatus === "PENDING") {
        return "Chờ xác nhận";
      }
      return "Đã upload";
    }
    return contractStatus;
  };

  const getStatusClass = (contractStatus, internConfirmStatus) => {
    if (contractStatus === "NOT_UPLOAD") {
      return "status-not-upload";
    }
    if (contractStatus === "UPLOAD") {
      if (internConfirmStatus === "APPROVED") {
        return "status-approved";
      }
      if (internConfirmStatus === "PENDING") {
        return "status-pending";
      }
      return "status-uploaded";
    }
    return "";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return dateString;
    }
  };

  const extractFileName = (filePath) => {
    if (!filePath) return "";
    const parts = filePath.split("/");
    return parts[parts.length - 1];
  };

  return (
    <div className="contract-table-container">
      <table className="contract-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Họ và tên</th>
            <th>SĐT</th>
            <th>Hợp đồng</th>
            <th>Trạng thái</th>
            <th>Thời gian tạo</th>
            <th>Chú thích</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(contracts) && contracts.length > 0 ? (
            contracts.map((contract, index) => (
              <ContractRow
                key={contract.documentId || contract.internId || index}
                contract={contract}
                index={page * size + index}
                translateStatus={translateStatus}
                getStatusClass={getStatusClass}
                formatDate={formatDate}
                extractFileName={extractFileName}
                onUpload={onUpload}
                onReplace={onReplace}
                onDelete={onDelete}
                onDownload={onDownload}
              />
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                Không có dữ liệu hợp đồng
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ContractTable;


