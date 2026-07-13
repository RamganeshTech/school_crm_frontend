import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../features/store/store';

// UI Components
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { toast } from '../../../shared/ui/ToastContext';
import { useRoleCheck } from '../../../hooks/useRoleCheck';

// API Hooks (Adjust paths to your actual files)
import {
    useGetBusById,
    useUpdateBus,
    useDeleteBusDocumentAttachment
} from '../../../api_services/transport_api/busApi';
import { useGetDriverDropDown } from '../../../api_services/transport_api/driverApi';

// Fixed set — every bus must have exactly these 5 statutory documents
const ALLOWED_BUS_DOCUMENT_NAMES = [
    "FC",
    "Insurance",
    "Permit",
    "Pollution",
    "Road Tax"
];

export default function BusSingle() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { schoolId } = useSelector((state: RootState) => state.auth);

    // --- API Hooks ---
    const { data: busData, isLoading, isError, refetch } = useGetBusById(id);
    const updateBusMutation = useUpdateBus();
    const deleteDocAttachmentMutation = useDeleteBusDocumentAttachment();

    // Fetch and format driver dropdown data
    const { data: driversData } = useGetDriverDropDown({ schoolId: schoolId! });


    // --- Permissions ---
    const { isPrincipal, isVicePrincipal } = useRoleCheck();
    const canEdit = !isPrincipal && !isVicePrincipal;

    // --- Local State ---
    const [isEditMode, setIsEditMode] = useState(false);

    // Core bus text fields
    const [formData, setFormData] = useState({
        busNumber: '', registrationNo: '', makeModel: '', year: '',
        seatingCapacity: '', fuelType: '', chassisNo: '', engineNo: '',
        purchaseDate: '', rcOwner: '', nextServiceDate: '', lastServiceDate: '',
        operationalStatus: 'active', assignedDriverId: ''
    });

    const driverOptions = React.useMemo(() => {
        // Assuming your hook returns { ok: true, data: [...] } or just an array
        const driversList = Array.isArray(driversData) ? driversData : (driversData?.data || []);
        return driversList.map((driver: any) => ({
            label: driver.name,
            value: driver._id
        }));
    }, [driversData]);

    // Statutory Documents state
    const [documentForms, setDocumentForms] = useState<any[]>([]);

    // --- Sync Data on Load or Cancel ---
    useEffect(() => {
        if (busData) {
            setFormData({
                busNumber: busData.busNumber || '',
                registrationNo: busData.registrationNo || '',
                makeModel: busData.makeModel || '',
                year: busData.year?.toString() || '',
                seatingCapacity: busData.seatingCapacity?.toString() || '',
                fuelType: busData.fuelType || '',
                chassisNo: busData.chassisNo || '',
                engineNo: busData.engineNo || '',
                purchaseDate: busData.purchaseDate ? new Date(busData.purchaseDate).toISOString().split('T')[0] : '',
                rcOwner: busData.rcOwner || '',
                nextServiceDate: busData.nextServiceDate ? new Date(busData.nextServiceDate).toISOString().split('T')[0] : '',
                lastServiceDate: busData.lastServiceDate ? new Date(busData.lastServiceDate).toISOString().split('T')[0] : '',
                operationalStatus: busData.operationalStatus || 'active',
                assignedDriverId: (busData.assignedDriverId as any)?._id || busData.assignedDriverId || '',
            });

            // Map the standard 5 documents and merge with existing DB data
            const mergedDocs = ALLOWED_BUS_DOCUMENT_NAMES.map((docName, index) => {
                const existing = busData.statutoryDocuments?.find((d: any) => d.documentName === docName);
                return {
                    id: existing?._id || `default_${index}`,
                    documentName: docName,
                    lastCost: existing?.lastCost?.toString() || '',
                    expiry: existing?.expiry ? new Date(existing.expiry).toISOString().split('T')[0] : '',
                    status: existing?.status || 'valid',
                    existingFiles: existing?.files || [],
                    newFiles: []
                };
            });
            setDocumentForms(mergedDocs);
        }
    }, [busData, isEditMode]);

    // --- Handlers ---
    const handleCancel = () => {
        setIsEditMode(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // --- Delete Existing Document File Handler ---
    const handleDeleteFileClick = async (e: React.MouseEvent, documentId: string, fileId: string) => {
        e.preventDefault();
        if (window.confirm("Are you sure you want to delete this file? This cannot be undone.")) {
            try {
                await deleteDocAttachmentMutation.mutateAsync({ id: id!, documentId, fileId });
                toast.success("File deleted successfully");
                refetch();
            } catch (error: any) {
                toast.error(error.message || "Failed to delete file");
            }
        }
    };

    // --- Save Handler ---
    const handleSave = async () => {
        try {
            if (!formData.registrationNo?.trim()) {
                toast.error("Registration Number is mandatory.");
                return;
            }

            const payload = new FormData();
            payload.append('schoolId', schoolId!);

            // 1. Core Text Fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value) payload.append(key, value);
            });

            // 2. Statutory Documents Metadata & Files
            // Filter to only send documents that have actual data (new files, cost, or expiry date)
            const activeDocs = documentForms.filter(doc =>
                (doc.newFiles && doc.newFiles.length > 0) ||
                doc.lastCost ||
                doc.expiry
            );

            if (activeDocs.length > 0) {
                const docMeta = activeDocs.map(doc => {
                    const payloadDoc: any = {
                        documentName: doc.documentName,
                        status: doc.status || 'valid'
                    };

                    // Include details/expiry only if they exist
                    if (doc.lastCost) payloadDoc.lastCost = Number(doc.lastCost);
                    if (doc.expiry) payloadDoc.expiry = doc.expiry;

                    // IMPORTANT: If this document already exists in the DB, send its _id so the backend UPDATES it
                    if (!doc.id.startsWith('default_')) {
                        payloadDoc._id = doc.id;
                    }

                    return payloadDoc;
                });

                // Crucial: This matches your backend's expected key `statutoryDocuments`
                payload.append('statutoryDocuments', JSON.stringify(docMeta));

                // Append files using the index that matches the activeDocs array
                activeDocs.forEach((doc, index) => {
                    if (doc.newFiles && doc.newFiles.length > 0) {
                        doc.newFiles.forEach((file: File) => {
                            // Crucial: Matches backend `statutoryDocuments_${index}`
                            payload.append(`statutoryDocuments_${index}`, file);
                        });
                    }
                });
            }

            await updateBusMutation.mutateAsync({ id: id!, formData: payload });
            toast.success("Bus Profile Updated Successfully!");
            setIsEditMode(false);
            refetch();

        } catch (error: any) {
            toast.error(error.message || "Failed to update bus profile");
        }
    };

    // --- Render Options ---
    const fuelOptions = [
        { label: 'Diesel', value: 'diesel' }, { label: 'Petrol', value: 'petrol' },
        { label: 'CNG', value: 'cng' }, { label: 'Electric', value: 'electric' }
    ];

    const operationalOptions = [
        { label: 'Active', value: 'active' }, { label: 'In Service', value: 'in_service' },
        { label: 'On Trip', value: 'on_trip' }, { label: 'Inactive', value: 'inactive' }
    ];

    // --- Loading & Error States ---
    if (isLoading) return <div className="p-8 text-center text-muted"><i className="fas fa-spinner fa-spin text-2xl"></i></div>;
    if (isError || !busData) return <div className="p-8 text-center text-danger">Failed to load bus details.</div>;

    return (
        <div className="w-full h-full flex flex-col p-2 space-y-4 overflow-y-auto custom-scrollbar">

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-4 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <i className="fas fa-arrow-left"></i>
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Bus Details</h2>
                        <p className="text-xs text-muted font-mono">{busData.registrationNo || 'No Registration Data'}</p>
                    </div>
                </div>

                {canEdit && (
                    <div className="flex gap-2">
                        {isEditMode ? (
                            <>
                                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                                <Button variant="primary" onClick={handleSave} isLoading={updateBusMutation.isPending} leftIcon="fas fa-save">
                                    Save Changes
                                </Button>
                            </>
                        ) : (
                            <Button variant="primary" onClick={() => setIsEditMode(true)} leftIcon="fas fa-edit">
                                Edit Details
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Core Vehicle Details Card */}
            <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
                <h4 className="font-semibold text-foreground border-b border-border pb-3 mb-4 flex items-center gap-2">
                    <i className="fas fa-bus text-muted"></i> Vehicle & Operational Specifications
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                    <InfoField label="Registration No" isEdit={isEditMode}>
                        {isEditMode ? <Input id="registrationNo" value={formData.registrationNo} onChange={handleInputChange} /> : <p className="font-medium text-foreground">{busData.registrationNo || 'N/A'}</p>}
                    </InfoField>

                    <InfoField label="Internal Bus No" isEdit={isEditMode}>
                        {isEditMode ? <Input id="busNumber" value={formData.busNumber} onChange={handleInputChange} /> : <p className="font-medium text-foreground">{busData.busNumber || 'N/A'}</p>}
                    </InfoField>

                    <InfoField label="Operational Status" isEdit={isEditMode}>
                        {isEditMode ? (
                            <SearchSelect
                                options={operationalOptions}
                                value={formData.operationalStatus}
                                onChange={(opt) => handleSelectChange('operationalStatus', String(opt.value))}
                                placeholder="Status"
                            />
                        ) : (
                            <span className="inline-flex px-2 py-1 bg-surface rounded text-xs font-semibold capitalize mt-1">
                                {busData.operationalStatus?.replace('_', ' ') || 'Unknown'}
                            </span>
                        )}
                    </InfoField>

                    <InfoField label="Make & Model" isEdit={isEditMode}>
                        {isEditMode ? <Input id="makeModel" value={formData.makeModel} onChange={handleInputChange} /> : <p className="font-medium text-foreground">{busData.makeModel || 'N/A'}</p>}
                    </InfoField>

                    <InfoField label="Manufacture Year" isEdit={isEditMode}>
                        {isEditMode ? <Input id="year" type="number" value={formData.year} onChange={handleInputChange} /> : <p className="font-medium text-foreground">{busData.year || 'N/A'}</p>}
                    </InfoField>

                    <InfoField label="Fuel Type" isEdit={isEditMode}>
                        {isEditMode ? (
                            <SearchSelect
                                options={fuelOptions}
                                value={formData.fuelType}
                                onChange={(opt) => handleSelectChange('fuelType', String(opt.value))}
                                placeholder="Fuel Type"
                            />
                        ) : (
                            <p className="font-medium text-foreground capitalize">{busData.fuelType || 'N/A'}</p>
                        )}
                    </InfoField>

                    <InfoField label="Seating Capacity" isEdit={isEditMode}>
                        {isEditMode ? <Input id="seatingCapacity" type="number" value={formData.seatingCapacity} onChange={handleInputChange} /> : <p className="font-medium text-foreground">{busData.seatingCapacity || 'N/A'}</p>}
                    </InfoField>

                    <InfoField label="Chassis No" isEdit={isEditMode}>
                        {isEditMode ? <Input id="chassisNo" value={formData.chassisNo} onChange={handleInputChange} /> : <p className="font-medium text-foreground font-mono text-sm">{busData.chassisNo || 'N/A'}</p>}
                    </InfoField>

                    <InfoField label="Engine No" isEdit={isEditMode}>
                        {isEditMode ? <Input id="engineNo" value={formData.engineNo} onChange={handleInputChange} /> : <p className="font-medium text-foreground font-mono text-sm">{busData.engineNo || 'N/A'}</p>}
                    </InfoField>

                    <InfoField label="RC Owner" isEdit={isEditMode}>
                        {isEditMode ? <Input id="rcOwner" value={formData.rcOwner} onChange={handleInputChange} /> : <p className="font-medium text-foreground">{busData.rcOwner || 'N/A'}</p>}
                    </InfoField>

                    <InfoField label="Purchase Date" isEdit={isEditMode}>
                        {isEditMode ? <Input id="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleInputChange} /> : <p className="font-medium text-foreground">{busData.purchaseDate ? new Date(busData.purchaseDate).toLocaleDateString() : 'N/A'}</p>}
                    </InfoField>

                    <InfoField label="Last Service Date" isEdit={isEditMode}>
                        {isEditMode ? <Input id="lastServiceDate" type="date" value={formData.lastServiceDate} onChange={handleInputChange} /> : <p className="font-medium text-foreground">{busData.lastServiceDate ? new Date(busData.lastServiceDate).toLocaleDateString() : 'N/A'}</p>}
                    </InfoField>

                    <InfoField label="Assigned Driver" isEdit={isEditMode}>
                        {isEditMode ? (
                            <SearchSelect
                                options={driverOptions}
                                value={formData.assignedDriverId}
                                onChange={(opt) => handleSelectChange('assignedDriverId', String(opt.value))}
                                placeholder="Search & Select Driver..."
                            />
                        ) : (
                            <p className="font-medium text-foreground">
                                {
                                    (busData.assignedDriverId as any)?.name ||
                                    driverOptions.find((opt: any) => opt.value === formData.assignedDriverId)?.label ||
                                    'Not Assigned'
                                }
                            </p>
                        )}
                    </InfoField>
                </div>
            </div>

            {/* FULL WIDTH: Statutory Documents List */}
            <div className="bg-surface rounded-xl border border-border p-5 shadow-sm mt-4">
                <h4 className="font-semibold text-foreground border-b border-border pb-3 mb-4 flex items-center gap-2">
                    <i className="fas fa-folder-open text-muted"></i> Statutory Documents & Renewals
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
                                    <InfoField label="Renewal Cost (₹)" isEdit={isEditMode}>
                                        {isEditMode ? (
                                            <Input
                                                type="number"
                                                value={doc.lastCost}
                                                onChange={(e) => setDocumentForms(prev => prev.map(d => d.id === doc.id ? { ...d, lastCost: e.target.value } : d))}
                                                placeholder="Amount..."
                                            />
                                        ) : (
                                            <p className="text-sm font-medium mt-1">{doc.lastCost ? `₹${doc.lastCost}` : 'N/A'}</p>
                                        )}
                                    </InfoField>

                                    <InfoField label="Expiry / Validity Date" isEdit={isEditMode}>
                                        {isEditMode ? (
                                            <Input
                                                type="date"
                                                value={doc.expiry}
                                                onChange={(e) => setDocumentForms(prev => prev.map(d => d.id === doc.id ? { ...d, expiry: e.target.value } : d))}
                                            />
                                        ) : (
                                            <p className="text-sm font-medium mt-1">{doc.expiry ? new Date(doc.expiry).toLocaleDateString() : 'N/A'}</p>
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

                                                    {/* File Preview Link with Original Name */}
                                                    {file.type === 'image' ? (
                                                        <a href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 overflow-hidden min-w-0">
                                                            <img src={file.url} alt={file.originalName} className="w-10 h-10 object-cover rounded border border-border shrink-0" />
                                                            <span className="text-xs text-primary hover:underline truncate" title={file.originalName}>
                                                                {file.originalName || 'Image File'}
                                                            </span>
                                                        </a>
                                                    ) : (
                                                        <a href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 overflow-hidden min-w-0 text-xs text-primary hover:underline" title={file.originalName}>
                                                            <i className={`fas ${file.type === 'video' ? 'fa-video' : 'fa-file-pdf'} text-danger text-base shrink-0`}></i>
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
                                        <div className="mt-1 flex flex-col gap-1">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*,application/pdf,video/*"
                                                onChange={(e) => {
                                                    if (e.target.files) {
                                                        const filesArr = Array.from(e.target.files);
                                                        setDocumentForms(prev => prev.map(d => d.id === doc.id ? { ...d, newFiles: filesArr } : d));
                                                    }
                                                }}
                                                className="w-full text-[10px] text-muted file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-primary-soft file:text-primary cursor-pointer border border-border"
                                            />
                                            <p className="text-[10px] text-muted italic ml-1">Only PDF, Images, and Videos are used inside here.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
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