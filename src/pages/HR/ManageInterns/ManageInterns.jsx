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

  // state cho filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [majorFilter, setMajorFilter] = useState("");

  const fetchInterns = async () => {
    try {
      if (!token) {
        setInterns([]);
        return;
      }
      // nếu có filter thì gọi search API
      if (searchTerm || statusFilter || majorFilter) {
        const res = await hrApi.searchInterns(token, {
          searchTerm,
          major: majorFilter,
          status: statusFilter,
        });
        setInterns(Array.isArray(res) ? res : []);
      } else {
        const res = await hrApi.getAllInterns(token);
        setInterns(Array.isArray(res) ? res : []);
      }
    } catch (err) {
      console.error("Error fetching interns:", err);
      setInterns([]);
    } finally {
      setLoading(false);
    }
  };

  // gọi lại khi filter thay đổi
  useEffect(() => {
    fetchInterns();
  }, [token, searchTerm, statusFilter, majorFilter]);

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
        />
        <HRInternTable interns={interns} />
      </div>
    </div>
  );
};

export default ManageInterns;
