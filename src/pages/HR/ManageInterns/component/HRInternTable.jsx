import React from "react";
import HRInternRow from "./HRInternRow";

const HRInternTable = ({ interns, page, size, fetchInterns }) => {
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

  return (
    <div className="users-table-container">
      <table className="users-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Ngành</th>
            <th>GPA</th>
            <th>Tài liệu</th>
            <th>Trạng thái</th>
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
                />
            ))
          ) : (
            <tr>
              <td colSpan="9" style={{ textAlign: "center" }}>
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
