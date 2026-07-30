import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EBPremisesCostBarChart } from '../dashboards/components/EbDashboardWidgets';
import { useGetPremiseById, useUpdatePremises } from '../../../api_services/eb_api/premisesApi';
import { useGetTariffs } from '../../../api_services/eb_api/tariffApi';
import { toast } from '../../../shared/ui/ToastContext';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { Toggle } from '../../../shared/ui/Toggle';
import { useAuthData } from '../../../hooks/useAuthData';
// import { useGetPremiseById, useUpdatePremises } from '../../../apiList/eb_api/premisesApi'; // Adjust import paths as needed
// import { toast } from '../../../utils/toast';
// import { Button } from '../../../components/ui/Button';
// import { Input } from '../../../components/ui/Input';
// import { Toggle } from '../../../components/ui/Toggle';
// import { useGetTariffs } from '../../../apiList/eb_api/tariffApi';
// import SearchSelectNew from '../../../components/ui/SearchSelectNew';
// import { dateFormate } from '../../../utils/dateFormator';

const PremisesSingle = () => {
    const { id } = useParams() as { schoolId: string; id: string };

    const {schoolId} = useAuthData()
    const navigate = useNavigate();

    // --- API Hooks ---
    const { data: premisesData, isLoading: isFetching, isError } = useGetPremiseById({premiseId:id, schoolId:schoolId!});
    const { mutateAsync: updatePremises, isPending: isUpdating } = useUpdatePremises();
    const { data: tariffsList = [], isLoading:isTariffsLoading } = useGetTariffs(schoolId!);


    // The API returns an array, so we extract the first matching record
    // const premisesData = premise?.[0];

    // --- State Management ---
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        premisesName: '',
        premisesAddress: '',
        meterLocation: '',
        tariffId: '',
        consumerNumber: '',
        sanctionedLoad: '',
        billingCycleStartDate: '',
        isActive: true
    });

    // --- Initialize Form Data ---
    useEffect(() => {
        if (premisesData) {
            setFormData({
                premisesName: premisesData.premisesName || '',
                premisesAddress: premisesData.premisesAddress || '',
                meterLocation: premisesData.meterLocation || '',
                tariffId: premisesData.tariffId._id || premisesData.tariffId || '',
                consumerNumber: premisesData.consumerNumber || '',
                sanctionedLoad: premisesData.sanctionedLoad ? String(premisesData.sanctionedLoad) : '',
                billingCycleStartDate: premisesData.billingCycleStartDate || '',
                isActive: premisesData.isActive ?? true
            });
        }
    }, [premisesData]);



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
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleToggleChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, isActive: checked }));
    };

    const handleCancel = () => {
        if (premisesData) {
            // Revert changes back to original data
            setFormData({
                premisesName: premisesData.premisesName || '',
                premisesAddress: premisesData.premisesAddress || '',
                meterLocation: premisesData.meterLocation || '',
                tariffId: premisesData.tariffId || '',
                consumerNumber: premisesData.consumerNumber || '',
                sanctionedLoad: premisesData.sanctionedLoad ? String(premisesData.sanctionedLoad) : '',
                billingCycleStartDate: premisesData.billingCycleStartDate || '',
                isActive: premisesData.isActive ?? true
            });
        }
        setIsEditMode(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!formData.premisesName) {
                toast.warning("Premises Name is required");
                return;
            }

            // Prepare Payload
            const payload: any = {
                premisesName: formData.premisesName,
                premisesAddress: formData.premisesAddress || undefined,
                meterLocation: formData.meterLocation || undefined,
                tariffId: formData.tariffId || undefined,
                consumerNumber: formData.consumerNumber || undefined,
                sanctionedLoad: formData.sanctionedLoad ? Number(formData.sanctionedLoad) : undefined,
                billingCycleStartDate: formData.billingCycleStartDate || undefined,
                isActive: formData.isActive
            };

            if (premisesData?._id) {
                await updatePremises({ schoolId:schoolId!, premisesId: premisesData._id, payload });
                toast.success( "Premises Updated Successfully");
                setIsEditMode(false);
            }
        } catch (error: any) {
            toast.error(error?.message || "Operation Failed");
        }
    };

    // --- Loading & Error States ---
    if (isFetching) {
        return (
            <div className="flex flex-col items-center justify-center h-64 w-full">
                {/* Replaced lucide-react with FontAwesome */}
                <i className="fas fa-circle-notch fa-spin text-muted text-3xl mb-4"></i>
                <p className="text-muted text-sm font-medium">Loading premises details...</p>
            </div>
        );
    }

    if (isError || !premisesData) {
        return (
            <div className="flex flex-col items-center justify-center h-64 w-full bg-surface border border-border rounded-xl p-6">
                <p className="text-status-danger text-sm font-semibold mb-2">Failed to load premises data.</p>
                <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 pb-10">

            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Premises Overview</h2>
                    <p className="text-sm text-muted mt-1">Manage configuration and view billing analytics for this location.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <i className="fas fa-arrow-left mr-2"></i> Back
                    </Button>
                </div>
            </div>

            {/* Top Section: Form / Details */}
            <div className="bg-surface rounded-xl border border-border shadow-sm">
                <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">

                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <i className="fas fa-building text-muted"></i>
                            Premises Information
                        </h3>
                        {!isEditMode ? (
                            <Button type="button" variant="primary" size="sm" onClick={() => setIsEditMode(true)}>
                                Edit Details
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="sm" isLoading={isUpdating}>
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">

                        <div className="sm:col-span-2 lg:col-span-1">
                            <InfoField label="Premises Name *" isEdit={isEditMode}>
                                {isEditMode ? (
                                    <Input
                                        id="premisesName"
                                        value={formData.premisesName}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Block A, Main Campus"
                                        required
                                    />
                                ) : (
                                    <p className="font-medium text-foreground text-[14px]">{formData.premisesName}</p>
                                )}
                            </InfoField>
                        </div>

                        <InfoField label="Consumer Number" isEdit={isEditMode}>
                            {isEditMode ? (
                                <Input
                                    id="consumerNumber"
                                    value={formData.consumerNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter EB Number"
                                />
                            ) : (
                                <p className="font-mono text-sm text-foreground bg-brand-soft border border-border px-2 py-1 rounded w-fit">
                                    {formData.consumerNumber || 'N/A'}
                                </p>
                            )}
                        </InfoField>

                        <InfoField label="Sanctioned Load (kW)" isEdit={isEditMode}>
                            {isEditMode ? (
                                <Input
                                    id="sanctionedLoad"
                                    type="number"
                                    step="any"
                                    value={formData.sanctionedLoad}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 50"
                                />
                            ) : (
                                <p className="text-[14px] text-foreground">{formData.sanctionedLoad ? `${formData.sanctionedLoad} kW` : 'N/A'}</p>
                            )}
                        </InfoField>

                        <div className="sm:col-span-2 lg:col-span-3">
                            <InfoField label="Physical Address" isEdit={isEditMode}>
                                {isEditMode ? (
                                    <textarea
                                        id="premisesAddress"
                                        value={formData.premisesAddress}
                                        onChange={handleInputChange}
                                        placeholder="Full address of the premises"
                                        className="w-full flex min-h-[80px] rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-main placeholder:text-text-soft focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-action-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    />
                                ) : (
                                    <p className="text-[14px] text-foreground leading-relaxed">{formData.premisesAddress || 'No address provided'}</p>
                                )}
                            </InfoField>
                        </div>

                        <InfoField label="Meter Location" isEdit={isEditMode}>
                            {isEditMode ? (
                                <Input
                                    id="meterLocation"
                                    value={formData.meterLocation}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Ground Floor Main Panel"
                                />
                            ) : (
                                <p className="text-[14px] text-foreground">{formData.meterLocation || 'N/A'}</p>
                            )}
                        </InfoField>

                        <InfoField label="Tariff Plan" isEdit={isEditMode}>
                            {isEditMode ? (
                                <SearchSelect
                                    options={tariffOptions}
                                    value={formData.tariffId}
                                    onChange={(val) => setFormData(prev => ({ ...prev, tariffId: String(val) }))}
                                    placeholder={isTariffsLoading ? "Loading tariffs..." : "Search and select tariff..."}
                                    // className=''
                                />
                            ) : (
                                <p className="text-sm text-text-main bg-surface border border-border px-2 py-1 rounded w-fit font-medium">
                                    <i className="fas fa-bolt text-primary mr-2 text-xs"></i>
                                    {selectedTariffName}
                                </p>
                            )}
                        </InfoField>

                        {/* <InfoField label="Billing Cycle Start Date" isEdit={isEditMode}>
                            {isEditMode ? (
                                <Input
                                    id="billingCycleStartDate"
                                    type="date" 
                                    min="1"
                                    max="31"
                                    value={formData.billingCycleStartDate}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 1"
                                />
                            ) : (
                                <p className="text-[14px] text-foreground">
                                    {formData.billingCycleStartDate ? `Day ${dateFormate(formData.billingCycleStartDate)} of month` : 'N/A'}
                                </p>
                            )}
                        </InfoField> */}

                        {/* Status Toggle */}
                        {/* <div className="sm:col-span-2 lg:col-span-3 pt-2 border-t border-border"> */}
                            {isEditMode ? (
                                <Toggle
                                    label="Premises Status"
                                    description={formData.isActive ? "Active and generating bills" : "Inactive / Suspended"}
                                    checked={formData.isActive}
                                    onChange={handleToggleChange}
                                    // trackClassName={formData.isActive ? "bg-action-success" : "bg-gray-200"}
                                />
                            ) : (
                                <InfoField label="Status" isEdit={false}>
                                    <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide ${formData.isActive
                                        ? "bg-action-success/10 text-status-success border border-border"
                                        : "bg-action-danger/10 text-status-danger border border-border"
                                        }`}>
                                        {formData.isActive ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                </InfoField>
                            )}
                        {/* </div> */}
                    </div>
                </form>
            </div>

            {/* Bottom Section: Analytics Chart */}
            <div className="w-full">
                <EBPremisesCostBarChart schoolId={schoolId!} premisesId={id} />
            </div>

        </div>
    );
};

export default PremisesSingle;

// --- Helper Component ---
const InfoField = ({ label, isEdit, children }: { label: string, isEdit: boolean, children: React.ReactNode }) => (
    <div className={`flex flex-col ${isEdit ? 'gap-1.5' : 'gap-1'}`}>
        <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">{label}</label>
        {children}
    </div>
);