import { useState, useEffect, useMemo } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
import { Input, Label } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { useGetAllClassesWithSections } from '../../api_services/teacher_api/teacherApi';
import {
    useAddAnnouncementAttachment,
    useDeleteAnnouncementAttachment
} from '../../api_services/announcement_api/announcementApi';
import { ImageGallery } from '../../shared/components/ImageGallery';
import { useRoleCheck } from '../../hooks/useRoleCheck';

interface AnnouncementSingleProps {
    mode: 'view' | 'edit' | 'create';
    initialData?: any;
    onSubmit: (data: any, files: File[]) => void;
    isSubmitting: boolean;
    onCancel: () => void;
    isEditable?: boolean;
    onEdit?: () => void;
}

const TYPE_OPTIONS = [
    { label: 'General Announcement', value: 'announcement' },
    { label: 'Important Notice', value: 'notice' },
    { label: 'Holiday', value: 'holiday' },
    { label: 'Event', value: 'event' },
];

const PRIORITY_OPTIONS = [
    { label: 'Normal', value: 'normal' },
    { label: 'High', value: 'high' },
    { label: 'Urgent', value: 'urgent' },
];

const AUDIENCE_OPTIONS = [
    { label: 'Everyone (Public)', value: 'all' },
    { label: 'Parents / Students', value: 'parent' },
    { label: 'Teachers / Staff', value: 'teacher' },
    { label: 'Specific Classes', value: 'specific_classes' },
];

export default function AnnouncementSingle({
    mode,
    initialData,
    onSubmit,
    isSubmitting,
    onCancel,
    isEditable = false,
    onEdit
}: AnnouncementSingleProps) {
    const { schoolId } = useAuthData();
    const isReadOnly = mode === 'view';

    // --- File Mutations (For Edit Mode Only) ---
    const addAttachmentMutation = useAddAnnouncementAttachment();
    const deleteAttachmentMutation = useDeleteAnnouncementAttachment();


    const {isCorrespondent, isAdmin, isPrincipal} = useRoleCheck()

    const canModify = isAdmin || isCorrespondent || isPrincipal

    // --- Fetch Classes for "Specific Classes" option ---
    const { data: classesData } = useGetAllClassesWithSections({ schoolId: schoolId! });
    const classOptions = useMemo(() => {
        return (classesData || []).map((c: any) => ({ label: c.name, value: c._id }));
    }, [classesData]);

    // --- Form State ---
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'announcement',
        priority: 'normal',
        targetAudience: ['all'],
        targetClasses: [] as string[],
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // Load initial data if editing or viewing
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                type: initialData.type || 'announcement',
                priority: initialData.priority || 'normal',
                targetAudience: initialData.targetAudience || ['all'],
                targetClasses: initialData.targetClasses?.map((c: any) => c._id || c) || [],
            });
            // Clear pending files if switching modes
            setSelectedFiles([]);
        }
    }, [initialData, mode]);

    // // --- Handlers ---
    // const handleAudienceChange = (opts: any) => {
    //     const values = Array.isArray(opts) ? opts.map(o => o.value) : [opts?.value];
    //     let finalValues = values;
    //     if (values.includes('all') && !formData.targetAudience.includes('all')) finalValues = ['all'];
    //     else if (values.length > 1 && values.includes('all')) finalValues = values.filter(v => v !== 'all');

    //     setFormData(prev => ({ ...prev, targetAudience: finalValues }));
    // };

    // const handleClassChange = (opts: any) => {
    //     const values = Array.isArray(opts) ? opts.map(o => o.value) : [opts?.value];
    //     setFormData(prev => ({ ...prev, targetClasses: values }));
    // };

    const handleSubmit = () => {
        onSubmit(formData, selectedFiles);
    };

    // --- Direct File Handlers (Edit Mode) ---
    const handleUploadNewAttachments = async () => {
        if (!initialData?._id || selectedFiles.length === 0) return;

        const uploadFormData = new FormData();
        selectedFiles.forEach(f => uploadFormData.append('attachment', f)); // Backend expects 'attachment'

        try {
            await addAttachmentMutation.mutateAsync({ id: initialData._id, formData: uploadFormData });
            setSelectedFiles([]); // Clear queue on success
        } catch (error) {
            console.error("Failed to upload attachments", error);
        }
    };

    const handleDeleteAttachment = async (fileId: string) => {
        if (!initialData?._id) return;
        if (window.confirm("Are you sure you want to permanently delete this file?")) {
            try {
                await deleteAttachmentMutation.mutateAsync({ announcementId: initialData._id, fileId });
            } catch (error) {
                console.error("Failed to delete attachment", error);
            }
        }
    };

    // const selectedAudienceOptions = AUDIENCE_OPTIONS.filter(option =>
    //     formData.targetAudience.includes(option.value)
    // );

    // UI Helpers
    const getPriorityBadge = (priority: string) => {
        if (priority === 'urgent') return 'bg-danger/10 text-danger border-danger/20';
        if (priority === 'high') return 'bg-warning/10 text-warning border-warning/20';
        return 'bg-success/10 text-success border-success/20';
    };

    const isSpecificClasses = formData.targetAudience.includes('specific_classes');

    return (
        <div className="w-full h-full flex flex-col bg-background overflow-hidden animate-in fade-in">

            {/* HEADER */}
            <header className="shrink-0 px-6 py-4 border-b border-border bg-surface flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onCancel}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-background border border-border text-muted hover:text-foreground hover:bg-primary-soft transition-colors"
                    >
                        <i className="fas fa-arrow-left text-sm"></i>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-foreground capitalize">
                            {mode} Announcement
                        </h1>
                        <p className="text-[11px] text-muted uppercase tracking-wider font-medium mt-0.5">
                            {mode === 'create' ? 'Draft a new notice' : initialData?._id}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {!isReadOnly ? (
                        <>
                            <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
                            <Button
                                variant="primary"
                                leftIcon="fas fa-paper-plane"
                                onClick={handleSubmit}
                                isLoading={isSubmitting}
                                disabled={!formData.title || !formData.description || (isSpecificClasses && formData.targetClasses.length === 0)}
                            >
                                {mode === 'create' ? 'Publish Now' : 'Save Changes'}
                            </Button>
                        </>
                    ) :(canModify && isEditable && onEdit) ? (
                        <Button variant="primary" leftIcon="fas fa-edit" onClick={onEdit}>
                            Edit Notice
                        </Button>
                    ) : null}
                </div>
            </header>

            {/* MAIN CONTENT AREA - 70/30 SPLIT */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
                <div className="max-w-full mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 h-full">

                    {/* LEFT PANE: 70% - Core Content */}
                    <div className="w-full lg:w-[70%] space-y-6 flex flex-col">

                        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm space-y-6">
                            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-3">Notice Content</h2>

                            {isReadOnly ? (
                                <div className="space-y-4">
                                    <h1 className="text-2xl font-bold text-foreground">{formData.title}</h1>
                                    <div className="p-4 bg-background border border-border rounded-xl min-h-[200px]">
                                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                            {formData.description}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <Input
                                        label="Announcement Title"
                                        placeholder="e.g., Annual Sports Day 2026"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />

                                    <div className="flex flex-col gap-1.5 flex-1 min-h-[300px]">
                                        <Label>Detailed Description <span className="text-danger">*</span></Label>
                                        <textarea
                                            className="w-full flex-1 bg-background border border-border rounded-xl p-4 text-sm focus:border-primary outline-none transition-colors resize-none custom-scrollbar"
                                            placeholder="Write the full details of the notice here..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Attachments Section */}
                        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
                            <div className="flex justify-between items-end border-b border-border pb-3 mb-4">
                                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Attachments</h2>
                                {(mode === 'create' || mode === 'edit') && (
                                    <label className="text-[10px] font-bold text-primary bg-primary-soft px-2 py-1 rounded cursor-pointer hover:bg-primary/20 transition-colors">
                                        <i className="fas fa-plus mr-1"></i> Add Files
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Existing Attachments (View/Edit Mode) */}
                            {initialData?.attachments?.length > 0 && (
                                <div className="space-y-6 mb-4">

                                    {initialData.attachments?.some((f: any) => f.type === 'image') && (
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-[10px] text-muted uppercase">Attached Images</Label>

                                            <ImageGallery
                                                images={initialData.attachments.filter((f: any) => f.type === 'image')}
                                                // The gallery returns the whole image object, so we extract the _id here
                                                {...(canModify ? {handleDelete:(image: any) => handleDeleteAttachment(image._id)} : {})}
                                                // Using standard responsive classes to mimic your previous grid aspect ratio
                                                heightClass="h-24 sm:h-28 md:h-32"
                                                widthClass="w-full sm:w-32 md:w-40"
                                            />
                                        </div>
                                    )}

                                    {/* 2. PDF / DOCUMENT LIST */}
                                    {initialData.attachments.filter((f: any) => f.type === 'pdf' || f.type !== 'image').length > 0 && (
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-[10px] text-muted uppercase">Attached Documents</Label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {initialData.attachments
                                                    .filter((f: any) => f.type === 'pdf' || f.type !== 'image')
                                                    .map((file: any) => (
                                                        <div key={file._id} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg hover:border-primary transition-colors group shadow-sm">
                                                            <a href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 flex-1 overflow-hidden pr-2">
                                                                <div className="w-8 h-8 rounded flex items-center justify-center bg-danger/10 text-danger shrink-0">
                                                                    <i className="fas fa-file-pdf"></i>
                                                                </div>
                                                                <div className="flex flex-col flex-1 overflow-hidden">
                                                                    <span className="text-xs font-bold text-foreground truncate">{file.originalName}</span>
                                                                    <span className="text-[9px] text-muted uppercase">Document</span>
                                                                </div>
                                                            </a>
                                                            {mode === 'edit' ? (
                                                                <button
                                                                    onClick={() => handleDeleteAttachment(file._id)}
                                                                    className="w-8 h-8 rounded flex items-center justify-center text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-colors shrink-0"
                                                                    title="Delete Document"
                                                                >
                                                                    <i className="fas fa-trash-alt text-xs"></i>
                                                                </button>
                                                            ) : (
                                                                <a href={file.url} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                                    <i className="fas fa-external-link-alt text-xs"></i>
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Pending New Files (Create & Edit Mode) */}
                            {selectedFiles.length > 0 && (
                                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] text-muted uppercase">Files ready to Upload</Label>
                                        {/* Direct Upload Button (Only in Edit mode) */}
                                        {(canModify && mode === 'edit') && (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                leftIcon="fas fa-cloud-upload-alt"
                                                onClick={handleUploadNewAttachments}
                                                isLoading={addAttachmentMutation.isPending}
                                                className="h-7 text-[10px]"
                                            >
                                                Upload to Notice
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedFiles.map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs bg-primary-soft text-primary px-3 py-1.5 rounded-lg border border-primary/10">
                                                <i className="fas fa-paperclip"></i>
                                                <span className="max-w-[150px] truncate font-medium">{f.name}</span>
                                                <button onClick={() => setSelectedFiles(files => files.filter((_, idx) => idx !== i))} className="ml-1 text-danger hover:text-danger/70">
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {selectedFiles.length === 0 && (!initialData?.attachments || initialData.attachments.length === 0) && (
                                <div className="py-6 flex flex-col items-center justify-center text-muted bg-background rounded-xl border border-dashed border-border">
                                    <i className="fas fa-folder-open text-3xl opacity-30 mb-2"></i>
                                    <p className="text-xs font-medium">No files attached to this notice.</p>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* RIGHT PANE: 30% - Settings Sidebar */}
                    <div className="w-full lg:w-[30%] space-y-6">

                        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm space-y-5">
                            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-3">Notice Settings</h2>

                            <div className="flex flex-col gap-1.5">
                                <Label>Document Type</Label>
                                {isReadOnly ? (
                                    <span className="text-sm font-bold text-foreground capitalize bg-background px-3 py-2 rounded-lg border border-border">{formData.type}</span>
                                ) : (
                                    <SearchSelect
                                        options={TYPE_OPTIONS}
                                        value={formData.type}
                                        onChange={(opt: any) => setFormData({ ...formData, type: opt?.value })}
                                    />
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label>Priority Level</Label>
                                {isReadOnly ? (
                                    <span className={`w-fit px-3 py-1 text-xs rounded uppercase font-bold tracking-wider border ${getPriorityBadge(formData.priority)}`}>
                                        {formData.priority}
                                    </span>
                                ) : (
                                    <SearchSelect
                                        options={PRIORITY_OPTIONS}
                                        value={formData.priority}
                                        onChange={(opt: any) => setFormData({ ...formData, priority: opt?.value })}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm space-y-5">
                            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-3">Visibility & Access</h2>

                            <div className="flex flex-col gap-1.5">
                                <Label>Target Audience</Label>
                                {isReadOnly ? (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {formData.targetAudience.map(aud => (
                                            <span key={aud} className="bg-background border border-border px-2 py-1 text-xs font-bold text-muted rounded capitalize">
                                                {aud.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <SearchSelect
                                        options={AUDIENCE_OPTIONS}
                                        // Pass the first string in the array (e.g., "specific_classes")
                                        value={formData.targetAudience[0] || ''}
                                        onChange={(opt: any) => {
                                            // Backend expects an array, so we wrap the selected string in an array
                                            setFormData({ ...formData, targetAudience: opt?.value ? [opt.value] : [] });
                                        }}
                                    />
                                )}
                            </div>

                            {/* Specific Classes Condition */}
                            {isSpecificClasses && (
                                <div className="flex flex-col gap-1.5 pt-3 border-t border-border animate-in fade-in">
                                    <Label>Targeted Classes <span className="text-danger">*</span></Label>
                                    <p className="text-[9px] text-muted -mt-1 leading-tight">Note: Selecting a class targets all sections within it.</p>
                                    {isReadOnly ? (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {initialData?.targetClasses?.map((cls: any) => (
                                                <span key={cls._id || cls} className="bg-primary-soft text-primary border border-primary/10 px-2 py-1 text-[10px] font-bold rounded">
                                                    {cls.name || cls}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <SearchSelect
                                            options={classOptions}
                                            // Pass the first ID string from the targetClasses array
                                            value={formData.targetClasses[0] || ''}
                                            onChange={(opt: any) => {
                                                // Wrap the selected class ID back into an array for the backend
                                                setFormData({ ...formData, targetClasses: opt?.value ? [opt.value] : [] });
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Audit Info (View/Edit Mode Only) */}
                        {!['create'].includes(mode) && initialData?.createdBy && (
                            <div className="bg-background border border-border p-4 rounded-xl text-xs text-muted flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span>Published By:</span>
                                    <span className="font-bold text-foreground">{initialData.createdBy.userName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Role:</span>
                                    <span className="font-medium capitalize">{initialData.createdBy.role}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Date:</span>
                                    <span className="font-medium">{new Date(initialData.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}