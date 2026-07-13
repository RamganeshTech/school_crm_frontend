import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../features/store/store';

// UI Components
import { Button } from '../../../shared/ui/Button';
import { Input, Label } from '../../../shared/ui/Input';
import { SideModal } from '../../../shared/ui/SideModal';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { toast } from '../../../shared/ui/ToastContext';

// API Hook (Adjust path to your actual bus API file)
import { useAddBus } from '../../../api_services/transport_api/busApi';
import { useGetDriverDropDown } from '../../../api_services/transport_api/driverApi';

interface BusCreateModelProps {
    isOpen: boolean;
    onClose: () => void;
}

// Fixed set — every bus must have exactly these 5 statutory documents
const ALLOWED_BUS_DOCUMENT_NAMES = [
    "FC",
    "Insurance",
    "Permit",
    "Pollution",
    "Road Tax"
];

export default function BusCreateModel({ isOpen, onClose }: BusCreateModelProps) {
    const { schoolId } = useSelector((state: RootState) => state.auth);
    const createBusMutation = useAddBus();

        const { data: driversData } = useGetDriverDropDown({ schoolId: schoolId! });
    

    // --- Form State ---
    const initialFormState = {
        busNumber: '', registrationNo: '', makeModel: '', year: '',
        seatingCapacity: '', fuelType: '', chassisNo: '', engineNo: '',
        purchaseDate: '', rcOwner: '', nextServiceDate: '', lastServiceDate: '',
        operationalStatus: 'active', assignedDriverId: ""
    };

    const [formData, setFormData] = useState(initialFormState);
    const [documentForms, setDocumentForms] = useState<any[]>([]);

    // --- Pre-populate Documents on Open ---
    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormState);

            // Map the standard 5 documents as empty templates
            const defaultDocs = ALLOWED_BUS_DOCUMENT_NAMES.map((docName, index) => ({
                id: `new_${index}`,
                documentName: docName,
                lastCost: '',
                expiry: '',
                newFiles: []
            }));
            setDocumentForms(defaultDocs);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

     const driverOptions = React.useMemo(() => {
            // Assuming your hook returns { ok: true, data: [...] } or just an array
            const driversList = Array.isArray(driversData) ? driversData : (driversData?.data || []);
            return driversList.map((driver: any) => ({
                label: driver.name,
                value: driver._id
            }));
        }, [driversData]);

    // --- Handlers ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // --- Submit Handler ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
            // Filter to only send documents where the user actually entered data or attached a file
            const activeDocs = documentForms.filter(doc =>
                (doc.newFiles && doc.newFiles.length > 0) || doc.lastCost || doc.expiry
            );

            if (activeDocs.length > 0) {
                const docMeta = activeDocs.map(doc => {
                    const payloadDoc: any = {
                        documentName: doc.documentName,
                        status: 'valid' // Default for new docs
                    };

                    if (doc.lastCost) payloadDoc.lastCost = Number(doc.lastCost);
                    if (doc.expiry) payloadDoc.expiry = doc.expiry;

                    return payloadDoc;
                });

                payload.append('statutoryDocuments', JSON.stringify(docMeta));

                // Append files using the index that matches the activeDocs array
                activeDocs.forEach((doc, index) => {
                    if (doc.newFiles && doc.newFiles.length > 0) {
                        doc.newFiles.forEach((file: File) => {
                            payload.append(`statutoryDocuments_${index}`, file);
                        });
                    }
                });
            }

            await createBusMutation.mutateAsync(payload);
            toast.success("Bus Registered Successfully!");
            onClose();

        } catch (error: any) {
            toast.error(error.message || "Failed to register bus");
        }
    };

    // --- Dropdown Options ---
    const fuelOptions = [
        { label: 'Diesel', value: 'diesel' }, { label: 'Petrol', value: 'petrol' },
        { label: 'CNG', value: 'cng' }, { label: 'Electric', value: 'electric' }
    ];

    const operationalOptions = [
        { label: 'Active', value: 'active' }, { label: 'In Service', value: 'in_service' },
        { label: 'On Trip', value: 'on_trip' }, { label: 'Inactive', value: 'inactive' }
    ];

    return (
        <SideModal
            isOpen={isOpen}
            onClose={onClose}
            title="Register New Bus"
            width='w-full sm:w-[500px] md:w-[650px] lg:w-[800px] '
        // If your SideModal accepts a className for width, you can add it here (e.g., className="max-w-4xl")
        >
            <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">

                {/* Scrollable Content Area */}
                <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1 pb-4">

                    {/* Vehicle Specifications */}
                    <div className="bg-surface/50 p-4 rounded-xl border border-border/50 space-y-4">
                        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <i className="fas fa-bus text-muted"></i> Vehicle Specifications
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Input id="registrationNo" label="Registration No" placeholder="e.g. TN-00-A-0000" value={formData.registrationNo} onChange={handleInputChange} required />
                            <Input id="busNumber" label="Internal Bus No" placeholder="e.g. BUS-01" value={formData.busNumber} onChange={handleInputChange} />
                            <SearchSelect label="Operational Status" options={operationalOptions} value={formData.operationalStatus} onChange={(opt) => handleSelectChange('operationalStatus', String(opt.value))} placeholder="Select Status" />
                            <Input id="makeModel" label="Make & Model" placeholder="e.g. Tata Marcopolo" value={formData.makeModel} onChange={handleInputChange} />
                            <Input id="year" type="number" label="Manufacture Year" placeholder="e.g. 2022" value={formData.year} onChange={handleInputChange} />
                            <SearchSelect label="Fuel Type" options={fuelOptions} value={formData.fuelType} onChange={(opt) => handleSelectChange('fuelType', String(opt.value))} placeholder="Select Fuel Type" />
                            <Input id="seatingCapacity" type="number" label="Seating Capacity" placeholder="e.g. 40" value={formData.seatingCapacity} onChange={handleInputChange} />
                            <Input id="chassisNo" label="Chassis No" placeholder="Enter Chassis Number" value={formData.chassisNo} onChange={handleInputChange} />
                            <Input id="engineNo" label="Engine No" placeholder="Enter Engine Number" value={formData.engineNo} onChange={handleInputChange} />
                            
                                    <SearchSelect
                                        options={driverOptions}
                                        value={formData.assignedDriverId}
                                        onChange={(opt) => handleSelectChange('assignedDriverId', String(opt.value))}
                                        placeholder="Search & Select Driver..."
                                    />

                        </div>
                    </div>

                    {/* Ownership & Maintenance */}
                    <div className="bg-surface/50 p-4 rounded-xl border border-border/50 space-y-4">
                        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <i className="fas fa-file-contract text-muted"></i> Ownership & Maintenance
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Input id="rcOwner" label="RC Owner Name" placeholder="Name on Registration" value={formData.rcOwner} onChange={handleInputChange} />
                            <Input id="purchaseDate" type="date" label="Purchase Date" value={formData.purchaseDate} onChange={handleInputChange} />
                            <Input id="lastServiceDate" type="date" label="Last Service Date" value={formData.lastServiceDate} onChange={handleInputChange} />
                        </div>
                    </div>

                    {/* Pre-populated Statutory Documents */}
                    <div className="bg-surface/50 p-4 rounded-xl border border-border/50 space-y-4">
                        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <i className="fas fa-folder-open text-muted"></i> Statutory Documents
                        </h4>

                        <div className="flex flex-col gap-4">
                            {documentForms.map((doc) => (
                                <div key={doc.id} className="border border-border/60 bg-background rounded-lg p-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

                                        {/* Fixed Document Name */}
                                        <div>
                                            <p className="text-xs font-bold text-muted uppercase tracking-wide">Document Type</p>
                                            <p className="font-semibold text-foreground mt-1">{doc.documentName}</p>
                                        </div>

                                        {/* Text Inputs */}
                                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <Label>Cost (₹)</Label>
                                                <Input
                                                    type="number"
                                                    value={doc.lastCost}
                                                    onChange={(e) => setDocumentForms(prev => prev.map(d => d.id === doc.id ? { ...d, lastCost: e.target.value } : d))}
                                                    placeholder="e.g. 5000"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <Label>Expiry Date</Label>
                                                <Input
                                                    type="date"
                                                    value={doc.expiry}
                                                    onChange={(e) => setDocumentForms(prev => prev.map(d => d.id === doc.id ? { ...d, expiry: e.target.value } : d))}
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
                                                onChange={(e) => {
                                                    if (e.target.files) {
                                                        const filesArr = Array.from(e.target.files);
                                                        setDocumentForms(prev => prev.map(d => d.id === doc.id ? { ...d, newFiles: filesArr } : d));
                                                    }
                                                }}
                                                className="w-full text-[10px] text-muted file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-primary-soft file:text-primary cursor-pointer border border-border"
                                            />
                                            <p className="text-[10px] text-muted italic ml-1 mt-1">PDF or Images</p>
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
                        isLoading={createBusMutation.isPending}
                        className="w-full sm:w-auto"
                    >
                        Register Bus
                    </Button>
                </div>
            </form>
        </SideModal>
    );
}