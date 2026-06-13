// import React, { useState, useEffect } from 'react';
// import { useAuthData } from '../../hooks/useAuthData';
// import { useGetFeeConfig, useUpsertFeeConfig } from '../../api_services/feeStructure_api/feeStructureConfigApi';
// import { toast } from '../../shared/ui/ToastContext';
// import { Button } from '../../shared/ui/Button';

// export default function FeeStructureConfig() {
//     const { schoolId } = useAuthData();

//     // --- Queries & Mutations ---
//     const { data: configData, isLoading: isFetching } = useGetFeeConfig(schoolId!);
//     const upsertConfigMutation = useUpsertFeeConfig();

//     // --- Local State ---
//     const [feeHeads, setFeeHeads] = useState<string[]>([]);
//     const [newFeeHead, setNewFeeHead] = useState('');
//     const [isActive, setIsActive] = useState(true);

//     // Sync fetched data to local state
//     useEffect(() => {
//         if (configData) {
//             setFeeHeads(configData.feeHeads || []);
//             setIsActive(configData.isActive ?? true);
//         }
//     }, [configData]);

//     // --- Handlers ---
//     const handleAddFeeHead = (e?: React.FormEvent) => {
//         if (e) e.preventDefault();

//         const trimmed = newFeeHead.trim();
//         if (!trimmed) return;

//         // Prevent exact duplicates (case-insensitive check)
//         const isDuplicate = feeHeads.some(head => head.toLowerCase() === trimmed.toLowerCase());
//         if (isDuplicate) {
//             return toast.error("This Fee Head already exists.");
//         }

//         setFeeHeads(prev => [...prev, trimmed]);
//         setNewFeeHead('');
//     };

//     const handleRemoveFeeHead = (indexToRemove: number) => {
//         setFeeHeads(prev => prev.filter((_, idx) => idx !== indexToRemove));
//     };

//     const handleSaveConfig = async () => {
//         if (!schoolId) return toast.error("School ID is missing.");

//         if (feeHeads.length === 0) {
//             if (!window.confirm("You are saving a configuration with zero fee heads. Proceed?")) {
//                 return;
//             }
//         }

//         try {
//             await upsertConfigMutation.mutateAsync({
//                 schoolId,
//                 feeHeads,
//                 isActive
//             });
//             toast.success("Global Fee Configuration saved successfully!");
//         } catch (error: any) {
//             toast.error(error.message || "Failed to save configuration.");
//         }
//     };

//     if (isFetching) {
//         return (
//             <div className="w-full h-[60vh] flex flex-col items-center justify-center text-muted">
//                 <i className="fas fa-spinner fa-spin text-3xl text-primary mb-4"></i>
//                 <p className="text-sm font-semibold animate-pulse">Loading Configuration...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-300">

//             {/* --- HEADER --- */}
//             <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//                 <div>
//                     <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
//                             <i className="fas fa-sliders text-lg"></i>
//                         </div>
//                         Fee Structure Configuration
//                     </h1>
//                     <p className="text-sm text-muted mt-1">
//                         Define the standard fee categories (Tuition, Transport, etc.) applied across all classes in your school.
//                     </p>
//                 </div>

//                 <div className="shrink-0">
//                     <Button 
//                         variant="primary" 
//                         onClick={handleSaveConfig}
//                         isLoading={upsertConfigMutation.isPending}
//                         leftIcon={upsertConfigMutation.isPending ? "fas fa-spinner fa-spin" : "fas fa-save"}
//                         className="w-full md:w-auto shadow-md"
//                     >
//                         {upsertConfigMutation.isPending ? "Saving..." : "Save Configuration"}
//                     </Button>
//                 </div>
//             </header>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//                 {/* --- LEFT COLUMN: SETTINGS & ADDITION --- */}
//                 <div className="lg:col-span-1 space-y-6">

//                     {/* Status Card */}
//                     <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
//                         <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
//                             <i className="fas fa-sliders-h text-muted"></i> Global Status
//                         </h3>

//                         <div className="flex items-center justify-between bg-background border border-border p-3 rounded-lg">
//                             <div className="flex flex-col">
//                                 <span className="text-sm font-semibold text-foreground">Active Configuration</span>
//                                 <span className="text-xs text-muted">Enable or disable fee collection globally.</span>
//                             </div>

//                             {/* Custom Toggle Switch */}
//                             <button 
//                                 type="button"
//                                 onClick={() => setIsActive(!isActive)}
//                                 className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-primary' : 'bg-border'}`}
//                                 role="switch"
//                                 aria-checked={isActive}
//                             >
//                                 <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
//                             </button>
//                         </div>
//                     </div>

//                     {/* Add Fee Head Card */}
//                     <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
//                         <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
//                             <i className="fas fa-plus-circle text-muted"></i> Add Fee Head
//                         </h3>

//                         <form onSubmit={handleAddFeeHead} className="flex flex-col gap-3">
//                             <div>
//                                 <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">
//                                     Fee Category Name
//                                 </label>
//                                 <div className="flex gap-2">
//                                     <input 
//                                         type="text"
//                                         placeholder="e.g. Tuition Fee, Library Fee..." 
//                                         value={newFeeHead}
//                                         onChange={(e) => setNewFeeHead(e.target.value)}
//                                         className="flex-1 bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
//                                     />
//                                     <Button 
//                                         type="submit" 
//                                         variant="secondary" 
//                                         disabled={!newFeeHead.trim()}
//                                         className="shrink-0"
//                                     >
//                                         <i className="fas fa-plus"></i>
//                                     </Button>
//                                 </div>
//                             </div>
//                             <p className="text-[10px] text-muted mt-1 leading-relaxed">
//                                 <i className="fas fa-info-circle mr-1"></i>
//                                 Standardize names to avoid confusion (e.g., use "Transport Fee" consistently instead of "Bus Fee").
//                             </p>
//                         </form>
//                     </div>
//                 </div>

//                 {/* --- RIGHT COLUMN: LIST OF FEE HEADS --- */}
//                 <div className="lg:col-span-2">
//                     <div className="bg-surface border border-border rounded-xl p-5 shadow-sm h-full flex flex-col">

//                         <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
//                             <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
//                                 <i className="fas fa-list text-muted"></i> Configured Fee Heads
//                             </h3>
//                             <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">
//                                 Total: {feeHeads.length}
//                             </span>
//                         </div>

//                         {/* Empty State */}
//                         {feeHeads.length === 0 ? (
//                             <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl bg-background/50">
//                                 <div className="w-16 h-16 rounded-full bg-border/50 flex items-center justify-center mb-4 text-muted">
//                                     <i className="fas fa-receipt text-2xl"></i>
//                                 </div>
//                                 <h4 className="text-base font-bold text-foreground mb-1">No Fee Heads Configured</h4>
//                                 <p className="text-sm text-muted max-w-sm">
//                                     You haven't added any fee categories yet. Start by adding items like "Tuition Fee" or "Admission Fee" from the panel.
//                                 </p>
//                             </div>
//                         ) : (
//                             /* Active List */
//                             <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
//                                 {feeHeads.map((head, index) => (
//                                     <div 
//                                         key={`${head}-${index}`} 
//                                         className="group flex items-center justify-between bg-background border border-border hover:border-primary/40 rounded-lg p-3 transition-all"
//                                     >
//                                         <div className="flex items-center gap-3 overflow-hidden">
//                                             <div className="w-8 h-8 rounded bg-surface border border-border flex items-center justify-center text-muted font-bold text-xs shrink-0">
//                                                 {index + 1}
//                                             </div>
//                                             <span className="font-semibold text-foreground text-sm truncate">
//                                                 {head}
//                                             </span>
//                                         </div>

//                                         <button 
//                                             onClick={() => handleRemoveFeeHead(index)}
//                                             className="w-8 h-8 rounded-md flex items-center justify-center text-muted hover:bg-danger/10 hover:text-danger transition-colors shrink-0"
//                                             title="Remove Fee Head"
//                                         >
//                                             <i className="fas fa-trash-alt text-xs"></i>
//                                         </button>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </div>

//             </div>
//         </div>
//     );
// }



import React, { useState, useEffect } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetFeeConfig, useUpsertFeeConfig } from '../../api_services/feeStructure_api/feeStructureConfigApi';
import { toast } from '../../shared/ui/ToastContext';
import { Button } from '../../shared/ui/Button';

// Common suggestions for a better UX
const SUGGESTED_HEADS = [
    "admission fee", "first term fee", "second term fee", "transport Fee",
    "library fee", "examination fee", "activity fee"
];

const toTitleCase = (str: string) => {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export default function FeeStructureConfig() {
    const { schoolId } = useAuthData();

    // --- Queries & Mutations ---
    const { data: configData, isLoading: isFetching } = useGetFeeConfig(schoolId!);
    const upsertConfigMutation = useUpsertFeeConfig();

    // --- Local State ---
    const [feeHeads, setFeeHeads] = useState<string[]>([]);
    const [newFeeHead, setNewFeeHead] = useState('');

    // Sync fetched data to local state
    useEffect(() => {
        if (configData) {
            setFeeHeads(configData.feeHeads || []);
        }
    }, [configData]);

    // --- Handlers ---
    const handleAddFeeHead = (headToAdd: string) => {
        const trimmed = headToAdd.trim();
        if (!trimmed) return;

        // Prevent exact duplicates (case-insensitive check)
        const isDuplicate = feeHeads.some(head => head.toLowerCase() === trimmed.toLowerCase());
        if (isDuplicate) {
            toast.error(`"${trimmed}" is already in the template.`);
            return;
        }

        setFeeHeads(prev => [...prev, trimmed]);
        setNewFeeHead('');
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAddFeeHead(newFeeHead);
    };

    const handleRemoveFeeHead = (indexToRemove: number) => {
        setFeeHeads(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSaveConfig = async () => {
        if (!schoolId) return toast.error("School ID is missing.");

        if (feeHeads.length === 0) {
            if (!window.confirm("You are saving a template with zero fee heads. Proceed?")) return;
        }

        try {
            await upsertConfigMutation.mutateAsync({
                schoolId,
                feeHeads,
            });
            toast.success("Fee Structure Template saved successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to save template.");
        }
    };

    if (isFetching) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center text-muted">
                <i className="fas fa-spinner fa-spin text-3xl text-primary mb-4"></i>
                <p className="text-sm font-semibold animate-pulse">Loading Template...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-2 animate-in fade-in duration-300">

            {/* --- HEADER --- */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                            <i className="fas fa-sliders text-lg"></i>
                        </div>
                        Fee Structure Configuration
                    </h1>
                    <p className="text-sm text-muted mt-1">
                        Design the standard fee receipt structure that will be applied to all classes.
                    </p>
                </div>

                <div className="shrink-0">
                    <Button
                        variant="primary"
                        onClick={handleSaveConfig}
                        isLoading={upsertConfigMutation.isPending}
                        leftIcon={upsertConfigMutation.isPending ? "fas fa-spinner fa-spin" : "fas fa-save"}
                        className="w-full md:w-auto shadow-md"
                    >
                        {upsertConfigMutation.isPending ? "Saving..." : "Save Template"}
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* --- LEFT COLUMN: THE BUILDER --- */}
                <div className="lg:col-span-5 space-y-6">

                    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                            <i className="fas fa-pen-nib text-muted"></i> Add Category
                        </h3>

                        <form onSubmit={handleFormSubmit} className="flex flex-col gap-3 mb-6">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-keyboard text-muted text-sm"></i>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Type custom fee head..."
                                    value={newFeeHead}
                                    onChange={(e) => setNewFeeHead(e.target.value)}
                                    className="w-full bg-background border border-border text-foreground rounded-lg pl-9 pr-12 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={!newFeeHead.trim()}
                                    className="absolute inset-y-1.5 right-1.5 w-8 h-8 flex items-center justify-center bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                >
                                    <i className="fas fa-plus text-xs"></i>
                                </button>
                            </div>
                        </form>

                        {/* Quick Add Chips */}
                        <div>
                            <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <i className="fas fa-bolt text-amber-500"></i> Quick Add
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTED_HEADS.map(head => {
                                    const isAdded = feeHeads.some(h => h.toLowerCase() === head.toLowerCase());
                                    return (
                                        <button
                                            key={head}
                                            type="button"
                                            disabled={isAdded}
                                            // 🌟 Passes down the original lowercase string to the state handler
                                            onClick={() => handleAddFeeHead(head)}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${isAdded
                                                ? 'bg-background border-border text-muted/50 cursor-not-allowed'
                                                : 'bg-surface border-border text-foreground hover:border-primary hover:text-primary cursor-pointer shadow-sm'
                                                }`}
                                        >
                                            {isAdded ? <i className="fas fa-check mr-1.5"></i> : <i className="fas fa-plus mr-1.5 opacity-50"></i>}
                                            {/* 🌟 Transforms label layout for visual premium presentation */}
                                            {toTitleCase(head)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- RIGHT COLUMN: LIVE RECEIPT PREVIEW --- */}
                <div className="lg:col-span-7">

                    {/* The "Receipt" Card */}
                    <div className="bg-surface rounded-xl shadow-xl border border-border overflow-hidden relative">

                        {/* Decorative Top Border (Like a ticket) */}
                        <div className="h-2 w-full bg-primary/80 absolute top-0 left-0"></div>

                        {/* Receipt Header */}
                        <div className="pt-8 pb-6 px-8 border-b border-dashed border-border bg-background/50 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-foreground uppercase tracking-widest">Fee Structure</h2>
                                <p className="text-xs text-muted font-medium mt-1">STANDARD TEMPLATE PREVIEW</p>
                            </div>
                            <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center bg-surface text-muted/30">
                                <i className="fas fa-school text-xl"></i>
                            </div>
                        </div>

                        {/* Receipt Body (Line Items) */}
                        <div className="p-4 min-h-[250px]">

                            <div className="flex items-center justify-between mb-2 pb-2 border-b-2 border-foreground/10">
                                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">fee Heads</span>
                                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Amount</span>
                            </div>

                            {feeHeads.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-muted/50">
                                    <i className="fas fa-receipt text-4xl mb-3"></i>
                                    <p className="text-sm font-medium">Template is empty. Add categories from the left.</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {feeHeads.map((head, index) => (
                                        <div
                                            key={`${head}-${index}`}
                                            className="group relative flex items-center justify-between py-1.5 px-2 hover:bg-background/80 rounded-lg transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                                                {/* 🌟 Formatted display text here too */}
                                                <span className="text-sm font-bold text-foreground">{toTitleCase(head)}</span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {/* <span className="text-xs font-mono font-medium text-muted">Set per class</span> */}
                                                <button
                                                    onClick={() => handleRemoveFeeHead(index)}
                                                    className=" cursor-pointer w-7 h-7 flex items-center justify-center bg-danger/10 text-danger rounded hover:bg-danger hover:text-white transition-all shadow-sm"
                                                    title="Remove from template"
                                                >
                                                    <i className="fas fa-times text-xs"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Receipt Footer */}
                        <div className="bg-background/50 border-t border-border p-6 flex items-center justify-between">
                            <span className="text-xs font-bold text-muted uppercase tracking-wider">Total Categories</span>
                            <span className="text-lg font-bold text-foreground">{feeHeads.length}</span>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}