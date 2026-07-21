


import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { toast } from '../../shared/ui/ToastContext';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { getAcademicYears } from '../../utils/utils';
import { useRoleCheck } from '../../hooks/useRoleCheck';

// Import the hooks we created earlier
import {
    useUpsertAcademicTermDates,
    useDeleteAcademicTermDates
} from '../../api_services/schoolConfig_api/schoolapi'; // Adjust path as needed
import InfoTooltip from './../../shared/ui/InfoToolTip';

// --- Helper Functions ---
const formatForInput = (dateValue?: string | Date | null) => {
    if (!dateValue) return '';
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

const formatForDisplay = (dateValue?: string | Date | null) => {
    if (!dateValue) return <span className="text-muted italic text-[12px]">Not Set</span>;
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

interface AcademicDateTimelineConfigProps {
    schoolData: any;
}

export default function AcademicDateTimelineConfig({ schoolData }: AcademicDateTimelineConfigProps) {
    // --- API Hooks ---
    const upsertMutation = useUpsertAcademicTermDates();
    const deleteMutation = useDeleteAcademicTermDates();

    const academicYearOptions = getAcademicYears();

    // --- Role Permissions ---
    const { isCorrespondent, isAdmin, isPrincipal } = useRoleCheck();
    const canModify = isCorrespondent || isAdmin || isPrincipal;

    // --- Local State ---
    const [selectedYear, setSelectedYear] = useState<string>(schoolData?.currentAcademicYear || '');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        firstTerm: '',
        secondTerm: '',
        thirdTerm: ''
    });

    // Check if the currently selected year already has saved data
    const existingConfig = schoolData?.academicTermDates?.find(
        (term: any) => term.academicYear === selectedYear
    );

    // --- Auto-Fill & State Sync Effect ---
    useEffect(() => {
        if (selectedYear) {
            if (existingConfig) {
                // Data exists -> default to Read-Only view, but prepopulate form in case they hit Edit
                setIsEditing(false);
                setFormData({
                    firstTerm: formatForInput(existingConfig.firstTerm),
                    secondTerm: formatForInput(existingConfig.secondTerm),
                    thirdTerm: formatForInput(existingConfig.thirdTerm),
                });
            } else {
                // No data -> default to Form view
                setIsEditing(true);
                setFormData({ firstTerm: '', secondTerm: '', thirdTerm: '' });
            }
        }
    }, [selectedYear, schoolData?.academicTermDates]);

    // --- Handlers ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedYear) return;

        try {
            await upsertMutation.mutateAsync({
                id: schoolData._id,
                data: {
                    academicYear: selectedYear,
                    firstTerm: formData.firstTerm || null,
                    secondTerm: formData.secondTerm || null,
                    thirdTerm: formData.thirdTerm || null,
                }
            });
            toast.success("Term dates saved successfully!");
            setIsEditing(false); // Return to read-only view after save
        } catch (error: any) {
            // Error handled by hook
            toast.error(error?.message || "failed to update dates");


        }
    };

    const handleDelete = async () => {
        if (!existingConfig) return;
        if (!window.confirm(`Are you sure you want to delete the timeline for ${selectedYear}?`)) return;

        try {
            await deleteMutation.mutateAsync({
                schoolId: schoolData._id,
                academicTermDateId: existingConfig._id
            });
            toast.success("Timeline deleted successfully!");
            // It will naturally revert to 'isEditing = true' via the useEffect since existingConfig will disappear
        } catch (error: any) {
            toast.error(error?.message || "failed to delete");
            // Error handled by hook
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-start animate-in fade-in duration-300">
            {/* --- LEFT COL: Selector & Quick Navigation --- */}
            <Card className="lg:col-span-1 shadow-sm border-border/60 sticky top-0">
                <CardHeader
                    title="Select Timeline"
                    subtitle="Choose an academic year to manage."
                />
                <CardContent className="space-y-2 sm:space-y-6">
                    <SearchSelect
                        label="Academic Year"
                        options={academicYearOptions}
                        value={selectedYear}
                        onChange={(opt: any) => setSelectedYear(String(opt.value))}
                        placeholder="Select Year..."
                    />

                    {/* Quick list of already configured years so the user knows what exists */}
                    {schoolData?.academicTermDates?.length > 0 && (
                        <div className="pt-4 border-t border-border/50">
                            <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-3">
                                Configured Years
                            </p>
                            {/* Added overflow, max-height, and right padding for the scrollbar */}
                            <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                {schoolData?.academicTermDates.map((term: any) => (
                                    <button
                                        key={term._id}
                                        type="button"
                                        onClick={() => setSelectedYear(term?.academicYear)}
                                        // Added cursor-pointer here
                                        className={`flex items-center justify-between p-2.5 rounded-lg border text-sm transition-colors cursor-pointer ${selectedYear === term.academicYear
                                            ? 'bg-primary/5 border-primary text-primary font-bold'
                                            : 'bg-surface border-border hover:border-primary/40 text-foreground'
                                            }`}
                                    >
                                        <span>{term?.academicYear}</span>
                                        {schoolData?.currentAcademicYear === term?.academicYear && (
                                            <span className="px-2 py-0.5 bg-success/10 text-success text-[10px] uppercase rounded font-bold">
                                                Current
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* --- RIGHT COL: Dynamic Details / Form View --- */}
            <Card className="lg:col-span-2 shadow-sm border-border/60 h-full min-h-[400px]">
                <section className='flex justify-between items-center border-b border-primary-hover px-3 sm:px-5'>
                    <CardHeader
                        title={selectedYear ? `Timeline Details: ${selectedYear}` : "Timeline Details"}
                        subtitle={selectedYear ? "Manage term start dates for this year." : "Select a year on the left to begin."}
                        className='!border-none !px-0 text-[10px] !sm:text-xs'
                    />

                    <InfoTooltip description='This Academic Date configuration is used to for update and track the Fee Status of each student.' />
                </section>
                <CardContent className="h-full">

                    {/* STATE 1: No Year Selected */}
                    {!selectedYear ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[250px] bg-surface rounded-xl border border-dashed border-border">
                            <i className="fas fa-hand-pointer text-3xl text-muted opacity-50 mb-3"></i>
                            <p className="text-sm font-semibold text-foreground">No Year Selected</p>
                            <p className="text-[10px] sm:text-xs text-muted mt-1 text-center max-w-sm">
                                Please select an academic year from the dropdown on the left to view or edit its term dates.
                            </p>
                        </div>
                    ) :

                        /* STATE 2: Read-Only View (Data Exists & Not Editing) */
                        existingConfig && !isEditing ? (
                            // <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col">
                                {/* <div className="bg-background border border-border/50 rounded-xl p-6 mb-6"> */}
                                <div className="bg-background border border-border/50 rounded-xl p-4 mb-4 overflow-y-auto custom-scrollbar flex-1">
                                    {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-6"> */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="flex flex-col items-center justify-center p-4 bg-surface rounded-lg border border-border/40 text-center">
                                            <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Term 1</p>
                                            <p className="text-sm font-bold text-foreground">{formatForDisplay(existingConfig.firstTerm)}</p>
                                        </div>
                                        <div className="flex flex-col items-center justify-center p-4 bg-surface rounded-lg border border-border/40 text-center">
                                            <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Term 2</p>
                                            <p className="text-sm font-bold text-foreground">{formatForDisplay(existingConfig.secondTerm)}</p>
                                        </div>
                                        <div className="flex flex-col items-center justify-center p-4 bg-surface rounded-lg border border-border/40 text-center">
                                            <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Term 3</p>
                                            <p className="text-sm font-bold text-foreground">{formatForDisplay(existingConfig.thirdTerm)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {canModify && (
                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                                        <Button
                                            type="button"
                                            variant="danger"
                                            leftIcon="fas fa-trash-alt"
                                            onClick={handleDelete}
                                            isLoading={deleteMutation.isPending}
                                        >
                                            Delete
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="primary"
                                            leftIcon="fas fa-edit"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            Edit <span className='hidden sm:inline-block sm:ml-1'>Dates</span>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) :
                            /* STATE 3: Form View (No Data OR Editing Existing) */
                            (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {!canModify && !existingConfig ? (
                                        <div className="flex flex-col items-center justify-center py-10 bg-surface rounded-xl border border-border">
                                            <i className="fas fa-lock text-2xl text-muted mb-3"></i>
                                            <p className="text-sm text-muted">No timeline is configured for this year, and you do not have permission to create one.</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSave} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input
                                                    id="firstTerm"
                                                    type="date"
                                                    label="Term 1 Start Date"
                                                    value={formData.firstTerm}
                                                    onChange={handleInputChange}
                                                    disabled={!canModify}
                                                />
                                                <Input
                                                    id="secondTerm"
                                                    type="date"
                                                    label="Term 2 Start Date"
                                                    value={formData.secondTerm}
                                                    onChange={handleInputChange}
                                                    disabled={!canModify}
                                                />
                                                <Input
                                                    id="thirdTerm"
                                                    type="date"
                                                    label="Term 3 Start Date"
                                                    value={formData.thirdTerm}
                                                    onChange={handleInputChange}
                                                    disabled={!canModify}
                                                />
                                            </div>

                                            {canModify && (
                                                <div className="pt-6 border-t border-border/50">
                                                    <div className="flex items-center justify-end gap-3">
                                                        {existingConfig && (
                                                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                                                Cancel
                                                            </Button>
                                                        )}
                                                        <Button
                                                            type="submit"
                                                            variant="primary"
                                                            leftIcon="fas fa-save"
                                                            isLoading={upsertMutation.isPending}
                                                            className="px-8"
                                                        >
                                                            {existingConfig ? "Update Timeline" : "Save Timeline"}
                                                        </Button>
                                                    </div>

                                                    {/* FALLBACK INFO FOR NEW CREATION */}
                                                    {!existingConfig && (
                                                        <div className="mt-4 bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-3">
                                                            <i className="fas fa-info-circle text-primary mt-0.5"></i>
                                                            <p className="text-[11px] text-muted leading-relaxed">
                                                                Data for the academic year <strong>{selectedYear}</strong> is not available. Submitting this form will securely create a newly configured timeline for this term.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </form>
                                    )}
                                </div>
                            )}
                </CardContent>
            </Card>
        </div>
    );
}