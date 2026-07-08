import { useState } from 'react';
import { Button } from '../../../shared/ui/Button';
import { toast } from '../../../shared/ui/ToastContext';
import { ImageGallery } from '../../../shared/components/ImageGallery';
import { useDeleteEmployeeDocument, useDeleteSpecificDocument, useUpsertEmployeeProfile } from '../../../api_services/auth_api/employeeProfileApi';
import { useAuthData } from '../../../hooks/useAuthData';

interface DocumentsTabProps {
    userId: string;
    hasProfile: boolean;
    documents: any[];
    panDocument?: any;
    aadhaarDocument?: any;
    appointmentLetter?: any;
    refetch: () => void;
}

export function DocumentsTab({ userId, hasProfile, documents, refetch, panDocument,
    aadhaarDocument,
    appointmentLetter }: DocumentsTabProps) {
    console.log("hasProfile", hasProfile)
    // const { mutateAsync: addDocuments, isPending: isUploadingDocs } = useAddEmployeeDocuments();
    const { schoolId } = useAuthData()

    const { mutateAsync: upsertProfile, isPending: isUploadingDocs } = useUpsertEmployeeProfile();

    const { mutateAsync: deleteDocument, isPending: isDeletingDoc } = useDeleteEmployeeDocument();
    const { mutateAsync: deleteSpecificDoc } = useDeleteSpecificDocument();
    const [loadingDocKey, setLoadingDocKey] = useState<string | null>(null);

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const allDocs = documents || [];
    const imageDocs = allDocs.filter((doc: any) => doc?.type === 'image');
    const pdfDocs = allDocs.filter((doc: any) => doc?.type === 'pdf');

    const galleryImages: any[] = imageDocs.map((doc: any) => ({
        type: 'image',
        key: doc.key,
        url: doc.url,
        originalName: doc.originalName || 'Document photo',
        uploadedAt: doc.uploadedAt || new Date(),
        _id: doc._id
    }));

    // const handleDocumentUpload = async () => {
    //     if (selectedFiles.length === 0) {
    //         toast.error("Please select at least one file.");
    //         return;
    //     }
    //     try {
    //         await addDocuments({ userId, files: selectedFiles });
    //         toast.success("Documents uploaded successfully!");
    //         setSelectedFiles([]);
    //         refetch();
    //     } catch (error: any) {
    //         toast.error(error.message || "Failed to upload documents");
    //     }
    // };

    const handleDocumentUpload = async () => {
        if (selectedFiles.length === 0) return;

        try {
            const formData = new FormData();
            // 🌟 CRITICAL: Append each file with the SAME field name "documents"
            selectedFiles.forEach((file) => {
                formData.append("documents", file);
            });

            // Use your new upsert hook (consistent with your other tabs)
            await upsertProfile({
                userId,
                schoolId: schoolId!,
                documents: selectedFiles // The hook handles the FormData appending
            });

            toast.success("Documents uploaded successfully!");
            setSelectedFiles([]); // Clear selection
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Failed to upload documents");
        }
    };

    const handleDocumentDelete = async (documentId: string) => {
        try {
            await deleteDocument({ userId, documentId });
            toast.success("Document deleted.");
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete document");
        }
       
    };



    const handleSpecificDocUpload = async (file: File | null, fieldName: 'panDocument' | 'aadhaarDocument' | 'appointmentLetter') => {
        if (!file) return;
        setLoadingDocKey(fieldName); // Start loading
        try {
            await upsertProfile({
                userId,
                schoolId: schoolId!,
                [fieldName]: file // Dynamically pass the correct file field
            });
            toast.success("Document uploaded successfully!");
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Failed to upload document");
        }
         finally {
            setLoadingDocKey(null); // Stop loading
        }
    };

    // Add this right below your handleSpecificDocUpload function
    const handleSpecificDocDelete = async (fieldKey: string) => {
        setLoadingDocKey(fieldKey); // Start loading
        try {
            await deleteSpecificDoc({ userId, field: fieldKey });
            toast.success("Document removed successfully.");
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Failed to remove document");
        }
        finally {
            setLoadingDocKey(null); // Stop loading
        }
    };

    const handleGalleryDelete = (image: any) => {
        handleDocumentDelete(image._id);
    };


    const specificDocs = [
        { label: 'PAN Card', key: 'panDocument', data: panDocument },
        { label: 'Aadhaar Card', key: 'aadhaarDocument', data: aadhaarDocument },
        { label: 'Appointment Letter', key: 'appointmentLetter', data: appointmentLetter }
    ];

    // const missingSpecificDocs = specificDocs.filter(doc => !doc.data);
    // const savedSpecificDocs = specificDocs.filter(doc => doc.data);

    return (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm max-w-7xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-bold text-foreground">Upload Documents</h2>
                    <p className="text-xs text-muted mt-1">upload your education and other employee records.</p>
                </div>
            </div>

            {/* 🌟 NEW: Specific Identity Documents Section */}
            {/* 1. Specific Docs Upload (Only shows if missing) */}
            {/* <div className="space-y-8">
                {missingSpecificDocs.length > 0 && (
                    <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Pending Identity Documents</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {missingSpecificDocs.map((doc) => (
                                <div key={doc.key} className="border border-border rounded-xl p-4 bg-background flex flex-col gap-3">
                                    <span className="text-sm font-semibold text-foreground">{doc.label}</span>
                                    <label className="flex items-center justify-center gap-2 border border-dashed border-border p-3 rounded-lg cursor-pointer hover:bg-primary-soft/30 hover:border-primary transition-colors text-muted hover:text-primary mt-auto text-xs font-medium">
                                        <i className="fas fa-upload"></i> Upload
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,image/*"
                                            onChange={(e) => handleSpecificDocUpload(e.target.files?.[0] || null, doc.key as any)}
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div> */}


            {/* ... Keep your existing generic documents uploader here ... */}


            <div className="space-y-6">

                <label
                    htmlFor="document-upload-input"
                    className="group flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl px-6 py-10 cursor-pointer transition-colors hover:border-primary hover:bg-primary-soft/30"
                >
                    <div className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center text-primary text-lg group-hover:scale-105 transition-transform">
                        <i className="fas fa-cloud-arrow-up"></i>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-foreground">Click to upload</p>
                        <p className="text-xs text-muted mt-1">PDF or image files, multiple files supported</p>
                    </div>
                    <input
                        id="document-upload-input"
                        type="file"
                        multiple
                        accept=".pdf,image/*"
                        onChange={(e) => setSelectedFiles(e.target.files ? Array.from(e.target.files) : [])}
                        className="hidden"
                    />
                </label>

                {selectedFiles.length > 0 && (
                    <div className="border border-border rounded-lg p-4 space-y-3 bg-mainBg/50">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-muted uppercase tracking-wider">
                                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                            </p>
                            <button onClick={() => setSelectedFiles([])} className="text-xs text-muted hover:text-red-500 transition-colors">
                                Clear all
                            </button>
                        </div>
                        <div className="space-y-2">
                            {selectedFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-2 bg-surface border border-border rounded-lg px-3 py-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <i className={`fas ${file.type.startsWith('image/') ? 'fa-image' : 'fa-file-pdf'} text-primary text-sm`}></i>
                                        <span className="text-sm text-foreground truncate">{file.name}</span>
                                        <span className="text-xs text-muted shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                                    </div>
                                    <button onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))} className="text-muted hover:text-red-500 text-xs shrink-0">
                                        <i className="fas fa-xmark"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end pt-1">
                            <Button variant="primary" size="sm" isLoading={isUploadingDocs} onClick={handleDocumentUpload}>
                                Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
                            </Button>
                        </div>
                    </div>
                )}



                <section>
                    {/* 🌟 UNIFIED IDENTITY DOCUMENTS SECTION (Upload & View together) */}
                    <div className="mb-8 border-b border-border pb-8">
                        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-4">
                            Identity & Employment Documents
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                            {/* Map through ALL specific docs, regardless of whether they are uploaded or missing */}
                            {specificDocs.map((doc) => (
                                <div key={doc.key} className="relative border border-border rounded-xl p-4 bg-background flex flex-col gap-3 shadow-sm hover:border-primary/30 transition-colors">

                                    {/* 🌟 LOADING OVERLAY: Appears over the whole card */}
                                    {loadingDocKey === doc.key && (
                                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-xl">
                                            <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
                                        </div>
                                    )}

                                    {/* 1. Header: Always shows what document this box is for */}
                                    <div className="flex justify-between items-center border-b border-border/50 pb-2">
                                        <span className="text-sm font-bold text-foreground flex items-center gap-2">
                                            <i className={`fas ${doc.key === 'appointmentLetter' ? 'fa-briefcase' : 'fa-id-card'} text-muted text-xs`}></i>
                                            {doc.label}
                                        </span>

                                        {/* Status Indicator */}
                                        {doc.data ? (
                                            <span className="w-6 h-6 rounded-full bg-success/10 text-success flex items-center justify-center text-xs" title="Uploaded">
                                                <i className="fas fa-check"></i>
                                            </span>
                                        ) : (
                                            <span className="w-6 h-6 rounded-full bg-warning/10 text-warning flex items-center justify-center text-xs" title="Missing">
                                                <i className="fas fa-exclamation"></i>
                                            </span>
                                        )}
                                    </div>

                                    {/* 2. Body: Show the Document OR the Fallback Upload Button */}
                                    {doc.data ? (
                                        // --- DOCUMENT IS UPLOADED ---
                                        doc.data.type === 'image' ? (
                                            // Image View
                                            <div className="flex flex-col gap-2 mt-auto h-full justify-end">
                                                <div
                                                    className="relative w-full h-32 rounded-lg overflow-hidden border border-border cursor-pointer group"
                                                    onClick={() => setPreviewImage(doc.data.url)}
                                                    title="Click to view full size"
                                                >
                                                    <img src={doc.data.url} alt={doc.label} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                        <i className="fas fa-expand text-white opacity-0 group-hover:opacity-100 drop-shadow-md text-xl"></i>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center px-1 mt-1">
                                                    <span className="text-xs font-medium text-muted truncate pr-2" title={doc.data.originalName}>{doc.data.originalName}</span>
                                                    <button onClick={() => handleSpecificDocDelete(doc.key)} disabled={isDeletingDoc} className="text-muted hover:text-red-500 shrink-0 bg-surface w-7 h-7 rounded flex items-center justify-center border border-border">
                                                        <i className="fas fa-trash text-xs"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            // PDF View
                                            <div className="flex flex-col gap-2 mt-auto h-full justify-end">
                                                <div className="flex flex-col items-center justify-center bg-surface border border-border p-4 rounded-lg h-32">
                                                    <i className="fas fa-file-pdf text-danger text-3xl mb-2"></i>
                                                    <a href={doc.data.url} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary hover:underline truncate w-full text-center">
                                                        View PDF
                                                    </a>
                                                </div>
                                                <div className="flex justify-between items-center px-1 mt-1">
                                                    <span className="text-xs font-medium text-muted truncate pr-2">{doc.data.originalName}</span>
                                                    <button onClick={() => handleSpecificDocDelete(doc.key)} disabled={isDeletingDoc} className="text-muted hover:text-red-500 shrink-0 bg-surface w-7 h-7 rounded flex items-center justify-center border border-border">
                                                        <i className="fas fa-trash text-xs"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        // --- FALLBACK: DOCUMENT IS MISSING ---
                                        <div className="flex flex-col items-center justify-center bg-surface/50 border border-dashed border-border rounded-lg p-4 mt-auto h-full min-h-[140px]">
                                            <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted mb-2">
                                                <i className="fas fa-file-circle-xmark"></i>
                                            </div>
                                            <p className="text-xs text-muted mb-3 font-medium">Not uploaded yet</p>

                                            <label className="flex items-center justify-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-md cursor-pointer hover:bg-primary hover:text-white transition-colors text-xs font-bold w-full">
                                                <i className="fas fa-upload"></i> Upload {doc.label}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,image/*"
                                                    onChange={(e) => handleSpecificDocUpload(e.target.files?.[0] || null, doc.key as any)}
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
                            Educational & Additional Documents {allDocs.length ? `(${allDocs.length})` : ''}
                        </p>

                        {allDocs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-12 border border-dashed border-border rounded-xl text-center">
                                <div className="w-10 h-10 rounded-full bg-mainBg flex items-center justify-center text-muted">
                                    <i className="far fa-folder-open"></i>
                                </div>
                                <p className="text-sm font-medium text-foreground">No educational or extra documents uploaded</p>
                                <p className="text-xs text-muted">Files you upload above will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {galleryImages.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-muted mb-2">Images</p>
                                        <ImageGallery
                                            images={galleryImages}
                                            {...(!isDeletingDoc ? { handleDelete: handleGalleryDelete } : {})}
                                            heightClass="h-32 sm:h-40"
                                            widthClass="w-full sm:w-48 md:w-52"
                                        />
                                    </div>
                                )}

                                {pdfDocs.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-muted mb-2">PDFs</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {pdfDocs.map((doc: any) => (
                                                <div key={doc._id} className="group border border-border rounded-lg p-3 flex items-center justify-between gap-2 hover:border-primary/40 transition-colors">
                                                    <a href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 min-w-0 text-sm text-foreground hover:text-primary transition-colors">
                                                        <span className="w-8 h-8 shrink-0 rounded-md bg-primary-soft flex items-center justify-center text-primary text-xs">
                                                            <i className="fas fa-file-pdf"></i>
                                                        </span>
                                                        <span className="truncate font-medium">{doc.originalName}</span>
                                                    </a>
                                                    <button disabled={isDeletingDoc} onClick={() => handleDocumentDelete(doc._id)} className="text-muted hover:text-red-500 text-xs transition-opacity shrink-0">
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>



            {/* 🌟 NEW: Full Screen Document Image Popup */}
            {previewImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">

                    {/* Clickable backdrop to close */}
                    <div
                        className="absolute inset-0 cursor-zoom-out"
                        onClick={() => setPreviewImage(null)}
                    ></div>

                    {/* Close Button */}
                    <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                        title="Close"
                    >
                        <i className="fas fa-times text-xl"></i>
                    </button>

                    {/* The Full Size Image */}
                    <div className="relative z-10 max-w-full max-h-full">
                        <img
                            src={previewImage}
                            alt="Document Preview"
                            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain border-2 border-white/10"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}