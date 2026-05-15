import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetClasses } from '../../api_services/schoolConfig_api/classApi';
import { useGetFeeStructureByClass } from '../../api_services/feeStructure_api/feeStructureApi';
import { Button } from '../../shared/ui/Button';

export default function FeeStructureMain() {
    const navigate = useNavigate();
    const location = useLocation();
    const { schoolId } = useAuthData();

    // --- State & Queries ---
    const [selectedClassId, setSelectedClassId] = useState<string>('');

    const { data: classesData, isLoading: isClassesLoading } = useGetClasses(schoolId!);
    
    // Only fetch fee structures if a class is actually selected
    const { 
        data: feeStructures, 
        isLoading: isFeesLoading 
    } = useGetFeeStructureByClass(schoolId!, selectedClassId || undefined);

    // Auto-select the first class when classes load if none is selected
    React.useEffect(() => {
        if (classesData && classesData.length > 0 && !selectedClassId) {
            setSelectedClassId(classesData[0]._id);
        }
    }, [classesData, selectedClassId]);

    // Split the data into New and Old for easy display
    const newFeeData = useMemo(() => feeStructures?.find((f: any) => f.type === 'new'), [feeStructures]);
    const oldFeeData = useMemo(() => feeStructures?.find((f: any) => f.type === 'old'), [feeStructures]);

    const isChild = location.pathname.includes("single");
    if (isChild) {
        return <Outlet />;
    }

    return (
        <div className="w-full h-full flex flex-col p-2 space-y-4 overflow-hidden bg-background">
            
            {/* --- Header --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 px-2">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-coins text-primary"></i>
                        Fee Master Configuration
                    </h1>
                    <p className="text-sm text-muted mt-1">Manage academic fee structures per class for New and Old students.</p>
                </div>
            </div>

            {/* --- 80/20 Main Layout --- */}
            <div className="flex flex-col lg:flex-row gap-5 h-[calc(100%-80px)]">
                
                {/* LEFT PANEL (20%): Class List */}
                <div className="w-full lg:w-1/4 xl:w-1/5 bg-surface border border-border rounded-xl flex flex-col overflow-hidden shadow-sm shrink-0">
                    <div className="p-4 border-b border-border bg-sub-header">
                        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Select Class</h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {isClassesLoading ? (
                            <div className="flex justify-center py-10"><i className="fas fa-spinner fa-spin text-primary"></i></div>
                        ) : (
                            classesData?.map((cls: any) => (
                                <button
                                    key={cls._id}
                                    onClick={() => setSelectedClassId(cls._id)}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                                        selectedClassId === cls._id 
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
                <div className="w-full lg:w-3/4 xl:w-4/5 bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
                    {!selectedClassId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted">
                            <i className="fas fa-chalkboard text-4xl mb-3 opacity-20"></i>
                            <p>Select a class to view fee structures.</p>
                        </div>
                    ) : isFeesLoading ? (
                        <div className="flex-1 flex items-center justify-center"><i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i></div>
                    ) : (
                        <div className="flex flex-col h-full">
                            
                            <div className="p-6 border-b border-border flex justify-between items-center bg-sub-header/50">
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">
                                        Class {classesData?.find((c: any) => c._id === selectedClassId)?.name}
                                    </h2>
                                    <p className="text-xs text-muted mt-1">Current mapped fee structures for this academic level.</p>
                                </div>
                                <Button 
                                    variant="primary" 
                                    leftIcon="fas fa-edit" 
                                    onClick={() => navigate(`single/${selectedClassId}`)}
                                    className="cursor-pointer"
                                >
                                    Manage Structure
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto  p-6 grid grid-cols-1 xl:grid-cols-2 gap-6 custom-scrollbar">
                                {/* NEW STUDENTS CARD (Using Primary Theme) */}
                                <FeeCard 
                                    type="New" 
                                    data={newFeeData} 
                                    icon="fas fa-user-plus" 
                                    colorClass="text-primary" 
                                    bgClass="bg-primary-soft" 
                                />
                                
                                {/* OLD STUDENTS CARD (Using Success Theme) */}
                                <FeeCard 
                                    type="Old" 
                                    data={oldFeeData} 
                                    icon="fas fa-user-graduate" 
                                    colorClass="text-primary" 
                                    bgClass="bg-primary-soft" 
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Helper Component for the 80% Right Side ---
function FeeCard({ type, data, icon, colorClass, bgClass }: { type: string, data: any, icon: string, colorClass: string, bgClass: string }) {
    const hasData = !!data && data.totalAmount > 0;

    return (
        <div className="border border-border rounded-xl overflow-hidden flex flex-col shadow-sm bg-surface">
            <div className={`p-4 border-b border-border flex items-center gap-3 ${bgClass}`}>
                <div className={`w-8 h-8 rounded-full bg-surface flex items-center justify-center shadow-sm ${colorClass}`}>
                    <i className={icon}></i>
                </div>
                <div>
                    <h3 className={`font-bold uppercase tracking-wider ${colorClass}`}>{type} Students</h3>
                    <p className="text-[10px] text-muted font-semibold mt-0.5">Fee Breakdown</p>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-3">
                {!hasData ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted/70 py-6">
                        <i className="fas fa-exclamation-circle text-2xl mb-2 opacity-50"></i>
                        <p className="text-sm font-medium">Not Configured Yet</p>
                    </div>
                ) : (
                    <>
                        <FeeRow label="Admission Fee" amount={data.feeHead?.admissionFee} />
                        <FeeRow label="First Term Amount" amount={data.feeHead?.firstTermAmt} />
                        <FeeRow label="Second Term Amount" amount={data.feeHead?.secondTermAmt} />
                        <FeeRow label="Bus First Term" amount={data.feeHead?.busFirstTermAmt} />
                        <FeeRow label="Bus Second Term" amount={data.feeHead?.busSecondTermAmt} />
                        
                        <div className="mt-auto pt-4 border-t border-dashed border-border flex justify-between items-center">
                            <span className="font-bold text-muted uppercase text-xs tracking-widest">Total Master Fee</span>
                            <span className="text-xl font-black text-foreground">₹{data.totalAmount?.toLocaleString('en-IN') || 0}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function FeeRow({ label, amount }: { label: string, amount: number }) {
    return (
        <div className="flex justify-between items-center py-1.5">
            <span className="text-sm text-muted font-medium">{label}</span>
            <span className="text-sm font-bold text-foreground">₹{(amount || 0).toLocaleString('en-IN')}</span>
        </div>
    );
}