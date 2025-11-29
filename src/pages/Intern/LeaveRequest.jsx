import React, { useState, useEffect, useContext } from 'react';
import InternSidebar from '../../components/Layout/InternSidebar';
import { AuthContext } from '../../context/AuthContext';
import { getInternByUserId } from '../../api/internApi';
import {
 createLeaveRequest,
 getMyLeaveRequests,
 cancelLeaveRequest,
} from '../../api/leaveRequestApi';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';
import {
 FaPlus,
 FaCalendarAlt,
 FaClock,
 FaCheckCircle,
 FaTimesCircle,
 FaHourglassHalf,
 FaTrash,
} from 'react-icons/fa';
import '../../styles/leaveRequest.css';
import LeaveRequestModal from "./modals/LeaveRequestModal";


const LeaveRequest = () => {
 const { token, user } = useContext(AuthContext);
 const [internId, setInternId] = useState(null);
 const [leaveRequests, setLeaveRequests] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showModal, setShowModal] = useState(false);
 const [formData, setFormData] = useState({ startDate: '', endDate: '', reason: '' });
 const [errors, setErrors] = useState({});
 const [submitting, setSubmitting] = useState(false);


 useEffect(() => {
   const fetchInternId = async () => {
     try {
       let userId = user?.userId;
       if (!userId) {
         const storedUserId = localStorage.getItem('userId');
         if (storedUserId) {
           userId = parseInt(storedUserId);
         } else {
           const payload = jwtDecode(token);
           userId = payload.userId || payload.id;
         }
       }


       if (userId) {
         const response = await getInternByUserId(token, userId);
         const data = response.internProfile || response;
         setInternId(data.internId);
       }
     } catch (error) {
       console.error('Error fetching intern ID:', error);
       toast.error('Không thể lấy thông tin intern');
     }
   };


   if (token) {
     fetchInternId();
   }
 }, [token, user]);


 useEffect(() => {
   if (internId) {
     fetchLeaveRequests();
   }
 }, [internId]);


 const fetchLeaveRequests = async () => {
   try {
     setLoading(true);
     const data = await getMyLeaveRequests(token, internId);
     let list = Array.isArray(data) ? data : [];

     list = [...list].sort((a, b) => {
       const idA = a.leaveId ?? 0;
       const idB = b.leaveId ?? 0;
       return idB - idA; // mã đơn lớn hơn (mới hơn) lên trước
     });

     setLeaveRequests(list);
   } catch (error) {
     console.error('Error fetching leave requests:', error);
     toast.error('Không thể lấy danh sách đơn nghỉ phép');
     setLeaveRequests([]);
   } finally {
     setLoading(false);
   }
 };


 const validateForm = () => {
   const newErrors = {};


   if (!formData.startDate) {
     newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
   }


   if (!formData.endDate) {
     newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
   }


   if (formData.startDate && formData.endDate) {
     if (new Date(formData.startDate) > new Date(formData.endDate)) {
       newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
     }
   }


   if (!formData.reason.trim()) {
     newErrors.reason = 'Vui lòng nhập lý do nghỉ phép';
   } else if (formData.reason.trim().length < 10) {
     newErrors.reason = 'Lý do phải có ít nhất 10 ký tự';
   } else if (formData.reason.length > 255) {
     newErrors.reason = 'Lý do không được vượt quá 255 ký tự';
   }


   setErrors(newErrors);
   return Object.keys(newErrors).length === 0;
 };


 const handleSubmit = async (e) => {
   e.preventDefault();


   if (!validateForm()) return;


   setSubmitting(true);
   try {
     const response = await createLeaveRequest(token, internId, formData);


     if (response.success) {
       toast.success('Tạo đơn xin nghỉ phép thành công!');
       setShowModal(false);
       setFormData({ startDate: '', endDate: '', reason: '' });
       fetchLeaveRequests();
     }
   } catch (error) {
     console.error('Error creating leave request:', error);
     toast.error(error.message || 'Có lỗi xảy ra khi tạo đơn nghỉ phép');
   } finally {
     setSubmitting(false);
   }
 };


 const handleCancel = async (leaveId) => {
   const result = await Swal.fire({
     title: 'Xác nhận hủy đơn',
     text: 'Bạn có chắc chắn muốn hủy đơn nghỉ phép này?',
     icon: 'warning',
     showCancelButton: true,
     confirmButtonColor: '#d33',
     cancelButtonColor: '#3085d6',
     confirmButtonText: 'Có, hủy đơn',
     cancelButtonText: 'Không',
   });


   if (result.isConfirmed) {
     try {
       const response = await cancelLeaveRequest(token, leaveId, internId);
       if (response.success) {
         toast.success('Hủy đơn nghỉ phép thành công!');
         fetchLeaveRequests();
       }
     } catch (error) {
       console.error('Error canceling leave request:', error);
       toast.error(error.message || 'Có lỗi xảy ra khi hủy đơn nghỉ phép');
     }
   }
 };


 const handleChange = (e) => {
   const { name, value } = e.target;
   setFormData((prev) => ({
     ...prev,
     [name]: value,
   }));
   if (errors[name]) {
     setErrors((prev) => ({ ...prev, [name]: '' }));
   }
 };


 const calculateDays = (startDate, endDate) => {
   if (!startDate || !endDate) return 0;
   const start = new Date(startDate);
   const end = new Date(endDate);
   const diffTime = Math.abs(end - start);
   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
   return diffDays;
 };


 const getStatusBadge = (status) => {
   const statusConfig = {
     PENDING: {
       icon: <FaHourglassHalf />,
       text: 'Chờ duyệt',
       className: 'status-pending',
     },
     APPROVED: {
       icon: <FaCheckCircle />,
       text: 'Đã duyệt',
       className: 'status-approved',
     },
     REJECTED: {
       icon: <FaTimesCircle />,
       text: 'Từ chối',
       className: 'status-rejected',
     },
   };


   const config = statusConfig[status] || statusConfig.PENDING;


   return (
     <span className={`status-badge ${config.className}`}>
       {config.icon}
       <span>{config.text}</span>
     </span>
   );
 };


 const formatDate = (dateString) => {
   const date = new Date(dateString);
   return date.toLocaleDateString('vi-VN', {
     year: 'numeric',
     month: '2-digit',
     day: '2-digit',
   });
 };


 if (loading) {
   return (
     <div className="leave-request-page">
       <InternSidebar />
       <div className="leave-request-wrapper">
         <div className="leave-request-loading">
           <div className="spinner"></div>
           <p>Đang tải dữ liệu...</p>
         </div>
       </div>
     </div>
   );
 }


 return (
   <div className="leave-request-page">
     <InternSidebar />
     <div className="leave-request-wrapper">
       {/* Header */}
       <div className="leave-request-header">
         <div className="header-left">
           <h2>Nghỉ phép</h2>
         </div>
         <button className="btn-create-leave" onClick={() => setShowModal(true)}>
           <FaPlus /> Tạo đơn
         </button>
       </div>


       {/* Leave Requests List */}
       <div className="leave-requests-list">
         {leaveRequests.length === 0 ? (
           <div className="no-data">
             <FaCalendarAlt className="no-data-icon" />
             <p>Bạn chưa có đơn nghỉ phép nào</p>
             <button className="btn-create-first" onClick={() => setShowModal(true)}>
               Tạo đơn đầu tiên
             </button>
           </div>
         ) : (
           <div className="requests-grid">
             {leaveRequests.map((request) => (
               <div key={request.leaveId} className="request-card">
                 <div className="card-header">
                   <div className="card-date">
                     <FaCalendarAlt />
                     <span>
                       {formatDate(request.startDate)} - {formatDate(request.endDate)}
                     </span>
                   </div>
                   {getStatusBadge(request.status)}
                 </div>


                 <div className="card-body">
                   <div className="card-info-row">
                     <FaClock />
                     <span>
                       {calculateDays(request.startDate, request.endDate)} ngày
                     </span>
                   </div>
                   <div className="card-reason">
                     <strong>Lý do:</strong>
                     <p>{request.reason}</p>
                   </div>
                   {request.rejectionReason && (
                     <div className="card-rejection">
                       <strong>Lý do từ chối:</strong>
                       <p>{request.rejectionReason}</p>
                     </div>
                   )}
                   <div className="card-date-submitted">
                     <small>
                       Ngày gửi: {formatDate(request.requestDate)}
                     </small>
                   </div>
                 </div>


                 {request.status === 'PENDING' && (
                   <div className="card-actions">
                     <button
                       className="btn-cancel"
                       onClick={() => handleCancel(request.leaveId)}
                     >
                       <FaTrash /> Hủy đơn
                     </button>
                   </div>
                 )}
               </div>
             ))}
           </div>
         )}
       </div>


       {/* Modal Create Leave Request */}
       {showModal && (
         <LeaveRequestModal
           formData={formData}
           errors={errors}
           submitting={submitting}
           onClose={() => setShowModal(false)}
           onChange={handleChange}
           onSubmit={handleSubmit}
         />
       )}
     </div>
   </div>
 );
};


export default LeaveRequest;

