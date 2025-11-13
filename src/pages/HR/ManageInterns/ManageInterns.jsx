import React, { useEffect, useState, useContext } from "react";
import hrApi from "../../../api/hrApi";
import HRInternTable from "./component/HRInternTable";
import HRSidebar from "../../../components/Layout/HRSidebar";
import { AuthContext } from "../../../context/AuthContext";
import HRInternHeader from "./component/HRInternHeader";

const ManageInterns = () => {
  const { token } = useContext(AuthContext);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [majorFilter, setMajorFilter] = useState("");

  // thêm state cho phân trang
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const fetchInterns = async () => {
    try {
      if (!token) {
        setInterns([]);
        return;
      }

      let res;
      if (searchTerm || statusFilter || majorFilter) {
        res = await hrApi.searchInterns(token, {
          searchTerm,
          major: majorFilter,
          status: statusFilter,
          page,
          size,
        });
      } else {
        res = await hrApi.getAllInterns(token, page, size);
      }

      // res là object Page
      setInterns(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      console.error("Error fetching interns:", err);
      setInterns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, [token, searchTerm, statusFilter, majorFilter, page, size]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setMajorFilter("");
    setPage(0);
    fetchInterns();
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="dashboard-content">
        <HRInternHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          majorFilter={majorFilter}
          setMajorFilter={setMajorFilter}
          onClearFilters={handleClearFilters}
        />
        <HRInternTable interns={interns} />

        {/* Pagination controls */}
        <div className="pagination">
          <button
            className={`pagination-btn ${page === 0 ? "" : ""}`}
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Trang trước
          </button>

          <span className="pagination-info">
            Trang {page + 1} / {totalPages}
          </span>

          <button
            className={`pagination-btn ${page + 1 >= totalPages ? "" : ""}`}
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageInterns;
