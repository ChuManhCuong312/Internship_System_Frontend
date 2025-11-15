import React, { useMemo } from "react";

const statuses = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Đang chờ" },
  { value: "ACTIVE", label: "Đang hiệu lực" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "REJECTED", label: "Bị từ chối" },
  { value: "CANCELLED", label: "Đã huỷ" },
];

const ContractFilter = ({ filter, onChange }) => {
  const opts = useMemo(() => statuses, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filter, [name]: value });
  };

  return (
    <div className="filter-bar" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
      <input
        type="text"
        name="q"
        placeholder="Tìm theo tên hợp đồng..."
        value={filter.q || ""}
        onChange={handleChange}
        style={{ padding: 8, minWidth: 220 }}
      />
      <select name="status" value={filter.status || ""} onChange={handleChange} style={{ padding: 8 }}>
        {opts.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
};

export default ContractFilter;

