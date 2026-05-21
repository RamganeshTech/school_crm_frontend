
// import { useState, useEffect } from 'react';
// import { useAuthData } from '../../hooks/useAuthData';
// import { useGetMyFeatures, useUpdateSchoolSubscription } from '../../api_services/subscripiton_api/subscriptionApi';

// // Define standard modules for mapping over them easily
// const MODULE_DEFINITIONS = [
//     { key: 'studentRecord', label: 'Student Records', icon: 'fas fa-user-graduate', description: 'Core student directory and profiles' },
//     { key: 'attendance', label: 'Attendance Tracking', icon: 'fas fa-calendar-check', description: 'Daily attendance and leave management' },
//     { key: 'expense', label: 'Expense Ledger', icon: 'fas fa-wallet', description: 'Financial tracking and approvals' },
//     { key: 'club', label: 'Club Management', icon: 'fas fa-users-viewfinder', description: 'Extracurricular club assignments' },
//     { key: 'announcement', label: 'Announcements', icon: 'fas fa-bullhorn', description: 'School-wide notice board system' }
// ] as const;

// export default function SubscriptionMain() {
//     const { schoolId, currentRole, isPlatformAdmin } = useAuthData(); 
    
//     // --- Data Fetching ---
//     const { data: subData, isLoading, isError } = useGetMyFeatures(schoolId!);
//     const { mutate: updateSubscription, isPending: isUpdating } = useUpdateSchoolSubscription();

//     // --- Local State for Editing (Only for Admins) ---
//     const [isEditing, setIsEditing] = useState(false);
//     const [selectedPlan, setSelectedPlan] = useState<string>('basic');
//     const [customModules, setCustomModules] = useState<Record<string, boolean>>({});

//     // Sync local state when API data loads
//     useEffect(() => {
//         if (subData) {
//             setSelectedPlan(subData.plan || 'basic');
//             // FIX: Cast the incoming features to match the strict React state
//             setCustomModules((subData.features as Record<string, boolean>) || {});
//         }
//     }, [subData]);

//     // Only allow platform admin (or equivalent high-level role) to toggle edit mode
//     const canEdit = isPlatformAdmin;

//     const handleToggleModule = (moduleKey: string) => {
//         if (!isEditing) return;
//         setCustomModules(prev => ({
//             ...prev,
//             [moduleKey]: !prev[moduleKey]
//         }));
//     };

//     const handleSave = () => {
//         if (!schoolId) return;
//         updateSubscription(
//             {
//                 schoolId,
//                 planName: selectedPlan as any,
//                 customModules: selectedPlan === 'custom' ? customModules : undefined 
//             },
//             {
//                 onSuccess: () => {
//                     setIsEditing(false);
//                 }
//             }
//         );
//     };

//     if (isLoading) {
//         return (
//             <div className="w-full h-64 flex flex-col items-center justify-center bg-surface rounded-2xl border border-border shadow-sm">
//                 <i className="fas fa-circle-notch fa-spin text-3xl text-primary mb-3"></i>
//                 <p className="text-sm font-medium text-muted">Loading subscription details...</p>
//             </div>
//         );
//     }

//     if (isError || !subData) {
//         return (
//             <div className="w-full h-64 flex flex-col items-center justify-center bg-surface rounded-2xl border border-border shadow-sm">
//                 <i className="fas fa-triangle-exclamation text-3xl text-danger mb-3"></i>
//                 <p className="text-sm font-medium text-danger">Failed to load subscription data.</p>
//             </div>
//         );
//     }

//     return (
//         <div className="w-full max-w-5xl mx-auto space-y-6">
            
//             {/* --- TOP HEADER / PLAN SUMMARY --- */}
//             <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
//                 <div className="flex items-center gap-5">
//                     <div className="w-14 h-14 rounded-xl bg-primary-soft flex items-center justify-center border border-border">
//                         <i className="fas fa-crown text-2xl text-primary"></i>
//                     </div>
//                     <div>
//                         <h2 className="text-xl font-black text-foreground uppercase tracking-wide">
//                             {canEdit && isEditing ? (
//                                 <select 
//                                     value={selectedPlan}
//                                     onChange={(e) => setSelectedPlan(e.target.value)}
//                                     className="bg-mainBg border border-border rounded text-foreground outline-none px-2 py-1 uppercase text-lg"
//                                 >
//                                     <option value="basic">Basic Plan</option>
//                                     <option value="standard">Standard Plan</option>
//                                     <option value="premium">Premium Plan</option>
//                                     <option value="custom">Custom Plan</option>
//                                 </select>
//                             ) : (
//                                 `${subData.plan || 'Custom'} Plan`
//                             )}
//                         </h2>
//                         <p className="text-sm text-muted font-medium mt-1">Active licensing and platform features</p>
//                     </div>
//                 </div>

//                 {/* Admin Action Buttons */}
//                 {canEdit && (
//                     <div className="flex items-center gap-3 w-full md:w-auto">
//                         {isEditing ? (
//                             <>
//                                 <button 
//                                     onClick={() => {
//                                         setIsEditing(false);
//                                         setSelectedPlan(subData.plan || 'basic');
//                                         // FIX: Cast the incoming features here as well
//                                         setCustomModules((subData.features as Record<string, boolean>) || {});
//                                     }}
//                                     className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-border text-foreground text-sm font-bold transition-colors hover:bg-mainBg"
//                                     disabled={isUpdating}
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button 
//                                     onClick={handleSave}
//                                     className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-primary text-inverse border border-primary text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
//                                     disabled={isUpdating}
//                                 >
//                                     {isUpdating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
//                                     Save Changes
//                                 </button>
//                             </>
//                         ) : (
//                             <button 
//                                 onClick={() => setIsEditing(true)}
//                                 className="w-full md:w-auto px-4 py-2 rounded-lg border border-border text-foreground text-sm font-bold transition-colors hover:bg-mainBg flex items-center justify-center gap-2"
//                             >
//                                 <i className="fas fa-pen"></i>
//                                 Modify Subscription
//                             </button>
//                         )}
//                     </div>
//                 )}
//             </div>

//             {/* --- MODULES GRID --- */}
//             <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
//                 <div className="p-5 border-b border-border bg-sub-header">
//                     <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Module Configuration</h3>
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-border">
//                     {MODULE_DEFINITIONS.map((mod) => {
//                         const isActive = customModules[mod.key] || false;

//                         return (
//                             <div 
//                                 key={mod.key} 
//                                 className={`p-6 flex flex-col justify-between transition-colors ${isActive ? '' : 'bg-mainBg opacity-80'}`}
//                             >
//                                 <div>
//                                     <div className="flex items-center justify-between mb-3">
//                                         <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isActive ? 'bg-primary text-inverse border-primary' : 'bg-surface text-muted border-border'}`}>
//                                             <i className={`${mod.icon}`}></i>
//                                         </div>
                                        
//                                         {/* Status Badge */}
//                                         <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${isActive ? 'text-success border-success' : 'text-muted border-border'}`}>
//                                             {isActive ? 'Enabled' : 'Locked'}
//                                         </div>
//                                     </div>
                                    
//                                     <h4 className="font-bold text-foreground text-base mb-1">{mod.label}</h4>
//                                     <p className="text-xs text-muted leading-relaxed min-h-[40px]">
//                                         {mod.description}
//                                     </p>
//                                 </div>

//                                 {/* Edit Toggle (Only visible in edit mode) */}
//                                 {isEditing && (
//                                     <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
//                                         <span className="text-xs font-bold text-muted uppercase">Access</span>
//                                         <button 
//                                             onClick={() => handleToggleModule(mod.key)}
//                                             className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isActive ? 'bg-success' : 'bg-primary-soft'}`}
//                                         >
//                                             <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-surface transition-transform ${isActive ? 'translate-x-4' : 'translate-x-1'}`} />
//                                         </button>
//                                     </div>
//                                 )}
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>

//         </div>
//     );
// }




import { useState, useEffect } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetMyFeatures, useUpdateSchoolSubscription } from '../../api_services/subscripiton_api/subscriptionApi';
import { SearchSelect } from '../../shared/ui/SearchSelect'; // Adjust path if needed

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

export default function SubscriptionMain() {
    const { schoolId, isPlatformAdmin } = useAuthData(); 
    
    // --- Data Fetching ---
    const { data: subData, isLoading, isError } = useGetMyFeatures(schoolId!);
    const { mutate: updateSubscription, isPending: isUpdating } = useUpdateSchoolSubscription();

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

    const handleSave = () => {
        if (!schoolId) return;
        updateSubscription(
            {
                schoolId,
                planName: selectedPlan as any,
                customModules: customModules // Always send the current state
            },
            {
                onSuccess: () => {
                    setIsEditing(false);
                }
            }
        );
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
                                className={`bg-surface p-6 rounded-2xl border flex flex-col justify-between transition-all duration-200 shadow-sm ${
                                    isActive ? 'border-border' : 'border-border opacity-75 bg-mainBg'
                                }`}
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                                            isActive ? 'bg-primary text-inverse border-primary shadow-sm' : 'bg-surface text-muted border-border'
                                        }`}>
                                            <i className={`${mod.icon} text-lg`}></i>
                                        </div>
                                        
                                        {/* Dynamic Status Display (Toggle vs Badge) */}
                                        {isEditing ? (
                                            <button 
                                                onClick={() => handleToggleModule(mod.key)}
                                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                                    isActive ? 'bg-success' : 'bg-border'
                                                }`}
                                            >
                                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow ring-0 transition duration-200 ease-in-out ${
                                                    isActive ? 'translate-x-5' : 'translate-x-0'
                                                }`} />
                                            </button>
                                        ) : (
                                            <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                                                isActive ? 'text-success border-success bg-success/5' : 'text-muted border-border bg-mainBg'
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