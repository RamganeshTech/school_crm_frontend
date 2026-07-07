import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

// UI Components
import { Input, Label } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { Toggle } from '../../shared/ui/Toggle';
import { toast } from '../../shared/ui/ToastContext';

// Hooks & APIs
import { useAuthData } from '../../hooks/useAuthData';
import { useGetStudentRecordByIdV1, useCollectFeev1 } from '../../api_services/student_api/studentRecordApi';
import { useGetFeeConfig } from '../../api_services/feeStructure_api/feeStructureConfigApi';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { getAcademicYears } from '../../utils/utils';
import { useGetSchoolById } from '../../api_services/schoolConfig_api/schoolapi';

export default function FeeCollectionSingle() {
    const navigate = useNavigate();
    const { schoolId } = useAuthData();
    const { studentId } = useParams();
    // const [searchParams] = useSearchParams();
    // const academicYear = searchParams.get('academicYear') || '';

    const academicYearOptions = getAcademicYears()

    const [searchParams, setSearchParams] = useSearchParams();
    const academicYear = searchParams.get('academicYear') || '';

    const { data: schoolData } = useGetSchoolById(schoolId!)


    const handleAcademicYearChange = (opt: any) => {
        setSearchParams(prev => {
            prev.set('academicYear', String(opt?.value));
            return prev;
        }, { replace: true }); // replace so you don't spam browser history
    };



    const getActiveTermLabel = () => {
        if (!schoolData?.currentAcademicYear || !schoolData?.academicTermDates?.length) {
            return "Term Status"; // Fallback if no data
        }

        // Find the term configuration for the current academic year
        const currentTimeline = schoolData?.academicTermDates.find(
            (timeline) => timeline?.academicYear === schoolData?.currentAcademicYear
        );

        if (!currentTimeline) return "Term Status";

        const today = new Date().getTime();

        // Safely parse dates to timestamps
        const firstTerm = currentTimeline?.firstTerm ? new Date(currentTimeline?.firstTerm).getTime() : null;
        const secondTerm = currentTimeline?.secondTerm ? new Date(currentTimeline?.secondTerm).getTime() : null;
        const thirdTerm = currentTimeline?.thirdTerm ? new Date(currentTimeline?.thirdTerm).getTime() : null;

        // Check in reverse chronological order
        if (thirdTerm && today >= thirdTerm) return "III Term Status";
        if (secondTerm && today >= secondTerm) return "II Term Status";
        if (firstTerm && today >= firstTerm) return "I Term Status";

        return "Term Status"; // Fallback if today is before the first term even starts
    };

    const termLabel = getActiveTermLabel();


    // --- API Hooks ---
    const { data: record, isLoading: isRecordLoading, isFetching: isRecordFetching, refetch } = useGetStudentRecordByIdV1(schoolId!, studentId, academicYear);
    const { data: feeConfig,  } = useGetFeeConfig(schoolId!);
    const collectFeeMutation = useCollectFeev1();

    // Safe extraction of nested IDs
    const actualStudentId = typeof record?.studentId === 'object' ? record?.studentId?._id : record?.studentId;
    const actualClassId = typeof record?.classId === 'object' ? record?.classId?._id : record?.classId;
    const actualSectionId = typeof record?.sectionId === 'object' ? record?.sectionId?._id : record?.sectionId;

    const fDues = record?.duesv1;
    // const totalDues = feeConfig?.feeHeads?.reduce((sum: number, head: string) => sum + Number(fDues?.[head] ?? 0), 0) ?? 0;
    const totalDues = feeConfig?.feeHeads?.reduce((sum: number, headObj: any) => sum + Number(fDues?.[headObj?.feeHead] ?? 0), 0) ?? 0;


    // Add these derived flags near your totalDues calculation
    const hasClassSection = !!actualClassId && !!actualSectionId;
    // const hasFeeStructure = Array.isArray(feeConfig?.feeHeads) && feeConfig.feeHeads.length > 0;
    // const isActuallyPaid = hasClassSection && hasFeeStructure && totalDues <= 0;
    // const canCollect = hasClassSection && hasFeeStructure && totalDues > 0;


    // --- Form State ---
    const [feeData, setFeeData] = useState({
        amount: '', paymentMode: 'cash', referenceNumber: '', bankName: '', chequeDate: '', remarks: '',
        manualDueAllocation: false, paidHeads: {} as Record<string, number>
    });

    const [denominations, setDenominations] = useState({
        notes500: 0, notes200: 0, notes100: 0, notes50: 0, notes20: 0, notes10: 0
    });
    const [feeFiles, setFeeFiles] = useState<FileList | null>(null);

    // --- Validations & Calculations ---
    const calculatedManualTotal = Object.values(feeData.paidHeads).reduce((a, b) => a + (Number(b) || 0), 0);
    const isManualValid = feeData.manualDueAllocation ? calculatedManualTotal === Number(feeData.amount) : true;
    const calculatedCashTotal = (denominations.notes500 * 500) + (denominations.notes200 * 200) + (denominations.notes100 * 100) + (denominations.notes50 * 50) + (denominations.notes20 * 20) + (denominations.notes10 * 10);
    const isCashValid = feeData.paymentMode === 'cash' ? calculatedCashTotal === Number(feeData.amount) : true;
    // const canSubmit = Number(feeData.amount) > 0 && isManualValid && isCashValid && totalDues > 0;

    const handleDenominationChange = (key: string, value: number) => {
        const updated = { ...denominations, [key]: value };
        setDenominations(updated);
        if (feeData.paymentMode === 'cash') {
            const total = (updated.notes500 * 500) + (updated.notes200 * 200) + (updated.notes100 * 100) +
                (updated.notes50 * 50) + (updated.notes20 * 20) + (updated.notes10 * 10);
            setFeeData(prev => ({ ...prev, amount: String(total) }));
        }
    };


    // --- Submit Handler ---
    const handleFeeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schoolId || !studentId || !record) return;

        const formData = new FormData();
        formData.append('schoolId', schoolId);
        formData.append('studentId', actualStudentId || '');
        formData.append('studentName', record?.studentName || record?.studentId?.studentName || '');
        formData.append('classId', actualClassId || '');
        formData.append('sectionId', actualSectionId || '');
        formData.append('amount', feeData.amount);
        formData.append('paymentMode', feeData.paymentMode);
        formData.append('remarks', feeData.remarks);
        formData.append('newOld', record?.newOld || 'new');
        formData.append('academicYear', academicYear);

        formData.append('manualDueAllocation', String(feeData.manualDueAllocation));
        if (feeData.manualDueAllocation) {
            formData.append('paidHeads', JSON.stringify(feeData.paidHeads));
        }

        if (feeData.paymentMode === 'cash') {
            const cashArray = [
                { label: "500", count: denominations.notes500 || 0 }, { label: "200", count: denominations.notes200 || 0 },
                { label: "100", count: denominations.notes100 || 0 }, { label: "50", count: denominations.notes50 || 0 },
                { label: "20", count: denominations.notes20 || 0 }, { label: "10", count: denominations.notes10 || 0 },
            ];
            formData.append('cashDenominations', JSON.stringify(cashArray));
        } else {
            formData.append('referenceNumber', feeData.referenceNumber);
            formData.append('bankName', feeData.bankName);
            if (feeData.paymentMode === 'cheque') formData.append('chequeDate', feeData.chequeDate);
        }

        if (feeFiles) {
            Array.from(feeFiles).forEach((file) => formData.append('files', file));
        }

        try {
            await collectFeeMutation.mutateAsync(formData);
            setFeeData({ amount: '', paymentMode: 'cash', referenceNumber: '', bankName: '', chequeDate: '', remarks: '', manualDueAllocation: false, paidHeads: {} });
            setFeeFiles(null);
            setDenominations({ notes500: 0, notes200: 0, notes100: 0, notes50: 0, notes20: 0, notes10: 0 });
            toast.success("Fee collected successfully!");
            refetch();
        } catch (err: any) {
            toast.error(err?.message || "Fee collection failed. Please try again.");
        }
    };

    const paymentModeOptions = [
        { label: 'Cash', value: 'cash' },
        { label: 'UPI / Online', value: 'upi' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'Cheque', value: 'cheque' }
    ];

    // if (isRecordLoading || isConfigLoading) {
    //     return (
    //         <div className="w-full h-full flex flex-col items-center justify-center text-muted bg-background">
    //             <i className="fas fa-circle-notch fa-spin text-3xl text-primary mb-3"></i>
    //             <p className="text-sm">Loading student data...</p>
    //         </div>
    //     );
    // }

    if (!isRecordFetching && !record) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted bg-background">
                <i className="fas fa-exclamation-triangle text-3xl text-danger mb-3"></i>
                <p className="text-sm">Student record not found.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    return (
        // OVERALL CONTAINER: Fixed height, background canvas color
        <div className="w-full h-full flex flex-col bg-background overflow-hidden animate-in fade-in">

            {/* --- 1. SLIM HEADER --- */}
            <header className="shrink-0 px-4 py-2 border-b border-border flex items-center justify-between  bg-surface z-10 shadow-sm">
                <div className='flex items-center justify-between gap-3'>

                    <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded border border-border text-muted hover:bg-background transition-colors cursor-pointer shrink-0">
                        <i className="fas fa-arrow-left text-sm"></i>
                    </button>
                    <h1 className="text-lg font-bold text-foreground">Process Payment</h1>
                </div>


                <div className=''>

                    <SearchSelect
                        label="Academic Year"
                        options={academicYearOptions}
                        value={academicYear}
                        onChange={handleAcademicYearChange}
                    />
                </div>
            </header>

            {/* --- MAIN WORKSPACE --- */}
            <div className="flex-1 flex flex-col p-3 lg:p-4 gap-4 overflow-hidden">

                {/* --- 2. TOP STATIC BANNER (Elevated Card) --- */}
                <div className="shrink-0 px-5 py-3 bg-surface border border-border rounded-xl shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0 border border-primary/20">
                            {record?.studentName?.charAt(0) || 'S'}
                        </div>
                        <div>
                            <h2 className="font-bold text-foreground text-base sm:text-lg leading-tight">{record?.studentName}</h2>
                            <p className="text-xs sm:text-sm text-muted font-medium mt-0.5">
                                <span className="text-foreground font-semibold px-2 py-0.5 bg-background border border-border rounded-md mr-2">{record?.className} - {record?.sectionName}</span>
                                Roll: <span className="text-foreground">{record?.rollNumber || 'N/A'}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex sm:flex-col sm:items-end gap-4 sm:gap-1 text-xs bg-background sm:bg-transparent p-2 sm:p-0 rounded-lg border sm:border-0 border-border">
                        <p className="text-muted"><i className="fas fa-user-tie w-3 text-center mr-1"></i> <span className="font-semibold text-foreground">{record?.studentId?.fatherName || record?.studentId?.motherName || 'N/A'}</span></p>
                        <p className="text-muted"><i className="fas fa-phone-alt w-3 text-center mr-1"></i> <span className="font-semibold text-foreground">{record?.studentId?.mobileNumber || record?.studentId?.fatherPhone || 'N/A'}</span></p>
                    </div>
                </div>

                {/* --- 3. SPLIT MAIN CONTENT --- */}
                <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">

                    {/* === LEFT SECTION: DUES BREAKDOWN (30%, Elevated Card) === */}
                    <div className="w-full lg:w-[30%] shrink-0 bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
                        <div className="px-4 py-3 bg-primary/5 border-b border-border flex items-center justify-between">
                            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                                <i className="fas fa-file-invoice-dollar"></i> Pending Dues
                                {(isRecordLoading || isRecordFetching) && <i className="fas fa-circle-notch fa-spin text-xs ml-2 text-muted"></i>}

                            </h3>
                            {/* {totalDues <= 0 && <span className="px-2 py-0.5 bg-success/10 text-success border border-success/20 text-[10px] font-bold rounded uppercase shadow-sm">Paid</span>} */}

                            {/* {!hasClassSection && (
                                <span className="px-2 py-0.5 bg-warning/10 text-warning border border-warning/20 text-[10px] font-bold rounded uppercase shadow-sm">
                                    No Class Assigned
                                </span>
                            )}
                            {hasClassSection && !hasFeeStructure && (
                                <span className="px-2 py-0.5 bg-warning/10 text-warning border border-warning/20 text-[10px] font-bold rounded uppercase shadow-sm">
                                    Fee Structure Not Set
                                </span>
                            )}
                            {isActuallyPaid && (
                                <span className="px-2 py-0.5 bg-success/10 text-success border border-success/20 text-[10px] font-bold rounded uppercase shadow-sm">
                                    Paid
                                </span>
                            )} */}

                            {!hasClassSection ? (
                                <span className="px-2 py-0.5 bg-warning/10 text-warning border border-warning/20 text-[10px] font-bold rounded uppercase shadow-sm">
                                    No Class Assigned
                                </span>
                            ) : (
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase shadow-sm border ${record?.feeStatus === 'paid'
                                    ? 'bg-success/10 text-success border-success/20'
                                    : 'bg-danger/10 text-danger border-danger/20'
                                    }`}>
                                    {/* {record?.feeStatus === 'paid' ? 'Paid' : 'Pending'} */}
                                    {termLabel}: {record?.feeStatus || 'Unknown'}
                                </span>
                            )}



                        </div>

                        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                            {totalDues <= 0 ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <p className="text-sm text-muted bg-background border border-border px-4 py-2 rounded-lg">No pending dues.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2.5">
                                    {feeConfig?.feeHeads?.map((headObj: any, index: number) => {

                                        const headName = headObj?.feeHead;
                                        const due = Number(fDues?.[headName] ?? 0);
                                        if (due <= 0) return null;
                                        return (
                                            <div key={`${headName}-${index}`} className="flex justify-between items-center bg-background border border-border px-3 py-2.5 rounded-lg shadow-sm">
                                                <span className="text-xs text-muted font-medium truncate pr-2 capitalize">{headName}</span>
                                                <span className="text-sm font-bold text-foreground">₹{due.toLocaleString()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="mt-auto pt-4">
                                <div className="p-3 bg-danger/5 border border-danger/20 rounded-xl flex justify-between items-center shadow-sm">
                                    <span className="font-bold text-danger-700 uppercase text-xs tracking-wider">Total Due</span>
                                    <span className="text-xl font-black text-danger">₹{totalDues.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === RIGHT SECTION: FORM (70%, Elevated Card) === */}
                    <div className="flex-1 lg:w-[70%] bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
                        <div className="px-4 py-3 bg-primary/5 border-b border-border">
                            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                                <i className="fas fa-cash-register"></i> Collection Terminal
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                            <form onSubmit={handleFeeSubmit} className="flex flex-col min-h-full">

                                <div className="p-4 sm:p-5 flex-1 space-y-5">
                                    <div className="flex flex-col xl:flex-row items-start xl:items-end gap-4 bg-background border border-border rounded-xl p-4 shadow-sm">

                                        {/* 1. Amount Input */}
                                        <div className="w-full xl:w-1/3">
                                            <Input
                                                id="amount" type="number" label="Amount Received (₹) "
                                                value={feeData.amount} onChange={(e) => setFeeData({ ...feeData, amount: e.target.value })}
                                                required min="1" max={totalDues} placeholder="e.g., 5000" disabled={totalDues <= 0}
                                            />
                                        </div>

                                        {/* 2. Payment Mode Selection */}
                                        <div className="w-full xl:w-1/3 flex flex-col justify-end">
                                            {/* Ensure SearchSelect is imported at the top of your file */}
                                            <SearchSelect
                                                label="Payment Mode"
                                                placeholder="Select Mode..."
                                                options={paymentModeOptions}
                                                value={feeData.paymentMode}
                                                onChange={(opt: any) => setFeeData({ ...feeData, paymentMode: String(opt?.value) })}
                                            />
                                        </div>

                                        <div className="w-full xl:w-1/3 flex flex-col justify-end gap-1.5">
                                            <Label>Allocation Method</Label>
                                            <div className="h-[42px] flex items-center justify-between border border-border rounded-lg bg-surface px-3 shadow-sm overflow-hidden">
                                                <div className="flex items-center shrink-0">
                                                    <Toggle
                                                        checked={feeData.manualDueAllocation}
                                                        onChange={(checked) => setFeeData({ ...feeData, manualDueAllocation: checked })}
                                                        label="Manual" disabled={totalDues <= 0}
                                                    />
                                                </div>
                                                <p className="text-[9px] sm:text-[10px] text-muted text-right leading-tight ml-2 border-l border-border pl-2 py-1">
                                                    Turn off for Auto-FIFO<br className="hidden xl:block" /> (pays oldest dues first).
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- EXPANDED MANUAL ALLOCATION UI --- */}
                                    {feeData.manualDueAllocation && (
                                        <div className="bg-background border border-border rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2 mt-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="text-[11px] font-bold text-muted uppercase tracking-wider">Allocate to Specific Heads</h4>
                                                <span className={`text-[11px] font-bold px-2 py-1 rounded shadow-sm border ${isManualValid && feeData.amount ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                                                    Allocated: ₹{calculatedManualTotal} / ₹{feeData.amount || 0}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {/* 🌟 DYNAMIC MAPPING FROM FEE CONFIG */}
                                                {feeConfig?.feeHeads?.map((headObj: any, index: number) => {

                                                    const headName = headObj.feeHead;
                                                    const due = Number(fDues?.[headName] ?? 0);

                                                    // Only show inputs for heads that actually have pending dues
                                                    if (due <= 0) return null;

                                                    return (
                                                        <Input
                                                            // key={head} 
                                                            key={`${headName}-${index}`}
                                                            // id={`m_${head}`} 
                                                            id={`m_${headName}`}
                                                            type="number"
                                                            // label={`${head} (Max ₹${due})`} 
                                                            label={`${headName} (Max ₹${due})`}
                                                            // value={feeData.paidHeads[head] || ''} 
                                                            value={feeData.paidHeads[headName] || ''}
                                                            onChange={(e) => setFeeData({
                                                                ...feeData,
                                                                paidHeads: {
                                                                    ...feeData.paidHeads,
                                                                    // Prevent negative numbers and map directly to the dynamic key
                                                                    // [head]: Math.max(0, Number(e.target.value)) 
                                                                    [headName]: Math.max(0, Number(e.target.value))
                                                                }
                                                            })}
                                                            max={due}
                                                        />
                                                    );
                                                })}
                                            </div>

                                            {!isManualValid && feeData.amount && (
                                                <p className="text-[11px] text-danger bg-danger/5 p-2 mt-3 rounded border border-danger/20 flex items-center gap-1.5 shadow-sm">
                                                    <i className="fas fa-exclamation-circle"></i> Allocation total does not match Amount Received.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Cash Denominations */}
                                    {feeData.paymentMode === 'cash' && (
                                        <div className="bg-background border border-border rounded-xl p-4 shadow-sm animate-in fade-in">
                                            <div className="flex justify-between items-center border-b border-border pb-3 mb-3">
                                                <h4 className="text-sm font-bold text-foreground">Cash Denominations</h4>
                                                <span className={`text-[11px] font-bold px-2 py-1 rounded shadow-sm border ${isCashValid && feeData.amount ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                                                    Total: ₹{calculatedCashTotal} / ₹{feeData.amount || 0}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                                {[500, 200, 100, 50, 20, 10].map((note) => (
                                                    <div key={note} className="flex flex-col gap-1 bg-surface border border-border px-2 py-1.5 rounded-lg text-center shadow-sm">
                                                        <span className="text-[10px] font-bold text-muted">₹{note}</span>
                                                        <input type="number" min="0" placeholder="0"
                                                            className="w-full bg-background border border-border/60 rounded p-1 text-xs text-foreground text-center font-bold outline-none focus:border-primary/50"
                                                            value={denominations[`notes${note}` as keyof typeof denominations] || ''}
                                                            // onChange={(e) => setDenominations({ ...denominations, [`notes${note}`]: Number(e.target.value) || 0 })}
                                                            onChange={(e) => handleDenominationChange(`notes${note}`, Number(e.target.value) || 0)}


                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            {!isCashValid && feeData.amount && (
                                                <p className="text-[11px] text-danger bg-danger/5 p-2 rounded border border-danger/20 flex items-center gap-1.5 shadow-sm mt-3"><i className="fas fa-exclamation-circle"></i> Denominations do not match amount.</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Bank/Cheque Specifics */}
                                    {(feeData.paymentMode === 'bank_transfer' || feeData.paymentMode === 'upi' || feeData.paymentMode === 'cheque') && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-background border border-border rounded-xl p-4 shadow-sm animate-in fade-in">
                                            <Input id="referenceNumber" label={feeData.paymentMode === 'upi' ? "UPI Trans. ID" : "Ref / Cheque No."} value={feeData.referenceNumber} onChange={(e) => setFeeData({ ...feeData, referenceNumber: e.target.value })} required />
                                            <Input id="bankName" label="Sender Bank Name" value={feeData.bankName} onChange={(e) => setFeeData({ ...feeData, bankName: e.target.value })} required />
                                            {feeData.paymentMode === 'cheque' && <Input id="chequeDate" type="date" label="Cheque Date" value={feeData.chequeDate} onChange={(e) => setFeeData({ ...feeData, chequeDate: e.target.value })} required />}
                                        </div>
                                    )}

                                    {/* Extras */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border">
                                        <div className="flex flex-col gap-1.5">
                                            <Label>Upload Bill/Proof</Label>
                                            <input type="file" multiple onChange={(e) => setFeeFiles(e.target.files)} className="w-full text-xs text-muted file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-primary-soft file:text-primary file:font-bold cursor-pointer border border-border rounded-lg bg-background shadow-sm" disabled={totalDues <= 0} />
                                        </div>
                                        <Input id="remarks" label="Remarks" placeholder="Optional note..." value={feeData.remarks} onChange={(e) => setFeeData({ ...feeData, remarks: e.target.value })} disabled={totalDues <= 0} />
                                    </div>
                                </div>

                                {/* Sticky Footer */}
                                <div className="sticky bottom-0 z-10 px-5 py-3 border-t border-border bg-surface flex justify-end gap-3 mt-auto shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                                    <Button type="button" size="sm" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                                    <Button type="submit" size="sm" variant="primary" isLoading={collectFeeMutation.isPending}>
                                        Process Payment
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}