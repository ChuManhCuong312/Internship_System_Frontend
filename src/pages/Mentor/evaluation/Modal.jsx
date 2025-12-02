import styles from "./Modal.module.css"

export default function Modal({ title, children, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>{title}</h3>

        <div className={styles.modalContent}>
          {children}
        </div>

        <button className={styles.closeButton} onClick={onClose}>Đóng</button>
      </div>
    </div>
  )
}
