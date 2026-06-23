
// import React, { useState, useEffect } from 'react';
// import { useAuthData } from '../../hooks/useAuthData';
// import { useGetFeeConfig, useUpsertFeeConfig } from '../../api_services/feeStructure_api/feeStructureConfigApi';
// import { toast } from '../../shared/ui/ToastContext';
// import { Button } from '../../shared/ui/Button';

// // Common suggestions for a better UX
// const SUGGESTED_HEADS = [
//     "admission fee", "first term fee", "second term fee", "transport Fee",
//     "library fee", "examination fee", "activity fee"
// ];

// const toTitleCase = (str: string) => {
//     return str
//         .toLowerCase()
//         .split(' ')
//         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//         .join(' ');
// };

// export default function FeeStructureConfig() {
//     const { schoolId } = useAuthData();

//     // --- Queries & Mutations ---
//     const { data: configData, isLoading: isFetching } = useGetFeeConfig(schoolId!);
//     const upsertConfigMutation = useUpsertFeeConfig();

//     // --- Local State ---
//     const [feeHeads, setFeeHeads] = useState<string[]>([]);
//     const [newFeeHead, setNewFeeHead] = useState('');

//     // Sync fetched data to local state
//     useEffect(() => {
//         if (configData) {
//             setFeeHeads(configData.feeHeads || []);
//         }
//     }, [configData]);

//     // --- Handlers ---
//     const handleAddFeeHead = (headToAdd: string) => {
//         const trimmed = headToAdd.trim();
//         if (!trimmed) return;

//         // Prevent exact duplicates (case-insensitive check)
//         const isDuplicate = feeHeads.some(head => head.toLowerCase() === trimmed.toLowerCase());
//         if (isDuplicate) {
//             toast.error(`"${trimmed}" is already in the template.`);
//             return;
//         }

//         setFeeHeads(prev => [...prev, trimmed]);
//         setNewFeeHead('');
//     };

//     const handleFormSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         handleAddFeeHead(newFeeHead);
//     };

//     const handleRemoveFeeHead = (indexToRemove: number) => {
//         setFeeHeads(prev => prev.filter((_, idx) => idx !== indexToRemove));
//     };

//     const handleSaveConfig = async () => {
//         if (!schoolId) return toast.error("School ID is missing.");

//         if (feeHeads.length === 0) {
//             if (!window.confirm("You are saving a template with zero fee heads. Proceed?")) return;
//         }

//         try {
//             await upsertConfigMutation.mutateAsync({
//                 schoolId,
//                 feeHeads,
//             });
//             toast.success("Fee Structure Template saved successfully!");
//         } catch (error: any) {
//             toast.error(error.message || "Failed to save template.");
//         }
//     };

//     if (isFetching) {
//         return (
//             <div className="w-full h-[60vh] flex flex-col items-center justify-center text-muted">
//                 <i className="fas fa-spinner fa-spin text-3xl text-primary mb-4"></i>
//                 <p className="text-sm font-semibold animate-pulse">Loading Template...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="w-full max-w-7xl mx-auto p-2 animate-in fade-in duration-300">

//             {/* --- HEADER --- */}
//             <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
//                 <div>
//                     <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
//                             <i className="fas fa-sliders text-lg"></i>
//                         </div>
//                         Fee Structure Configuration
//                     </h1>
//                     <p className="text-sm text-muted mt-1">
//                         Design the standard fee receipt structure that will be applied to all classes.
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
//                         {upsertConfigMutation.isPending ? "Saving..." : "Save Template"}
//                     </Button>
//                 </div>
//             </header>

//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

//                 {/* --- LEFT COLUMN: THE BUILDER --- */}
//                 <div className="lg:col-span-5 space-y-6">

//                     <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
//                         <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
//                             <i className="fas fa-pen-nib text-muted"></i> Add Category
//                         </h3>

//                         <form onSubmit={handleFormSubmit} className="flex flex-col gap-3 mb-6">
//                             <div className="relative">
//                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                     <i className="fas fa-keyboard text-muted text-sm"></i>
//                                 </div>
//                                 <input
//                                     type="text"
//                                     placeholder="Type custom fee head..."
//                                     value={newFeeHead}
//                                     onChange={(e) => setNewFeeHead(e.target.value)}
//                                     className="w-full bg-background border border-border text-foreground rounded-lg pl-9 pr-12 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner"
//                                 />
//                                 <button
//                                     type="submit"
//                                     disabled={!newFeeHead.trim()}
//                                     className="absolute inset-y-1.5 right-1.5 w-8 h-8 flex items-center justify-center bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
//                                 >
//                                     <i className="fas fa-plus text-xs"></i>
//                                 </button>
//                             </div>
//                         </form>

//                         {/* Quick Add Chips */}
//                         <div>
//                             <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
//                                 <i className="fas fa-bolt text-amber-500"></i> Quick Add
//                             </p>
//                             <div className="flex flex-wrap gap-2">
//                                 {SUGGESTED_HEADS.map(head => {
//                                     const isAdded = feeHeads.some(h => h.toLowerCase() === head.toLowerCase());
//                                     return (
//                                         <button
//                                             key={head}
//                                             type="button"
//                                             disabled={isAdded}
//                                             // 🌟 Passes down the original lowercase string to the state handler
//                                             onClick={() => handleAddFeeHead(head)}
//                                             className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${isAdded
//                                                 ? 'bg-background border-border text-muted/50 cursor-not-allowed'
//                                                 : 'bg-surface border-border text-foreground hover:border-primary hover:text-primary cursor-pointer shadow-sm'
//                                                 }`}
//                                         >
//                                             {isAdded ? <i className="fas fa-check mr-1.5"></i> : <i className="fas fa-plus mr-1.5 opacity-50"></i>}
//                                             {/* 🌟 Transforms label layout for visual premium presentation */}
//                                             {toTitleCase(head)}
//                                         </button>
//                                     );
//                                 })}
//                             </div>
//                         </div>

//                     </div>
//                 </div>

//                 {/* --- RIGHT COLUMN: LIVE RECEIPT PREVIEW --- */}
//                 <div className="lg:col-span-7">

//                     {/* The "Receipt" Card */}
//                     <div className="bg-surface rounded-xl shadow-xl border border-border overflow-hidden relative">

//                         {/* Decorative Top Border (Like a ticket) */}
//                         <div className="h-2 w-full bg-primary/80 absolute top-0 left-0"></div>

//                         {/* Receipt Header */}
//                         <div className="pt-8 pb-6 px-8 border-b border-dashed border-border bg-background/50 flex items-center justify-between">
//                             <div>
//                                 <h2 className="text-lg font-bold text-foreground uppercase tracking-widest">Fee Structure</h2>
//                                 <p className="text-xs text-muted font-medium mt-1">STANDARD TEMPLATE PREVIEW</p>
//                             </div>
//                             <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center bg-surface text-muted/30">
//                                 <i className="fas fa-school text-xl"></i>
//                             </div>
//                         </div>

//                         {/* Receipt Body (Line Items) */}
//                         <div className="p-4 min-h-[250px]">

//                             <div className="flex items-center justify-between mb-2 pb-2 border-b-2 border-foreground/10">
//                                 <span className="text-[10px] font-bold text-muted uppercase tracking-widest">fee Heads</span>
//                                 <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Amount</span>
//                             </div>

//                             {feeHeads.length === 0 ? (
//                                 <div className="py-12 flex flex-col items-center justify-center text-muted/50">
//                                     <i className="fas fa-receipt text-4xl mb-3"></i>
//                                     <p className="text-sm font-medium">Template is empty. Add categories from the left.</p>
//                                 </div>
//                             ) : (
//                                 <div className="space-y-1">
//                                     {feeHeads.map((head, index) => (
//                                         <div
//                                             key={`${head}-${index}`}
//                                             className="group relative flex items-center justify-between py-1.5 px-2 hover:bg-background/80 rounded-lg transition-colors"
//                                         >
//                                             <div className="flex items-center gap-3">
//                                                 <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
//                                                 {/* 🌟 Formatted display text here too */}
//                                                 <span className="text-sm font-bold text-foreground">{toTitleCase(head)}</span>
//                                             </div>

//                                             <div className="flex items-center gap-4">
//                                                 {/* <span className="text-xs font-mono font-medium text-muted">Set per class</span> */}
//                                                 <button
//                                                     onClick={() => handleRemoveFeeHead(index)}
//                                                     className=" cursor-pointer w-7 h-7 flex items-center justify-center bg-danger/10 text-danger rounded hover:bg-danger hover:text-white transition-all shadow-sm"
//                                                     title="Remove from template"
//                                                 >
//                                                     <i className="fas fa-times text-xs"></i>
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>

//                         {/* Receipt Footer */}
//                         <div className="bg-background/50 border-t border-border p-6 flex items-center justify-between">
//                             <span className="text-xs font-bold text-muted uppercase tracking-wider">Total Categories</span>
//                             <span className="text-lg font-bold text-foreground">{feeHeads.length}</span>
//                         </div>

//                     </div>
//                 </div>

//             </div>
//         </div>
//     );
// }



// SECOND VERSION


import React, { useState, useEffect } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetFeeConfig, useUpsertFeeConfigV1, type FeeHeadItem } from '../../api_services/feeStructure_api/feeStructureConfigApi';
import { toast } from '../../shared/ui/ToastContext';
import { Button } from '../../shared/ui/Button';
import { SearchSelect } from '../../shared/ui/SearchSelect';

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
    const upsertConfigMutation = useUpsertFeeConfigV1();

    const TERM_OPTIONS = [
        { label: 'First Term', value: 'firstTerm' },
        { label: 'Second Term', value: 'secondTerm' },
        { label: 'Third Term', value: 'thirdTerm' }
    ];

    // --- Local State ---
    // const [feeHeads, setFeeHeads] = useState<string[]>([]);

    // Example of how your state array looks now
    const [feeHeads, setFeeHeads] = useState<FeeHeadItem[]>([]);
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
        // const isDuplicate = feeHeads.some(head => head.toLowerCase() === trimmed.toLowerCase());
        const isDuplicate = feeHeads.some(item => item.feeHead.toLowerCase() === trimmed.toLowerCase());
        if (isDuplicate) {
            toast.error(`"${trimmed}" is already in the template.`);
            return;
        }

        // setFeeHeads(prev => [...prev, trimmed]);
        setFeeHeads(prev => [...prev, { feeHead: trimmed, isTerm: false, associatedTerm: null }]);
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

        // // 🌟 VALIDATION: Ensure all term-based fees have a term selected
        // const hasUnassignedTerms = feeHeads.some(item => item.isTerm && !item.associatedTerm);
        // if (hasUnassignedTerms) {
        //     toast.error("Please assign a specific term to all selected term-based fees.");
        //     return;
        // }

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
                                    const isAdded = feeHeads.some(h => h?.feeHead?.toLowerCase() === head.toLowerCase());
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

                            {/* {feeHeadsList.length === 0 ? (
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
                                                <span className="text-sm font-bold text-foreground">{toTitleCase(head)}</span>
                                            </div>

                                            <div className="flex items-center gap-4">
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
                            )} */}



                            {feeHeads.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-muted/50">
                                    <i className="fas fa-receipt text-4xl mb-3"></i>
                                    <p className="text-sm font-medium">Template is empty. Add categories from the left.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {feeHeads.map((head, index) => (
                                        <div
                                            key={`${head.feeHead}-${index}`}
                                            className="group relative flex flex-col gap-3 py-3 px-3 bg-surface hover:bg-background/80 border border-border/40 rounded-xl transition-colors"
                                        >
                                            {/* --- TOP ROW: Dot, Title, and Delete Button --- */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0"></span>
                                                    <span className="text-sm font-bold text-foreground">
                                                        {toTitleCase(head?.feeHead || "")}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => handleRemoveFeeHead(index)}
                                                    className="cursor-pointer w-7 h-7 flex items-center justify-center bg-danger/10 text-danger rounded hover:bg-danger hover:text-white transition-all shadow-sm shrink-0"
                                                    title="Remove from template"
                                                >
                                                    <i className="fas fa-times text-xs"></i>
                                                </button>
                                            </div>

                                            {/* --- BOTTOM ROW: Controls (Checkbox & Dropdown) --- */}
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pl-4 border-l-2 border-border/40 ml-0.5">

                                                {/* 1. Variable Color Checkbox */}
                                                <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold text-muted uppercase tracking-wider select-none shrink-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={head.isTerm}
                                                        onChange={(e) => {
                                                            const updated = [...feeHeads];
                                                            updated[index].isTerm = e.target.checked;
                                                            if (!e.target.checked) updated[index].associatedTerm = null;
                                                            setFeeHeads(updated);
                                                        }}
                                                        className="w-4 h-4 rounded text-primary bg-background border-border accent-primary focus:ring-primary/20 transition-all cursor-pointer"
                                                    />
                                                    Term Based Fee
                                                </label>

                                                {/* 2. Search Select (Only shows if checked) */}
                                                {head.isTerm && (
                                                    <div className="w-full sm:w-48 animate-in fade-in slide-in-from-left-2 duration-200">
                                                        <SearchSelect
                                                            label=""
                                                            options={TERM_OPTIONS}
                                                            value={head.associatedTerm || ""}
                                                            onChange={(opt: any) => {
                                                                const updated = [...feeHeads];
                                                                updated[index].associatedTerm = opt?.value || null;
                                                                setFeeHeads(updated);
                                                            }}
                                                            placeholder="Select Term..."
                                                        />
                                                    </div>
                                                )}
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
