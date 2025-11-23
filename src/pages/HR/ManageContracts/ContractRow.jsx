import React from "react";

const ContractRow = ({
  contract,
  index,
  translateStatus,
  getStatusClass,
  formatDate,
  extractFileName,
  onUpload,
  onReplace,
  onDelete,
  onDownload,
}) => {
  const hasContract = (contract.filePath || contract.file_path) && 
                      (contract.contractStatus === "UPLOAD" || contract.contract_status === "UPLOAD");
  const filePath = contract.filePath || contract.file_path;
  const fileName = hasContract ? extractFileName(filePath) : "";
  const contractStatus = contract.contractStatus || contract.contract_status;
  const internConfirmStatus = contract.internConfirmStatus || contract.intern_confirm_status;
  const statusText = translateStatus(contractStatus, internConfirmStatus);
  const statusClass = getStatusClass(contractStatus, internConfirmStatus);

  return (
    <tr>
      <td>{index + 1}</td>
      <td>{contract.fullName || "-"}</td>
      <td>{contract.phone || "-"}</td>
      <td>
        {hasContract ? (
          <a
            href={filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="contract-link"
            title={fileName}
          >
            {fileName || "Hợp đồng"}
          </a>
        ) : (
          <span className="no-contract">-</span>
        )}
      </td>
      <td>
        <span className={`status-badge ${statusClass}`}>{statusText}</span>
      </td>
      <td>{formatDate(contract.createdAt || contract.confirmAt)}</td>
      <td>
        <span className="note-cell" title={contract.note || ""}>
          {contract.note ? (
            contract.note.length > 30 ? (
              `${contract.note.substring(0, 30)}...`
            ) : (
              contract.note
            )
          ) : (
            "-"
          )}
        </span>
      </td>
      <td>
        <div className="action-buttons">
          {hasContract ? (
            <>
              <button
                className="btn-download"
                onClick={() => onDownload(contract)}
                title="Tải xuống"
              >
                ⬇️
              </button>
              <button
                className="btn-replace"
                onClick={() => onReplace(contract, true)}
                title="Thay thế"
              >
                🔄
              </button>
              <button
                className="btn-delete"
                onClick={() => onDelete(contract)}
                title="Xóa"
              >
                🗑️
              </button>
            </>
          ) : (
            <button
              className="btn-upload"
              onClick={() => onUpload(contract, false)}
              title="Upload hợp đồng"
            >
              📤 Upload
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default ContractRow;

