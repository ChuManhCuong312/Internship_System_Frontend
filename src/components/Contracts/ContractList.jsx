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
            
            <th>Ngày hiệu lực</th>
            <th style={{ textAlign: "center" }}>Hành động</th>
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
            <tr key={c.id} onClick={() => onSelect(c)} style={{ cursor: "pointer" }} className="contract-row">
              <td>{idx + 1}</td>
              <td>{c.title}</td>
              <td><ContractStatusBadge status={c.status} /></td>
              
              <td>{c.effectiveDate ? new Date(c.effectiveDate).toLocaleDateString() : "-"}</td>
              <td style={{ textAlign: "center" }}>
                <button 
                  className="btn-view"
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#3b82f6", // Màu xanh dương (Tailwind blue-500)
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.9rem"
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // 3. Ngăn chặn click lan ra thẻ tr (tránh kích hoạt 2 lần)
                    onSelect(c);
                  }}
                >
                  Xem chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContractList;

