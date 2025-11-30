import React from "react";
import Modal from "../../../../components/Layout/Modal";
import { LoadingButton } from "../../../../components/common/LoadingSpinner";
import "../../../../styles/modal.css";
import "../../../../styles/buttons.css";
import "../../../../styles/table.css";

const QuickApproveModal = ({ interns, onClose, onConfirm, isLoading }) => {
  const count = Array.isArray(interns) ? interns.length : 0;

  return (
    <Modal title="Duyệt nhanh hồ sơ" onClose={onClose}>
      <div className="approve-modal">
        <div className="approve-modal__section">
          <h3 className="approve-modal__heading">
            {count === 1
              ? "Bạn đang duyệt 1 hồ sơ:"
              : `Bạn đang duyệt ${count} hồ sơ:`}
          </h3>

          {count > 0 && (
            <div className="quick-approve-table-wrapper">
              <div className="users-table-container quick-approve-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>STT</th>
                      <th>Họ tên</th>
                      <th>Ngành</th>
                      <th>GPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interns.map((intern, index) => (
                      <tr key={intern.internId}>
                        <td>{index + 1}</td>
                        <td style={{ textAlign: "left" }}>{intern.fullName}</td>
                        <td>{intern.major}</td>
                        <td>{intern.gpa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="warning-box">
          <strong>⚠️ Xác nhận duyệt nhanh:</strong>
          <p>
            Sau khi xác nhận, tất cả hồ sơ trên sẽ được chuyển sang trạng thái
            <strong> "Đã duyệt"</strong>. Vui lòng kiểm tra lại danh sách trước khi tiếp tục.
          </p>
        </div>
      </div>

      <div className="modal-actions">
        <button className="btn-cancel" onClick={onClose} disabled={isLoading}>
          Hủy
        </button>
        <LoadingButton
          className="btn-save"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          Xác nhận duyệt
        </LoadingButton>
      </div>
    </Modal>
  );
};

export default QuickApproveModal;
