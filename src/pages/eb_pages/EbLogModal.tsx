import React, { useEffect, useState } from "react";
import { useGetPremises } from "../../api_services/eb_api/premisesApi";
import { useCreateEBLog, useGetEBLogById, useUpdateEBLog } from "../../api_services/eb_api/ebLogApi";
import { SearchSelect } from "../../shared/ui/SearchSelect";
import { Input } from "../../shared/ui/Input";
import { Button } from "../../shared/ui/Button";
import { toast } from "../../shared/ui/ToastContext";
import { SideModal } from "../../shared/ui/SideModal";
// UI Components
// import { Button } from "../../../components/ui/Button";
// import { Input } from "../../../components/ui/Input";
// import { SearchSelect, type SelectOption } from "../../../components/ui/SearchSelect";

// // Hooks
// import { useGetPremises } from "../../../hooks/premises.hooks";
// import {
//     useGetEBLogById,
//     useCreateEBLog,
//     useUpdateEBLog
// } from "../../../hooks/ebLog.hooks";

interface EbLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    logId?: string | null;
    schoolId: string;
}

export const EbLogModal: React.FC<EbLogModalProps> = ({
    isOpen,
    onClose,
    logId,
    schoolId, // Replace with actual schoolId from context
}) => {
    // --- API Hooks ---
    const createLogMutation = useCreateEBLog();
    const updateLogMutation = useUpdateEBLog();

    // --- Permissions ---
    // const { isCorrespondent, isAdmin, isPrincipal, isAccountant } = useRoleCheck();
    const canEdit = true; // Replace with actual role check logic: isCorrespondent || isAdmin || isPrincipal || isAccountant

    // Fetch fresh data if logId is provided
    const { data: fetchedLog, isLoading: isFetchingLog } = useGetEBLogById(schoolId!, logId || undefined);

    // Fetch and format premises dropdown data
    const { data: premisesList = [] } = useGetPremises(schoolId!);
    const premisesOptions = React.useMemo(() => {
        return premisesList.map((p: any) => ({
            label: p.premisesName,
            value: p._id
        }));
    }, [premisesList]);

    // Determine the actual data to use (prefer fresh fetched data, fallback to passed logData)
    const actualLogData = fetchedLog;

    // --- State Setup ---
    const initialFormState = {
        premisesId: '',
        date: new Date().toISOString().split('T')[0], // Default to today
        time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
        meterReading: '',
        note: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isEditMode, setIsEditMode] = useState(false);

    // --- Initialize Form on Open & Fetch ---
    useEffect(() => {
        if (isOpen) {
            if (logId && actualLogData) {
                // View Mode for existing record
                setFormData({
                    premisesId: actualLogData?.premisesId?._id || actualLogData?.premisesId || '',
                    date: actualLogData.date ? new Date(actualLogData.date).toISOString().split('T')[0] : '',
                    time: actualLogData.time || '',
                    meterReading: actualLogData.meterReading?.toString() || '',
                    note: actualLogData.note || ''
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
                premisesId: actualLogData?.premisesId?._id || actualLogData?.premisesId || '',
                date: actualLogData?.date ? new Date(actualLogData?.date).toISOString().split('T')[0] : '',
                time: actualLogData?.time || '',
                meterReading: actualLogData?.meterReading?.toString() || '',
                note: actualLogData?.note || ''
            });
            setIsEditMode(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Mandatory Validations
            if (!formData.premisesId || !formData.date || !formData.time || !formData.meterReading) {
                toast.error("Premises, Date, Time, and Meter Reading are mandatory.");
                return;
            }

            // Prepare Payload 
            const payload: any = {};
            if (formData.premisesId) payload.premisesId = formData.premisesId;
            if (formData.date) payload.date = formData.date;
            if (formData.time) payload.time = formData.time;
            if (formData.meterReading) payload.meterReading = Number(formData.meterReading);
            if (formData.note !== undefined) payload.note = formData.note;

            if (logId) {
                // Update API
                await updateLogMutation.mutateAsync({ schoolId: schoolId!, logId, payload });
                toast.success("EB Log Updated Successfully!");
                setIsEditMode(false);
            } else {
                // Create API
                await createLogMutation.mutateAsync({ schoolId: schoolId!, payload });
                toast.success("EB Log Created Successfully!");
                onClose();
                setFormData(initialFormState)
            }

        } catch (error: any) {
            toast.error(error.message || "Operation Failed.");
        }
    };

    const isPending = createLogMutation.isPending || updateLogMutation.isPending;
    const title = !logId ? "Record EB Reading" : isEditMode ? "Edit EB Log" : "EB Log Details";

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
                    <p className="text-muted text-sm font-medium">Fetching Log Details...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">

                    {/* Scrollable Content Area */}
                    <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1 pb-4 mt-2">

                        {/* --- 1. Premises & Reading Metrics --- */}
                        <div className="bg-surface/50 p-5 rounded-xl border border-border-default/50 space-y-5">
                            <h4 className="text-sm font-semibold text-foreground border-b border-border-default pb-2 flex items-center gap-2">
                                <i className="fas fa-building text-muted"></i> Premises & Reading
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                {/* Premises */}
                                <InfoField label="Premises" isEdit={isEditMode}>
                                    {isEditMode ? (
                                        <SearchSelect
                                            options={premisesOptions}
                                            value={formData.premisesId}
                                            onChange={(opt) => handleSelectChange('premisesId', String(opt.value))}
                                            placeholder="Select Premises..."
                                        // disabled={!!logId} // Usually shouldn't change premises on edit
                                        />
                                    ) : (
                                        <p className="font-medium text-foreground">
                                            {actualLogData?.premisesId?.premisesName || premisesOptions.find((opt: any) => opt.value === formData.premisesId)?.label || 'Unknown Premises'}
                                        </p>
                                    )}
                                </InfoField>

                                {/* Meter Reading */}
                                <InfoField label={`Meter Reading (kWh) ${!logId ? '*' : ''}`} isEdit={isEditMode}>
                                    {isEditMode ? (
                                        <Input
                                            id="meterReading"
                                            type="number"
                                            step="any"
                                            placeholder="e.g. 14500"
                                            value={formData.meterReading}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    ) : (
                                        <p className="font-mono text-sm bg-background border border-border-default px-2 py-1 rounded w-fit">
                                            {formData.meterReading ? `${Number(formData.meterReading).toLocaleString()} kWh` : 'N/A'}
                                        </p>
                                    )}
                                </InfoField>

                                {/* Date */}
                                <InfoField label="Reading Date" isEdit={isEditMode}>
                                    {isEditMode ? (
                                        <Input id="date" type="date" value={formData.date} onChange={handleInputChange} required />
                                    ) : (
                                        <p className="font-medium text-foreground">
                                            {formData.date ? new Date(formData.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                        </p>
                                    )}
                                </InfoField>

                                {/* Time */}
                                <InfoField label="Reading Time" isEdit={isEditMode}>
                                    {isEditMode ? (
                                        <Input id="time" type="time" value={formData.time} onChange={handleInputChange} required />
                                    ) : (
                                        <p className="font-medium text-foreground">
                                            {formData.time || 'N/A'}
                                        </p>
                                    )}
                                </InfoField>
                            </div>
                        </div>

                        {/* --- 2. Additional Notes --- */}
                        <div className="bg-surface/50 p-5 rounded-xl border border-border-default/50">
                            <InfoField label="Notes / Observations" isEdit={isEditMode}>
                                {isEditMode ? (
                                    <textarea
                                        id="note"
                                        rows={3}
                                        className="w-full rounded-lg border border-border-default bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-soft/50 resize-none"
                                        placeholder="Any observations regarding this reading..."
                                        value={formData.note}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    <p className="text-sm text-muted bg-background border border-border-default/50 p-3 rounded-lg min-h-[60px]">
                                        {formData.note || <span className="italic opacity-60">No remarks provided.</span>}
                                    </p>
                                )}
                            </InfoField>
                        </div>
                    </div>

                    {/* Fixed Footer */}
                    <div className="mt-auto pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-border-default shrink-0 bg-background">
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
                                {logId ? 'Save Changes' : 'Record Reading'}
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
        <label className="text-[11px] font-semibold text-muted uppercase tracking-wide">{label}</label>
        {children}
    </div>
);

export default EbLogModal;