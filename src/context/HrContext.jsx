import React, { createContext, useState, useEffect, useContext } from "react";
import {
  getAllInterns,
  createIntern,
  updateIntern,
  deleteIntern,
} from "../api/hrApi";
import { AuthContext } from "./AuthContext";
import { searchInterns, getMajors } from "../api/hrApi";

export const HrContext = createContext();

export const HrProvider = ({ children }) => {
  const { token, loading: authLoading } = useContext(AuthContext);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch interns
  const fetchInterns = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getAllInterns(token);
      setInterns(data.content);
      setError(null);
    } catch (err) {
      console.error("Lấy danh sách intern thất bại:", err);
      setError("Không thể tải danh sách thực tập sinh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && token) fetchInterns();
  }, [authLoading, token]);

  const addIntern = async (internProfile) => {
    const newIntern = await createIntern(token, internProfile);
    setInterns((prev) => [...prev, newIntern]);
  };

const editIntern = async (id, internProfile) => {
  const updated = await updateIntern(token, id, internProfile);
  setInterns((prev) =>
    prev.map((i) => (i.internId === id ? updated : i))
  );
};

const removeIntern = async (id) => {
  await deleteIntern(token, id);
  setInterns((prev) => prev.filter((i) => i.internId !== id));
};
const searchInternList = async (filters) => {
  const data = await searchInterns(token, filters);
  setInterns(data.content);
};

const fetchMajors = async () => {
  return await getMajors(token);
};

  return (
    <HrContext.Provider
      value={{
        interns,
        setInterns,
        loading,
        error,
        fetchInterns,
        addIntern,
        editIntern,
        removeIntern,
        searchInternList,
        fetchMajors,
      }}
    >
      {children}
    </HrContext.Provider>
  );
};
