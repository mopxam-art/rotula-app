import React from "react";
import { X } from "lucide-react";

export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  headingLevel?: HeadingLevel;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  headingLevel = "h2",
}) => {
  if (!isOpen) return null;

  const titleId = "modal-title";
  const HeadingTag = headingLevel;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-xl transform transition-all"
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <HeadingTag id={titleId} className="text-xl font-bold text-gray-900">
            {title}
          </HeadingTag>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};
