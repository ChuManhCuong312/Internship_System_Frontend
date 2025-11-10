// src/pages/hr/ApproveDocs.jsx
import React, { useState, useEffect, useContext } from "react";
import HRSidebar from "../../../components/Layout/HRSidebar";
import Pagination from "../../../components/Common/Pagination";
import { AuthContext } from "../../../context/AuthContext";

import HRInternHeader from "./component/HRInternHeader";
import HRInternTable from "./component/HRInternTable";
import RejectModal from "./modals/RejectModal";
import ContractModal from "./modals/ContractModal";

import { InternsContext } from "../../../context/InternsContext";
import "../../../styles/manageUsers.css";

const ApproveDocs = () => {
  const { user: loggedInUser } = useContext(AuthContext);
  const isHR = loggedInUser?.role === "HR";

  const { interns, setInterns } = useContext(InternsContext);

  const [filteredInterns, setFilteredInterns] = useState(interns);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [internsPerPage] = useState(10);
  const [modalSuccess, setModalSuccess] = useState("");

  // Approve modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);

  const [selectedIntern, setSelectedIntern] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [contractFile, setContractFile] = useState(null);
  const [contractError, setContractError] = useState("");

  useEffect(() => {
    let result = interns;
    if (searchTerm) {
      result = result.filter(
        (i) =>
          (i.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (i.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) {
      result = result.filter((i) => i.status === statusFilter);
    }
    setFilteredInterns(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, interns]);

  const indexOfLast = currentPage * internsPerPage;
  const indexOfFirst = indexOfLast - internsPerPage;
  const currentInterns = filteredInterns.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredInterns.length / internsPerPage);

  const notify = (msg) => {
    setModalSuccess(msg);
    setTimeout(() => setModalSuccess(""), 3000);
  };

  const handleApprove = (id) => {
    setInterns((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "Đã duyệt" } : i))
    );
    notify("✅ Đã duyệt hồ sơ thành công");
  };

  const handleReject = (id) => {
    const intern = interns.find((i) => i.id === id);
    setSelectedIntern(intern);
    setRejectReason("");
    setRejectError("");
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectReason || !rejectReason.trim()) {
      setRejectError("Vui lòng nhập lý do từ chối");
      return;
    }
    setInterns((prev) =>
      prev.map((i) =>
        i.id === selectedIntern.id ? { ...i, status: "Bị từ chối", rejectReason } : i
      )
    );
    setShowRejectModal(false);
    setRejectReason("");
    setRejectError("");
    notify("❌ Đã từ chối hồ sơ");
  };

  const handleSendContract = (id) => {
    const intern = interns.find((i) => i.id === id);
    setSelectedIntern(intern);
    setContractFile(null);
    setContractError("");
    setShowContractModal(true);
  };

  const confirmSendContract = () => {
    if (!contractFile) {
      setContractError("Vui lòng chọn file hợp đồng");
      return;
    }
    setInterns((prev) =>
      prev.map((i) =>
        i.id === selectedIntern.id
          ? {
              ...i,
              status: "Hợp đồng hoàn tất",
              documents: [...(i.documents || []), contractFile.name || contractFile],
            }
          : i
      )
    );
    setShowContractModal(false);
    setContractFile(null);
    setContractError("");
    notify("📤 Đã gửi hợp đồng và hoàn tất");
  };

  const handleUnlock = (id) => {
    setInterns((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "Chờ duyệt" } : i))
    );
    notify("🔓 Hồ sơ đã được mở lại để duyệt");
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
