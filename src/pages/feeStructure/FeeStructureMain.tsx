import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetClasses } from '../../api_services/schoolConfig_api/classApi';
import { useGetFeeStructureByClass } from '../../api_services/feeStructure_api/feeStructureApi';
import { useGetFeeConfig } from '../../api_services/feeStructure_api/feeStructureConfigApi';
// import { Button } from '../../shared/ui/Button';

export default function FeeStructureMain() {
    const navigate = useNavigate();
    const location = useLocation();
    const { schoolId } = useAuthData();

    // --- State & Queries ---
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { data: classesData, isLoading: isClassesLoading } = useGetClasses(schoolId!);

    // Only fetch fee structures if a class is actually selected
    // const {
    //     data: feeStructures,
    //     isLoading: isFeesLoading
    // } = useGetFeeStructureByClass(schoolId!, selectedClassId || undefined);


    // 🌟 2. Call the Global Config Hook to get the master list of feeHeads
    const { data: configData } = useGetFeeConfig(schoolId!);
    const globalFeeHeads = configData?.feeHeads || [];

    // Only fetch fee structures if a class is actually selected
    const {
        data: feeStructures,
        isLoading: isFeesLoading
    } = useGetFeeStructureByClass(schoolId!, selectedClassId || undefined);

    // 🌟 3. Prevent .find() crashes if the backend returns an empty object instead of an array
    const newFeeData = useMemo(() => Array.isArray(feeStructures) ? feeStructures.find((f: any) => f.type === 'new') : null, [feeStructures]);
    const oldFeeData = useMemo(() => Array.isArray(feeStructures) ? feeStructures.find((f: any) => f.type === 'old') : null, [feeStructures]);


    // Auto-select the first class when classes load if none is selected
    React.useEffect(() => {
        if (classesData && classesData.length > 0 && !selectedClassId) {
            setSelectedClassId(classesData[0]._id);
        }
    }, [classesData, selectedClassId]);

    // Split the data into New and Old for easy display
    // const newFeeData = useMemo(() => feeStructures?.find((f: any) => f.type === 'new'), [feeStructures]);
    // const oldFeeData = useMemo(() => feeStructures?.find((f: any) => f.type === 'old'), [feeStructures]);

    const isChild = location.pathname.includes("single");
    if (isChild) {
        return <Outlet />;
    }

    return (
        <div className="w-full h-full flex flex-col p-2 space-y-4 overflow-hidden bg-background">

            {/* --- Header --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0 px-2">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-coins text-primary"></i>
                        Fee Structure Configuration
                    </h1>
                    <p className="text-xs lg:text-sm text-muted mt-1">Manage academic fee structures per class for New and Old students.</p>
                </div>

                {/* Mobile Class Selector Toggle Button */}
                <div className="w-full sm:w-auto lg:hidden">
                    <button
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-bold text-foreground bg-surface hover:bg-mainBg transition-colors shadow-sm"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <i className="fas fa-layer-group"></i>
                        Select Class
                    </button>
                </div>
            </div>

            {/* --- 80/20 Main Layout --- */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 h-[calc(100%-80px)] relative">

                {/* MOBILE OVERLAY */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* LEFT PANEL (20%): Class List */}
                <div className={`
                    fixed inset-y-0 left-0 z-50 w-[280px] bg-surface border-r border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
                    lg:static lg:w-1/4 xl:w-1/5 lg:shrink-0 lg:rounded-xl lg:shadow-sm lg:translate-x-0 lg:border
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="p-3 sm:p-4 border-b border-border bg-sub-header flex justify-between items-center lg:block shrink-0">
                        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Select Class</h3>
                        <button
                            className="lg:hidden text-muted hover:text-danger p-1"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <i className="fas fa-xmark text-xl"></i>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {isClassesLoading ? (
                            <div className="flex justify-center py-10"><i className="fas fa-spinner fa-spin text-primary"></i></div>
                        ) : (
                            classesData?.map((cls: any) => (
                                <button
                                    key={cls._id}
                                    onClick={() => {
                                        setSelectedClassId(cls._id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${selectedClassId === cls._id
                                        ? 'bg-primary-soft text-primary border border-primary/30 shadow-sm'
                                        : 'text-muted hover:text-foreground hover:bg-sub-header border border-transparent'
                                        }`}
                                >
                                    Class {cls.name}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL (80%): Fee Details */}
                <div className="flex-1 w-full lg:w-3/4 xl:w-4/5 bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
                    {!selectedClassId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted p-4 text-center">
                            <i className="fas fa-chalkboard text-4xl mb-3 opacity-20"></i>
                            <p className="text-sm">Select a class from the menu to view fee structures.</p>
                        </div>
                    ) : isFeesLoading ? (
                        <div className="flex-1 flex items-center justify-center"><i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i></div>
                    ) : (
                        <div className="flex flex-col h-full overflow-hidden">

                            {/* COMPACT RIGHT HEADER */}
                            <div className="p-3 sm:p-5 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-sub-header/50 shrink-0">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-foreground">
                                        Class {classesData?.find((c: any) => c._id === selectedClassId)?.name || 'Data'}
                                    </h2>
                                    <p className="text-[11px] sm:text-xs text-muted mt-0.5">Current mapped fee structures for this academic level.</p>
                                </div>
                                <button
                                    onClick={() => navigate(`single/${selectedClassId}`)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-inverse rounded-lg text-xs sm:text-sm font-bold shadow-sm w-full sm:w-auto hover:bg-primary-hover transition-colors shrink-0"
                                >
                                    <i className="fas fa-edit"></i>
                                    Manage Structure
                                </button>
                            </div>

                            {/* --- COMPACT CARD GRID --- */}
                            {/* FIX: Removed grid from the outer wrapper to allow natural scrolling */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                                {/* FIX: Changed to lg:grid-cols-2 for better tablet layout. Removed fixed heights. */}
                                {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 h-auto">
                                    <FeeCard
                                        type="New"
                                        data={newFeeData}
                                        icon="fas fa-user-plus"
                                        colorClass="text-primary"
                                        bgClass="bg-primary-soft"
                                    />
                                    <FeeCard
                                        type="Old"
                                        data={oldFeeData}
                                        icon="fas fa-user-graduate"
                                        colorClass="text-primary"
                                        bgClass="bg-primary-soft"
                                    />
                                </div> */}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 h-auto">
                                    <FeeCard
                                        type="New"
                                        data={newFeeData}
                                        globalFeeHeads={globalFeeHeads} // 🌟 Pass the global list here
                                        icon="fas fa-user-plus"
                                        colorClass="text-primary"
                                        bgClass="bg-primary-soft"
                                    />
                                    <FeeCard
                                        type="Old"
                                        data={oldFeeData}
                                        globalFeeHeads={globalFeeHeads} // 🌟 Pass the global list here
                                        icon="fas fa-user-graduate"
                                        colorClass="text-primary"
                                        bgClass="bg-primary-soft"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )


}

// // --- Helper Component for the 80% Right Side ---
// function FeeCard({ type, data, icon, colorClass, bgClass }: { type: string, data: any, icon: string, colorClass: string, bgClass: string }) {
//     const hasData = !!data && data.totalAmount > 0;

//     return (
//         <div className="border border-border rounded-xl overflow-hidden flex flex-col shadow-sm bg-surface">
//             <div className={`p-4 border-b border-border flex items-center gap-3 ${bgClass}`}>
//                 <div className={`w-8 h-8 rounded-full bg-surface flex items-center justify-center shadow-sm ${colorClass}`}>
//                     <i className={icon}></i>
//                 </div>
//                 <div>
//                     <h3 className={`font-bold uppercase tracking-wider ${colorClass}`}>{type} Students</h3>
//                     <p className="text-[10px] text-muted font-semibold mt-0.5">Fee Breakdown</p>
//                 </div>
//             </div>

//             <div className="p-5 flex-1 flex flex-col gap-3">
//                 {!hasData ? (
//                     <div className="flex-1 flex flex-col items-center justify-center text-muted/70 py-6">
//                         <i className="fas fa-exclamation-circle text-2xl mb-2 opacity-50"></i>
//                         <p className="text-sm font-medium">Not Configured Yet</p>
//                     </div>
//                 ) : (
//                     <>
//                         <FeeRow label="Admission Fee" amount={data.feeHead?.admissionFee} />
//                         <FeeRow label="First Term Amount" amount={data.feeHead?.firstTermAmt} />
//                         <FeeRow label="Second Term Amount" amount={data.feeHead?.secondTermAmt} />
//                         <FeeRow label="Bus First Term" amount={data.feeHead?.busFirstTermAmt} />
//                         <FeeRow label="Bus Second Term" amount={data.feeHead?.busSecondTermAmt} />

//                         <div className="mt-auto pt-4 border-t border-dashed border-border flex justify-between items-center">
//                             <span className="font-bold text-muted uppercase text-xs tracking-widest">Total Master Fee</span>
//                             <span className="text-xl font-black text-foreground">₹{data.totalAmount?.toLocaleString('en-IN') || 0}</span>
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }

// function FeeRow({ label, amount }: { label: string, amount: number }) {
//     return (
//         <div className="flex justify-between items-center py-1.5">
//             <span className="text-sm text-muted font-medium">{label}</span>
//             <span className="text-sm font-bold text-foreground">₹{(amount || 0).toLocaleString('en-IN')}</span>
//         </div>
//     );
// }



// --- Helper Component: Compact & Scrollable FeeCard ---
// function FeeCard({ type, data, icon, colorClass, bgClass }: { type: string, data: any, icon: string, colorClass: string, bgClass: string }) {
function FeeCard({ type, data, icon, colorClass, bgClass, globalFeeHeads }: { type: string, data: any, icon: string, colorClass: string, bgClass: string, globalFeeHeads: string[] }) {
    // const hasData = !!data && data.totalAmount > 0;
    // const hasData = true; // Hardcoded to true for visualization, change back to logic above

    const hasConfiguredHeads = globalFeeHeads.length > 0;

    return (
        <div className="border border-border rounded-xl flex flex-col shadow-sm bg-surface max-h-[450px] xl:max-h-none h-fit xl:h-full overflow-hidden">

            <div className={`p-3 sm:p-4 border-b border-border flex items-center gap-3 shrink-0 ${bgClass}`}>
                <div className={`w-8 h-8 rounded-full bg-surface flex items-center justify-center shadow-sm ${colorClass}`}>
                    <i className={icon}></i>
                </div>
                <div>
                    <h3 className={`font-bold text-sm sm:text-base uppercase tracking-wider ${colorClass}`}>{type} Students</h3>
                    <p className="text-[10px] text-muted font-semibold mt-0.5">Fee Breakdown</p>
                </div>
            </div>

            {/* Inner scroll area just in case fee list is massive */}
            <div className="p-3 sm:p-5 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                {!hasConfiguredHeads ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted/70 py-6">
                        <i className="fas fa-exclamation-circle text-2xl mb-2 opacity-50"></i>
                        <p className="text-sm font-medium">Not Configured Yet</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        {/* <div className="space-y-0.5 mb-4">
                            <FeeRow label="Admission Fee" amount={data?.feeHead?.admissionFee} />
                            <FeeRow label="First Term Amount" amount={data?.feeHead?.firstTermAmt} />
                            <FeeRow label="Second Term Amount" amount={data?.feeHead?.secondTermAmt} />
                            <FeeRow label="Bus First Term" amount={data?.feeHead?.busFirstTermAmt} />
                            <FeeRow label="Bus Second Term" amount={data?.feeHead?.busSecondTermAmt} />
                        </div> */}

                        <div className="space-y-0.5 mb-4">
                            {/* 🌟 Loop through GLOBAL heads, not the class data directly */}
                            {globalFeeHeads.map((headName) => {
                                // Match the amount from the class data, default to 0 if it doesn't exist
                                const amount = data?.feeHeads?.[headName] || 0;
                                
                                return (
                                    <FeeRow 
                                        key={headName} 
                                        label={headName} 
                                        amount={amount} 
                                    />
                                );
                            })}
                        </div>

                        <div className="mt-auto pt-3 border-t border-dashed border-border flex justify-between items-center shrink-0">
                            <span className="font-bold text-muted uppercase text-[10px] sm:text-xs tracking-widest">Total Master Fee</span>
                            <span className="text-lg sm:text-xl font-black text-foreground">₹{(data?.totalAmount || 0)?.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Helper Component: Improved FeeRow with Dividers ---
function FeeRow({ label, amount }: { label: string, amount: number }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
            <span className="text-xs sm:text-sm text-muted font-medium capitalize">{label}</span>
            <span className="text-xs sm:text-sm font-bold text-foreground">₹{(amount || 0).toLocaleString('en-IN')}</span>
        </div>
    );
}