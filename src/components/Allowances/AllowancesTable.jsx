import React from "react";

const AllowancesTable = ({
  allowances,
  sortBy,
  direction,
  onSort,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="allowance-table-container">
      <table className="allowance-table">
        <thead>
          <tr>
            <th onClick={() => onSort("allowanceId")}>
              ID {sortBy === "allowanceId" && (direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => onSort("internId")}>
              ID TTS {sortBy === "internId" && (direction === "asc" ? "↑" : "↓")}
            </th>
            <th>Tên thực tập sinh</th>
            <th onClick={() => onSort("type")}>
              Loại {sortBy === "type" && (direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => onSort("amount")}>
              Số tiền {sortBy === "amount" && (direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => onSort("dateApplied")}>
              Ngày áp dụng {sortBy === "dateApplied" && (direction === "asc" ? "↑" : "↓")}
            </th>
            <th>Ghi chú</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {allowances.length > 0 ? (
            allowances.map((allowance) => (
              <tr key={allowance.allowanceId}>
                <td>{allowance.allowanceId}</td>
                <td>{allowance.internId}</td>
                <td>{allowance.internName || "-"}</td>
                <td>{allowance.type}</td>
                <td className="amount">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(allowance.amount)}
                </td>
                <td>{new Date(allowance.dateApplied).toLocaleDateString("vi-VN")}</td>
                <td>{allowance.note || "-"}</td>
                <td className="actions">
                  <button
                    className="btn-edit"
                    onClick={() => onEdit(allowance)}
                    title="Chỉnh sửa"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => onDelete(allowance.allowanceId)}
                    title="Xóa"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="no-data">
                Không có dữ liệu trợ cấp
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AllowancesTable;
