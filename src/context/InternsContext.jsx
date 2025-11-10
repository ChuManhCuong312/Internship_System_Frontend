// src/context/InternsContext.jsx
import React, { createContext, useState } from "react";

export const InternsContext = createContext();

const mockMentors = [
  { id: 1, name: "Nguyễn Văn Hướng" },
  { id: 2, name: "Trần Thị Hạnh" },
  { id: 3, name: "Phạm Quốc Bình" },
];

const mockInterns = [
  {
    id: 1,
    fullName: "Nguyễn Văn A",
    email: "a@example.com",
    phone: "0987765443",
    major: "Công nghệ thông tin",
    mentor: "-",
    status: "Chờ duyệt",
    createdAt: "2024-03-15",
    documents: ["CV_A.pdf", "DonXinTT_A.pdf"],
  },
  {
    id: 2,
    fullName: "Trần Thị B",
    email: "b@example.com",
    phone: "0987765442",
    major: "Công nghệ thông tin",
    mentor: "-",
    status: "Đã duyệt",
    createdAt: "2024-03-28",
    documents: ["CV_B.pdf"],
  },
  {
    id: 3,
    fullName: "Lê Văn C",
    email: "c@example.com",
    phone: "0987765441",
    major: "Quản trị kinh doanh",
    mentor: "Nguyễn Văn Hướng",
    status: "Hợp đồng hoàn tất",
    createdAt: "2024-04-02",
    documents: ["CV_C.pdf", "HopDong_C.pdf"],
  },
  {
    id: 4,
    fullName: "Lê Văn D",
    email: "d@example.com",
    phone: "0987765442",
    major: "Thiết kế đồ họa",
    mentor: "-",
    status: "Hợp đồng hoàn tất",
    createdAt: "2024-04-03",
    documents: ["CV_C.pdf", "HopDong_C.pdf"],
  },
];

export const InternsProvider = ({ children }) => {
  const [interns, setInterns] = useState(mockInterns);
  return (
    <InternsContext.Provider value={{ interns, setInterns, mockMentors }}>
      {children}
    </InternsContext.Provider>
  );
};
