import React from "react";
import HRInternRow from "./HRInternRow";
import "../../../../styles/buttons.css";

const HRInternTable = ({
  interns,
  page,
  size,
  fetchInterns,
  onEdit,
  onView,
  onApprove,
  showDocuments = true,
  showApproveActions = false,
  showStatus = true,
  matchingInterns,
  appliedCriteria,
  enableSelection = false,
  selectedInternIds = [],
  onToggleSelectIntern,
  onToggleSelectAll,
}) => {

  const translateStatus = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Từ chối";
      case "ACTIVE":
        return "Đang hoạt động";
      case "COMPLETED":
        return "Hoàn thành";
      default:
        return "Chưa gửi CV";
    }
  };

  const baseColumns = enableSelection ? 9 : 8;
  const totalColumns = baseColumns + (showDocuments ? 1 : 0) + (showStatus ? 1 : 0);

  const isMatching = (internId) => {
    return appliedCriteria && matchingInterns && matchingInterns.has(internId);
  };

  return (
    <div className="users-table-container">
      <table className="users-table">
        <thead>
          <tr>
            {enableSelection && (
              <th>
                <input
                  type="checkbox"
                  checked={
                    Array.isArray(selectedInternIds) &&
                    selectedInternIds.length > 0 &&
                    interns &&
                    selectedInternIds.length === interns.length
                  }
                  onChange={(e) =>
                    onToggleSelectAll && onToggleSelectAll(e.target.checked)
                  }
                />
              </th>
            )}
            <th>STT</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Ngành</th>
            <th>GPA</th>
            {showDocuments && <th>Tài liệu</th>}
            <th>Trường</th>
            {showStatus && <th>Trạng thái</th>}
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(interns) && interns.length > 0 ? (
            interns.map((intern, index) => (
              <HRInternRow
                key={intern.internId}
                intern={intern}
                index={page * size + index}
                translateStatus={translateStatus}
                onStatusChange={fetchInterns}
                onEdit={onEdit}
                onView={onView}
                onApprove={onApprove}
                showDocuments={showDocuments}
                showApproveActions={showApproveActions}
                showStatus={showStatus}
                isMatching={isMatching(intern.internId)}
                appliedCriteria={appliedCriteria}
                enableSelection={enableSelection}
                selectedInternIds={selectedInternIds}
                onToggleSelectIntern={onToggleSelectIntern}
              />
            ))
          ) : (
            <tr>
              <td colSpan={totalColumns} style={{ textAlign: "center" }}>
                Không có dữ liệu thực tập sinh
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HRInternTable;