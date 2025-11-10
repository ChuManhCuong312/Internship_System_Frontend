import React, { useState, useContext, useEffect } from "react";
import HRSidebar from "../../../components/Layout/HRSidebar";
import Pagination from "../../../components/Common/Pagination";
import HRInternHeader from "./component/HRInternHeader";
import HRInternTable from "./component/HRInternTable";
import RejectModal from "./modals/RejectModal";
import ContractModal from "./modals/ContractModal";
import { InternsContext } from "../../../context/InternsContext";
import { AuthContext } from "../../../context/AuthContext";
import "../../../styles/manageUsers.css";

const ApproveDocs = () => {
  const { user: loggedInUser } = useContext(AuthContext);
  const isHR = loggedInUser?.role === "HR";

  const {
    interns,
    loading,
    editIntern,
  } = useContext(InternsContext);

  const [filteredInterns, setFilteredInterns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [internsPerPage] = useState(10);
  const [modalSuccess, setModalSuccess] = useState("");
const [majorFilter, setMajorFilter] = useState("");

  // Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);

  // Reject state
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  // Contract state
  const [contractFile, setContractFile] = useState(null);
  const [contractError, setContractError] = useState("");

  useEffect(() => {
    if (!loading) {
      let result = interns;

      if (statusFilter) {
        result = result.filter((i) => i.status === statusFilter);
      } else {
        result = result.filter((i) =>
          ["PENDING", "APPROVED", "REJECTED"].includes(i.status)
        );
      }

      if (majorFilter) {
        result = result.filter((i) =>
          (i.major || "").toLowerCase().includes(majorFilter.toLowerCase())
        );
      }

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        result = result.filter(
          (i) =>
            (i.fullName || "").toLowerCase().includes(q) ||
            (i.email || "").toLowerCase().includes(q)
        );
      }

      setFilteredInterns(result);
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, majorFilter, interns, loading]);


  const indexOfLast = currentPage * internsPerPage;
  const indexOfFirst = indexOfLast - internsPerPage;
  const currentInterns = filteredInterns.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredInterns.length / internsPerPage);

  const notify = (msg) => {
    setModalSuccess(msg);
    setTimeout(() => setModalSuccess(""), 3000);
  };

  // Approve
  const handleApprove = async (intern) => {
    try {
      await editIntern(intern.internId, { ...intern, status: "APPROVED" });
      notify("✅ Đã duyệt hồ sơ thành công");
    } catch (err) {
      console.error(err);
      notify("❌ Lỗi khi duyệt hồ sơ");
    }
  };

  // Reject
  const handleReject = (intern) => {
    setSelectedIntern(intern);
    setRejectReason("");
    setRejectError("");
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      setRejectError("Vui lòng nhập lý do từ chối");
      return;
    }
    try {
      await editIntern(selectedIntern.internId, {
        ...selectedIntern,
        status: "REJECTED",
        rejectReason,
      });
      setShowRejectModal(false);
      notify("❌ Đã từ chối hồ sơ");
    } catch (err) {
      console.error(err);
      notify("❌ Lỗi khi từ chối hồ sơ");
    }
  };

  // Send contract
  const handleSendContract = (intern) => {
    setSelectedIntern(intern);
    setContractFile(null);
    setContractError("");
    setShowContractModal(true);
  };

  const confirmSendContract = async () => {
    if (!contractFile) {
      setContractError("Vui lòng chọn file hợp đồng");
      return;
    }
    try {
      await editIntern(selectedIntern.internId, {
        ...selectedIntern,
        status: "COMPLETED",
        documents: [
          ...(selectedIntern.documents || []),
          contractFile.name || contractFile,
        ],
      });
      setShowContractModal(false);
      notify("📤 Đã gửi hợp đồng và hoàn tất");
    } catch (err) {
      console.error(err);
      notify("❌ Lỗi khi gửi hợp đồng");
    }
  };

  // Unlock
  const handleUnlock = async (intern) => {
    try {
      await editIntern(intern.internId, { ...intern, status: "PENDING" });
      notify("🔓 Hồ sơ đã được mở lại để duyệt");
    } catch (err) {
      console.error(err);
      notify("❌ Lỗi khi mở lại hồ sơ");
    }
  };

  if (!isHR) {
    return (
      <div className="dashboard-layout">
        <HRSidebar />
        <div className="dashboard-content">
          <h2 className="page-title">Bạn không có quyền truy cập trang này.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="dashboard-content manage-users-content">
        <HRInternHeader
          title="Phê duyệt và phản hồi"
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
            setMajorFilter={setMajorFilter}
        />

        {modalSuccess && <div className="success-message">{modalSuccess}</div>}

        <HRInternTable
          interns={currentInterns}
          handlers={{
            handleApprove,
            handleReject,
            handleSendContract,
            handleUnlock,
          }}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredInterns.length}
          onPageChange={setCurrentPage}
        />

        {showRejectModal && (
          <RejectModal
            intern={selectedIntern}
            reason={rejectReason}
            setReason={setRejectReason}
            onClose={() => setShowRejectModal(false)}
            onConfirm={confirmReject}
            error={rejectError}
          />
        )}

        {showContractModal && (
          <ContractModal
            intern={selectedIntern}
            contractFile={contractFile}
            setContractFile={setContractFile}
            onClose={() => setShowContractModal(false)}
            onConfirm={confirmSendContract}
            error={contractError}
          />
        )}
      </div>
    </div>
  );
};

export default ApproveDocs;
