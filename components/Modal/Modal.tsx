import React, { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, closeModal, children }) => {

  // Add an event listener for the Escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    // Clean up the event listener when the modal is closed
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={closeModal} ></div>
      <div className="relative z-10 max-h-screen overflow-y-auto p-6 rounded shadow-lg no-scrollbar">
        {children}
      </div>
    </div>
  );
};

export default Modal;
