// src/pages/Intern/ContractPage.jsx

import React, { useState, useMemo, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import InternSidebar from '../../components/Layout/InternSidebar.jsx'; 
import ConfirmContractModal from '../../components/Contracts/ConfirmContractModal.jsx';
import ContractFilter from '../../components/Contracts/ContractFilter.jsx';
import ContractList from '../../components/Contracts/ContractList.jsx';
import ContractViewer from '../../components/Contracts/ContractViewer.jsx';
import { AuthContext } from '../../context/AuthContext.jsx'; 
import { getInternByUserId } from '../../api/internApi.js';
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
  
  const [currentInternId, setCurrentInternId] = useState(null);

  // --- HÀM HỖ TRỢ: LẤY ID HỢP ĐỒNG ---
  const getContractId = (c) => {
    if (!c) return null;
    return c.documentId || c.id || c.contractId;
  };

  // --- 1. LOGIC LẤY DỮ LIỆU ---
  const fetchAllData = async () => {
    if (!user?.userId || !token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      let internIdToUse = currentInternId;

      // BƯỚC 1: Tìm Intern ID
      if (!internIdToUse) {
        try {
          const responseData = await getInternByUserId(token, user.userId);
          const profile = responseData.internProfile || responseData; 
          const foundId = profile.id || profile.internId; //
          
          if (foundId) {
            internIdToUse = foundId;
            setCurrentInternId(internIdToUse);
            console.log("✅ Tìm thấy Intern ID:", internIdToUse);
          } else {
            throw new Error("Không tìm thấy ID trong hồ sơ thực tập");
          }
        } catch (error) {
          console.error("Lỗi lấy Intern Profile:", error);
          if (error.response && error.response.status === 404) {
            toast.info("Bạn chưa có hồ sơ thực tập.");
          }
          setLoading(false);
          return; 
        }
      }

      // BƯỚC 2: Lấy Hợp đồng
      if (internIdToUse) {
        const contractData = await getInternContracts(token, internIdToUse);
        setContracts(contractData);
      }
      setSelectedContract(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      toast.error("Lỗi khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user?.userId, token]);

  // --- 2. LOGIC LỌC ---
  const filteredContracts = useMemo(() => {
    if (!contracts) return [];
    const searchLower = filter.q ? filter.q.toLowerCase().trim() : "";

    return contracts.filter(c => {
      const id = getContractId(c);
      const confirmStatus = c.internConfirmStatus;
      let statusMatch = true;
      
      if (filter.status) {
          if (filter.status === 'PENDING') statusMatch = confirmStatus === 'PENDING';
          else if (filter.status === 'ACTIVE') statusMatch = confirmStatus === 'APPROVED'; 
          else statusMatch = confirmStatus === filter.status; 
      }

      const displayTitle = c.note || `Hợp đồng số ${id}`; 
      const qMatch = !searchLower || 
                     (displayTitle && displayTitle.toLowerCase().includes(searchLower)) || 
                     (id && id.toString().includes(searchLower));
      
      return statusMatch && qMatch;
    });
  }, [contracts, filter]);

  // --- 3. LOGIC XÁC NHẬN (ĐÃ FIX LỖI) ---
  const handleConfirm = async (contract) => {
    const contractId = getContractId(contract);
    if (!contractId) return toast.error("Lỗi dữ liệu: Không tìm thấy ID hợp đồng");

    
    const original = contracts.find(c => getContractId(c) === contractId) || contract;
    const status = (original.internConfirmStatus || '').toString().trim().toUpperCase();

    if (status && status !== 'PENDING') {
      toast.warn("Hợp đồng này không ở trạng thái chờ xác nhận.");
      setIsModalOpen(false);
      return;
    }

    try {
      const apiResponse = await confirmContractApi(token, contractId);
      
      // Update UI
      const updateList = (prev) => prev.map(c => 
        getContractId(c) === contractId ? { ...c, internConfirmStatus: 'APPROVED', confirmAt: new Date().toISOString() } : c
      );

      setContracts(updateList);
      
      // Cập nhật selectedContract bằng object đầy đủ đã update
      const updatedFullContract = { 
          ...original, 
          internConfirmStatus: 'APPROVED', 
          confirmAt: new Date().toISOString() 
      };
      setSelectedContract(updatedFullContract);
      
      toast.success("Xác nhận hợp đồng thành công!");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Confirm error:", err);
      toast.error("Xác nhận thất bại.");
    }
  };

  const handleOpenConfirmModal = () => {
    setIsModalOpen(true);
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
        
        <div className="contract-main-view">
          <ContractFilter filter={filter} onChange={setFilter} />
          
          <ContractList 
              contracts={filteredContracts.map(c => {
                const id = getContractId(c); 
                return {
                  id: id, 
                  title: c.note || `Hợp đồng số ${id}`,
                  status: c.internConfirmStatus,
                  createdAt: c.confirmAt,
                  effectiveDate: c.confirmAt,
                  content: c.filePath 
                };
              })} 
              onSelect={(contractData) => {
                  // Khi click vào dòng -> Lưu object GỐC ĐẦY ĐỦ vào state
                  const fullContract = contracts.find(c => getContractId(c) === contractData.id);
                  setSelectedContract(fullContract);
              }} 
          />
        </div>

        {selectedContract && (
          <ContractViewer 
            contract={{
              id: getContractId(selectedContract),
              code: getContractId(selectedContract),
              title: selectedContract.note || `Hợp đồng số ${getContractId(selectedContract)}`,
              status: selectedContract.internConfirmStatus, // Mapping status cho Viewer
              effectiveDate: selectedContract.confirmAt,
              confirmedAt: selectedContract.confirmAt,
              content: selectedContract.filePath
            }} 
            onConfirm={handleOpenConfirmModal} // Gọi hàm mở modal
            onClose={() => setSelectedContract(null)} 
          />
        )}
      </div>

      <ConfirmContractModal 
        open={isModalOpen}
        contract={selectedContract ? {
            ...selectedContract,
            id: getContractId(selectedContract),
            title: selectedContract.note || `Hợp đồng số ${getContractId(selectedContract)}`
        } : null}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default ContractPage;