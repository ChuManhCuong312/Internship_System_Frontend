import React, { useState } from "react";
import Modal from "../../../../components/Layout/Modal";
import { LoadingButton } from "../../../../components/common/LoadingSpinner";
import "../../../../styles/modal.css";
import "../../../../styles/buttons.css";
import "../../../../styles/table.css";

const QuickApproveModal = ({ interns, onClose, onConfirm, isLoading, onToggleSelectIntern, onViewIntern }) => {
  const count = Array.isArray(interns) ? interns.length : 0;

  const [selectedIds, setSelectedIds] = useState(
    Array.isArray(interns) ? interns.map((i) => i.internId) : []
  );

  const handleToggleLocal = (intern) => {
    setSelectedIds((prev) => {
      if (prev.includes(intern.internId)) {
        return prev.filter((id) => id !== intern.internId);
      }
      return [...prev, intern.internId];
    });
  };

  const handleConfirm = () => {
    if (!Array.isArray(interns) || interns.length === 0) {
      onConfirm && onConfirm([]);
      return;
    }
    const selectedInterns = interns.filter((i) => selectedIds.includes(i.internId));
    onConfirm && onConfirm(selectedInterns);
  };

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
                      <th style={{ width: "40px" }}></th>
                      <th style={{ width: "60px" }}>STT</th>
                      <th>Họ tên</th>
                      <th>Ngành</th>
                      <th>GPA</th>
                      <th>CV</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interns.map((intern, index) => (
                      <tr key={intern.internId}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(intern.internId)}
                            onChange={() => handleToggleLocal(intern)}
                          />
                        </td>
                        <td>{index + 1}</td>
                        <td style={{ textAlign: "left" }}>{intern.fullName}</td>
                        <td>{intern.major}</td>
                        <td>{intern.gpa}</td>
                        <td>
                          {intern.cvPath ? (
                            <a
                              href={intern.cvPath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="doc-item"
                            >
                              Xem CV
                            </a>
                          ) : (
                            <span className="doc-status">Chưa có</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-view"
                              type="button"
                              onClick={() => onViewIntern && onViewIntern(intern)}
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </td>
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
          onClick={handleConfirm}
          isLoading={isLoading}
        >
          Xác nhận duyệt
        </LoadingButton>
      </div>
    </Modal>
  );
};

export default QuickApproveModal;
