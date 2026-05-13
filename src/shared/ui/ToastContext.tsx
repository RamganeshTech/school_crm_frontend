// import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// export type ToastType = 'success' | 'error' | 'info' | 'warning';

// interface Toast {
//   id: string;
//   message: string;
//   type: ToastType;
// }

// interface ToastContextProps {
//   showToast: (message: string, type?: ToastType) => void;
// }

// const ToastContext = createContext<ToastContextProps | undefined>(undefined);

// export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [toasts, setToasts] = useState<Toast[]>([]);

//   const showToast = useCallback((message: string, type: ToastType = 'info') => {
//     const id = Math.random().toString(36).substring(2, 9);
//     setToasts((prev) => [...prev, { id, message, type }]);

//     // Auto-remove after 4 seconds
//     setTimeout(() => {
//       setToasts((prev) => prev.filter((toast) => toast.id !== id));
//     }, 4000);
//   }, []);

//   const removeToast = (id: string) => {
//     setToasts((prev) => prev.filter((toast) => toast.id !== id));
//   };

//   return (
//     <ToastContext.Provider value={{ showToast }}>
//       {children}
      
//       {/* Toast Container - Fixed to Bottom Right */}
//       <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
//         {toasts.map((toast) => (
//           <ToastCard key={toast.id} toast={toast} onRemove={removeToast} />
//         ))}
//       </div>
//     </ToastContext.Provider>
//   );
// };

// export const useToast = () => {
//   const context = useContext(ToastContext);
//   if (!context) throw new Error('useToast must be used within a ToastProvider');
//   return context;
// };

// // --- THE UI COMPONENT FOR THE TOAST ---
// const ToastCard: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
//   const styles = {
//     success: { icon: "fa-circle-check", color: "text-green-600", bg: "bg-green-50 border-green-200" },
//     error: { icon: "fa-circle-xmark", color: "text-red-600", bg: "bg-red-50 border-red-200" },
//     warning: { icon: "fa-triangle-exclamation", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
//     info: { icon: "fa-circle-info", color: "text-primary", bg: "bg-primary-soft border-primary/30" },
//   };

//   const currentStyle = styles[toast.type];

//   return (
//     <div className={`pointer-events-auto flex items-start gap-3 w-80 p-4 rounded-xl shadow-lg border ${currentStyle.bg} transform transition-all duration-300 animate-slide-in-right`}>
//       <i className={`fa-solid ${currentStyle.icon} ${currentStyle.color} text-lg mt-0.5`}></i>
//       <p className="flex-1 text-sm font-medium text-content">{toast.message}</p>
//       <button 
//         onClick={() => onRemove(toast.id)} 
//         className="text-content-muted hover:text-content transition-colors"
//       >
//         <i className="fa-solid fa-xmark"></i>
//       </button>
//     </div>
//   );
// };




import React, { useState, useEffect } from 'react';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface InternalToast extends ToastOptions {
  id: string;
}

// ==========================================
// 2. THE EVENT EMITTER (Using Native Browser Events)
// ==========================================
const TOAST_EVENT_NAME = 'SHOW_GLOBAL_TOAST';

// ==========================================
// 3. THE IMPERATIVE API (What you import and call)
// ==========================================
export const toast = ({ message, type = 'info', duration = 3000 }: ToastOptions) => {
  const newToast: InternalToast = {
    id: Math.random().toString(36).substring(2, 9),
    message,
    type,
    duration,
  };

  // Dispatch a native browser event
  const event = new CustomEvent(TOAST_EVENT_NAME, { detail: newToast });
  window.dispatchEvent(event);
};

// Helper methods
toast.success = (message: string, duration?: number) => toast({ message, type: 'success', duration });
toast.error = (message: string, duration?: number) => toast({ message, type: 'error', duration });
toast.warning = (message: string, duration?: number) => toast({ message, type: 'warning', duration });
toast.info = (message: string, duration?: number) => toast({ message, type: 'info', duration });

// ==========================================
// 4. THE UI COMPONENTS
// ==========================================
export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<InternalToast[]>([]);

  useEffect(() => {
    // Listen for the custom event
    const handleNewToast = (event: Event) => {
      const customEvent = event as CustomEvent<InternalToast>;
      const newToast = customEvent.detail;

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, newToast.duration);
    };

    window.addEventListener(TOAST_EVENT_NAME, handleNewToast);

    return () => {
      window.removeEventListener(TOAST_EVENT_NAME, handleNewToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Always return the container so React doesn't unmount the wrapper
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
};

// The Individual Card UI
const ToastCard: React.FC<{ toast: InternalToast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  // Styled using your custom CSS variables
  const styles = {
    success: { icon: "fa-circle-check", color: "text-success", bg: "bg-surface border-success/30 shadow-[0_4px_12px_rgba(16,185,129,0.1)]" },
    error: { icon: "fa-circle-xmark", color: "text-danger", bg: "bg-surface border-danger/30 shadow-[0_4px_12px_rgba(239,68,68,0.1)]" },
    warning: { icon: "fa-triangle-exclamation", color: "text-warning", bg: "bg-surface border-warning/30 shadow-[0_4px_12px_rgba(245,158,11,0.1)]" },
    info: { icon: "fa-circle-info", color: "text-primary", bg: "bg-surface border-border shadow-sm" },
  };

  const currentStyle = styles[toast.type || 'info'];

  return (
    <div className={`pointer-events-auto flex items-center gap-3 w-80 p-4 rounded-xl border ${currentStyle.bg} transform transition-all duration-300 animate-slide-in-right`}>
      <i className={`fa-solid ${currentStyle.icon} ${currentStyle.color} text-lg mt-0.5`}></i>
      <p className="flex-1 text-sm font-medium text-foreground">{toast.message}</p>
      <button 
        onClick={() => onRemove(toast.id)} 
        className="text-muted hover:text-foreground transition-colors"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};