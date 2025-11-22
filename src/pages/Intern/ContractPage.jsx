// src/pages/Intern/ContractPage.jsx

import React, { useState, useMemo, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import InternSidebar from '../../components/Layout/InternSidebar.jsx'; 
import ConfirmContractModal from '../../components/Contracts/ConfirmContractModal.jsx';
import ContractFilter from '../../components/Contracts/ContractFilter.jsx';
import ContractList from '../../components/Contracts/ContractList.jsx';
import ContractStatusBadge from '../../components/Contracts/ContractStatusBadge.jsx';
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

  // --- LOGIC LẤY DỮ LIỆU ---
  const fetchContracts = async () => {
    if (!user?.userId || !token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Backend controller có endpoint /intern/{internId}
      // Tôi giả định internId ở đây là userId của Intern
      const data = await getInternContracts(token, user.userId); 
      console.log("DT: ", data.data);
      setContracts(data);
      // Mặc định chọn hợp đồng đầu tiên để hiển thị chi tiết
      if (data.length > 0) {
        setSelectedContract(data[0]);
      }
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


  // --- LOGIC LỌC HỢP ĐỒNG ---
 // Trong file ContractPage.jsx

const filteredContracts = useMemo(() => {
  if (!contracts) return [];

  // Chuẩn hóa chuỗi tìm kiếm: chữ thường + bỏ khoảng trắng thừa
  const searchLower = filter.q ? filter.q.toLowerCase().trim() : "";

  return contracts.filter(c => {
    // 1. Logic lọc theo trạng thái (Giữ nguyên như cũ)
    const confirmStatus = c.internConfirmStatus;
    let statusMatch = true;
    if (filter.status) {
        if (filter.status === 'PENDING') {
          statusMatch = confirmStatus === 'PENDING';
        } else if (filter.status === 'ACTIVE' || filter.status === 'COMPLETED') {
          statusMatch = confirmStatus === 'APPROVED';
        } else {
          // Nếu filter status khác các case trên, so sánh trực tiếp
          statusMatch = confirmStatus === filter.status; 
        }
    }

    // 2. Logic tìm kiếm (ĐÃ SỬA LỖI)
    // Xác định tên hiển thị thực tế giống như lúc hiển thị trong bảng (ContractList)
    // Nếu ở bảng bạn hiển thị c.note, thì ở đây phải tìm theo c.note
    const displayTitle = c.note || c.title || `Hợp đồng số ${c.id}`; 
    
    const qMatch = !searchLower || 
                   (displayTitle && displayTitle.toLowerCase().includes(searchLower)) || 
                   (c.id && c.id.toString().includes(searchLower));
    
    return statusMatch && qMatch;
  });
}, [contracts, filter]);

  // --- LOGIC XỬ LÝ XÁC NHẬN ---
  const handleConfirm = async (contract) => {
    if (contract.internConfirmStatus !== 'PENDING') {
      toast.warn("Hợp đồng này đã được xác nhận hoặc không ở trạng thái chờ.");
      setIsModalOpen(false);
      return;
    }

    try {
      // Gọi API để cập nhật trạng thái xác nhận sang APPROVED
      const apiResponse = await confirmContractApi(token, contract.id);
      
      if (apiResponse && apiResponse.contract) {
        // Cập nhật danh sách hợp đồng trong state
        const updatedContracts = contracts.map(c => 
          c.id === contract.id ? apiResponse.contract : c
        );
        setContracts(updatedContracts);
        
        // Cập nhật hợp đồng đang được chọn
        setSelectedContract(apiResponse.contract);
        
        toast.success(apiResponse.message || `Đã xác nhận thành công hợp đồng: ${contract.title}`);
      } else {
        throw new Error("API response is invalid.");
      }
      
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Xác nhận thất bại. Vui lòng thử lại.");
      console.error("Confirmation error:", error);
    }
  };

  // Mở modal xác nhận
  const handleOpenConfirmModal = (contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <InternSidebar />
        <div className="dashboard-content">
          <h2 style={{ marginBottom: 20 }}>📑 Quản lý Hợp đồng</h2>
          <p>Đang tải dữ liệu hợp đồng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <InternSidebar />
      <div className="dashboard-content">
        <h2 style={{ marginBottom: 20 }}>📑 Quản lý Hợp đồng</h2>
        
        <div style={{ display: 'flex', gap: 20 }}>
          {/* Phần Danh sách và Lọc */}
          <div style={{ flex: 2, minWidth: '450px' }}>
            <ContractFilter filter={filter} onChange={setFilter} />
            <ContractList 
                contracts={filteredContracts.map(c => ({
                    // Map data từ backend sang định dạng ContractList
                    id: c.id,
                    title: c.note || `Hợp đồng số ${c.id}`, // Giả định dùng note/id làm title nếu không có field title
                    status: c.internConfirmStatus, // Sử dụng internConfirmStatus
                    createdAt: c.createdAt,
                    effectiveDate: c.confirmAt, // Giả định ngày hiệu lực là ngày xác nhận
                    content: c.filePath // Giả định nội dung là filePath để xem, hoặc cần thêm API lấy chi tiết
                }))} 
                onSelect={(contractData) => {
                    // Tìm lại object đầy đủ từ state Contracts
                    const fullContract = contracts.find(c => c.id === contractData.id);
                    setSelectedContract(fullContract);
                }} 
            />
          </div>

          {/* Phần Xem chi tiết */}
          <div style={{ flex: 1, minWidth: '350px' }}>
            <ContractViewer 
              contract={selectedContract ? {
                // Map selected contract cho ContractViewer
                id: selectedContract.id,
                code: selectedContract.id,
                title: selectedContract.note || `Hợp đồng số ${selectedContract.id}`,
                status: selectedContract.internConfirmStatus,
                
                effectiveDate: selectedContract.confirmAt,
                confirmedAt: selectedContract.confirmAt,
                content: selectedContract.filePath // Hiển thị đường dẫn file hoặc nội dung
              } : null} 
              onConfirm={handleOpenConfirmModal} 
            />
          </div>
        </div>
      </div>

      {/* Modal xác nhận */}
      <ConfirmContractModal 
        open={isModalOpen}
        contract={selectedContract ? {
            id: selectedContract.id,
            title: selectedContract.note || `Hợp đồng số ${selectedContract.id}`,
            // Chỉ cần ID và Title cho modal
        } : null}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default ContractPage;