import React, { useState, useEffect, useContext } from "react";
import HRSidebar from "../../../components/Layout/HRSidebar";
import "../../../styles/manageUsers.css";
import AssignInternForm from "./AssignInternForm";
import Pagination from "../../../components/Common/Pagination";
import hrApi from "../../../api/hrApi";
import { AuthContext } from "../../../context/AuthContext";

const MentorAssigns = () => {
  const { token } = useContext(AuthContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);


  const [interns, setInterns] = useState([]);
  const [mentors, setMentors] = useState([]);

  // modal states
  const [showInternModal, setShowInternModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [selectedMentorId, setSelectedMentorId] = useState(null);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("")

  useEffect(() => {
    if (!token) return;
    loadData(); // initial load
    loadMentors();
  }, [token]);

  // load interns with current filters

  const loadData = async (page = currentPage) => {
    try {
        const filter = sortOption === "withMentor" ? "withMentor" : sortOption === "withoutMentor" ? "withoutMentor" : "all";
        const data = await hrApi.getInternAssignments(token, { search: searchTerm, filter, page, size: itemsPerPage });

        setInterns(data.data);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
    } catch (err) {
        console.error("Failed to load interns:", err);
    }
  };



  const loadMentors = async () => {
    try {
      const data = await hrApi.getAllMentors(token);
      setMentors(data);
    } catch (err) {
      console.error("Failed to load mentors:", err);
    }
  };

  // call whenever search or filter changes
  useEffect(() => {
    setCurrentPage(1);
    loadData(1);
  }, [searchTerm, sortOption]);

  // open modal
  const handleOpenInternModal = (intern) => {
    setSelectedIntern(intern);
    setSelectedMentorId(intern.mentorId || "");
    loadMentors();
    setShowInternModal(true);
  };

  const handleSaveInternAssignment = async () => {
    try {
      if (!selectedIntern) return;

      if (selectedIntern.mentorId) {
        // reassign
        await hrApi.reassignMentor(token, {
          internId: selectedIntern.internId,
          mentorId: selectedMentorId
        });
      } else {
        // assign
        await hrApi.assignMentor(token, {
          internId: selectedIntern.internId,
          mentorId: selectedMentorId
        });
      }

      await loadData(); // refresh list
      setShowInternModal(false);
      showToast(selectedIntern.mentorId ? "Phân công lại thành công!" : "Phân công thành công!", "success");
    } catch (err) {
      console.error("Assign failed:", err);
      showToast("Có lỗi xảy ra khi phân công!", "error");
    }
  };

  const showToast = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
        setToastMessage("");
        setToastType("");
    }, 3000);
  };

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="mentor-assign-container">
        <div className="right-content">
          <div className="manage-users-header">
            <h2 className="page-title">Danh sách thực tập sinh</h2>
            <div className="header-actions">
              <input
                type="text"
                placeholder="Tìm thực tập sinh, mentor..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="filter-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="">Tất cả thực tập sinh</option>
                <option value="withMentor">Đã phân công Mentor</option>
                <option value="withoutMentor">Chưa phân công Mentor</option>
              </select>
            </div>
          </div>

          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Thực tập sinh</th>
                  <th>Mentor</th>
                  <th>Phân công lúc</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {interns.map((intern, idx) => (
                  <tr key={intern.internId}>
                    <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td>{intern.internName}</td>
                    <td>{intern.mentorName || "Chưa có Mentor"}</td>
                    <td>{intern.assignedAt ? new Date(intern.assignedAt).toLocaleString() : "-"}</td>
                    <td>
                      {intern.internConfirmStatus !== "APPROVED" ? (
                        <span style={{ color: "red" }}>TTS chưa xác nhận hợp đồng</span>
                      ) : (
                        <button
                          className="assign-btn"
                          onClick={() => handleOpenInternModal(intern)}
                        >
                          {intern.mentorId ? "Phân công lại Mentor" : "Phân công Mentor"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={(page) => {
                setCurrentPage(page);
                loadData(page); // reload data when page changes
                }}
            />
        </div>
      </div>

      {showInternModal && selectedIntern && (
        <AssignInternForm
          intern={selectedIntern}
          mentors={mentors}
          selectedMentor={selectedMentorId}
          onSelectMentor={setSelectedMentorId}
          onSave={handleSaveInternAssignment}
          onClose={() => setShowInternModal(false)}
        />
      )}

      {/* ✅ Toast Notification */}
      {toastMessage && (
            <div className={`toast ${toastType}`}>
                {toastMessage}
            </div>
      )}
    </div>
  );
};

export default MentorAssigns;