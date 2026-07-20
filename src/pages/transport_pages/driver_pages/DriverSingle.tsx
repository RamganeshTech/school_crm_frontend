import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../features/store/store';

// UI Components
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { toast } from '../../../shared/ui/ToastContext';
import { useRoleCheck } from '../../../hooks/useRoleCheck';

// Hooks
import {
    useGetDriverById,
    useUpdateDriver,
    useDeleteDriverDocumentAttachment
} from '../../../api_services/transport_api/driverApi';
import { useGetBusDropDown } from '../../../api_services/transport_api/busApi';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import DriverRoute from './DriverRoute';


export const DRIVER_DOCUMENT_NAMES = [
    "Driving License",
    "Badge",
    "Police Verification",
    "Medical Certificate",
    "Aadhar Card", // Replaced sensitive government ID with placeholder
    "Other",
] as const;


export default function DriverSingle() {
    const { id } = useParams<{ id: string }>() as { id: string }
    const navigate = useNavigate();
    const { schoolId } = useSelector((state: RootState) => state.auth);

    // --- API Hooks ---
    const { data: driverData, isLoading, isError, refetch } = useGetDriverById(id);
    const updateDriverMutation = useUpdateDriver();
    const deleteDocAttachmentMutation = useDeleteDriverDocumentAttachment();

    const { data: busesData } = useGetBusDropDown({ schoolId: schoolId! });
    const busOptions = React.useMemo(() => {
        const busesList = Array.isArray(busesData) ? busesData : (busesData?.data || []);
        return busesList.map((bus: any) => ({
            label: `${bus.registrationNo} ${bus.busNumber ? `(${bus.busNumber})` : ''}`,
            value: bus._id
        }));
    }, [busesData]);

    // --- Permissions ---
    const { isPrincipal, isVicePrincipal } = useRoleCheck();
    const canEdit = !isPrincipal && !isVicePrincipal;

    // --- Local State ---
    const [isEditMode, setIsEditMode] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        name: '', phone: '', dateOfBirth: '', joinedDate: '', emergencyContact: '', address: '',
        assignedBusId: ""
    });

    // To hold completely NEW documents added during edit mode
    // const [newDocuments, setNewDocuments] = useState<any[]>([]);
    const [documentForms, setDocumentForms] = useState<any[]>([]);

    // --- Sync Data on Load or Cancel ---
    useEffect(() => {
        if (driverData) {
            setFormData({
                name: driverData.name || '',
                phone: driverData.phone || '',
                dateOfBirth: driverData.dateOfBirth ? new Date(driverData.dateOfBirth).toISOString().split('T')[0] : '',
                joinedDate: driverData.joinedDate ? new Date(driverData.joinedDate).toISOString().split('T')[0] : '',
                emergencyContact: driverData.emergencyContact || '',
                address: driverData.address || '',
                assignedBusId: (driverData.assignedBusId as any)?._id || driverData.assignedBusId || '',

            });
            setPhotoFile(null);

            // Map the 6 standard documents and merge with existing DB data
            const mergedDocs = DRIVER_DOCUMENT_NAMES.map((docName, index) => {
                const existing = driverData.documents?.find((d: any) => d.documentName === docName);
                return {
                    id: existing?._id || `default_${index}`,
                    documentName: docName,
                    detail: existing?.detail || '',
                    expiryDate: existing?.expiryDate ? new Date(existing.expiryDate).toISOString().split('T')[0] : '',
                    status: existing?.status || 'valid',
                    existingFiles: existing?.files || [],
                    newFiles: []
                };
            });
            setDocumentForms(mergedDocs);
        }
    }, [driverData, isEditMode]);


    // --- Handlers ---
    const handleCancel = () => {
        setIsEditMode(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;

        // Restrict these fields to numbers only as the user types
        if (id === 'phone' || id === 'emergencyContact') {
            const onlyNums = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({ ...prev, [id]: onlyNums }));
            return;
        }

        setFormData(prev => ({ ...prev, [id]: value }));
    };


    const handleSelectChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };



    // --- Save Handler ---
    const handleSave = async () => {
        try {

            const phoneRegex = /^\d{10}$/;

            if (formData.phone && !phoneRegex.test(formData.phone)) {
                toast.error("Phone number must be exactly 10 digits.");
                return;
            }

            if (formData.emergencyContact && !phoneRegex.test(formData.emergencyContact)) {
                toast.error("Emergency contact must be exactly 10 digits.");
                return;
            }

            const payload = new FormData();
            payload.append('schoolId', schoolId!);

            // 1. Text Fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value) payload.append(key, value);
            });

            // 2. Profile Photo
            if (photoFile) payload.append('photo', photoFile);

            // 3. Documents Metadata & Files
            // Filter to only send documents that have actual data (new files, details, or an expiry date)
            const activeDocs = documentForms.filter(doc =>
                (doc.newFiles && doc.newFiles.length > 0) ||
                doc.detail ||
                doc.expiryDate
            );

            if (activeDocs.length > 0) {
                const docMeta = activeDocs.map(doc => {
                    const payloadDoc: any = {
                        documentName: doc.documentName,
                        status: doc.status || 'valid'
                    };

                    // Include details/expiry only if they exist
                    if (doc.detail) payloadDoc.detail = doc.detail;
                    if (doc.expiryDate) payloadDoc.expiryDate = doc.expiryDate;

                    // IMPORTANT: If this document already exists in the DB, send its _id so the backend UPDATES it
                    if (!doc.id.startsWith('default_')) {
                        payloadDoc._id = doc.id;
                    }

                    return payloadDoc;
                });

                payload.append('documents', JSON.stringify(docMeta));

                // Append files using the index that matches the activeDocs array
                activeDocs.forEach((doc, index) => {
                    if (doc.newFiles && doc.newFiles.length > 0) {
                        doc.newFiles.forEach((file: File) => {
                            payload.append(`documents_${index}`, file);
                        });
                    }
                });
            }

            await updateDriverMutation.mutateAsync({ id: id!, formData: payload });
            toast.success("Profile Updated Successfully!");
            setIsEditMode(false);
            refetch();

        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        }
    };


    // --- Delete Existing Document File Handler ---
    const handleDeleteFileClick = async (e: React.MouseEvent, documentId: string, fileId: string) => {
        e.preventDefault();
        // if (window.confirm("Are you sure you want to delete this file? This cannot be undone.")) {
        try {
            await deleteDocAttachmentMutation.mutateAsync({ id: id!, documentId, fileId });
            toast.success("File deleted successfully");
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete file");
        }
        // }
    };

    // --- Render Loading/Error ---
    if (isLoading) return <div className="p-8 text-center text-muted"><i className="fas fa-spinner fa-spin text-2xl"></i></div>;
    if (isError || !driverData) return <div className="p-8 text-center text-danger">Failed to load driver details.</div>;

    return (
        <div className="w-full h-full flex flex-col p-2 space-y-4 overflow-y-auto custom-scrollbar">

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-4 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <i className="fas fa-arrow-left"></i>
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Driver Profile</h2>
                        {/* <p className="text-xs text-muted">ID: {driverData._id}</p> */}
                    </div>
                </div>

                {canEdit && (
                    <div className="flex gap-2">
                        {isEditMode ? (
                            <>
                                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                                <Button variant="primary" onClick={handleSave} isLoading={updateDriverMutation.isPending} leftIcon="fas fa-save">
                                    Save Changes
                                </Button>
                            </>
                        ) : (
                            <Button variant="primary" onClick={() => setIsEditMode(true)} leftIcon="fas fa-edit">
                                Edit Profile
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* LEFT COLUMN: Photo & Quick Stats */}
                <div className="flex flex-col gap-4">
                    <div className="bg-surface rounded-xl border border-border p-6 flex flex-col items-center text-center shadow-sm">
                        <div className="relative w-32 h-32 rounded-full border-4 border-background shadow-md overflow-hidden bg-primary-soft mb-4 flex items-center justify-center text-primary text-3xl font-bold">
                            {photoFile ? (
                                <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                            ) : driverData.photo?.url ? (
                                <img src={driverData.photo.url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                driverData.name?.charAt(0)
                            )}
                        </div>

                        {isEditMode && (
                            <div className="w-full mb-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => { if (e.target.files) setPhotoFile(e.target.files[0]) }}
                                    className="w-full text-xs text-muted file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary-soft file:text-primary cursor-pointer"
                                />
                            </div>
                        )}

                        <h3 className="text-lg font-bold text-foreground">{driverData.name}</h3>
                        <p className="text-sm text-muted">{driverData.phone}</p>

                        <span className={`mt-3 px-3 py-1 rounded-full text-xs font-bold ${driverData.status === 'active' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                            }`}>
                            {driverData.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                    </div>
                </div>

                {/* RIGHT COLUMN: Details & Documents */}
                <div className="lg:col-span-2 flex flex-col gap-4">

                    {/* Basic Info Card */}
                    <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
                        <h4 className="font-semibold text-foreground border-b border-border pb-3 mb-4 flex items-center gap-2">
                            <i className="fas fa-address-card text-muted"></i> Personal Information
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                            <InfoField label="Full Name" isEdit={isEditMode}>
                                {isEditMode ? <Input id="name" value={formData.name} onChange={handleInputChange} /> : <p className="font-medium text-foreground">{driverData.name}</p>}
                            </InfoField>

                            <InfoField label="Phone Number" isEdit={isEditMode}>
                                {isEditMode ? <Input id="phone" value={formData.phone} onChange={handleInputChange} /> : <p className="font-medium text-foreground">{driverData.phone}</p>}
                            </InfoField>

                            <InfoField label="Date of Birth" isEdit={isEditMode}>
                                {isEditMode ? <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} /> : <p className="font-medium text-foreground">{driverData.dateOfBirth ? new Date(driverData.dateOfBirth).toLocaleDateString() : 'N/A'}</p>}
                            </InfoField>

                            <InfoField label="Joined Date" isEdit={isEditMode}>
                                {isEditMode ? <Input id="joinedDate" type="date" value={formData.joinedDate} onChange={handleInputChange} /> : <p className="font-medium text-foreground">{driverData.joinedDate ? new Date(driverData.joinedDate).toLocaleDateString() : 'N/A'}</p>}
                            </InfoField>

                            <InfoField label="Emergency Contact" isEdit={isEditMode}>
                                {isEditMode ? <Input id="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} /> : <p className="font-medium text-foreground">{driverData.emergencyContact || 'N/A'}</p>}
                            </InfoField>

                            <InfoField label="Assigned Bus" isEdit={isEditMode}>
                                {isEditMode ? (
                                    <SearchSelect
                                        options={busOptions}
                                        value={formData.assignedBusId}
                                        onChange={(opt) => handleSelectChange('assignedBusId', String(opt.value))}
                                        placeholder="Search & Assign Bus..."
                                    />
                                ) : (
                                    <p className="font-medium text-foreground">
                                        {
                                            (driverData.assignedBusId as any)?.busNumber ||
                                            busOptions.find((opt: any) => opt.value === formData.assignedBusId)?.label ||
                                            'Not Assigned'
                                        }
                                    </p>
                                )}
                            </InfoField>

                            <div className="sm:col-span-2">
                                <InfoField label="Address" isEdit={isEditMode}>
                                    {isEditMode ? (
                                        <textarea id="address" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-primary/50" rows={2} value={formData.address} onChange={handleInputChange} />
                                    ) : (
                                        <p className="font-medium text-foreground">{driverData.address || 'N/A'}</p>
                                    )}
                                </InfoField>
                            </div>
                        </div>
                    </div>

                </div>



            </div>


            {/* FULL WIDTH: Statutory Documents List */}
            <div className="bg-surface rounded-xl border border-border p-5 shadow-sm mt-4">
                <h4 className="font-semibold text-foreground border-b border-border pb-3 mb-4 flex items-center gap-2">
                    <i className="fas fa-folder-open text-muted"></i> Statutory Documents
                </h4>

                <div className="flex flex-col gap-4">
                    {documentForms.map((doc) => (
                        <div key={doc.id} className="border border-border/60 bg-background rounded-lg p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

                                {/* Document Type */}
                                <div>
                                    <p className="text-xs font-bold text-muted uppercase tracking-wide">Document Type</p>
                                    <p className="font-semibold text-foreground mt-1">{doc.documentName}</p>
                                </div>

                                {/* Details & Expiry */}
                                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InfoField label="Details" isEdit={isEditMode}>
                                        {isEditMode ? (
                                            <Input
                                                value={doc.detail}
                                                onChange={(e) => setDocumentForms(prev => prev.map(d => d.id === doc.id ? { ...d, detail: e.target.value } : d))}
                                                placeholder="Enter details..."
                                            />
                                        ) : (
                                            <p className="text-sm font-medium mt-1">{doc.detail || 'N/A'}</p>
                                        )}
                                    </InfoField>

                                    <InfoField label="Expiry Date" isEdit={isEditMode}>
                                        {isEditMode ? (
                                            <Input
                                                type="date"
                                                value={doc.expiryDate}
                                                onChange={(e) => setDocumentForms(prev => prev.map(d => d.id === doc.id ? { ...d, expiryDate: e.target.value } : d))}
                                            />
                                        ) : (
                                            <p className="text-sm font-medium mt-1">{doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}</p>
                                        )}
                                    </InfoField>
                                </div>

                                {/* Files Upload & Preview */}
                                <div>
                                    <p className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Attached Files</p>

                                    {/* Existing Files from DB */}
                                    {doc.existingFiles.length > 0 ? (
                                        <div className="flex flex-col gap-3 mb-2">
                                            {doc.existingFiles.map((file: any) => (
                                                <div key={file._id} className="flex items-center justify-between bg-surface border border-border rounded p-2 shadow-sm">

                                                    {/* File Preview Link */}
                                                    {file.type === 'image' ? (
                                                        <a href={file.url} target="_blank" rel="noreferrer" className="flex  w-fit items-center gap-3 overflow-hidden min-w-0">
                                                            <img src={file.url} alt={file.originalName} className="w-10 h-10 object-cover rounded border border-border shrink-0" />
                                                            {/* <span className="text-xs text-primary hover:underline truncate" title={file.originalName}>
                                                                {file.originalName || 'Image File'}
                                                            </span> */}
                                                        </a>
                                                    ) : (
                                                        <a href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 overflow-hidden min-w-0 text-xs text-primary hover:underline" title={file.originalName}>
                                                            <i className="fas fa-file-pdf text-danger text-base shrink-0"></i>
                                                            <span className="truncate">{file.originalName || 'Document File'}</span>
                                                        </a>
                                                    )}

                                                    {/* Delete Button (Edit Mode Only) */}
                                                    {isEditMode && (
                                                        <button
                                                            onClick={(e) => handleDeleteFileClick(e, doc.id, file._id)}
                                                            className="text-danger hover:bg-danger/10 p-1.5 rounded transition-colors ml-3 shrink-0"
                                                            title="Delete File"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        !isEditMode && <p className="text-xs text-muted italic">Not Uploaded</p>
                                    )}

                                    {/* New File Uploader (Edit Mode Only) */}
                                    {isEditMode && (
                                        <input
                                            type="file"
                                            multiple
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    const filesArr = Array.from(e.target.files);
                                                    setDocumentForms(prev => prev.map(d => d.id === doc.id ? { ...d, newFiles: filesArr } : d));
                                                }
                                            }}
                                            className="w-full text-[10px] text-muted file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-primary-soft file:text-primary cursor-pointer border border-border mt-1"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            <section className='w-full'>
                <DriverRoute driverId={id} />
            </section>


        </div>
    );
}

// Small UI Helper for Grid Alignment
const InfoField = ({ label, isEdit, children }: { label: string, isEdit: boolean, children: React.ReactNode }) => (
    <div className={`flex flex-col ${isEdit ? 'gap-1' : 'gap-0.5'}`}>
        <label className="text-xs font-medium text-muted uppercase tracking-wide">{label}</label>
        {children}
    </div>
);