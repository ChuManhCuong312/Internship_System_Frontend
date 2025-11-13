import React from "react";

const HRInternTable = ({ interns }) => {
  // Hàm chuyển trạng thái sang tiếng Việt
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
        return "Không rõ";
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
            <th>Trường</th>
            <th>GPA</th>
            <th>Tài liệu</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(interns) && interns.length > 0 ? (
            interns.map((intern, index) => (
              <tr key={intern.internId}>
                <td>{index + 1}</td> {/* STT thay cho ID */}
                <td>{intern.fullName}</td>
                <td>{intern.email}</td>
                <td>{intern.phone}</td>
                <td>{intern.major}</td>
                <td>{intern.school}</td>
                <td>{intern.gpa}</td>
                <td>
                  {intern.cvPath && (
                    <a href={`/${intern.cvPath}`} target="_blank" rel="noopener noreferrer">
                      CV
                    </a>
                  )}
                  {intern.internshipApplicationPath && (
                    <>
                      {" | "}
                      <a
                        href={`/${intern.internshipApplicationPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Application
                      </a>
                    </>
                  )}
                  {!intern.cvPath && !intern.internshipApplicationPath && "Chưa có"}
                </td>
                <td>{translateStatus(intern.status)}</td>
              </tr>
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
