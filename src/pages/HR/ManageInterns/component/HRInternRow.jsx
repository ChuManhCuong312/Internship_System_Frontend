import React from "react";
import StatusBadge from "../../../../components/Common/StatusBadge";
import ActionButtons from "../../../../components/Common/ActionButtons";

const statusMap = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  ACTIVE: "Đang hoạt động",
  COMPLETED: "Hợp đồng hoàn tất"
};
const HRInternRow = ({
  intern,
  handleAssignMentor,
  handleApprove,
  handleReject,
  handleEdit,
  handleDelete,
  handleUnlock,
  handleSendContract
}) => (
  <tr>
    <td>{intern.fullName}</td>
    <td>{intern.email}</td>
    <td>{intern.school}</td>
    <td>{intern.major}</td>
    <td>
      {(!intern.mentor || intern.mentor === "-") ? (
              <button
                className="btn-assign"
                onClick={() => handleAssignMentor(intern)}
              >
                👨‍🏫 Phân công
              </button>
            ) : (
              intern.mentor
            )}
        </td>
    <td>
      {intern.documents && intern.documents.length > 0
        ? intern.documents.map((doc, idx) => (
            <a key={idx} href="#" download={doc} className="download-link">📄 {doc}</a>
          ))
        : "-"
      }
    </td>
<td><StatusBadge status={statusMap[intern.status]} /></td>
    <td>{intern.createdAt ? intern.createdAt : "-"}</td>
    <td>
      <ActionButtons
        user={intern}
        userRole="hr"
        onApprove={handleApprove}
        onReject={handleReject}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUnlock={handleUnlock}
        onSendContract={handleSendContract}
      />
    </td>
  </tr>
);

export default HRInternRow;
