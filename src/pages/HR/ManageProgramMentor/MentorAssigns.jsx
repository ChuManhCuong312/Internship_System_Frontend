import React, { useState } from "react";
import HRSidebar from "../../../components/Layout/HRSidebar";
import "../../../styles/manageUsers.css";
import AssignInternForm from "./AssignInternForm";
import Pagination from "../../../components/Common/Pagination";

const MentorAssigns = () => {
  const [selectedTab, setSelectedTab] = useState("interns");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10

  const [interns, setInterns] = useState([
    { id: 1, name: "Trần Thị B", mentorName: "Nguyễn Văn A" },
    { id: 2, name: "Phạm Văn D", mentorName: "Lê Văn C" },
    { id: 3, name: "Ngô Văn E", mentorName: null },
    { id: 4, name: "Lê Thị G", mentorName: null },
    { id: 5, name: "Đặng Văn H", mentorName: null },
    { id: 6, name: "Nguyễn Thị I", mentorName: null },
  ]);

  const [mentors, setMentors] = useState([
    { id: 1, name: "Nguyễn Văn A", interns: ["Trần Thị B", "Ngô Văn E"] },
    { id: 2, name: "Lê Văn C", interns: ["Phạm Văn D"] },
  ]);


  // Modal states
  const [showInternModal, setShowInternModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [selectedMentorName, setSelectedMentorName] = useState("");

  const [showMentorModal, setShowMentorModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedInterns, setSelectedInterns] = useState([]);

  // Filter logic
  const filteredInterns = interns
    .filter((intern) => intern.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((intern) => {
      if (sortOption === "withMentor") return intern.mentorName;
      if (sortOption === "withoutMentor") return !intern.mentorName;
      return true;
    });




  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInterns.slice(indexOfFirstItem, indexOfLastItem);


  const totalPages = Math.ceil(
     filteredInterns.length  / itemsPerPage
  );

  // Open intern modal
  const handleOpenInternModal = (intern) => {
    setSelectedIntern(intern);
    setSelectedMentorName(intern.mentorName || "");
    setShowInternModal(true);
  };

  // Save intern assignment
  const handleSaveInternAssignment = () => {
    setInterns((prev) =>
      prev.map((i) =>
        i.id === selectedIntern.id ? { ...i, mentorName: selectedMentorName } : i
      )
    );
    setShowInternModal(false);
  };

  // Open mentor modal
  const handleOpenMentorModal = (mentor) => {
    setSelectedMentor(mentor);
    setSelectedInterns(mentor.interns);
    setShowMentorModal(true);
  };

  // Save mentor assignment
  const handleSaveMentorAssignment = () => {
    setMentors((prev) =>
      prev.map((m) =>
        m.id === selectedMentor.id ? { ...m, interns: selectedInterns } : m
      )
    );
    setInterns((prev) =>
      prev.map((intern) =>
        selectedInterns.includes(intern.name)
          ? { ...intern, mentorName: selectedMentor.name }
          : intern
      )
    );
    setShowMentorModal(false);
  };

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="mentor-assign-container">


        {/* Right Content */}
        <div className="right-content">


          <div className="manage-users-header">
                <h2 class="page-title">{selectedTab === "interns" ? "Danh sách thực tập sinh" : "Phân công Mentor"}</h2>
                  <div className="header-actions">
            <input
              type="text"
              placeholder={`Search ${selectedTab}...`}
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
          <div className = "users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Thực tập sinh</th>
                <th>Mentor</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredInterns.map((intern, index) => (
                <tr key={intern.id}>
                  <td>{index + 1}</td>
                  <td>{intern.name}</td>
                  <td>{intern.mentorName || "Chưa có Mentor"}</td>
                  <td>
                    <button
                      className="assign-btn"
                      onClick={() => handleOpenInternModal(intern)}
                    >
                      {intern.mentorName ? "Đổi Mentor" : "Phân công Mentor"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems= {filteredInterns.length}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* Modals */}

{showInternModal && (
  <AssignInternForm
    intern={selectedIntern}
    mentors={mentors}
    selectedMentor={selectedMentorName}
    onSelectMentor={setSelectedMentorName}
    onSave={handleSaveInternAssignment}
    onClose={() => setShowInternModal(false)}
  />
)}


      {showMentorModal && (
        <AssignMentorForm
          mentor={selectedMentor}
          interns={interns}
          onSave={(selectedInterns) => {
            setMentors((prev) =>
              prev.map((m) =>
                m.id === selectedMentor.id ? { ...m, interns: selectedInterns } : m
              )
            );
            setInterns((prev) =>
              prev.map((intern) =>
                selectedInterns.includes(intern.name)
                  ? { ...intern, mentorName: selectedMentor.name }
                  : intern
              )
            );
            setShowMentorModal(false);
          }}
          onClose={() => setShowMentorModal(false)}
        />
      )}
    </div>
  );
};

export default MentorAssigns;