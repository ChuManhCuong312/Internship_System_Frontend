import React from "react";
import { createPortal } from "react-dom";
import "../../styles/modal.css";

const Modal = ({ title, children, onClose }) => {
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
