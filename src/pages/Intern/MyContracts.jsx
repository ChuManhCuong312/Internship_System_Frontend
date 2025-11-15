import React, { useMemo, useState } from "react";
import ContractFilter from "../../components/Contracts/ContractFilter";
import ContractList from "../../components/Contracts/ContractList";
import ContractViewer from "../../components/Contracts/ContractViewer";
import ConfirmContractModal from "../../components/Contracts/ConfirmContractModal";
import { notifyHR } from "../../services/notificationService";
import "../../styles/styles.css";
import "../../styles/buttons.css";
import "../../styles/table.css";

const mockContracts = [
  {
    id: "CT-001",
    code: "CT-001",
    title: "Hợp đồng thực tập - Đợt 11/2025",
    status: "PENDING",
    createdAt: new Date().toISOString(),
    effectiveDate: null,
    confirmedAt: null,
    content: `Điều 1: Thời gian thực tập\nĐiều 2: Quyền và nghĩa vụ...\nĐiều 3: Bảo mật...`,
  },
  {
    id: "CT-002",
    code: "CT-002",
    title: "Phụ lục hợp đồng - Chính sách hỗ trợ",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    effectiveDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    confirmedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    content: `Phụ lục về hỗ trợ chi phí...`,
  },
];

const MyContracts = () => {
  const [filter, setFilter] = useState({ q: "", status: "" });
  const [contracts, setContracts] = useState(mockContracts);
  const [selected, setSelected] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const filtered = useMemo(() => {
    return contracts.filter((c) => {
      if (filter.status && c.status !== filter.status) return false;
      if (filter.q && !c.title.toLowerCase().includes(filter.q.toLowerCase())) return false;
      return true;
    });
  }, [contracts, filter]);

  const handleSelect = (c) => setSelected(c);

  const handleAskConfirm = (c) => {
    setSelected(c);
    setOpenConfirm(true);
  };

  const handleConfirm = (c) => {
    const now = new Date().toISOString();
    setContracts((prev) =>
      prev.map((it) =>
        it.id === c.id ? { ...it, status: "ACTIVE", confirmedAt: now, effectiveDate: now } : it
      )
    );
    setSelected((prev) => prev && prev.id === c.id ? { ...prev, status: "ACTIVE", confirmedAt: now, effectiveDate: now } : prev);
    setOpenConfirm(false);

    notifyHR({
      type: "contract_confirmed",
      title: "Intern đã xác nhận hợp đồng",
      message: `${c.code} - ${c.title}`,
      payload: { contractId: c.id, confirmedAt: now }
    });
  };

  return (
    <div className="page-container" style={{ display: "grid", gap: 16 }}>
      <h2>Hợp đồng của tôi</h2>
      <ContractFilter filter={filter} onChange={setFilter} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <ContractList contracts={filtered} onSelect={handleSelect} />
        </div>
        <div>
          <ContractViewer contract={selected} onConfirm={handleAskConfirm} />
        </div>
      </div>

      <ConfirmContractModal
        open={openConfirm}
        contract={selected}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default MyContracts;

