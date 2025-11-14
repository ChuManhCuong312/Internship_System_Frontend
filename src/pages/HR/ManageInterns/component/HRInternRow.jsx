import React, { useContext, useState } from "react";
import hrApi from "../../../../api/hrApi";
import { AuthContext } from "../../../../context/AuthContext";
import RejectModal from "../modals/RejectModal";

const HRInternRow = ({ intern, index, translateStatus, onStatusChange }) => {
  const { token } = useContext(AuthContext);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleApprove = async () => {
    await hrApi.updateInternStatus(token, intern.internId, "APPROVED");
    onStatusChange();
  };

  const handleRejectConfirm = async () => {
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do từ chối");
      return;
    }
    await hrApi.updateInternStatus(token, intern.internId, "REJECTED", reason);
    setShowRejectModal(false);
    setReason("");
    setError("");
    onStatusChange();
  };

  return (
    <>
      <tr>
        <td>{index + 1}</td>
        <td>{intern.fullName}</td>
        <td>{intern.email}</td>
        <td>{intern.phone}</td>
        <td>{intern.major}</td>
        <td>{intern.gpa}</td>
        <td>
          {intern.cvFile && (
            <a href={`/${intern.cvFile}`} download>{intern.cvFile}</a>
          )}
          {intern.permissionFile && (
            <>
              {" | "}
              <a href={`/${intern.permissionFile}`} download>
                {intern.permissionFile}
              </a>
            </>
          )}
          {!intern.cvFile && !intern.permissionFile && "Chưa có"}
        </td>
        <td>{translateStatus(intern.status)}</td>
        <td>
          {intern.status === "PENDING" && (
            <div className="action-buttons">
              <button className="btn-approve" onClick={handleApprove}>
                Duyệt
              </button>
              <button className="btn-reject" onClick={() => setShowRejectModal(true)}>
                Từ chối
              </button>
            </div>
          )}
        </td>
      </tr>

      {showRejectModal && (
        <RejectModal
          intern={intern}
          reason={reason}
          setReason={setReason}
          error={error}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleRejectConfirm}
        />
      )}
    </>
  );
};

export default HRInternRow;
