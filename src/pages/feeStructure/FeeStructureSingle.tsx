import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetClasses } from '../../api_services/schoolConfig_api/classApi';
import { useGetFeeStructureByClass, useSetFeeStructure } from '../../api_services/feeStructure_api/feeStructureApi';
import { toast } from '../../shared/ui/ToastContext';
import { Input } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { useRoleCheck } from '../../hooks/useRoleCheck';
import { useGetFeeConfig, type FeeHeadItem } from '../../api_services/feeStructure_api/feeStructureConfigApi';

export default function FeeStructureSingle() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const { schoolId } = useAuthData();
    const { isAdmin, isCorrespondent, isAccountant } = useRoleCheck()

    const canModify = isAdmin || isCorrespondent || isAccountant;

    // --- Queries ---
    // const { data: classesData } = useGetClasses(schoolId!);
    // const { data: feeStructures, isLoading } = useGetFeeStructureByClass(schoolId!, classId);
    // const setFeeMutation = useSetFeeStructure();

    // // --- Class Name Helper ---
    // const className = useMemo(() => {
    //     return classesData?.find((c: any) => c._id === classId)?.name || 'Unknown Class';
    // }, [classesData, classId]);

    // // --- UI State ---
    // // Toggle between editing New Student vs Old Student fees
    // const [activeTab, setActiveTab] = useState<'new' | 'old'>('new');

    // const [feeData, setFeeData] = useState({
    //     admissionFee: '',
    //     firstTermAmt: '',
    //     secondTermAmt: '',
    //     busFirstTermAmt: '',
    //     busSecondTermAmt: ''
    // });

    // --- Queries ---
    const { data: classesData } = useGetClasses(schoolId!);
    const { data: feeStructures, isLoading: isFeesLoading } = useGetFeeStructureByClass(schoolId!, classId);

    // 🌟 Fetch global config to know which inputs to generate
    const { data: configData, isLoading: _isConfigLoading } = useGetFeeConfig(schoolId!);
    const globalFeeHeads: FeeHeadItem[] = useMemo(() => configData?.feeHeads || [], [configData]);

    const setFeeMutation = useSetFeeStructure();

    // --- Class Name Helper ---
    const className = useMemo(() => {
        return classesData?.find((c: any) => c._id === classId)?.name || 'Unknown Class';
    }, [classesData, classId]);

    // --- UI State ---
    const [activeTab, setActiveTab] = useState<'new' | 'old'>('new');

    // 🌟 Dynamic state to hold all fee amounts based on config
    const [feeData, setFeeData] = useState<Record<string, string>>({});

    // // --- Sync Data when switching tabs or loading ---
    // useEffect(() => {
    //     if (feeStructures) {
    //         const targetData = feeStructures.find((f: any) => f.type === activeTab);
    //         if (targetData && targetData.feeHead) {
    //             setFeeData({
    //                 admissionFee: targetData.feeHead.admissionFee?.toString() || '',
    //                 firstTermAmt: targetData.feeHead.firstTermAmt?.toString() || '',
    //                 secondTermAmt: targetData.feeHead.secondTermAmt?.toString() || '',
    //                 busFirstTermAmt: targetData.feeHead.busFirstTermAmt?.toString() || '',
    //                 busSecondTermAmt: targetData.feeHead.busSecondTermAmt?.toString() || ''
    //             });
    //         } else {
    //             // Reset if no data exists for this type yet
    //             setFeeData({ admissionFee: '', firstTermAmt: '', secondTermAmt: '', busFirstTermAmt: '', busSecondTermAmt: '' });
    //         }
    //     }
    // }, [feeStructures, activeTab]);

    // // --- Handlers ---
    // const handleInputChange = (field: string, value: string) => {
    //     // Only allow numbers
    //     if (value === '' || /^\d+$/.test(value)) {
    //         setFeeData(prev => ({ ...prev, [field]: value }));
    //     }
    // };

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     try {
    //         await setFeeMutation.mutateAsync({
    //             schoolId: schoolId!,
    //             classId: classId!,
    //             type: activeTab,
    //             feeHead: {
    //                 admissionFee: Number(feeData.admissionFee) || 0,
    //                 firstTermAmt: Number(feeData.firstTermAmt) || 0,
    //                 secondTermAmt: Number(feeData.secondTermAmt) || 0,
    //                 busFirstTermAmt: Number(feeData.busFirstTermAmt) || 0,
    //                 busSecondTermAmt: Number(feeData.busSecondTermAmt) || 0
    //             }
    //         });
    //         toast.success(`Fee structure for ${activeTab.toUpperCase()} students saved!`);
    //     } catch (error: any) {
    //         toast.error(error.message || "Failed to save fee structure");
    //     }
    // };

    // // Auto-calculate preview total
    // const previewTotal =
    //     (Number(feeData.admissionFee) || 0) +
    //     (Number(feeData.firstTermAmt) || 0) +
    //     (Number(feeData.secondTermAmt) || 0) +
    //     (Number(feeData.busFirstTermAmt) || 0) +
    //     (Number(feeData.busSecondTermAmt) || 0);

    // --- Sync Data when switching tabs or loading ---
    useEffect(() => {
        if (globalFeeHeads.length > 0) {
            const targetData = feeStructures?.find((f: any) => f.type === activeTab);
            const newFeeData: Record<string, string> = {};

            // Safely look for feeHeads property
            const savedHeads = targetData?.feeHeads || {};

            globalFeeHeads.forEach(headObj => {
                const headName = headObj.feeHead; // Extract string
                // newFeeData[head] = savedHeads[head] !== undefined ? savedHeads[head].toString() : '';
                newFeeData[headName] = savedHeads[headName] !== undefined ? savedHeads[headName].toString() : '';
            });

            setFeeData(newFeeData);
        }
    }, [feeStructures, activeTab, globalFeeHeads]);

    // --- Handlers ---
    const handleInputChange = (field: string, value: string) => {
        if (value === '' || /^\d+$/.test(value)) {
            setFeeData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (globalFeeHeads.length === 0) return toast.error("Global fee configuration is empty.");

        // Build the dynamic payload object
        const submittedFeeHeads: Record<string, number> = {};
        // globalFeeHeads.forEach(head => {
        //     submittedFeeHeads[head] = Number(feeData[head]) || 0;
        // });

        globalFeeHeads.forEach(headObj => {
            const headName = headObj?.feeHead;
            submittedFeeHeads[headName] = Number(feeData[headName]) || 0;
        });

        try {
            await setFeeMutation.mutateAsync({
                schoolId: schoolId!,
                classId: classId!,
                type: activeTab,
                feeHead: submittedFeeHeads // 🌟 Sending dynamic object to backend
            } as any);

            toast.success(`Fee structure for ${activeTab.toUpperCase()} students saved!`);
        } catch (error: any) {
            toast.error(error.message || "Failed to save fee structure");
        }
    };

    // 🌟 Auto-calculate preview total dynamically
    const previewTotal = useMemo(() => {
        return Object.values(feeData).reduce((sum, val) => sum + (Number(val) || 0), 0);
    }, [feeData]);

    // Helper to format labels cleanly on the UI
    const toTitleCase = (str: string) => str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');


    return (
        <div className="w-full h-full flex flex-col bg-background overflow-hidden">

            {/* --- Header --- */}
            {/* Adjusted padding and text sizes for smaller screens */}
            <header className="shrink-0 px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between bg-surface z-10 shadow-sm">
                <div className="flex items-center gap-3 sm:gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-border text-muted hover:bg-sub-header transition-colors cursor-pointer shrink-0"
                    >
                        <i className="fas fa-arrow-left text-sm"></i>
                    </button>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-foreground line-clamp-1">Manage Fees: Class {className}</h1>
                        <p className="text-[10px] sm:text-xs font-semibold text-muted mt-0.5 tracking-wide uppercase">
                            Configure master limits and templates
                        </p>
                    </div>
                </div>
            </header>

            {/* --- Main Content --- */}
            {/* Reduced base padding for mobile, expands on md/lg */}
            <main className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto">

                    {/* Tab Navigation (Uniform Design) */}
                    <div className="flex bg-surface p-1 rounded-xl border border-border shadow-sm mb-4 sm:mb-6 w-full max-w-md mx-auto md:mx-0">
                        <button
                            onClick={() => setActiveTab('new')}
                            className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'new' ? 'bg-primary-soft text-primary shadow-sm' : 'text-muted hover:bg-sub-header'
                                }`}
                        >
                            <i className="fas fa-user-plus mr-1 sm:mr-2"></i> NEW Students
                        </button>
                        <button
                            onClick={() => setActiveTab('old')}
                            className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'old' ? 'bg-primary-soft text-primary shadow-sm' : 'text-muted hover:bg-sub-header'
                                }`}
                        >
                            <i className="fas fa-user-graduate mr-1 sm:mr-2"></i> OLD Students
                        </button>
                    </div>

                    {isFeesLoading ? (
                        <div className="flex justify-center py-20"><i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i></div>
                    ) : (
                        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">

                            {/* FORM SECTION */}
                            <form onSubmit={handleSubmit} className="flex-1 p-4 sm:p-6 md:p-8 border-b md:border-b-0 md:border-r border-border">
                                <h3 className="text-base sm:text-lg font-bold text-foreground mb-4 sm:mb-6">
                                    Define {activeTab.toUpperCase()} Student Heads
                                </h3>

                                {/* <div className="space-y-4 sm:space-y-5">
                                    <Input
                                        label="Admission Fee (₹)"
                                        value={feeData.admissionFee}
                                        onChange={(e) => handleInputChange('admissionFee', e.target.value)}
                                        placeholder="0"
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            label="First Term Fee (₹)"
                                            value={feeData.firstTermAmt}
                                            onChange={(e) => handleInputChange('firstTermAmt', e.target.value)}
                                            placeholder="0"
                                        />
                                        <Input
                                            label="Second Term Fee (₹)"
                                            value={feeData.secondTermAmt}
                                            onChange={(e) => handleInputChange('secondTermAmt', e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <Label className="mb-3 block text-muted">Bus Transportation Fees</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Input
                                                label="Bus First Term (₹)"
                                                value={feeData.busFirstTermAmt}
                                                onChange={(e) => handleInputChange('busFirstTermAmt', e.target.value)}
                                                placeholder="0"
                                            />
                                            <Input
                                                label="Bus Second Term (₹)"
                                                value={feeData.busSecondTermAmt}
                                                onChange={(e) => handleInputChange('busSecondTermAmt', e.target.value)}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div> */}

                                <div className="space-y-4 sm:space-y-5">
                                    {/* 🌟 Dynamic Inputs Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {globalFeeHeads.map((headObj, index) => {
                                            const headName = headObj.feeHead; // Extract string

                                            return (<Input
                                                // key={head}
                                                key={`${headName}-${index}`}
                                                // label={`${toTitleCase(head)} (₹)`}
                                                // value={feeData[head] || ''}
                                                // onChange={(e) => handleInputChange(head, e.target.value)}

                                                label={`${toTitleCase(headName)} (₹)`}
                                                value={feeData[headName] || ''}
                                                onChange={(e) => handleInputChange(headName, e.target.value)}
                                                placeholder="0"
                                            />
                                            )
                                        })}
                                    </div>
                                </div>

                                {canModify && <div className="mt-6 sm:mt-8">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full py-3 sm:py-3.5 cursor-pointer text-sm sm:text-base"
                                        isLoading={setFeeMutation.isPending}
                                    >
                                        Save {activeTab.toUpperCase()} Configuration
                                    </Button>
                                </div>}
                            </form>

                            {/* PREVIEW SUMMARY SECTION */}
                            {/* <div className="w-full md:w-[35%] lg:w-1/3 bg-sub-header p-5 sm:p-6 md:p-8 flex flex-col">
                                <h3 className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-widest mb-4 sm:mb-6">Live Preview</h3>

                                <div className="flex-1 space-y-3 sm:space-y-4 text-xs sm:text-sm">
                                    <div className="flex justify-between text-muted">
                                        <span>Admission</span>
                                        <span className="font-bold text-foreground">₹{Number(feeData.admissionFee || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-muted">
                                        <span>First Term</span>
                                        <span className="font-bold text-foreground">₹{Number(feeData.firstTermAmt || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-muted">
                                        <span>Second Term</span>
                                        <span className="font-bold text-foreground">₹{Number(feeData.secondTermAmt || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-muted pt-3 border-t border-border">
                                        <span>Bus T1</span>
                                        <span className="font-bold text-foreground">₹{Number(feeData.busFirstTermAmt || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-muted">
                                        <span>Bus T2</span>
                                        <span className="font-bold text-foreground">₹{Number(feeData.busSecondTermAmt || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 sm:pt-5 border-t-2 border-dashed border-border">
                                    <p className="text-[9px] sm:text-[10px] text-muted font-bold uppercase tracking-widest mb-1">Calculated Total</p>
                                    <p className="text-2xl sm:text-3xl font-black text-primary">
                                        ₹{previewTotal.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div> */}

                            <div className="flex-1 space-y-3 sm:space-y-4 text-xs sm:text-sm p-5 sm:p-6 md:p-8 ">
                                {/* 🌟 Dynamic Preview Rows */}
                                {/* {globalFeeHeads.map((head) => {
                                    return (
                                        <div key={head} className="flex justify-between text-muted">
                                            <span className="font-medium capitalize">{head}</span>
                                            <span className="font-bold text-foreground">
                                                ₹{Number(feeData[head] || 0).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    );
                                })} */}

                                {globalFeeHeads.map((headObj, index) => {
                                    const headName = headObj.feeHead; // Extract string

                                    return (
                                        <div key={`${headName}-${index}`} className="flex justify-between text-muted">
                                            <span className="font-medium capitalize">{headName}</span>
                                            <span className="font-bold text-foreground">
                                                ₹{Number(feeData[headName] || 0).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    );
                                })}

                                <div className="mt-6 pt-4 sm:pt-5 border-t-2 border-dashed border-border">
                                    <p className="text-[9px] sm:text-[10px] text-muted font-bold uppercase tracking-widest mb-1">Calculated Total</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-primary">
                                        ₹{previewTotal.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}