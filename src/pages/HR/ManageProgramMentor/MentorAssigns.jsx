import React, { useState, useContext, useEffect } from "react";
import HRSidebar from "../../../components/Layout/HRSidebar";
import Pagination from "../../../components/Common/Pagination";
import { InternsContext } from "../../../context/InternsContext";
import { AuthContext } from "../../../context/AuthContext";
import "../../../styles/manageUsers.css";



const MentorAssigns = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMentor, setFilterMentor] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filteredAssignments, setFilteredAssignments] = useState([]);

  // ✅ Static data
  const mentorAssignments = [
    { id: 1, mentorName: "Nguyễn Văn A", internName: "Trần Thị B", assignedAt: "2025-11-13 10:00" },
    { id: 2, mentorName: "Lê Văn C", internName: "Phạm Văn D", assignedAt: "2025-11-13 11:00" },
    { id: 3, mentorName: "Nguyễn Văn A", internName: "Ngô Văn E", assignedAt: "2025-11-13 12:00" },
    { id: 4, mentorName: "Lê Văn C", internName: "Đặng Thị F", assignedAt: "2025-11-13 13:00" },
    // Add more static rows if needed
  ];

  // ✅ Filter logic without infinite loop
  useEffect(() => {
    let result = mentorAssignments;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.mentorName.toLowerCase().includes(q) ||
          item.internName.toLowerCase().includes(q)
      );
    }
    if (filterMentor) {
      result = result.filter((item) => item.mentorName === filterMentor);
    }
    setFilteredAssignments(result);
    setCurrentPage(1);
  }, [searchTerm, filterMentor]); // ✅ Removed mentorAssignments from dependencies

  // ✅ Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredAssignments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="dashboard-content manage-users-content">
        {/* Header */}
        <div className="mentor-assign-header">
          <h1 className="page-title">Phân công Mentor</h1>
          <div className="header-actions">
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="filter-select"
              value={filterMentor}
              onChange={(e) => setFilterMentor(e.target.value)}
            >
              <option value="">Lọc theo Mentor</option>
              <option value="Nguyễn Văn A">Nguyễn Văn A</option>
              <option value="Lê Văn C">Lê Văn C</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <table className="mentor-assign-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên Mentor</th>
              <th>Tên Intern</th>
              <th>Phân công lúc</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{indexOfFirst + index + 1}</td>
                  <td>{item.mentorName}</td>
                  <td>{item.internName}</td>
                  <td>{item.assignedAt}</td>
                  <td>
                    <button className="action-btn">Xóa</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">Không tìm thấy dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredAssignments.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default MentorAssigns;