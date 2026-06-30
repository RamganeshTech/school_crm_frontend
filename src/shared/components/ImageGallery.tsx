import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { downloadImageUtil } from '../../api_services/download_api/downloadApi';

export interface IStudentUpload {
    // _id:string
    type: "image" | "pdf" | "video";
    key?: string;
    url?: string;
    originalName?: string;
    uploadedAt: Date | string;
}

interface ImageGalleryProps {
    images: IStudentUpload[];
    handleDelete?: (image: IStudentUpload) => void;
    heightClass?: string;
    widthClass?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
    images,
    handleDelete,
    heightClass = "h-32 sm:h-40 md:h-48", // Default fallback heights
    // widthClass = "w-full"
    widthClass = "w-32 sm:w-40 md:w-48"   // Natural thumbnail fallback widths using flex basis
}) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    // const downloadMutation = useDownloadFile();

    // --- Keyboard Navigation ---
    useEffect(() => {
        if (selectedIndex === null) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') handleClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        // Prevent body scrolling when lightbox is open
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [selectedIndex, images.length]);

    // --- Handlers ---
    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedIndex((prev) => 
            prev !== null ? (prev === images.length - 1 ? 0 : prev + 1) : null
        );
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedIndex((prev) => 
            prev !== null ? (prev === 0 ? images.length - 1 : prev - 1) : null
        );
    };

    const handleClose = () => {
        setSelectedIndex(null);
    };

    const handleDownloadClick = async (e: React.MouseEvent, image: IStudentUpload) => {
    e.stopPropagation();
    if (!image.key) return;

    // Direct, synchronous action wrapper invocation
    await downloadImageUtil({
        fileKey: image.key,
        // originalName: image.originalName
    });
};

    const onDeleteClick = (e: React.MouseEvent, image: IStudentUpload) => {
        e.stopPropagation();
        // if (handleDelete) {
        //     handleDelete(image);
        //     handleClose(); // Close the modal after triggering delete
        // }

        if (handleDelete && selectedIndex !== null) {
            // Trigger the deletion in the parent component
            handleDelete(image);
            
            // 1. If it's the very last image in the entire gallery, close the modal
            if (images.length <= 1) {
                handleClose();
            } 
            // 2. If we are deleting the very last image in the list (e.g., Image 3 of 3), 
            // we must shift the view backwards to the previous image (Image 2)
            else if (selectedIndex === images.length - 1) {
                setSelectedIndex(selectedIndex - 1);
            }
            // 3. If we delete an image at the start or middle, we DO NOT change the index.
            // Why? Because when the parent removes the image from the array, the NEXT 
            // image will automatically slide into this current index position!
        }
    };

    if (!images || images.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-muted border border-dashed border-border rounded-xl bg-surface/50">
                <i className="fas fa-images text-3xl mb-2 opacity-50"></i>
                <p className="text-sm font-medium">No files uploaded yet.</p>
            </div>
        );
    }

    return (
        <>
            {/* --- GRID GALLERY VIEW --- */}
            {/* <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"> */}
            <div className="flex flex-wrap gap-0 items-center justify-start">
                {images.map((img, idx) => (
                    <div 
                        key={img.key || idx} 
                        onClick={() => setSelectedIndex(idx)}
                        className={`${heightClass} ${widthClass} relative group cursor-pointer overflow-hidden rounded-sm border border-border bg-surface transition-all`}
                    >
                        {img.type === 'image' ? (
                            <img 
                                src={img.url} 
                                alt={img.originalName || 'Uploaded Image'} 
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                loading="lazy"
                            />
                        ) : (
                            // Render PDF Placeholder elegantly
                            <div className="w-full h-full flex flex-col items-center justify-center bg-danger/5 text-danger group-hover:bg-danger/10 transition-colors">
                                <i className="fas fa-file-pdf text-3xl sm:text-4xl mb-2"></i>
                                <span className="text-[10px] sm:text-xs font-semibold px-2 truncate w-full text-center">
                                    {img.originalName || 'PDF Document'}
                                </span>
                            </div>
                        )}
                        
                        {/* Hover Overlay indicator */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <i className="fas fa-expand text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md text-xl"></i>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- FULLSCREEN LIGHTBOX (PORTAL) --- */}
            {selectedIndex !== null && createPortal(
                <div 
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200" 
                    onClick={handleClose} // Clicking outside closes modal
                >
                    {/* Top Right Actions */}
                    <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center gap-4 sm:gap-6 z-50 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                        {/* Download */}
                        <button 
                            // onClick={(e) => handleDownload(e, images[selectedIndex].url, images[selectedIndex].originalName)} 
                            onClick={(e) => handleDownloadClick(e, images[selectedIndex])}
                            // disabled={downloadMutation.isPending}
                            className="text-white/70 hover:text-white transition-colors"
                            title="Download"
                        >
                            <i className="fas fa-download text-lg sm:text-xl"></i>
                        </button>
                        
                        {/* Delete (Only if prop is provided) */}
                        {handleDelete && (
                            <button 
                                onClick={(e) => onDeleteClick(e, images[selectedIndex])} 
                                className="text-white/70 hover:text-danger transition-colors"
                                title="Delete"
                            >
                                <i className="fas fa-trash-alt text-lg sm:text-xl"></i>
                            </button>
                        )}

                        {/* Close */}
                        <button 
                            onClick={handleClose} 
                            className="text-white/70 hover:text-danger transition-colors border-l border-white/20 pl-4 sm:pl-6 ml-1"
                            title="Close"
                        >
                            <i className="fas fa-times text-xl sm:text-2xl"></i>
                        </button>
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button 
                                onClick={handlePrev} 
                                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors text-3xl sm:text-5xl p-2 sm:p-4 z-50 hover:scale-110"
                            >
                                <i className="fas fa-chevron-left drop-shadow-lg"></i>
                            </button>
                            <button 
                                onClick={handleNext} 
                                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors text-3xl sm:text-5xl p-2 sm:p-4 z-50 hover:scale-110"
                            >
                                <i className="fas fa-chevron-right drop-shadow-lg"></i>
                            </button>
                        </>
                    )}

                    {/* Image / Content Display */}
                    {/* Prevent click from propagating to the background wrapper */}
                    <div className="relative max-w-[95vw] sm:max-w-[85vw] max-h-[85vh] flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                        
                        {images[selectedIndex].type === 'image' ? (
                            <img 
                                src={images[selectedIndex].url} 
                                alt={images[selectedIndex].originalName} 
                                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl select-none" 
                                draggable={false}
                            />
                        ) : (
                            <div className="w-[80vw] sm:w-[500px] h-[60vh] bg-surface rounded-xl flex flex-col items-center justify-center p-8 text-center shadow-2xl">
                                <i className="fas fa-file-pdf text-6xl text-danger mb-4"></i>
                                <h3 className="text-xl font-bold text-foreground mb-2 break-all">{images[selectedIndex].originalName}</h3>
                                <p className="text-muted text-sm mb-6">Preview is not available for PDF documents.</p>
                                <button 
                                    // onClick={(e) => handleDownload(e, images[selectedIndex].url, images[selectedIndex].originalName)}
                                    // disabled={downloadMutation.isPending}
                                    onClick={(e) => handleDownloadClick(e, images[selectedIndex])}
                                    className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                                >
                                    <i className="fas fa-download mr-2"></i> Download File
                                </button>
                            </div>
                        )}

                        {/* Image Counter */}
                        {images.length > 1 && (
                            <div className="absolute -bottom-12 text-white/90 text-xs sm:text-sm font-bold bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10 tracking-widest uppercase">
                                {selectedIndex + 1} of {images.length}
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};