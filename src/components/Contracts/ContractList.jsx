import React from "react";
import ContractStatusBadge from "./ContractStatusBadge";
import "../../styles/table.css";

const ContractList = ({ contracts, onSelect }) => {
  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Tên hợp đồng</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Ngày hiệu lực</th>
          </tr>
        </thead>
        <tbody>
          {contracts.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: 16 }}>
                Không có hợp đồng nào
              </td>
            </tr>
          )}
          {contracts.map((c, idx) => (
            <tr key={c.id} onClick={() => onSelect(c)} style={{ cursor: "pointer" }}>
              <td>{idx + 1}</td>
              <td>{c.title}</td>
              <td><ContractStatusBadge status={c.status} /></td>
              <td>{new Date(c.createdAt).toLocaleDateString()}</td>
              <td>{c.effectiveDate ? new Date(c.effectiveDate).toLocaleDateString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContractList;

