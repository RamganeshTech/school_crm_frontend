


import { useState, useEffect } from 'react';
// import { useAuthData } from '../../hooks/useAuthData';
import { useGetMyFeatures, useUpdateSchoolSubscription } from '../../api_services/subscripiton_api/subscriptionApi';
import { SearchSelect } from '../../shared/ui/SearchSelect'; // Adjust path if needed
import { toast } from '../../shared/ui/ToastContext';
// import { useRoleCheck } from '../../hooks/useRoleCheck';

// --- Standard Module Definitions ---
const MODULE_DEFINITIONS = [
    { key: 'studentRecord', label: 'Student Records', icon: 'fas fa-user-graduate', description: 'Core student directory and profiles' },
    { key: 'attendance', label: 'Attendance Tracking', icon: 'fas fa-calendar-check', description: 'Daily attendance and leave management' },
    { key: 'expense', label: 'Expense Ledger', icon: 'fas fa-wallet', description: 'Financial tracking and approvals' },
    { key: 'club', label: 'Club Management', icon: 'fas fa-users-viewfinder', description: 'Extracurricular club assignments' },
    { key: 'announcement', label: 'Announcements', icon: 'fas fa-bullhorn', description: 'School-wide notice board system' }
] as const;

// --- Plan Definitions for SearchSelect ---
const PLAN_OPTIONS = [
    { label: 'Basic Plan', value: 'basic' },
    { label: 'Standard Plan', value: 'standard' },
    { label: 'Premium Plan', value: 'premium' },
    { label: 'Custom Plan', value: 'custom' }
];

// --- Pre-defined Packages for Auto-Toggling ---
const PACKAGES: Record<string, Record<string, boolean>> = {
    basic: { studentRecord: true, attendance: false, expense: false, club: false, announcement: false },
    standard: { studentRecord: true, attendance: true, expense: true, club: false, announcement: false },
    premium: { studentRecord: true, attendance: true, expense: true, club: true, announcement: true }
};


type Props = {
    schoolId: string
    isPlatformAdmin: boolean
}
const SubscriptionModule: React.FC<Props> = ({ schoolId, isPlatformAdmin }) => {
    // const { schoolId, isPlatformAdmin } = useAuthData();

    // --- Data Fetching ---
    const { data: subData, isLoading, isError } = useGetMyFeatures(schoolId!);
    const { mutateAsync: updateSubscription, isPending: isUpdating } = useUpdateSchoolSubscription();

    // const {isCorrespondent, } = useRoleCheck()

    // const canModify = isCorrespondent 

    // --- Local State ---
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string>('basic');
    const [customModules, setCustomModules] = useState<Record<string, boolean>>({});

    // Sync local state when API data loads
    useEffect(() => {
        if (subData) {
            setSelectedPlan(subData.plan || 'basic');
            setCustomModules((subData.features as Record<string, boolean>) || {});
        }
    }, [subData]);

    const canEdit = isPlatformAdmin;

    // Smart Dropdown Handler: Auto-fills modules based on selected plan
    const handlePlanChange = (planValue: string) => {
        setSelectedPlan(planValue);
        if (planValue !== 'custom' && PACKAGES[planValue]) {
            // Auto-update toggles to match the selected package
            setCustomModules({ ...PACKAGES[planValue] });
        }
    };

    // Smart Toggle Handler: Switches plan to 'custom' if user manually deviates from a preset
    const handleToggleModule = (moduleKey: string) => {
        if (!isEditing) return;
        setCustomModules(prev => {
            const updated = { ...prev, [moduleKey]: !prev[moduleKey] };
            return updated;
        });
        setSelectedPlan('custom'); // Deviating from default means it's custom now
    };

    const handleSave = async () => {
        try {
            if (!schoolId) return;
            await updateSubscription(
                {
                    schoolId,
                    planName: selectedPlan as any,
                    customModules: customModules // Always send the current state
                }
            );
            setIsEditing(false);
            toast.success("Updated the subscription!");

        }
        catch (error: any) {
            toast.error(error.message || "Failed to create staff");

        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center">
                <i className="fas fa-circle-notch fa-spin text-3xl text-primary mb-3"></i>
                <p className="text-sm font-medium text-muted">Loading subscription details...</p>
            </div>
        );
    }

    if (isError || !subData) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center">
                <i className="fas fa-triangle-exclamation text-3xl text-danger mb-3"></i>
                <p className="text-sm font-medium text-danger">Failed to load subscription data.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col space-y-6">

            {/* --- TOP HEADER --- */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3 uppercase">
                        <i className="fas fa-crown text-primary"></i>
                        Subscription Plan
                    </h1>
                    <p className="text-sm text-muted mt-1">Manage active licensing and platform features for your school.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    {canEdit && isEditing ? (
                        <>
                            {/* SearchSelect replaces the native select */}
                            <div className="w-full sm:w-56">
                                <SearchSelect
                                    label=""
                                    options={PLAN_OPTIONS}
                                    value={selectedPlan}
                                    onChange={(opt) => handlePlanChange(opt.value as string)}
                                    placeholder="Select Plan..."
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setSelectedPlan(subData.plan || 'basic');
                                    setCustomModules((subData.features as Record<string, boolean>) || {});
                                }}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm font-bold transition-colors hover:bg-mainBg whitespace-nowrap shadow-sm"
                                disabled={isUpdating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-primary text-inverse border border-primary text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
                                disabled={isUpdating}
                            >
                                {isUpdating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                                Save
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            {/* Static Badge showing current plan */}
                            <div className="px-4 py-2 rounded-lg bg-primary-soft text-primary font-bold text-sm uppercase tracking-wider border border-border">
                                {subData.plan || 'Custom'} Plan
                            </div>

                            {canEdit && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm font-bold transition-colors hover:bg-mainBg flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
                                >
                                    <i className="fas fa-pen text-muted"></i>
                                    Modify
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* --- INDEPENDENT CARD GRID --- */}
            <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {MODULE_DEFINITIONS.map((mod) => {
                        const isActive = customModules[mod.key] || false;

                        return (
                            <div
                                key={mod.key}
                                className={`bg-surface p-6 rounded-2xl border flex flex-col justify-between transition-all duration-200 shadow-sm ${isActive ? 'border-border' : 'border-border opacity-75 bg-mainBg'
                                    }`}
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${isActive ? 'bg-primary text-inverse border-primary shadow-sm' : 'bg-surface text-muted border-border'
                                            }`}>
                                            <i className={`${mod.icon} text-lg`}></i>
                                        </div>

                                        {/* Dynamic Status Display (Toggle vs Badge) */}
                                        {isEditing ? (
                                            <button
                                                onClick={() => handleToggleModule(mod.key)}
                                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isActive ? 'bg-success' : 'bg-border'
                                                    }`}
                                            >
                                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'
                                                    }`} />
                                            </button>
                                        ) : (
                                            <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${isActive ? 'text-success border-success bg-success/5' : 'text-muted border-border bg-mainBg'
                                                }`}>
                                                {isActive ? 'Enabled' : 'Locked'}
                                            </div>
                                        )}
                                    </div>

                                    <h4 className="font-bold text-foreground text-lg mb-1">{mod.label}</h4>
                                    <p className="text-sm text-muted leading-relaxed">
                                        {mod.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}

export default SubscriptionModule