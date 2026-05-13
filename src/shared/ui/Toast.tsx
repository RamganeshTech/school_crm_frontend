import React, { useEffect } from 'react';

export interface ToastProps {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: (id: string) => void;
  duration?: number; // default 3000ms
}

export const Toast: React.FC<ToastProps> = ({ id, message, type = 'info', onClose, duration = 3000 }) => {
  
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const styles = {
    success: { icon: "fa-circle-check", color: "text-green-500", bg: "bg-green-50 border-green-200" },
    error: { icon: "fa-circle-xmark", color: "text-red-500", bg: "bg-red-50 border-red-200" },
    warning: { icon: "fa-triangle-exclamation", color: "text-amber-500", bg: "bg-amber-50 border-amber-200" },
    info: { icon: "fa-circle-info", color: "text-primary", bg: "bg-primary-soft border-primary" },
  };

  const currentStyle = styles[type];

  return (
    <div className={`pointer-events-auto flex items-center gap-3 w-full max-w-sm p-4 rounded-xl shadow-lg border ${currentStyle.bg} bg-surface animate-fade-in-up`}>
      <i className={`fa-solid ${currentStyle.icon} ${currentStyle.color} text-xl`}></i>
      <p className="flex-1 text-sm font-medium text-content">{message}</p>
      <button onClick={() => onClose(id)} className="text-content-muted hover:text-content">
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};