import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../features/store/store';

// UI Components
import { Button } from '../../../shared/ui/Button';
import { Input, Label } from '../../../shared/ui/Input';
import { SideModal } from '../../../shared/ui/SideModal';
import { toast } from '../../../shared/ui/ToastContext';

// API Hooks (Adjust import paths based on your structure)
import { useAddDriver, useUpdateDriver } from '../../../api_services/transport_api/driverApi';
import { useGetBusDropDown } from '../../../api_services/transport_api/busApi';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { DRIVER_DOCUMENT_NAMES } from './DriverSingle';
import { driverStatusOptions } from './DriverMain';

interface DriverFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    driverData?: any | null;
}

// Helper type for our dynamic documents
interface IDocumentState {
    id: string; // Unique UI ID
    documentName: string;
    detail: string;
    expiryDate: string;
    files: File[];
}

export default function DriverFormModal({ isOpen, onClose, driverData }: DriverFormModalProps) {
    const { schoolId } = useSelector((state: RootState) => state.auth);

    const createDriverMutation = useAddDriver();
    const updateDriverMutation = useUpdateDriver();

    // --- State Setup ---
    const initialFormState = {
        name: '',
        phone: '',
        dateOfBirth: '',
        joinedDate: '',
        emergencyContact: '',
        address: '',
        assignedBusId: '', // <-- Add this
        status: ""
    };

    const [formDataState, setFormDataState] = useState(initialFormState);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [documents, setDocuments] = useState<IDocumentState[]>([]);

    // Fetch and format bus dropdown data
    const { data: busesData } = useGetBusDropDown({ schoolId: schoolId! });
    const busOptions = React.useMemo(() => {
        const busesList = Array.isArray(busesData) ? busesData : (busesData?.data || []);
        return busesList.map((bus: any) => ({
            label: `${bus.registrationNo} ${bus.busNumber ? `(${bus.busNumber})` : ''}`,
            value: bus._id
        }));
    }, [busesData]);

    // --- Populate on Edit ---
    useEffect(() => {
        if (isOpen) {
            setFormDataState(initialFormState);
            setPhotoFile(null);
          
        //     // Generate empty slots for the 6 default documents
            const defaultDocs = DRIVER_DOCUMENT_NAMES.map((docName, index) => ({
                id: `new_${index}`,
                documentName: docName,
                detail: '',
                expiryDate: '',
                files: []
            }));
            setDocuments(defaultDocs);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [driverData, isOpen]);

    // --- Basic Input Handlers ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        // Prevent typing non-numbers in phone fields
        if (id === 'phone' || id === 'emergencyContact') {
            const onlyNums = value.replace(/[^0-9]/g, '');
            setFormDataState(prev => ({ ...prev, [id]: onlyNums }));
            return;
        }
        setFormDataState(prev => ({ ...prev, [id]: value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
        }
    };

    const handleDocumentFieldChange = (id: string, field: keyof IDocumentState, value: any) => {
        setDocuments(prev => prev.map(doc =>
            doc.id === id ? { ...doc, [field]: value } : doc
        ));
    };

    const handleDocumentFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setDocuments(prev => prev.map(doc =>
                doc.id === id ? { ...doc, files: filesArray } : doc
            ));
        }
    };

    // // --- Dynamic Document Handlers ---
    // const addDocument = () => {
    //     setDocuments(prev => [
    //         ...prev,
    //         { id: Date.now().toString(), documentName: '', detail: '', expiryDate: '', files: [] }
    //     ]);
    // };

    // const removeDocument = (id: string) => {
    //     setDocuments(prev => prev.filter(doc => doc.id !== id));
    // };

    // const handleDocumentFieldChange = (id: string, field: keyof IDocumentState, value: any) => {
    //     setDocuments(prev => prev.map(doc =>
    //         doc.id === id ? { ...doc, [field]: value } : doc
    //     ));
    // };

    // const handleDocumentFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    //     if (e.target.files) {
    //         const filesArray = Array.from(e.target.files);
    //         setDocuments(prev => prev.map(doc =>
    //             doc.id === id ? { ...doc, files: filesArray } : doc
    //         ));
    //     }
    // };

    // --- Unified Submit Handler ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!formDataState.name?.trim()) {
                toast.error("Driver Name is mandatory.");
                return;
            }

            const phoneRegex = /^\d{10}$/;
            if (formDataState.phone && !phoneRegex.test(formDataState.phone)) {
                toast.error("Phone number must be exactly 10 digits.");
                return;
            }
            if (formDataState?.emergencyContact && !phoneRegex.test(formDataState.emergencyContact)) {
                toast.error("Emergency contact must be exactly 10 digits.");
                return;
            }

            const payload = new FormData();
            payload.append('schoolId', schoolId!);

            // 1. Append Standard Text Fields
            Object.keys(formDataState).forEach(key => {
                const value = formDataState[key as keyof typeof formDataState];
                if (value) payload.append(key, value);
            });

            // 2. Append Photo (Matches `req.files.find(f => f.fieldname === 'photo')`)
            if (photoFile) {
                payload.append('photo', photoFile);
            }

           // 3. Filter and Append Documents Metadata & Files
            // We ONLY send documents to the backend if the user typed something or attached files
            const activeDocs = documents.filter(doc => 
                (doc.files && doc.files.length > 0) || doc.detail || doc.expiryDate
            );

            if (activeDocs.length > 0) {
                const documentsPayload = activeDocs.map(doc => {
                    const payloadDoc: any = {
                        documentName: doc.documentName,
                        status: 'valid' // Defaulting as per backend
                    };
                    
                    if (doc.detail) payloadDoc.detail = doc.detail;
                    if (doc.expiryDate) payloadDoc.expiryDate = doc.expiryDate;

                    return payloadDoc;
                });
                
                payload.append('documents', JSON.stringify(documentsPayload));

                // Append Document Files matching the `documents_${index}` pattern required by backend
                activeDocs.forEach((doc, index) => {
                    if (doc.files && doc.files.length > 0) {
                        doc.files.forEach(file => {
                            payload.append(`documents_${index}`, file);
                        });
                    }
                });
            }   

            // Execute API Call

            await createDriverMutation.mutateAsync(payload);
            toast.success("Driver Created Successfully!");

            onClose();

        } catch (error: any) {
            toast.error(error.message || "Operation Failed.");
        }
    };

    const isPending = createDriverMutation.isPending || updateDriverMutation.isPending;

    return (
        <SideModal
            isOpen={isOpen}
            onClose={onClose}
            title={driverData ? 'Edit Driver Profile' : 'Register New Driver'}
            width='w-full sm:w-[500px] lg:w-[700px] '
        >
            <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">

                {/* Scrollable Content Area */}
                <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1 pb-4">

                    {/* 1. Photo Upload */}
                    <div className="flex flex-col gap-1.5">
                        <Label>Driver Photo</Label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-soft file:text-primary hover:file:bg-primary-soft/80 cursor-pointer transition-colors"
                        />
                    </div>

                    {/* 2. Basic Info Section */}
                    <div className="bg-surface/50 p-4 rounded-xl border border-border/50 space-y-4">
                        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <i className="fas fa-user text-muted"></i> Personal Details
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                id="name"
                                autoFocus={!driverData}
                                label="Full Name"
                                placeholder="Enter driver's name"
                                value={formDataState.name}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                id="phone"
                                type="tel"
                                maxLength={10}
                                minLength={10}
                                label="Phone Number"
                                placeholder="10-digit number"
                                value={formDataState.phone}
                                onChange={handleInputChange}
                            />
                            <Input
                                id="dateOfBirth"
                                type="date"
                                label="Date of Birth"
                                value={formDataState.dateOfBirth}
                                onChange={handleInputChange}
                            />
                            <Input
                                id="joinedDate"
                                type="date"
                                label="Joining Date"
                                value={formDataState.joinedDate}
                                onChange={handleInputChange}
                            />
                            <Input
                                id="emergencyContact"
                                type="tel"
                                maxLength={10}
                                label="Emergency Contact"
                                placeholder="10-digit number"
                                value={formDataState.emergencyContact}
                                onChange={handleInputChange}
                            />
                            <SearchSelect
                                label="Assigned Bus"
                                options={busOptions}
                                value={formDataState.assignedBusId}
                                onChange={(opt) => setFormDataState(prev => ({ ...prev, assignedBusId: String(opt.value) }))}
                                placeholder="Search & Assign Bus..."
                            />

                             <SearchSelect
                                label="Status"
                                options={driverStatusOptions}
                                value={formDataState.status}
                                onChange={(opt) => setFormDataState(prev => ({ ...prev, status: String(opt.value) }))}
                                placeholder="Status Options..."
                            />
                        </div>

                        <div className="mt-4">
                            <Label>Address</Label>
                            <textarea
                                id="address"
                                rows={3}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Enter full address..."
                                value={formDataState.address}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* 3. Statutory Documents Section (Grid Layout) */}
                    <div className="bg-surface/50 p-4 rounded-xl border border-border/50 space-y-4">
                        <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                            <i className="fas fa-folder-open text-muted"></i> Statutory Documents
                        </h4>

                        <div className="flex flex-col gap-4">
                            {documents.map((doc) => (
                                <div key={doc.id} className="border border-border/60 bg-background rounded-lg p-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

                                        {/* Document Type Label */}
                                        <div>
                                            <p className="text-xs font-bold text-muted uppercase tracking-wide">Document Type</p>
                                            <p className="font-semibold text-foreground mt-1">{doc.documentName}</p>
                                        </div>

                                        {/* Details & Expiry */}
                                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <Label>Details / Remarks</Label>
                                                <Input
                                                    id={`docDetail_${doc.id}`}
                                                    placeholder="e.g., ID No: XXXX"
                                                    value={doc.detail}
                                                    onChange={(e) => handleDocumentFieldChange(doc.id, 'detail', e.target.value)}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <Label>Expiry Date</Label>
                                                <Input
                                                    id={`docExpiry_${doc.id}`}
                                                    type="date"
                                                    value={doc.expiryDate}
                                                    onChange={(e) => handleDocumentFieldChange(doc.id, 'expiryDate', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* File Uploader */}
                                        <div className="flex flex-col gap-1">
                                            <Label>Upload Files</Label>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*,application/pdf"
                                                onChange={(e) => handleDocumentFileChange(doc.id, e)}
                                                className="w-full text-[10px] text-muted file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-primary-soft file:text-primary cursor-pointer border border-border"
                                            />
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Fixed Footer */}
                <div className="mt-auto pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-border shrink-0 bg-background">
                    <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isPending}
                        className="w-full sm:w-auto"
                    >
                        {driverData ? 'Update Driver' : 'Save Driver'}
                    </Button>
                </div>
            </form>
        </SideModal>
    );
}