import React, { useEffect } from 'react';

interface ImagePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    alt?: string;
    title?: string;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
    isOpen,
    onClose,
    imageUrl,
    alt = 'Preview',
    title,
}) => {
    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Lock body scroll while open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 bg-foreground/70 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-border text-foreground hover:text-primary hover:border-primary-soft transition-colors shadow-lg z-10"
                aria-label="Close preview"
            >
                <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            {/* Image Container - stop propagation so clicking image doesn't close */}
            <div
                className="max-w-full max-h-full flex flex-col items-center gap-3"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={imageUrl}
                    alt={alt}
                    className="max-w-[90vw] max-h-[80vh] sm:max-w-[85vw] sm:max-h-[85vh] object-contain rounded-lg shadow-2xl bg-surface"
                />
                {title && (
                    <p className="text-sm font-medium text-white/90 text-center px-4">
                        {title}
                    </p>
                )}
            </div>
        </div>
    );
};