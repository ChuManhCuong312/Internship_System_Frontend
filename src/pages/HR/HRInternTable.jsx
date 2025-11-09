import React from "react";
import InternRow from "./HRInternRow";

const HRInternTable = ({ interns, handlers }) => (
  <div className="users-table-container">
    <table className="users-table">
      <thead>
        <tr>
          <th>Họ tên</th>
          <th>Email</th>
          <th>Trường</th>
          <th>Ngành</th>
          <th>Mentor</th>
          <th>Tài liệu</th>
          <th>Trạng thái</th>
          <th>Ngày tạo</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {interns.map((i) => (
          <InternRow key={i.id} intern={i} {...handlers} />
        ))}
      </tbody>
    </table>
  </div>
);

export default HRInternTable;
