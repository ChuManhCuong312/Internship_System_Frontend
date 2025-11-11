import React from "react";
import HRInternRow from "./HRInternRow";

const HRInternTable = ({ interns, handlers, showStatus = false  }) => (
  <div className="users-table-container">
    <table className="users-table">
      <thead>
        <tr>
          <th>Họ tên</th>
          <th>Email</th>
          <th>Trường</th>
          <th>Ngành</th>
    {handlers.handleAssignMentor && <th>Mentor</th>}
              <th>Tài liệu</th>
              {showStatus && <th>Trạng thái</th>}
          <th>Ngày tạo</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {interns.map((intern) => (
          <HRInternRow
            key={intern.internId}
            intern={intern}
            handleAssignMentor={handlers.handleAssignMentor}
            handleApprove={handlers.handleApprove}
            handleReject={handlers.handleReject}
            handleEdit={handlers.handleEdit}
            handleDelete={handlers.handleDelete}
            handleUnlock={handlers.handleUnlock}
            handleSendContract={handlers.handleSendContract}
          showStatus={showStatus}
                      {...handlers}
          />
        ))}
      </tbody>
    </table>
  </div>
);

export default HRInternTable;
