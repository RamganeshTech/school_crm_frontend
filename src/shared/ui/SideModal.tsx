import React, { useEffect } from 'react';

interface SideModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string; // Allows overriding width like 'w-[400px]' or 'max-w-2xl'
}

export const SideModal: React.FC<SideModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = "w-full sm:w-[450px] md:w-[500px]"
}) => {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[9990] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />


      {/* Modal Panel (Sliding from Right) */}
      <div 
        className={`fixed top-0 right-0 h-full bg-surface shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col ${width} border-l-2 border-border ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <h2 className="text-lg font-semibold text-content">{title}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-content-muted hover:bg-background hover:text-content transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 bg-mainBg">
          {children}
        </div>
      </div>
    </>
  );
};