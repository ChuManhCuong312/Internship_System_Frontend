import React, { useState, useEffect } from "react";
import "../../styles/contractPage.css";

const statuses = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Đang chờ" },
  { value: "ACTIVE", label: "Đang hiệu lực" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "REJECTED", label: "Bị từ chối" },
];

const ContractFilter = ({ filter, onChange }) => {
  const [localSearch, setLocalSearch] = useState(filter.q || "");

  useEffect(() => {
    setLocalSearch(filter.q || "");
  }, [filter.q]);

  // Debounce 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filter.q || "")) {
        onChange({ ...filter, q: localSearch });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, filter, onChange]);

  return (
    <div className="filter-bar">
      <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
        {/* Search Icon */}
        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#01579b", opacity: 0.7 }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </span>
        
        <input
          type="text"
          placeholder="Tìm tên hợp đồng, mã số..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          style={{ width: "95%", paddingLeft: "38px" }}
        />
      </div>

      <div style={{ minWidth: "200px" }}>
        <select 
          value={filter.status || ""} 
          onChange={(e) => onChange({ ...filter, status: e.target.value })}
          style={{ width: "100%" }}
        >
          {statuses.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ContractFilter;