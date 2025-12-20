import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

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
  className = "",
  noPadding = false,
}) => {
  const modalRoot = document.getElementById("modal-root");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modalRoot) {
      const div = document.createElement("div");
      div.id = "modal-root";
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
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent scrolling background
    } else {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => {
        // Close if click is on the overlay itself, not content within
        if (overlayRef.current && e.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      <div
        className={`bg-[#1a0f0a] border-4 border-[#3E2723] rounded-xl shadow-2xl w-full max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 scale-100 relative ${className || "max-w-lg"}`}
      >
        {/* Wood grain texture */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #3E2723 0px, #1a0f0a 2px, #3E2723 4px)",
          }}
        ></div>

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b-2 border-[#5D4037] shrink-0 bg-[#3E2723] z-10 relative">
          <h3 className="text-2xl font-black text-[#E7E5E4] truncate pr-4 uppercase tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-[#78716C] hover:text-[#D97706] transition-colors duration-200 focus:outline-none"
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
          <div className="flex-1 min-h-0 flex flex-col relative z-10">
            {children}
          </div>
        ) : (
          <div className="p-5 flex-1 min-h-0 flex flex-col overflow-y-auto relative z-10">
            {children}
          </div>
        )}
      </div>
    </div>,
    document.getElementById("modal-root") || document.body,
  );
};

export default Modal;
