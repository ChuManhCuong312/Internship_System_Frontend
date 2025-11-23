// src/pages/Intern/ContractPage.jsx

import React, { useState, useMemo, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import InternSidebar from '../../components/Layout/InternSidebar.jsx'; 
import ConfirmContractModal from '../../components/Contracts/ConfirmContractModal.jsx';
import ContractFilter from '../../components/Contracts/ContractFilter.jsx';
import ContractList from '../../components/Contracts/ContractList.jsx';
import ContractViewer from '../../components/Contracts/ContractViewer.jsx';
import { AuthContext } from '../../context/AuthContext.jsx'; 
import { getInternContracts, confirmContractApi } from '../../api/contractApi.js'; 
import '../../styles/dashBoard.css'; 
import '../../styles/contractPage.css'; 

const ContractPage = () => {
  const { user, token } = useContext(AuthContext);
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [filter, setFilter] = useState({ q: "", status: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- HÀM HỖ TRỢ: LẤY ID AN TOÀN ---
  // Backend có thể trả về id, contractId, hoặc documentId. Hàm này xử lý tất cả.
  const getContractId = (c) => {
    if (!c) return null;
    return c.id || c.contractId || c.documentId;
  };

  // --- 1. LOGIC LẤY DỮ LIỆU ---
  const fetchContracts = async () => {
    if (!user?.userId || !token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const data = await getInternContracts(token, user.userId); 
      
      // LOG DEBUG: Kiểm tra cấu trúc dữ liệu trong Console (F12)
      console.log("🔥 Dữ liệu hợp đồng từ API:", data);
      if (data.length > 0) {
        console.log("🔍 Key của hợp đồng đầu tiên:", Object.keys(data[0]));
        console.log("🔍 ID tìm được:", getContractId(data[0]));
      }

      setContracts(data);
      setSelectedContract(null);
    } catch (err) {
      console.error("Failed to fetch contracts:", err);
      toast.error("Không thể tải danh sách hợp đồng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [user?.userId, token]);

  // --- 2. LOGIC LỌC ---
  const filteredContracts = useMemo(() => {
    if (!contracts) return [];

    const searchLower = filter.q ? filter.q.toLowerCase().trim() : "";

    return contracts.filter(c => {
      const id = getContractId(c);
      
      // Lọc theo trạng thái
      const confirmStatus = c.internConfirmStatus;
      let statusMatch = true;
      
      if (filter.status) {
          if (filter.status === 'PENDING') {
            statusMatch = confirmStatus === 'PENDING';
          } else if (filter.status === 'ACTIVE' || filter.status === 'COMPLETED') {
            statusMatch = confirmStatus === 'APPROVED'; 
          } else {
            statusMatch = confirmStatus === filter.status; 
          }
      }

      // Lọc theo từ khóa
      const displayTitle = c.note || c.title || `Hợp đồng số ${id}`; 
      
      const qMatch = !searchLower || 
                     (displayTitle && displayTitle.toLowerCase().includes(searchLower)) || 
                     (id && id.toString().includes(searchLower));
      
      return statusMatch && qMatch;
    });
  }, [contracts, filter]);

  const handleConfirm = async (contract) => {
  const contractId = getContractId(contract);
  if (!contractId) return toast.error("Lỗi ID hợp đồng");

  // CHỈ CHO PHÉP KHI LÀ PENDING HOẶC NULL/EMPTY
  const status = (contract.internConfirmStatus || '').toString().trim().toUpperCase();
  if (status && status !== 'PENDING') {
    toast.warn("Hợp đồng đã được xác nhận rồi!");
    setIsModalOpen(false);
    return;
  }

  try {
    const apiResponse = await confirmContractApi(token, contractId);
    
    const newStatusData = apiResponse.contract || {}; 
    
    
    const originalContract = contracts.find(c => getContractId(c) === contractId) || contract;

    
    const updated = {
      ...originalContract, 
      ...newStatusData,    
      
      // Đảm bảo status là 'APPROVED'
      internConfirmStatus: 'APPROVED', 
    };

    // BƯỚC 4: Cập nhật state với object đầy đủ
    setContracts(prev => prev.map(c => getContractId(c) === contractId ? updated : c));
    setSelectedContract(updated);
    
    toast.success("Xác nhận thành công!");
    setIsModalOpen(false);
  } catch (err) {
    console.error(err);
    toast.error("Xác nhận thất bại!");
  }
};

  const handleOpenConfirmModal = (contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const handleCloseViewer = () => {
    setSelectedContract(null);
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <InternSidebar />
        <div className="dashboard-content">
          <h2 style={{ marginBottom: 20 }}>📑 Quản lý Hợp đồng</h2>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <InternSidebar />
      <div className="dashboard-content">
        <h2 style={{ marginBottom: 20 }}>📑 Quản lý Hợp đồng</h2>
        
        {/* GIAO DIỆN CHÍNH */}
        <div className="contract-main-view">
          <ContractFilter filter={filter} onChange={setFilter} />
          
          <ContractList 
              contracts={filteredContracts.map(c => {
                const id = getContractId(c); // Sử dụng hàm lấy ID an toàn
                return {
                  id: id, // Đảm bảo id luôn có giá trị
                  title: c.note || `Hợp đồng số ${id}`,
                  status: c.internConfirmStatus,
                  createdAt: c.createdAt,
                  effectiveDate: c.confirmAt,
                  content: c.filePath 
                };
              })} 
              onSelect={(contractData) => {
                  // Tìm hợp đồng gốc dựa trên ID
                  const fullContract = contracts.find(c => getContractId(c) === contractData.id);
                  setSelectedContract(fullContract);
              }} 
              
          />
        </div>

        {/* GIAO DIỆN POPUP */}
        {selectedContract && (
          <ContractViewer 
            contract={{
              id: getContractId(selectedContract),
              code: getContractId(selectedContract),
              title: selectedContract.note || `Hợp đồng số ${getContractId(selectedContract)}`,
              status: selectedContract.internConfirmStatus,
              effectiveDate: selectedContract.confirmAt,
              confirmedAt: selectedContract.confirmAt,
              content: selectedContract.filePath
            }} 
            onConfirm={handleOpenConfirmModal}
            onClose={handleCloseViewer} 
          />
        )}
      </div>

      {/* Modal Confirm */}
      <ConfirmContractModal 
        open={isModalOpen}
        contract={selectedContract ? {
            ...selectedContract, // Copy toàn bộ dữ liệu gốc
            id: getContractId(selectedContract), // Đảm bảo ID chuẩn
            title: selectedContract.note || `Hợp đồng số ${getContractId(selectedContract)}`,
        } : null}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default ContractPage;