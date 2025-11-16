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

  const [interns, setInterns] = useState([]);
  const [mentors, setMentors] = useState([]);

  // modal states
  const [showInternModal, setShowInternModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [selectedMentorId, setSelectedMentorId] = useState(null);

  useEffect(() => {
    if (!token) return;
    loadData(); // initial load
    loadMentors();
  }, [token]);

  // load interns with current filters
  const loadData = async () => {
    try {
      const filter = sortOption === "withMentor" ? "withMentor" : sortOption === "withoutMentor" ? "withoutMentor" : "all";
      const data = await hrApi.getInternAssignments(token, { search: searchTerm, filter });
      setInterns(data);
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
    loadData();
  }, [searchTerm, sortOption]);

  // open modal
  const handleOpenInternModal = (intern) => {
    setSelectedIntern(intern);
    setSelectedMentorId(intern.mentorId || "");
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
    } catch (err) {
      console.error("Assign failed:", err);
      alert(err?.response?.data?.message || err?.message || "Assign failed");
    }
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
                <option value="">Lọc thực tập sinh</option>
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
                    <td>{idx + 1}</td>
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
            totalPages={1}
            totalItems={interns.length}
            onPageChange={(page) => setCurrentPage(page)}
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
    </div>
  );
};

export default MentorAssigns;