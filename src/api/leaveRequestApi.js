import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export const createLeaveRequest = async (token, internId, data) => {
 try {
   const response = await axios.post(
     `${API_BASE_URL}/api/leave-requests?internId=${internId}`,
     data,
     {
       headers: {
         Authorization: `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
     }
   );
   return response.data;
 } catch (error) {
   throw error.response?.data || error;
 }
};

export const getMyLeaveRequests = async (token, internId) => {
 try {
   const response = await axios.get(
     `${API_BASE_URL}/api/leave-requests/my-requests?internId=${internId}`,
     {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     }
   );
   return response.data;
 } catch (error) {
   throw error.response?.data || error;
 }
};

export const getLeaveRequestById = async (token, leaveId, internId) => {
 try {
   const response = await axios.get(
     `${API_BASE_URL}/api/leave-requests/${leaveId}?internId=${internId}`,
     {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     }
   );
   return response.data;
 } catch (error) {
   throw error.response?.data || error;
 }
};

export const cancelLeaveRequest = async (token, leaveId, internId) => {
 try {
   const response = await axios.delete(
     `${API_BASE_URL}/api/leave-requests/${leaveId}?internId=${internId}`,
     {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     }
   );
   return response.data;
 } catch (error) {
   throw error.response?.data || error;
 }
};

