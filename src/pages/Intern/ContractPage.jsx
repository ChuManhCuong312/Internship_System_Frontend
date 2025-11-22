import React, { useState, useMemo } from 'react';
import InternSidebar from '../../components/Layout/InternSidebar';
import ContractFilter from '../../components/Contracts/ContractFilter';
import ContractList from '../../components/Contracts/ContractList';
import ContractViewer from '../../components/Contracts/ContractViewer';
import ConfirmContractModal from '../../components/Contracts/ConfirmContractModal';
import '../../styles/dashBoard.css'; // Giữ lại styles chung

// Dữ liệu hợp đồng giả (Mock Data)
const mockContracts = [
  {
    id: 'C001',
    code: 'C-2025-001',
    title: 'Hợp đồng thực tập mùa hè',
    status: 'PENDING', // Đang chờ xác nhận
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    effectiveDate: null,
    confirmedAt: null,
    content: "Điều khoản 1: Thực tập sinh sẽ làm việc 8 tiếng/ngày.\nĐiều khoản 2: Phụ cấp 3.000.000 VNĐ/tháng."
  },
  {
    id: 'C002',
    code: 'C-2024-123',
    title: 'Hợp đồng thử việc 2 tháng',
    status: 'ACTIVE', // Đang hiệu lực
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    effectiveDate: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
    confirmedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
    content: "Đây là nội dung của hợp đồng thử việc. Mức lương cố định là..."
  },
  {
    id: 'C003',
    code: 'C-2023-456',
    title: 'Hợp đồng đào tạo ban đầu',
    status: 'COMPLETED', // Hoàn thành
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    effectiveDate: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000).toISOString(),
    confirmedAt: new Date(Date.now() - 363 * 24 * 60 * 60 * 1000).toISOString(),
    content: "Các điều khoản về khóa đào tạo..."
  },
];

const ContractPage = () => {
  const [contracts, setContracts] = useState(mockContracts);
  const [selectedContract, setSelectedContract] = useState(null);
  const [filter, setFilter] = useState({ q: "", status: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Logic lọc hợp đồng
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      // Lọc theo trạng thái
      const statusMatch = !filter.status || c.status === filter.status;
      // Lọc theo tên/mã
      const qMatch = !filter.q || 
                     c.title.toLowerCase().includes(filter.q.toLowerCase()) || 
                     c.code?.toLowerCase().includes(filter.q.toLowerCase());
      
      return statusMatch && qMatch;
    });
  }, [contracts, filter]);

  // Xử lý sự kiện xác nhận hợp đồng (giả lập)
  const handleConfirm = (contract) => {
    // Chỉ xác nhận khi hợp đồng đang ở trạng thái PENDING
    if (contract.status === 'PENDING') {
      // Giả lập cập nhật trạng thái
      const updatedContracts = contracts.map(c => 
        c.id === contract.id ? { 
          ...c, 
          status: 'ACTIVE', // Chuyển sang Đang hiệu lực
          confirmedAt: new Date().toISOString(), 
          effectiveDate: new Date().toISOString() // Thiết lập ngày hiệu lực là ngày xác nhận
        } : c
      );
      setContracts(updatedContracts);
      setSelectedContract({ 
        ...contract, 
        status: 'ACTIVE', 
        confirmedAt: new Date().toISOString(),
        effectiveDate: new Date().toISOString()
      });
      setIsModalOpen(false);
      alert(`Đã xác nhận thành công hợp đồng: ${contract.title}`);
    }
  };

  // Mở modal xác nhận
  const handleOpenConfirmModal = (contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  return (
    <div className="dashboard-layout">
      <InternSidebar />
      <div className="dashboard-content">
        <h2 style={{ marginBottom: 20 }}>📑 Quản lý Hợp đồng</h2>
        
        <div style={{ display: 'flex', gap: 20 }}>
          {/* Phần Danh sách và Lọc */}
          <div style={{ flex: 2, minWidth: '450px' }}>
            <ContractFilter filter={filter} onChange={setFilter} />
            <ContractList contracts={filteredContracts} onSelect={setSelectedContract} />
          </div>

          {/* Phần Xem chi tiết */}
          <div style={{ flex: 1, minWidth: '350px' }}>
            <ContractViewer 
              contract={selectedContract} 
              onConfirm={handleOpenConfirmModal} // Gán hàm mở modal vào đây
            />
          </div>
        </div>
      </div>

      {/* Modal xác nhận */}
      <ConfirmContractModal 
        open={isModalOpen}
        contract={selectedContract}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default ContractPage;