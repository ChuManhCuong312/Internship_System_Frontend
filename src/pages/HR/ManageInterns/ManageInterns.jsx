import React, { useEffect, useState, useContext } from "react";
import hrApi from "../../../api/hrApi";
import HRInternTable from "./component/HRInternTable";
import HRSidebar from "../../../components/Layout/HRSidebar";
import { AuthContext } from "../../../context/AuthContext";

const ManageInterns = () => {
  const { token } = useContext(AuthContext); // lấy token từ context
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        if (!token) {
          console.warn("Không có token, không thể gọi API");
          setInterns([]);
          return;
        }
        const res = await hrApi.getAllInterns(token);
        const data = Array.isArray(res) ? res : [];
        setInterns(data);
      } catch (err) {
        console.error("Error fetching interns:", err);
        setInterns([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInterns();
  }, [token]);

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="dashboard-content">
        <h2>Quản lý thực tập sinh</h2>
        <HRInternTable interns={interns} />
      </div>
    </div>
  );
};

export default ManageInterns;
