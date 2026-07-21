import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { SideModal } from '../../shared/ui/SideModal';
import { toast } from '../../shared/ui/ToastContext';

// Adjust path based on your structure
import {
    useCreatePremises,
    useUpdatePremises,
    type IPremises
} from '../../api_services/eb_api/premisesApi';
import { useGetTariffs } from '../../api_services/eb_api/tariffApi';
import { SearchSelect } from '../../shared/ui/SearchSelect';

interface PremisesModalProps {
    isOpen: boolean;
    onClose: () => void;
    premisesData?: IPremises | null;
    schoolId: string;
    canEdit: boolean;
}

export default function PremisesModal({ isOpen, onClose, premisesData, schoolId, canEdit }: PremisesModalProps) {
    
    // --- API Hooks ---
    const { mutateAsync: createPremises, isPending: isCreating } = useCreatePremises();
    const { mutateAsync: updatePremises, isPending: isUpdating } = useUpdatePremises();
    const { data: tariffsList = [], isLoading: isTariffsLoading } = useGetTariffs(schoolId);

    const isPending = isCreating || isUpdating;

    // --- State Setup ---
    const initialFormState = {
        premisesName: '',
        premisesAddress: '',
        tariffId: '', // <-- Added tariffId to state
        meterLocation: '',
        consumerNumber: '',
        sanctionedLoad: '',
        billingCycleStartDate: '',
        isActive: true
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isEditMode, setIsEditMode] = useState(false);

    // --- Initialize Form on Open ---
    useEffect(() => {
        if (isOpen) {
            if (premisesData) {
                // View Mode for existing record
                setFormData({
                    premisesName: premisesData.premisesName || '',
                    premisesAddress: premisesData.premisesAddress || '',
                    meterLocation: premisesData.meterLocation || '',
                    tariffId: premisesData.tariffId || '', // <-- Load existing tariffId
                    consumerNumber: premisesData.consumerNumber || '',
                    sanctionedLoad: premisesData.sanctionedLoad ? String(premisesData.sanctionedLoad) : '',
                    billingCycleStartDate: premisesData.billingCycleStartDate 
                        ? new Date(premisesData.billingCycleStartDate).toISOString().split('T')[0] 
                        : '',
                    isActive: premisesData.isActive ?? true
                });
                setIsEditMode(false); // Default to View mode when opening existing
            } else {
                // Create Mode
                setFormData(initialFormState);
                setIsEditMode(true);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, premisesData]);


    // Format options for the SearchSelect
    const tariffOptions = useMemo(() => {
        return tariffsList.map((tariff) => ({
            value: tariff._id,
            label: tariff.tariffName
        }));
    }, [tariffsList]);

    // Find selected tariff name for View Mode
    const selectedTariffName = useMemo(() => {
        return tariffsList.find(t => t._id === formData.tariffId)?.tariffName || 'N/A';
    }, [tariffsList, formData.tariffId]);


    // --- Handlers ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [id]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleCancel = () => {
        if (!premisesData) {
            onClose(); // Creating -> close
        } else {
            // Revert changes
            setFormData({
                premisesName: premisesData.premisesName || '',
                premisesAddress: premisesData.premisesAddress || '',
                tariffId: premisesData.tariffId || '', // <-- Revert tariffId
                meterLocation: premisesData.meterLocation || '',
                consumerNumber: premisesData.consumerNumber || '',
                sanctionedLoad: premisesData.sanctionedLoad ? String(premisesData.sanctionedLoad) : '',
                billingCycleStartDate: premisesData.billingCycleStartDate 
                    ? new Date(premisesData.billingCycleStartDate).toISOString().split('T')[0] 
                    : '',
                isActive: premisesData.isActive ?? true
            });
            setIsEditMode(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!formData.premisesName) {
                toast.error("Premises Name is required.");
                return;
            }

            // Prepare Payload
            const payload: any = {
                premisesName: formData.premisesName,
                premisesAddress: formData.premisesAddress || undefined,
                meterLocation: formData.meterLocation || undefined,
                tariffId: formData.tariffId || undefined, // <-- Add tariffId to payload
                consumerNumber: formData.consumerNumber || undefined,
                sanctionedLoad: formData.sanctionedLoad ? Number(formData.sanctionedLoad) : undefined,
                billingCycleStartDate: formData.billingCycleStartDate || undefined,
                isActive: formData.isActive
            };

            if (premisesData?._id) {
                // Update
                await updatePremises({ schoolId, premisesId: premisesData._id, payload });
                toast.success("Premises Updated Successfully!");
                setIsEditMode(false);
            } else {
                // Create
                await createPremises({ schoolId, payload });
                toast.success("Premises Created Successfully!");
                onClose();
            }
        } catch (error: any) {
            toast.error(error?.message || "Operation Failed.");
        }
    };

    const title = !premisesData ? "Register New Premises" : isEditMode ? "Edit Premises" : "Premises Details";

    return (
        <SideModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            actions={
                (canEdit && premisesData && !isEditMode) ? (
                    <Button type="button" variant="primary" leftIcon="fas fa-edit" onClick={() => setIsEditMode(true)}>
                        Edit Details
                    </Button>
                ) : undefined
            }
        >
            <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">
                
                {/* Scrollable Content Area */}
                <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1 pb-4 mt-2">
                    
                    {/* --- Basic Information --- */}
                    <div className="bg-surface/50 p-5 rounded-xl border border-border/50 space-y-5">
                        <h4 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                            <i className="fas fa-info-circle text-muted"></i> Basic Details
                        </h4>

                        <div className="grid grid-cols-1 gap-y-5">
                            <InfoField label="Premises Name *" isEdit={isEditMode}>
                                {isEditMode ? (
                                    <Input 
                                        id="premisesName" 
                                        placeholder="e.g. Main Block, Admin Wing" 
                                        value={formData.premisesName} 
                                        onChange={handleInputChange} 
                                        required 
                                    />
                                ) : (
                                    <p className="font-medium text-foreground">{formData.premisesName || 'N/A'}</p>
                                )}
                            </InfoField>

                            <InfoField label="Address" isEdit={isEditMode}>
                                {isEditMode ? (
                                    <textarea
                                        id="premisesAddress"
                                        rows={2}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                        placeholder="Enter physical address..."
                                        value={formData.premisesAddress}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    <p className="text-sm text-foreground">{formData.premisesAddress || 'N/A'}</p>
                                )}
                            </InfoField>

                            {/* --- Tariff Selection Field Added Here --- */}
                            <InfoField label="Tariff Plan" isEdit={isEditMode}>
                                {isEditMode ? (
                                    <SearchSelect
                                        options={tariffOptions}
                                        value={formData.tariffId}
                                        onChange={(val) => setFormData(prev => ({ ...prev, tariffId: String(val.value) }))}
                                        placeholder={isTariffsLoading ? "Loading tariffs..." : "Search and select tariff..."}
                                    />
                                ) : (
                                    <p className="text-sm text-foreground bg-background border border-border px-2 py-1 rounded w-fit font-medium">
                                        <i className="fas fa-bolt text-primary mr-2 text-xs"></i>
                                        {selectedTariffName}
                                    </p>
                                )}
                            </InfoField>

                            {isEditMode && (
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground mt-2">
                                    <input
                                        id="isActive"
                                        type="checkbox"
                                        className="w-4 h-4 accent-primary rounded border-border-default"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                    />
                                    Active Status
                                </label>
                            )}
                        </div>
                    </div>

                    {/* --- Meter & Billing Information --- */}
                    <div className="bg-surface/50 p-5 rounded-xl border border-border/50 space-y-5">
                        <h4 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                            <i className="fas fa-bolt text-muted"></i> Meter & Billing Details
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                            <InfoField label="Consumer Number" isEdit={isEditMode}>
                                {isEditMode ? (
                                    <Input id="consumerNumber" placeholder="EB Consumer No" value={formData.consumerNumber} onChange={handleInputChange} />
                                ) : (
                                    <p className="font-mono text-sm text-foreground bg-background border border-border px-2 py-1 rounded w-fit">
                                        {formData.consumerNumber || 'N/A'}
                                    </p>
                                )}
                            </InfoField>

                            <InfoField label="Sanctioned Load (kW)" isEdit={isEditMode}>
                                {isEditMode ? (
                                    <Input id="sanctionedLoad" type="number" step="any" placeholder="e.g. 50" value={formData.sanctionedLoad} onChange={handleInputChange} />
                                ) : (
                                    <p className="font-medium text-foreground">{formData.sanctionedLoad ? `${formData.sanctionedLoad} kW` : 'N/A'}</p>
                                )}
                            </InfoField>

                            <InfoField label="Meter Location" isEdit={isEditMode}>
                                {isEditMode ? (
                                    <Input id="meterLocation" placeholder="e.g. Ground Floor Panel" value={formData.meterLocation} onChange={handleInputChange} />
                                ) : (
                                    <p className="text-sm text-foreground">{formData.meterLocation || 'N/A'}</p>
                                )}
                            </InfoField>

                            <InfoField label="Billing Cycle Start" isEdit={isEditMode}>
                                {isEditMode ? (
                                    <Input id="billingCycleStartDate" type="date" value={formData.billingCycleStartDate} onChange={handleInputChange} />
                                ) : (
                                    <p className="text-sm text-foreground">
                                        {formData.billingCycleStartDate 
                                            ? new Date(formData.billingCycleStartDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
                                            : 'N/A'}
                                    </p>
                                )}
                            </InfoField>
                        </div>
                    </div>

                </div>

                {/* Fixed Footer */}
                <div className="mt-auto pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-border shrink-0 bg-background">
                    <Button type="button" variant="outline" onClick={isEditMode && premisesData ? handleCancel : onClose} className="w-full sm:w-auto">
                        {isEditMode && premisesData ? 'Cancel Edit' : 'Close'}
                    </Button>

                    {isEditMode && (
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isPending}
                            className="w-full sm:w-auto"
                        >
                            {premisesData ? 'Save Changes' : 'Create Premises'}
                        </Button>
                    )}
                </div>
            </form>
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