import React from "react";
import Pagination from "../../../../components/Common/Pagination";

const ReportTable = ({
  report,
  appliedProgramId,
  paginatedInternRows,
  currentPage,
  internRows,
  totalPages,
  setCurrentPage,
  setSelectedIntern,
  itemsPerPage,
}) => {
  if (!report) return null;

  return (
    <>
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Trường</th>
              <th>Ngành</th>
              {!appliedProgramId && <th>Chương trình</th>}
              <th>Nhóm</th>
              <th>Mentor</th>
              <th>Kỹ thuật</th>
              <th>Giao tiếp</th>
              <th>Kỷ luật</th>
              <th>Thái độ</th>
              <th>Điểm cuối kỳ</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInternRows.length === 0 && (
              <tr>
                <td colSpan="15" style={{ textAlign: "center" }}>
                  Không có dữ liệu báo cáo
                </td>
              </tr>
            )}
            {paginatedInternRows.map((intern, index) => (
              <tr key={intern.internId}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td>{intern.fullName}</td>
                <td>{intern.email}</td>
                <td>{intern.phone}</td>
                <td>{intern.school}</td>
                <td>{intern.major}</td>
                {!appliedProgramId && <td>{intern.programName}</td>}
                <td>{intern.teamName}</td>
                <td>{intern.mentorName}</td>
                <td>
                  {intern.avgTechnical != null
                    ? intern.avgTechnical.toFixed(2)
                    : "-"}
                </td>
                <td>
                  {intern.avgCommunication != null
                    ? intern.avgCommunication.toFixed(2)
                    : "-"}
                </td>
                <td>
                  {intern.avgDiscipline != null
                    ? intern.avgDiscipline.toFixed(2)
                    : "-"}
                </td>
                <td>
                  {intern.avgAttitude != null
                    ? intern.avgAttitude.toFixed(2)
                    : "-"}
                </td>
                <td>
                  {intern.finalScore != null
                    ? intern.finalScore.toFixed(2)
                    : "-"}
                </td>
                <td
                  title={intern.allNotes || ""}
                  style={{
                    cursor:
                      intern.allNotes || intern.latestNote
                        ? "pointer"
                        : "default",
                    color:
                      intern.allNotes || intern.latestNote
                        ? "#01579b"
                        : "inherit",
                    textDecoration:
                      intern.allNotes || intern.latestNote
                        ? "underline"
                        : "none",
                  }}
                  onClick={() => {
                    if (intern.allNotes || intern.latestNote) {
                      setSelectedIntern(intern);
                    }
                  }}
                >
                  {intern.latestNote || (intern.allNotes ? "Xem chi tiết" : "-")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={internRows.length}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default ReportTable;
