import React, { createContext, useState, useEffect, useContext } from "react";
import hrApi from "../api/hrApi";
import { AuthContext } from "./AuthContext";

export const HrContext = createContext();

export const HrProvider = ({ children }) => {
  const { token, loading: authLoading } = useContext(AuthContext);

  const [interns, setInterns] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [majorOptions, setMajorOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch interns
  const fetchInterns = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await hrApi.AllInterns(token);
      setInterns(data.content || []);
      setError(null);
    } catch (err) {
      console.error("Lấy danh sách intern thất bại:", err);
      setError("Không thể tải danh sách thực tập sinh");
    } finally {
      setLoading(false);
    }
  };

  // Fetch majors & schools
  const fetchFilters = async () => {
    if (!token) return;
    try {
      const [majors, schools] = await Promise.all([
        hrApi.getAllMajors(token),
        hrApi.getAllSchools(token)
      ]);
      setMajorOptions(majors || []);
      setSchoolOptions(schools || []);
    } catch (err) {
      console.error("Không thể tải danh sách filter:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFilters();
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && token) {
      fetchInterns();
    }
  }, [authLoading, token]);

  const addIntern = async (internProfile) => {
    const newIntern = await hrApi.createInternProfile(token, internProfile.userId, internProfile);
    setInterns((prev) => [...prev, newIntern]);
  };

  const editIntern = async (id, internProfile) => {
    const updated = await hrApi.updateInternProfile(token, id, internProfile);
    setInterns((prev) =>
      prev.map((i) => (i.internId === id ? updated : i))
    );
  };

  const removeIntern = async (id) => {
    await hrApi.deleteIntern(token, id);
    setInterns((prev) => prev.filter((i) => i.internId !== id));
  };

  const searchInternList = async (filters) => {
    const data = await hrApi.searchInterns(token, filters);
    setInterns(data.content || []);
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
        schoolOptions,
        majorOptions,
        setSchoolOptions,
        setMajorOptions,
        fetchFilters
      }}
    >
      {children}
    </HrContext.Provider>
  );
};
