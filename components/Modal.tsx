
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  noPadding?: boolean; // New prop to disable default padding/scroll
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  className = '',
  noPadding = false 
}) => {
  const modalRoot = document.getElementById('modal-root');
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modalRoot) {
      const div = document.createElement('div');
      div.id = 'modal-root';
      document.body.appendChild(div);
      return () => {
        if (document.body.contains(div)) {
          document.body.removeChild(div);
        }
      };
    }
  }, [modalRoot]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scrolling background
    } else {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4"
      onClick={(e) => {
        // Close if click is on the overlay itself, not content within
        if (overlayRef.current && e.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      <div className={`bg-surface rounded-lg shadow-xl w-full max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 scale-100 ${className || 'max-w-lg'}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-600 shrink-0 bg-surface z-10">
          <h3 className="text-2xl font-bold font-sans text-white truncate pr-4 tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text transition-colors duration-200 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {/* Content Wrapper */}
        {noPadding ? (
          <div className="flex-1 min-h-0 flex flex-col relative">
            {children}
          </div>
        ) : (
          <div className="p-4 flex-1 min-h-0 flex flex-col overflow-y-auto">
            {children}
          </div>
        )}
      </div>
    </div>,
    document.getElementById('modal-root') || document.body 
  );
};

export default Modal;
