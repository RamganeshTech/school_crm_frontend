import { useState } from 'react';
import { Button } from '../../../shared/ui/Button';
import { toast } from '../../../shared/ui/ToastContext';
import { ImageGallery } from '../../../shared/components/ImageGallery';
import { useAddEmployeeDocuments, useDeleteEmployeeDocument } from '../../../api_services/auth_api/employeeProfileApi';

interface DocumentsTabProps {
    userId: string;
    hasProfile: boolean;
    documents: any[];
    refetch: () => void;
}

export function DocumentsTab({ userId, hasProfile, documents, refetch }: DocumentsTabProps) {
    const { mutateAsync: addDocuments, isPending: isUploadingDocs } = useAddEmployeeDocuments();
    const { mutateAsync: deleteDocument, isPending: isDeletingDoc } = useDeleteEmployeeDocument();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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

    const handleDocumentUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error("Please select at least one file.");
            return;
        }
        try {
            await addDocuments({ userId, files: selectedFiles });
            toast.success("Documents uploaded successfully!");
            setSelectedFiles([]);
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

    const handleGalleryDelete = (image: any) => {
        handleDocumentDelete(image._id);
    };

    return (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm max-w-7xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-bold text-foreground">Uploaded Documents</h2>
                    <p className="text-xs text-muted mt-1">Resumes, certificates, ID proofs, and other employee records.</p>
                </div>
            </div>

            {!hasProfile ? (
                <div className="py-12 text-center text-muted text-sm">
                    <i className="fas fa-circle-info mr-2"></i>
                    Fill the employment details first before uploading documents.
                </div>
            ) : (
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

                    <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
                            Saved Documents {allDocs.length ? `(${allDocs.length})` : ''}
                        </p>

                        {allDocs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-12 border border-dashed border-border rounded-xl text-center">
                                <div className="w-10 h-10 rounded-full bg-mainBg flex items-center justify-center text-muted">
                                    <i className="far fa-folder-open"></i>
                                </div>
                                <p className="text-sm font-medium text-foreground">No documents uploaded yet</p>
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
                </div>
            )}
        </div>
    );
}