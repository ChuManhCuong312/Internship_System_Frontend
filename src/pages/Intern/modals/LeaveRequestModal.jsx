import React from "react";
import Modal from "../../../components/Layout/Modal";
import { FaClock } from "react-icons/fa";


const LeaveRequestModal = ({
 formData,
 errors,
 submitting,
 onClose,
 onChange,
 onSubmit,
}) => {
 const calculateDays = (startDate, endDate) => {
   if (!startDate || !endDate) return 0;
   const start = new Date(startDate);
   const end = new Date(endDate);
   const diffTime = Math.abs(end - start);
   return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
 };


 return (
   <Modal title="Tạo đơn xin nghỉ phép" onClose={onClose}>
     <form onSubmit={onSubmit}>
       <div className="form-group">
         <label htmlFor="startDate">
           Ngày bắt đầu <span className="required">*</span>
         </label>
         <input
           type="date"
           id="startDate"
           name="startDate"
           value={formData.startDate}
           onChange={onChange}
           min={new Date().toISOString().split("T")[0]}
           className={`form-input ${errors.startDate ? "error" : ""}`}
         />
         {errors.startDate && (
           <p className="field-error">{errors.startDate}</p>
         )}
       </div>


       <div className="form-group">
         <label htmlFor="endDate">
           Ngày kết thúc <span className="required">*</span>
         </label>
         <input
           type="date"
           id="endDate"
           name="endDate"
           value={formData.endDate}
           onChange={onChange}
           min={formData.startDate || new Date().toISOString().split("T")[0]}
           className={`form-input ${errors.endDate ? "error" : ""}`}
         />
         {errors.endDate && (
           <p className="field-error">{errors.endDate}</p>
         )}
       </div>


       {formData.startDate && formData.endDate && (
         <div className="form-info">
           <FaClock />
           <span>
             Tổng số ngày nghỉ:{" "}
             <strong>
               {calculateDays(formData.startDate, formData.endDate)} ngày
             </strong>
           </span>
         </div>
       )}


       <div className="form-group">
         <label htmlFor="reason">
           Lý do nghỉ phép <span className="required">*</span>
         </label>
         <textarea
           id="reason"
           name="reason"
           value={formData.reason}
           onChange={onChange}
           rows="4"
           maxLength="255"
           placeholder="Nhập lý do xin nghỉ phép (ít nhất 10 ký tự)..."
           className={`form-input ${errors.reason ? "error" : ""}`}
         />
         <div className="textarea-footer">
           <span className="char-count">
             {formData.reason.length}/255 ký tự
           </span>
         </div>
         {errors.reason && (
           <p className="field-error">{errors.reason}</p>
         )}
       </div>


       <div className="modal-actions">
         <button
           type="button"
           className="btn-cancel"
           onClick={onClose}
           disabled={submitting}
         >
           Hủy
         </button>
         <button
           type="submit"
           className="btn-save"
           disabled={submitting}
         >
           {submitting ? "Đang gửi..." : "Gửi đơn"}
         </button>
       </div>
     </form>
   </Modal>
 );
};


export default LeaveRequestModal;