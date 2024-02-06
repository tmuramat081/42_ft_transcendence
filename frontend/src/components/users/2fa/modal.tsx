import React from 'react';
import styles from './Modal.module.css';

const Modal = ({ show, children, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <span className={styles.closeButton} onClick={onClose}>&times;</span>
        {children}
      </div>
    </div>
  );
};

export default Modal;
