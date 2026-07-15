import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../features/store/store';

// UI Components
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { SideModal } from '../../../shared/ui/SideModal';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { toast } from '../../../shared/ui/ToastContext';

// API Hooks (Adjust import paths based on your structure)
import {
    useCreateFuelLog,
    useUpdateFuelLog,
    useGetFuelLogById
} from '../../../api_services/transport_api/fuelLogApi';
import { useGetBusDropDown } from '../../../api_services/transport_api/busApi';
import { useRoleCheck } from '../../../hooks/useRoleCheck';

interface FuelLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    logData?: any | null; // Passed from table for instant basic data (optional)
    logId?: string | null; // The ID to fetch fresh data
}

export default function FuelLogModal({ isOpen, onClose, logData, logId }: FuelLogModalProps) {
    const { schoolId } = useSelector((state: RootState) => state.auth);

    // --- API Hooks ---
    const createLogMutation = useCreateFuelLog();
    const updateLogMutation = useUpdateFuelLog();

    // --- Permissions ---
    const { isCorrespondent, isAdmin } = useRoleCheck();

    const canEdit = isCorrespondent || isAdmin

    // Fetch fresh data if logId is provided
    const { data: fetchedLog, isLoading: isFetchingLog } = useGetFuelLogById(logId || undefined);

    // Fetch and format bus dropdown data
    const { data: busesData } = useGetBusDropDown({ schoolId: schoolId! });
    const busOptions = React.useMemo(() => {
        const busesList = Array.isArray(busesData) ? busesData : (busesData?.data || []);
        return busesList.map((bus: any) => ({
            label: `${bus.registrationNo} ${bus.busNumber ? `(${bus.busNumber})` : ''}`,
            value: bus._id
        }));
    }, [busesData]);

    const paymentOptions = [
        { label: 'Cash', value: 'cash' },
        { label: 'Card', value: 'card' },
        { label: 'UPI', value: 'upi' },
        { label: 'Company Account', value: 'company_account' }
    ];

    // Determine the actual data to use (prefer fresh fetched data, fallback to passed logData)
    const actualLogData = fetchedLog || logData;

    // --- State Setup ---
    const initialFormState = {
        busId: '',
        date: new Date().toISOString().split('T')[0], // Default to today
        odometerReading: '',
        fuelQuantity: '',
        pricePerLiter: '',
        totalAmount: '',
        fuelStation: '',
        paymentMode: 'cash',
        fuelBillNo: '',
        notes: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isEditMode, setIsEditMode] = useState(false);

    // --- Initialize Form on Open & Fetch ---
    useEffect(() => {
        if (isOpen) {
            if (logId && actualLogData) {
                // View Mode for existing record
                setFormData({
                    busId: actualLogData?.busId?._id || actualLogData?.busId || '',
                    date: actualLogData.date ? new Date(actualLogData.date).toISOString().split('T')[0] : '',
                    odometerReading: actualLogData.odometerReading?.toString() || '',
                    fuelQuantity: actualLogData.fuelQuantity?.toString() || '',
                    pricePerLiter: actualLogData.pricePerLiter?.toString() || '',
                    totalAmount: actualLogData.totalAmount?.toString() || '',
                    fuelStation: actualLogData.fuelStation || '',
                    paymentMode: actualLogData.paymentMode || 'cash',
                    fuelBillNo: actualLogData.fuelBillNo || '',
                    notes: actualLogData.notes || ''
                });
                setIsEditMode(false); // Default to View mode
            } else if (!logId) {
                // Create Mode
                setFormData(initialFormState);
                setIsEditMode(true); // Must be edit mode to create
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, actualLogData, logId]);

    // --- Auto-calculate Total Amount ---
  useEffect(() => {
        if (formData.fuelQuantity && formData.totalAmount) {
            const qty = parseFloat(formData.fuelQuantity);
            const total = parseFloat(formData.totalAmount);
            if (!isNaN(qty) && !isNaN(total) && qty > 0) {
                setFormData(prev => ({ ...prev, pricePerLiter: (total / qty).toFixed(2) }));
            }
        }
    }, [formData.fuelQuantity, formData.totalAmount]);

    // --- Handlers ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleCancel = () => {
        if (!logId) {
            onClose(); // If creating, just close
        } else {
            // If editing, revert changes and return to view mode using actualLogData
            setFormData({
                busId: actualLogData.busId?._id || actualLogData.busId || '',
                date: actualLogData.date ? new Date(actualLogData.date).toISOString().split('T')[0] : '',
                odometerReading: actualLogData.odometerReading?.toString() || '',
                fuelQuantity: actualLogData.fuelQuantity?.toString() || '',
                pricePerLiter: actualLogData.pricePerLiter?.toString() || '',
                totalAmount: actualLogData.totalAmount?.toString() || '',
                fuelStation: actualLogData.fuelStation || '',
                paymentMode: actualLogData.paymentMode || 'cash',
                fuelBillNo: actualLogData.fuelBillNo || '',
                notes: actualLogData.notes || ''
            });
            setIsEditMode(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Mandatory Validations
            if (!formData.busId || !formData.date) {
                toast.error("Bus and Date are mandatory.");
                return;
            }

            if (!logId) {
                if (!formData.odometerReading || !formData.fuelQuantity || !formData.totalAmount) {
                    toast.error("Odometer, Fuel Quantity, and Total Amount are required for new logs.");
                    return;
                }
            }

            // Prepare Payload 
            const payload: any = { schoolId };
            if (formData.busId) payload.busId = formData.busId;
            if (formData.date) payload.date = formData.date;
            if (formData.odometerReading) payload.odometerReading = Number(formData.odometerReading);
            if (formData.fuelQuantity) payload.fuelQuantity = Number(formData.fuelQuantity);
            if (formData.pricePerLiter) payload.pricePerLiter = Number(formData.pricePerLiter);
            if (formData.totalAmount) payload.totalAmount = Number(formData.totalAmount);
            if (formData.fuelStation !== undefined) payload.fuelStation = formData.fuelStation;
            if (formData.paymentMode !== undefined) payload.paymentMode = formData.paymentMode;
            if (formData.fuelBillNo !== undefined) payload.fuelBillNo = formData.fuelBillNo;
            if (formData.notes !== undefined) payload.notes = formData.notes;

            if (logId) {
                // Update API
                await updateLogMutation.mutateAsync({ id: logId, payload });
                toast.success("Fuel Log Updated Successfully!");
                setIsEditMode(false);
            } else {
                // Create API
                await createLogMutation.mutateAsync(payload);
                toast.success("Fuel Log Created Successfully!");
                onClose();
            }

        } catch (error: any) {
            toast.error(error.message || "Operation Failed.");
        }
    };

    const isPending = createLogMutation.isPending || updateLogMutation.isPending;
    const title = !logId ? "Register Fuel Log" : isEditMode ? "Edit Fuel Log" : "Fuel Log Details";

    return (
        <SideModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            actions={
                (canEdit && logId && !isEditMode && !isFetchingLog) ? (
                    <Button type="button" variant="primary" leftIcon="fas fa-edit" onClick={() => setIsEditMode(true)}>
                        Edit Details
                    </Button>
                ) : undefined
            }
        >
            {isFetchingLog ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3">
                    <i className="fas fa-spinner fa-spin text-primary text-3xl"></i>
                    <p className="text-muted text-sm font-medium">Fetching Fuel Details...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">

                    {/* Scrollable Content Area */}
                    <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1 pb-4 mt-2">

                        {/* --- 1. Vehicle & Fuel Data --- */}
                        <div className="bg-surface/50 p-5 rounded-xl border border-border/50 space-y-5">
                            <h4 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                                <i className="fas fa-bus text-muted"></i> Vehicle & Fuel Metrics
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                {/* Bus ID */}
                                <InfoField label="Assigned Bus" isEdit={isEditMode}>
                                    {isEditMode ? (
                                        <SearchSelect
                                            options={busOptions}
                                            value={formData.busId}
                                            onChange={(opt) => handleSelectChange('busId', String(opt.value))}
                                            placeholder="Search & Select Bus..."
                                        />
                                    ) : (
                                        <p className="font-medium text-foreground">
                                            {actualLogData?.busId?.registrationNo || busOptions.find((opt: any) => opt.value === formData.busId)?.label || 'Unknown Bus'}
                                        </p>
                                    )}
                                </InfoField>

                                {/* Date */}
                                <InfoField label="Fill Date" isEdit={isEditMode}>
                                    {isEditMode ? (
                                        <Input id="date" type="date" value={formData.date} onChange={handleInputChange} required />
                                    ) : (
                                        <p className="font-medium text-foreground">
                                            {formData.date ? new Date(formData.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                        </p>
                                    )}
                                </InfoField>

                                {/* Odometer */}
                                <InfoField label={`Odometer Reading (km) ${!logId ? '*' : ''}`} isEdit={isEditMode}>
                                    {isEditMode ? (
                                        <Input id="odometerReading" type="number" placeholder="e.g. 12500" value={formData.odometerReading} onChange={handleInputChange} required={!logId} />
                                    ) : (
                                        <p className="font-mono text-sm bg-background border border-border px-2 py-1 rounded w-fit">
                                            {formData.odometerReading || 'N/A'}
                                        </p>
                                    )}
                                </InfoField>

                               {/* Station Name */}
                                <InfoField label="Fuel Station Name" isEdit={isEditMode}>
                                    {isEditMode ? (
                                        <Input id="fuelStation" placeholder="e.g. Indian Oil, Bharat Petrol" value={formData.fuelStation} onChange={handleInputChange} />
                                    ) : (
                                        <p className="font-medium text-foreground">{formData.fuelStation || 'N/A'}</p>
                                    )}
                                </InfoField>
                            </div>
                        </div>

                        {/* --- 2. Billing & Payment Data --- */}
                        <div className="bg-surface/50 p-5 rounded-xl border border-border/50 space-y-5">
                            <h4 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                                <i className="fas fa-file-invoice-dollar text-muted"></i> Billing Information
                            </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                {/* Fuel Quantity */}
                                <InfoField label={`Fuel Quantity (Liters) ${!logId ? '*' : ''}`} isEdit={isEditMode}>
                                    {isEditMode ? (
                                        <Input id="fuelQuantity" type="number" step="0.01" placeholder="e.g. 45.5" value={formData.fuelQuantity} onChange={handleInputChange} required={!logId} />
                                    ) : (
                                        <p className="font-semibold text-foreground">
                                            {formData.fuelQuantity ? `${formData.fuelQuantity} L` : 'N/A'}
                                        </p>
                                    )}
                                </InfoField>

                                {/* Total Amount */}
                                <InfoField label={`Total Amount (₹) ${!logId ? '*' : ''}`} isEdit={isEditMode}>
                                    {isEditMode ? (
                                        <Input id="totalAmount" type="number" step="0.01" placeholder="e.g. 4000" value={formData.totalAmount} onChange={handleInputChange} required={!logId} />
                                    ) : (
                                        <p className="font-bold text-danger bg-danger/10 border border-danger/20 px-2 py-1 rounded w-fit">
                                            {formData.totalAmount ? `₹${formData.totalAmount}` : 'N/A'}
                                        </p>
                                    )}
                                </InfoField>

                                {/* Price Per Liter */}
                                <InfoField label="Price Per Liter (₹)" isEdit={isEditMode}>
                                    {isEditMode ? (
                                        <Input id="pricePerLiter" type="number" step="0.01" placeholder="Auto-calculated or type here" value={formData.pricePerLiter} onChange={handleInputChange} />
                                    ) : (
                                        <p className="text-sm text-foreground">
                                            {formData.pricePerLiter ? `₹${formData.pricePerLiter}` : 'N/A'}
                                        </p>
                                    )}
                                </InfoField>

                                {/* Bill Number */}
                                <InfoField label="Bill / Receipt No" isEdit={isEditMode}>
                                    {isEditMode ? (
                                        <Input id="fuelBillNo" placeholder="Enter Bill No" value={formData.fuelBillNo} onChange={handleInputChange} />
                                    ) : (
                                        <p className="font-mono text-sm text-foreground">{formData.fuelBillNo || 'N/A'}</p>
                                    )}
                                </InfoField>

                                {/* Payment Mode */}
                                <InfoField label="Payment Mode" isEdit={isEditMode}>
                                    {isEditMode ? (
                                        <SearchSelect
                                            options={paymentOptions}
                                            value={formData.paymentMode}
                                            onChange={(opt) => handleSelectChange('paymentMode', String(opt.value))}
                                            placeholder="Select Payment Mode"
                                        />
                                    ) : (
                                        <p className="text-sm text-foreground capitalize">{formData.paymentMode?.replace('_', ' ') || 'N/A'}</p>
                                    )}
                                </InfoField>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-surface/50 p-5 rounded-xl border border-border/50">
                            <InfoField label="Notes / Remarks" isEdit={isEditMode}>
                                {isEditMode ? (
                                    <textarea
                                        id="notes"
                                        rows={3}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Any additional remarks..."
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    <p className="text-sm text-muted bg-background border border-border/50 p-3 rounded-lg min-h-[60px]">
                                        {formData.notes || <span className="italic opacity-60">No remarks provided.</span>}
                                    </p>
                                )}
                            </InfoField>
                        </div>
                    </div>

                    {/* Fixed Footer */}
                    <div className="mt-auto pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-border shrink-0 bg-background">
                        <Button type="button" variant="outline" onClick={isEditMode && logId ? handleCancel : onClose} className="w-full sm:w-auto">
                            {isEditMode && logId ? 'Cancel Edit' : 'Close'}
                        </Button>

                        {isEditMode && (
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isPending}
                                className="w-full sm:w-auto"
                            >
                                {logId ? 'Save Changes' : 'Register Fuel Log'}
                            </Button>
                        )}
                    </div>
                </form>
            )}
        </SideModal>
    );
}

// Small UI Helper for Grid Alignment
const InfoField = ({ label, isEdit, children }: { label: string, isEdit: boolean, children: React.ReactNode }) => (
    <div className={`flex flex-col ${isEdit ? 'gap-1' : 'gap-1.5'}`}>
        <label className="text-xs font-semibold text-muted uppercase tracking-wide">{label}</label>
        {children}
    </div>
);