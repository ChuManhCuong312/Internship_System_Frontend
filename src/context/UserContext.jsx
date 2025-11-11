import React, { createContext, useState, useEffect, useContext } from "react";
import {
 getAllUsers,
 createUser,
 updateUser,
 deleteUser,
 activateUser,
 rejectUser,
 unlockUser,
} from "../api/userApi";
import { AuthContext } from "./AuthContext";


export const UserContext = createContext();


export const UserProvider = ({ children }) => {
 const { token, loading: authLoading } = useContext(AuthContext);
 const [users, setUsers] = useState([]);
 const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);


 const fetchUsers = async (filters = {}) => {
   if (!token) return;
   setLoading(true);
   try {
     const data = await getAllUsers(token, filters);
     console.log("Response từ API getAllUsers:", data); // 👈 log ra response


     setUsers(data.data);
     setPagination({
       currentPage: data.currentPage,
       totalPages: data.totalPages,
       totalItems: data.totalItems,
     });
     setError(null);
   } catch (err) {
     console.error("Lỗi khi lấy danh sách người dùng:", err);
     setError("Không thể tải danh sách người dùng");
   } finally {
     setLoading(false);
   }
 };


 const addUser = async (userProfile) => {
   await createUser(token, userProfile);
   await fetchUsers(); // reload danh sách
 };


 const editUser = async (userId, userProfile) => {
   await updateUser(token, userId, userProfile);
   await fetchUsers();
 };


 const removeUser = async (userId) => {
   await deleteUser(token, userId);
   setUsers((prev) => prev.filter((u) => u.userId !== userId));
 };


 const activate = async (userId) => {
   await activateUser(token, userId);
   await fetchUsers();
 };


 const reject = async (userId) => {
   await rejectUser(token, userId);
   await fetchUsers();
 };


 const unlock = async (userId) => {
   await unlockUser(token, userId);
   await fetchUsers();
 };


 return (
   <UserContext.Provider
     value={{
       users,
       pagination,
       loading,
       error,
       fetchUsers,
       addUser,
       editUser,
       removeUser,
       activate,
       reject,
       unlock,
     }}
   >
     {children}
   </UserContext.Provider>
 );
};
