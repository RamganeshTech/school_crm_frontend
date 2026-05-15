import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../features/store/store';


// API Hooks
import {
    // useGetStudentRecordById,
    useGetStudentRecordByIdV1,
    useToggleStudentRecordStatus,
    // useAssignStudentToClass,
    // useRemoveStudentFromClass,
    useApplyConcession,
    // useUpdateConcessionDetails,
    useCollectFee,
    useRevertFeeTransaction,
    // useRevertFeeTransaction
} from '../../../api_services/student_api/studentRecordApi';

import { useGetClasses } from '../../../api_services/schoolConfig_api/classApi';
import { useGetSections } from '../../../api_services/schoolConfig_api/sectionApi';

import { Button } from '../../../shared/ui/Button';
import { Input, Label } from '../../../shared/ui/Input';
import { SideModal } from '../../../shared/ui/SideModal';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { Toggle } from '../../../shared/ui/Toggle';
import { toast } from '../../../shared/ui/ToastContext';
import AssignClass from './AssignClass';

export default function StudentRecordSingle() {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const location = useLocation()

    const { schoolId } = useSelector((state: RootState) => state.auth);

    // --- Data Fetching ---
    // const { data: record, isLoading, isError, refetch } = useGetStudentRecordById(schoolId!, studentId);
    const { data: record, isLoading, isError, refetch } = useGetStudentRecordByIdV1(schoolId!, studentId);




    // Mutations
    const collectFeeMutation = useCollectFee();
    const toggleStatusMutation = useToggleStudentRecordStatus();
    // const assignClassMutation = useAssignStudentToClass();
    // const removeClassMutation = useRemoveStudentFromClass();
    const applyConcessionMutation = useApplyConcession();
    const revertFeeMutation = useRevertFeeTransaction();

    // --- Modal States ---
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isConcessionModalOpen, setIsConcessionModalOpen] = useState(false);

    // ==========================================
    // 1. FEE COLLECTION STATE & LOGIC
    // ==========================================
    const [feeData, setFeeData] = useState({
        amount: '',
        paymentMode: 'Cash',
        referenceNumber: '',
        bankName: '',
        chequeDate: '',
        remarks: '',
        manualDueAllocation: false,
        paidHeads: {
            admissionFee: 0,
            firstTermAmt: 0,
            secondTermAmt: 0,
            busFirstTermAmt: 0,
            busSecondTermAmt: 0
        }
    });

    const [denominations, setDenominations] = useState({
        notes500: 0, notes200: 0, notes100: 0, notes50: 0, notes20: 0, notes10: 0
    });
    const [feeFiles, setFeeFiles] = useState<FileList | null>(null);

    const calculatedCashTotal = useMemo(() => {
        return (denominations.notes500 * 500) +
            (denominations.notes200 * 200) + (denominations.notes100 * 100) +
            (denominations.notes50 * 50) + (denominations.notes20 * 20) +
            (denominations.notes10 * 10);
    }, [denominations]);

    const isCashValid = feeData.paymentMode !== 'Cash' || (calculatedCashTotal === Number(feeData.amount) && Number(feeData.amount) > 0);

    const calculatedManualTotal = useMemo(() => {
        return Object.values(feeData.paidHeads).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
    }, [feeData.paidHeads]);


    // ==========================================
    // 3. CONCESSION STATE & LOGIC
    // ==========================================
    const [concessionData, setConcessionData] = useState({
        type: 'amount',     // 'amount' or 'percentage'
        value: '',          // The numeric value
        remark: '',         // 'Sibling', 'Staff', etc.

        // Initialization fields (Only used if !isRecordCreated)
        classId: record?.classId || '',
        sectionId: record?.sectionId || '',
        newOld: record?.newOld || "new",
        isBusApplicable: false,
        busPoint: ''
    });

    const [concessionFile, setConcessionFile] = useState<File | null>(null);
    // Detect if this is a Ghost Record (Not created in DB yet)
    const isRecordCreated = !!record?._id;


    // NEW: Validation for Manual Allocation
    const isManualValid = !feeData.manualDueAllocation || (calculatedManualTotal === Number(feeData.amount));

    const canSubmit = isCashValid && isManualValid && Number(feeData.amount) > 0;

    // Safe extraction with fallbacks
    const fStruct = record?.feeStructure || {};
    const fPaid = record?.feePaid || {};
    const fDues = record?.dues || {};
    const concession = record?.concession || {};
    const receipts = record?.receipts || [];
    const profileImgUrl = record?.studentImage?.url || record?.studentId?.studentImage?.url;
    const actualRollNumber = record?.rollNumber || record?.nonMandatory?.rollNumber || 'N/A';

    // 🛑 THE FIX: Safely extract IDs whether they are populated objects or raw strings
    const actualClassId = typeof record?.classId === 'object' ? record?.classId?._id : record?.classId;
    const actualSectionId = typeof record?.sectionId === 'object' ? record?.sectionId?._id : record?.sectionId;
    const actualStudentId = typeof record?.studentId === 'object' ? record?.studentId?._id : record?.studentId;

    // Use populated names if the flat string fields are missing
    const displayClassName = record?.className || record?.classId?.name || 'Unassigned';
    const displaySectionName = record?.sectionName || record?.sectionId?.name || 'Unassigned';



    const handleFeeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schoolId || !studentId || !record) return;

        const formData = new FormData();
        formData.append('schoolId', schoolId);
        formData.append('studentId', actualStudentId || '');
        formData.append('studentName', record?.studentName || '');
        formData.append('classId', actualClassId || '');
        formData.append('sectionId', actualSectionId || '');
        formData.append('amount', feeData.amount);
        formData.append('paymentMode', feeData.paymentMode);
        formData.append('remarks', feeData.remarks);
        formData.append('newOld', record?.newOld);

        // Add Manual Allocation Data
        formData.append('manualDueAllocation', String(feeData.manualDueAllocation));
        if (feeData.manualDueAllocation) {
            formData.append('paidHeads', JSON.stringify(feeData.paidHeads));
        }

        // ... (Keep your Cash/Bank logic and Files logic exactly the same) ...

        try {
            await collectFeeMutation.mutateAsync(formData);
            setIsFeeModalOpen(false);

            // Reset everything on success
            setFeeData({
                amount: '', paymentMode: 'Cash', referenceNumber: '', bankName: '', chequeDate: '', remarks: '', manualDueAllocation: false,
                paidHeads: { admissionFee: 0, firstTermAmt: 0, secondTermAmt: 0, busFirstTermAmt: 0, busSecondTermAmt: 0 }
            });
            setDenominations({ notes500: 0, notes200: 0, notes100: 0, notes50: 0, notes20: 0, notes10: 0 });

            toast.success("Fee collected successfully!");
            refetch();
        } catch (err: any) {
            console.error("Fee collection failed", err);
            toast.error(err?.message || "Fee collection failed. Please try again.");
        }
    };

    // ==========================================
    // 2. ASSIGN CLASS STATE & LOGIC
    // ==========================================
    // const [assignData, setAssignData] = useState({ classId: '', sectionId: '', academicYear: null, rollNumber: '' });
    const { data: classesData } = useGetClasses(schoolId!);
    const { data: sectionsData, isLoading: isSectionsLoading } = useGetSections({ schoolId: schoolId!, classId: concessionData.classId });

    // --- Check if the selected class for Assignment has sections ---
    // const assignSelectedClassObj = classesData?.find((c: any) => c?._id === assignData?.classId);
    // const assignHasSections = assignSelectedClassObj?.hasSections === true;


    // const handleAssignSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     try {
    //         await assignClassMutation.mutateAsync({
    //             schoolId: schoolId!,
    //             studentId: typeof record?.studentId === 'object' ? record?.studentId?._id : record?.studentId,
    //             studentName: record?.studentName || '',
    //             newOld: record?.newOld || 'New',
    //             ...assignData
    //         });
    //         setIsAssignModalOpen(false);
    //         refetch();
    //         toast.success("Successfully Assinged!");
    //     } catch (err: any) {

    //         console.error("Assignment failed", err);

    //         toast.error(err?.message || "Failed to assign class.");
    //     }
    // };



    // --- Fetch Classes & Sections for the Modal ---

    // --- Options Mapping ---


    const classOptions = classesData?.map((cls: any) => ({ label: cls.name, value: cls._id })) || [];
    const sectionOptions = sectionsData?.map((sec: any) => ({ label: sec.name, value: sec._id })) || [];

    // --- Check if the selected class has sections ---
    const selectedClassObj = classesData?.find((c: any) => c?._id === concessionData?.classId);
    // Assuming your class object has a 'hasSections' boolean, or check if sections array exists
    const hasSections = selectedClassObj?.hasSections === true;



    const handleConcessionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!record || !schoolId) return;

        const formData = new FormData();
        formData.append('schoolId', schoolId);

        // Core Identity
        const targetStudentId = typeof record.studentId === 'object' ? record.studentId._id : record.studentId;
        formData.append('studentId', targetStudentId);
        formData.append('studentName', record.studentName || '');

        // Concession Details
        formData.append('concessionType', concessionData.type); // 'amount' or 'percentage'
        formData.append('concessionValue', concessionData.value);
        formData.append('remark', concessionData.remark);       // 'Sibling', 'Staff'

        if (concessionFile) formData.append('file', concessionFile);

        formData.append('newOld', concessionData.newOld);
        formData.append('isBusApplicable', String(concessionData.isBusApplicable));
        if (concessionData.isBusApplicable) {
            formData.append('busPoint', concessionData.busPoint);
        }

        // --- APPEND INITIALIZATION DATA IF RECORD IS GHOST ---
        if (!isRecordCreated) {
            formData.append('classId', concessionData.classId);
            formData.append('sectionId', concessionData.sectionId);

        }

        try {
            await applyConcessionMutation.mutateAsync(formData);
            setIsConcessionModalOpen(false);
            toast.success("Concession applied and record initialized!");
            refetch(); // Refetches the Ghost record, which will now be a REAL record
        } catch (err: any) {
            toast.error(err?.message || "Failed to apply concession.");
            console.error("Concession failed", err);
        }
    };

    // --- Status Toggle Handler using Custom Toggle ---
    const handleToggleStatus = async (newStatus: boolean) => {
        if (!record) return;
        try {
            await toggleStatusMutation.mutateAsync({ id: record._id, isActive: newStatus });
            refetch();
            toast.success("Status Updated!");
        } catch (error: any) {

            console.error("Toggle failed", error);
            // toast.error("Status not updated!");
            toast.error(error.message || "Status not updated!", 5000);

        }
    };

    // --- Revert Fee Handler ---
    const handleRevertFee = async (receiptId: string) => {
        const remarks = window.prompt("Enter reason for reverting this transaction:");
        if (remarks === null) return; // User cancelled

        try {
            await revertFeeMutation.mutateAsync({
                receiptId,
                status: 'cancelled',
                remarks: remarks || 'Reverted by admin'
            });
            toast.success("Transaction reverted successfully!");
            refetch();
        } catch (error: any) {
            console.error("Failed to revert fee", error);
            toast.error(error?.message || "Failed to revert transaction.");
        }
    };

    const totalSuccessfullyPaid = receipts
        .filter((tx: any) => tx.status === 'success')
        .reduce((sum: number, tx: any) => sum + (Number(tx.amountPaid) || 0), 0);

    // --- Render Guards ---
    if (isLoading) return (
        <div className="w-full h-64 flex items-center justify-center bg-background rounded-xl">
            <i className="fas fa-circle-notch fa-spin text-primary text-3xl mb-4"></i>
        </div>
    );
    if (isError || !record) return (
        <div className="p-6 text-center text-danger bg-danger/10 border border-danger/20 rounded-xl">
            Failed to load record details.
        </div>
    );


    const isChild = location.pathname.includes("fee-transaction")
    if (isChild) {
        return <Outlet />
    }


    return (
        <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-2">

            {/* Header & Quick Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-xl border border-border shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted hover:bg-background transition-colors">
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div className="w-16 h-16 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-xl border border-primary/20 overflow-hidden">
                        {profileImgUrl ? (
                            <img src={profileImgUrl} alt="profile" className="w-full h-full object-cover" />
                        ) : (
                            record?.studentName?.charAt(0).toUpperCase() || 'S'
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                            {record?.studentName || 'Unknown Student'}
                        </h1>
                        <p className="text-sm text-muted mt-1">
                            Academic Year: {record?.academicYear || '-'} | SR-ID: {record?.srId || record?.studentId?.srId || 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-sub-header/50 px-4 py-2 rounded-lg border border-border">
                        <Toggle
                            checked={record?.isActive || false}
                            onChange={handleToggleStatus}
                            label="Active Status"
                            disabled={toggleStatusMutation.isPending}
                            isLoading={toggleStatusMutation.isPending}

                        />
                    </div>
                    <Button variant="outline" onClick={() => setIsAssignModalOpen(true)} leftIcon="fas fa-chalkboard-user">Manage Class</Button>
                    <Button variant="outline" onClick={() => setIsConcessionModalOpen(true)} leftIcon="fas fa-tags">Concession</Button>
                    <Button variant="primary" onClick={() => setIsFeeModalOpen(true)} leftIcon="fas fa-rupee-sign">
                        Collect Fee
                    </Button>
                </div>
            </div>

            {/* Top Info Grids (Academic & Concession) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Academic & Class Details */}
                <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-3 mb-2">
                        <i className="fas fa-chalkboard-user text-primary"></i>
                        <h3 className="font-semibold text-foreground">Academic Information</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                        <div>
                            <p className="text-muted text-xs">Class & Section</p>
                            <p className="font-medium text-foreground text-sm mt-0.5">
                                {displayClassName} - {displaySectionName}
                            </p>
                            <div className="mt-1 space-y-0.5">
                                <p className="text-[10px] text-muted/70 truncate" title={actualClassId}>Class ID: {actualClassId || 'N/A'}</p>
                                <p className="text-[10px] text-muted/70 truncate" title={actualSectionId}>Section ID: {actualSectionId || 'N/A'}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-muted text-xs">Roll Number & Type</p>
                            <p className="font-medium text-foreground text-sm mt-0.5">{actualRollNumber}</p>
                            <p className="text-xs text-muted mt-1 capitalize">Admission: {record?.newOld || 'N/A'}</p>
                        </div>

                        <div className="col-span-2 flex flex-wrap gap-3 pt-2 border-t border-border/50">
                            <span className={`px-2.5 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 ${record?.isBusApplicable ? 'bg-primary-soft text-primary border-primary/20' : 'bg-surface text-muted border-border'}`}>
                                <i className={`fas fa-bus ${record?.isBusApplicable ? 'text-primary' : 'text-muted/50'}`}></i>
                                Bus Subscriber: {record?.isBusApplicable ? 'Yes' : 'No'}
                            </span>
                            <span className={`px-2.5 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 ${record?.isFullyPaid ? 'bg-success/10 text-success border-success/20' : 'bg-surface text-muted border-border'}`}>
                                <i className={`fas fa-check-double ${record?.isFullyPaid ? 'text-success' : 'text-muted/50'}`}></i>
                                Fully Paid: {record?.isFullyPaid ? 'Yes' : 'No'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Concession Details */}
                <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-3 mb-2">
                        <i className="fas fa-tags text-primary"></i>
                        <h3 className="font-semibold text-foreground">Concession Details</h3>
                    </div>
                    {concession?.isApplied ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-muted text-xs">Concession Type</p>
                                    <p className="font-medium text-foreground text-sm mt-0.5 capitalize">{concession?.type || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-muted text-xs">Discount Value</p>
                                    <p className="font-bold text-primary text-sm mt-0.5">
                                        {concession?.type === 'percentage' ? `${concession?.value || 0}%` : `₹${concession?.value || 0}`}
                                        <span className="text-xs text-muted ml-1 font-normal">(Value: ₹{concession?.inAmount || 0})</span>
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-muted text-xs">Remarks / Reason</p>
                                <p className="text-sm text-foreground bg-background p-2 rounded border border-border mt-1 capitalize">
                                    {concession?.remark || 'No remarks provided'}
                                </p>
                            </div>
                            {concession?.proof?.url && (
                                <a href={concession.proof.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-primary-soft text-primary border border-primary/20 hover:bg-primary/10 transition-colors w-max">
                                    <i className="fas fa-file-invoice"></i> View Proof Document
                                </a>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-muted h-32">
                            <i className="fas fa-tag text-2xl mb-2 opacity-30"></i>
                            <p className="text-sm">No concession applied to this record.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* UNIFIED FINANCIAL SUMMARY TABLE */}
            <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-wallet text-primary"></i>
                        <h3 className="font-semibold text-foreground">Financial Summary</h3>
                    </div>


                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`fee-transaction`)}>
                        <i className="fas fa-goto text-primary"></i>
                        <h3 className="font-semibold text-foreground">Full View</h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-background text-muted uppercase text-xs tracking-wider border-y border-border">
                            <tr>
                                <th className="px-4 py-3 font-medium">Fee Category</th>
                                <th className="px-4 py-3 font-medium text-right">Total Fee (Structure)</th>
                                <th className="px-4 py-3 font-medium text-right text-success">Amount Paid</th>
                                <th className="px-4 py-3 font-medium text-right text-danger">Current Due</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            <tr className="hover:bg-background/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-foreground">Admission Fee</td>
                                <td className="px-4 py-3 text-right">₹{fStruct?.admissionFee || 0}</td>
                                <td className="px-4 py-3 text-right text-success font-medium">₹{fPaid?.admissionFee || 0}</td>
                                <td className="px-4 py-3 text-right text-danger font-medium">₹{fDues?.admissionDues || 0}</td>
                            </tr>
                            <tr className="hover:bg-background/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-foreground">First Term</td>
                                <td className="px-4 py-3 text-right">₹{fStruct?.firstTermAmt || 0}</td>
                                <td className="px-4 py-3 text-right text-success font-medium">₹{fPaid?.firstTermAmt || 0}</td>
                                <td className="px-4 py-3 text-right text-danger font-medium">₹{fDues?.firstTermDues || 0}</td>
                            </tr>
                            <tr className="hover:bg-background/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-foreground">Second Term</td>
                                <td className="px-4 py-3 text-right">₹{fStruct?.secondTermAmt || 0}</td>
                                <td className="px-4 py-3 text-right text-success font-medium">₹{fPaid?.secondTermAmt || 0}</td>
                                <td className="px-4 py-3 text-right text-danger font-medium">₹{fDues?.secondTermDues || 0}</td>
                            </tr>
                            {record?.isBusApplicable && (
                                <>
                                    <tr className="hover:bg-background/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground">Bus - First Term</td>
                                        <td className="px-4 py-3 text-right">₹{fStruct?.busFirstTermAmt || 0}</td>
                                        <td className="px-4 py-3 text-right text-success font-medium">₹{fPaid?.busFirstTermAmt || 0}</td>
                                        <td className="px-4 py-3 text-right text-danger font-medium">₹{fDues?.busfirstTermDues || 0}</td>
                                    </tr>
                                    <tr className="hover:bg-background/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground">Bus - Second Term</td>
                                        <td className="px-4 py-3 text-right">₹{fStruct?.busSecondTermAmt || 0}</td>
                                        <td className="px-4 py-3 text-right text-success font-medium">₹{fPaid?.busSecondTermAmt || 0}</td>
                                        <td className="px-4 py-3 text-right text-danger font-medium">₹{fDues?.busSecondTermDues || 0}</td>
                                    </tr>
                                </>
                            )}
                            {/* TOTALS ROW */}
                            <tr className="bg-primary-soft/30 border-t-2 border-border">
                                <td className="px-4 py-4 font-bold text-foreground">Grand Total</td>
                                <td className="px-4 py-4 text-right font-bold">
                                    ₹{(fStruct?.admissionFee || 0) + (fStruct?.firstTermAmt || 0) + (fStruct?.secondTermAmt || 0) + (record?.isBusApplicable ? (fStruct?.busFirstTermAmt || 0) + (fStruct?.busSecondTermAmt || 0) : 0)}
                                </td>
                                <td className="px-4 py-4 text-right text-success font-bold">
                                    ₹{(fPaid?.admissionFee || 0) + (fPaid?.firstTermAmt || 0) + (fPaid?.secondTermAmt || 0) + (record?.isBusApplicable ? (fPaid?.busFirstTermAmt || 0) + (fPaid?.busSecondTermAmt || 0) : 0)}
                                </td>
                                <td className="px-4 py-4 text-right text-danger font-bold">
                                    ₹{(fDues?.admissionDues || 0) + (fDues?.firstTermDues || 0) + (fDues?.secondTermDues || 0) + (record?.isBusApplicable ? (fDues?.busfirstTermDues || 0) + (fDues?.busSecondTermDues || 0) : 0)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =========================================================
                TRANSACTION HISTORY (FEE TRANSCRIPT)
            ========================================================= */}
            <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                <section className="flex items-center justify-between border-b border-border pb-4 mb-4">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-receipt text-primary"></i>
                        <h3 className="font-semibold text-foreground">Transaction History</h3>
                    </div>


                    {/* Right Side: Total Amount Paid */}
                    {receipts.length > 0 && (
                        <div className="flex items-center gap-3 bg-background border-l-4 border-primary px-4 py-2 rounded-r-xl shadow-sm shrink-0">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <i className="fas fa-wallet text-sm"></i>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    Total Amount
                                </span>
                                <span className="text-lg font-bold text-slate-800 leading-tight">
                                    ₹{totalSuccessfullyPaid.toLocaleString('en-IN')}
                                </span>
                            </div>

                            <div className="flex flex-col">
                                {/* <span className="text-[9px] font-bold text-muted uppercase tracking-widest">Transactions</span> */}
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    Transactions
                                </span>
                                <span className="text-md font-bold text-foreground">{receipts.length} Receipts</span>
                            </div>
                        </div>
                    )}
                </section>

                <div className="overflow-x-auto">
                    {receipts.length > 0 ? (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-background text-muted uppercase text-xs tracking-wider border-y border-border">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Receipt Info</th>
                                    <th className="px-4 py-3 font-medium">Payment Mode</th>
                                    <th className="px-4 py-3 font-medium">Collected By</th>
                                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                                    <th className="px-4 py-3 font-medium text-center">Status</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {receipts.map((tx: any) => (
                                    <tr key={tx._id} className="hover:bg-background/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-foreground">{tx.receiptNo || 'N/A'}</p>
                                            <p className="text-xs text-muted">{new Date(tx.paymentDate).toLocaleString()}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-foreground capitalize">{tx.paymentMode.replace('_', ' ')}</p>
                                            {(tx.referenceNumber || tx.bankName) && (
                                                <p className="text-xs text-muted truncate max-w-[150px]">Ref: {tx.referenceNumber} | {tx.bankName}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-foreground">
                                            {tx.collectedBy?.userName || 'System'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-foreground">
                                            ₹{tx.amountPaid || 0}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2.5 py-1 rounded text-xs font-medium border capitalize ${tx.status === 'success' ? 'bg-success/10 text-success border-success/20' :
                                                tx.status === 'pending' || tx.status === 'draft' ? 'bg-warning/10 text-warning border-warning/20' :
                                                    'bg-danger/10 text-danger border-danger/20'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {tx.proofUpload?.length > 0 && (
                                                    <a href={tx.proofUpload[0].url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs font-medium" title="View Attachment">
                                                        <i className="fas fa-paperclip"></i>
                                                    </a>
                                                )}
                                                {tx.status === 'success' && (
                                                    <>
                                                        {revertFeeMutation.isPending ?
                                                            <i className="fas fa-spinner animate-spin"></i>

                                                            :
                                                            <button
                                                                onClick={() => handleRevertFee(tx._id)}
                                                                disabled={revertFeeMutation.isPending}
                                                                className="text-danger hover:underline text-xs font-medium"
                                                                title="Revert Transaction"
                                                            >
                                                                <i className="fas fa-undo"></i>
                                                            </button>}


                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center text-muted py-10">
                            <i className="fas fa-file-invoice-dollar text-3xl mb-3 opacity-30"></i>
                            <p className="text-sm">No transactions recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* =========================================================
                MODALS
            ========================================================= */}
            {/* =========================================================
                FEE COLLECTION MODAL
            ========================================================= */}
            <SideModal isOpen={isFeeModalOpen} onClose={() => setIsFeeModalOpen(false)} title="Collect Fee">
                <form onSubmit={handleFeeSubmit} className="flex flex-col h-full space-y-6">
                    <div className="space-y-5 overflow-y-auto custom-scrollbar pr-2 pb-4">

                        {/* Summary Box */}
                        <div className="bg-primary-soft/50 border border-primary/20 rounded-xl p-4 mb-2">
                            <p className="text-sm font-semibold text-foreground">
                                Total Dues Available: ₹{(fDues?.admissionDues || 0) + (fDues?.firstTermDues || 0) + (fDues?.secondTermDues || 0) + (record?.isBusApplicable ? (fDues?.busfirstTermDues || 0) + (fDues?.busSecondTermDues || 0) : 0)}
                            </p>
                        </div>

                        {/* Amount Input */}
                        <Input
                            id="amount" type="number" label="Amount Received (₹)"
                            value={feeData.amount} onChange={(e) => setFeeData({ ...feeData, amount: e.target.value })}
                            required min="1" placeholder="e.g., 5000"
                        />

                        {/* --- MANUAL ALLOCATION TOGGLE & UI --- */}
                        <div className="bg-background border border-border rounded-xl p-4 space-y-4">
                            <Toggle
                                checked={feeData.manualDueAllocation}
                                onChange={(checked) => setFeeData({ ...feeData, manualDueAllocation: checked })}
                                label="Manual Fee Allocation"
                                description="Turn off for Auto-FIFO (pays oldest dues first)."
                            />

                            {feeData.manualDueAllocation && (
                                <div className="pt-3 border-t border-border space-y-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-xs font-semibold text-muted uppercase">Allocate to Heads</h4>
                                        <span className={`text-sm font-bold px-2 py-1 rounded-md ${isManualValid && feeData.amount ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                            Allocated: ₹{calculatedManualTotal} / ₹{feeData.amount || 0}
                                        </span>
                                    </div>

                                    {fDues?.admissionDues > 0 && (
                                        <Input id="m_adm" type="number" label={`Admission Fee (Max ₹${fDues.admissionDues})`} value={feeData.paidHeads.admissionFee || ''} onChange={(e) => setFeeData({ ...feeData, paidHeads: { ...feeData.paidHeads, admissionFee: Number(e.target.value) } })} max={fDues.admissionDues} />
                                    )}
                                    {fDues?.firstTermDues > 0 && (
                                        <Input id="m_t1" type="number" label={`First Term (Max ₹${fDues.firstTermDues})`} value={feeData.paidHeads.firstTermAmt || ''} onChange={(e) => setFeeData({ ...feeData, paidHeads: { ...feeData.paidHeads, firstTermAmt: Number(e.target.value) } })} max={fDues.firstTermDues} />
                                    )}
                                    {fDues?.secondTermDues > 0 && (
                                        <Input id="m_t2" type="number" label={`Second Term (Max ₹${fDues.secondTermDues})`} value={feeData.paidHeads.secondTermAmt || ''} onChange={(e) => setFeeData({ ...feeData, paidHeads: { ...feeData.paidHeads, secondTermAmt: Number(e.target.value) } })} max={fDues.secondTermDues} />
                                    )}
                                    {record?.isBusApplicable && fDues?.busfirstTermDues > 0 && (
                                        <Input id="m_b1" type="number" label={`Bus First Term (Max ₹${fDues.busfirstTermDues})`} value={feeData.paidHeads.busFirstTermAmt || ''} onChange={(e) => setFeeData({ ...feeData, paidHeads: { ...feeData.paidHeads, busFirstTermAmt: Number(e.target.value) } })} max={fDues.busfirstTermDues} />
                                    )}
                                    {record?.isBusApplicable && fDues?.busSecondTermDues > 0 && (
                                        <Input id="m_b2" type="number" label={`Bus Second Term (Max ₹${fDues.busSecondTermDues})`} value={feeData.paidHeads.busSecondTermAmt || ''} onChange={(e) => setFeeData({ ...feeData, paidHeads: { ...feeData.paidHeads, busSecondTermAmt: Number(e.target.value) } })} max={fDues.busSecondTermDues} />
                                    )}

                                    {!isManualValid && feeData.amount && (
                                        <div className="flex items-center gap-2 mt-2 text-xs text-danger bg-danger/5 p-2 rounded border border-danger/20">
                                            <i className="fas fa-exclamation-circle"></i>
                                            <p>Allocation total does not match Amount Received.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* --- PAYMENT MODE SELECTION --- */}
                        <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
                            <Label>Payment Mode</Label>
                            <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 outline-none" value={feeData.paymentMode} onChange={(e) => setFeeData({ ...feeData, paymentMode: e.target.value })}>
                                <option value="Cash">Cash</option>
                                <option value="Bank Transfer">Bank Transfer / UPI</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                        </div>

                        {/* --- CASH DENOMINATIONS UI --- */}
                        {feeData.paymentMode === 'Cash' && (
                            <div className="bg-background border border-border rounded-xl p-4 space-y-4">
                                <div className="flex justify-between items-center border-b border-border pb-3">
                                    <h4 className="text-sm font-semibold text-foreground">Cash Denominations</h4>
                                    <span className={`text-sm font-bold px-2 py-1 rounded-md ${isCashValid && feeData.amount ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                        Total: ₹{calculatedCashTotal} / ₹{feeData.amount || 0}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                    {[500, 200, 100, 50, 20, 10].map((note) => (
                                        <div key={note} className="flex items-center gap-3 bg-surface border border-border px-3 py-2 rounded-lg">
                                            <span className="text-xs font-medium text-muted w-10 shrink-0">₹{note}</span>
                                            <span className="text-xs text-muted">x</span>
                                            <input
                                                type="number" min="0" placeholder="0"
                                                className="w-full bg-transparent text-sm text-foreground outline-none text-right font-medium"
                                                value={denominations[`notes${note}` as keyof typeof denominations] || ''}
                                                onChange={(e) => setDenominations({ ...denominations, [`notes${note}`]: Number(e.target.value) || 0 })}
                                            />
                                        </div>
                                    ))}
                                </div>
                                {!isCashValid && feeData.amount && (
                                    <div className="flex items-center gap-2 mt-3 text-xs text-danger bg-danger/5 p-2 rounded border border-danger/20">
                                        <i className="fas fa-exclamation-circle"></i>
                                        <p>Denomination total does not match Amount Received.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- BANK / CHEQUE UI --- */}
                        {feeData.paymentMode !== 'Cash' && (
                            <div className="space-y-4 bg-background border border-border rounded-xl p-4">
                                <Input id="referenceNumber" label="Reference / Cheque Number" value={feeData.referenceNumber} onChange={(e) => setFeeData({ ...feeData, referenceNumber: e.target.value })} required />
                                <Input id="bankName" label="Bank Name" value={feeData.bankName} onChange={(e) => setFeeData({ ...feeData, bankName: e.target.value })} required />
                                {feeData.paymentMode === 'Cheque' && (
                                    <Input id="chequeDate" type="date" label="Cheque Date" value={feeData.chequeDate} onChange={(e) => setFeeData({ ...feeData, chequeDate: e.target.value })} required />
                                )}
                            </div>
                        )}

                        {/* --- UPLOADS & REMARKS --- */}
                        <div className="flex flex-col gap-1.5">
                            <Label>Upload Attachments (Optional)</Label>
                            <input type="file" multiple onChange={(e) => setFeeFiles(e.target.files)} className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-soft file:text-primary cursor-pointer" />
                        </div>
                        <Input id="remarks" label="Remarks / Note" value={feeData.remarks} onChange={(e) => setFeeData({ ...feeData, remarks: e.target.value })} />
                    </div>

                    {/* --- SUBMIT FOOTER --- */}
                    <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-border bg-surface">
                        <Button type="button" variant="outline" onClick={() => setIsFeeModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={collectFeeMutation.isPending} disabled={!canSubmit}>Process Payment</Button>
                    </div>
                </form>
            </SideModal>

            {/* 2. ASSIGN CLASS MODAL */}
            {/* <SideModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign to Class">
                <form onSubmit={handleAssignSubmit} className="flex flex-col h-full space-y-6">
                    <div className="space-y-4">
                        <SearchSelect
                            label="Select Class"
                            options={classesData?.map((c: any) => ({ label: c.name, value: c._id })) || []}
                            value={assignData.classId}
                            onChange={(o) => setAssignData({ ...assignData, classId: String(o.value), sectionId: '' })}
                        />
                        {assignHasSections && (
                            <div className="relative" key={assignData.classId}>
                                <SearchSelect
                                    label="Select Section"
                                    options={sectionsData?.map((s: any) => ({ label: s.name, value: s._id })) || []}
                                    value={assignData.sectionId}
                                    onChange={(o) => setAssignData({ ...assignData, sectionId: String(o.value) })}
                                />
                                {isSectionsLoading && <i className="fas fa-spinner fa-spin absolute right-3 top-[38px] text-muted text-xs"></i>}
                            </div>
                        )}
                        <Input id="rollNumber" label="Roll Number (Optional)" value={assignData.rollNumber} onChange={(e) => setAssignData({ ...assignData, rollNumber: e.target.value })} />
                        <Input id="academicYear" label="Academic Year" value={assignData.academicYear} onChange={(e) => setAssignData({ ...assignData, academicYear: e.target.value })} />
                    </div>
                    <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-border">
                        {record?.classId && (
                            <Button type="button" variant="ghost" className="text-danger mr-auto" onClick={async () => {
                                if (window.confirm("Remove student from current class?")) {
                                    await removeClassMutation.mutateAsync({ schoolId: schoolId!, studentId: typeof record?.studentId === 'object' ? record?.studentId?._id : record?.studentId });
                                    setIsAssignModalOpen(false); refetch();
                                }
                            }}>Remove from Class</Button>
                        )}
                        <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={assignClassMutation.isPending} disabled={!assignData.classId}>Assign</Button>
                    </div>
                </form>
            </SideModal> */}


            <AssignClass
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                record={record} // Pass the data from useGetStudentRecordById
                schoolId={schoolId!}
                refetch={refetch} // Pass the refetch function so the table updates
            />

            {/* 3. CONCESSION MODAL */}
            {/* <SideModal isOpen={isConcessionModalOpen} onClose={() => setIsConcessionModalOpen(false)} title="Manage Concession">
                <form onSubmit={handleConcessionSubmit} className="flex flex-col h-full space-y-6">
                    <div className="space-y-4">
                        <Input id="type" label="Concession Type" placeholder="e.g., Sibling, Staff, Merit" value={concessionData.type} onChange={(e) => setConcessionData({ ...concessionData, type: e.target.value })} required />
                        <Input id="value" type="number" label="Concession Value (₹ or %)" value={concessionData.value} onChange={(e) => setConcessionData({ ...concessionData, value: e.target.value })} required />
                        <div className="flex flex-col gap-1.5">
                            <Label>Upload Proof Document</Label>
                            <input type="file" onChange={(e) => setConcessionFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-soft file:text-primary cursor-pointer" />
                        </div>
                    </div>
                    <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-border">
                        <Button type="button" variant="outline" onClick={() => setIsConcessionModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={applyConcessionMutation.isPending}>Apply Concession</Button>
                    </div>
                </form>
            </SideModal> */}

            <SideModal isOpen={isConcessionModalOpen} onClose={() => setIsConcessionModalOpen(false)} title="Manage Concession">
                <form onSubmit={handleConcessionSubmit} className="flex flex-col h-full space-y-6 pr-2">

                    {/* --- DYNAMIC INITIALIZATION WIDGET (Only shows for Ghost Records) --- */}
                    {!isRecordCreated && (
                        <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl space-y-4 mb-2 animate-in fade-in">
                            <p className="text-xs font-bold text-warning-700 flex items-center gap-2">
                                <i className="fas fa-info-circle"></i>
                                Record Initialization Required
                            </p>
                            <p className="text-[10px] text-warning-800/80 -mt-1 leading-relaxed">
                                This student does not have an active record for this academic year. Please verify their details below to initialize the record alongside the concession.
                            </p>

                            <div className={`grid ${hasSections ? 'grid-cols-2' : 'grid-cols-1'} gap-3 pt-2 border-t border-warning/20`}>
                                <SearchSelect
                                    label="Class *"
                                    options={classOptions}
                                    value={concessionData.classId}
                                    onChange={(opt) => setConcessionData({
                                        ...concessionData,
                                        classId: String(opt?.value || ''),
                                        sectionId: '' // Automatically reset section when class changes
                                    })}
                                />

                                {hasSections && (
                                    <div className="animate-in fade-in" key={concessionData.classId}>
                                        <SearchSelect
                                            label="Section *"
                                            options={sectionOptions}
                                            value={concessionData.sectionId}
                                            onChange={(opt) => setConcessionData({
                                                ...concessionData,

                                                sectionId: String(opt?.value || '')
                                            })}
                                        />
                                    </div>
                                )}
                            </div>


                        </div>
                    )}

                    {/* --- CORE CONCESSION FIELDS --- */}
                    <div className="space-y-5">
                        {/* Amount vs Percentage Toggle */}
                        <div className="flex flex-col gap-1.5">
                            <Label>Concession Calculation Type</Label>
                            <div className="flex gap-2">
                                <label className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${concessionData.type === 'amount' ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-surface text-muted hover:border-primary/30'}`}>
                                    <input type="radio" className="hidden" checked={concessionData.type === 'amount'} onChange={() => setConcessionData({ ...concessionData, type: 'amount' })} />
                                    <i className="fas fa-rupee-sign text-lg mb-1"></i>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Flat Amount</span>
                                </label>
                                <label className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${concessionData.type === 'percentage' ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-surface text-muted hover:border-primary/30'}`}>
                                    <input type="radio" className="hidden" checked={concessionData.type === 'percentage'} onChange={() => setConcessionData({ ...concessionData, type: 'percentage' })} />
                                    <i className="fas fa-percent text-lg mb-1"></i>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Percentage</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                id="value"
                                type="number"
                                label={concessionData.type === 'amount' ? "Discount Amount (₹)" : "Discount Percentage (%)"}
                                placeholder="e.g., 5000"
                                value={concessionData.value}
                                onChange={(e) => setConcessionData({ ...concessionData, value: e.target.value })}
                                required
                                min="0"
                                max={concessionData.type === 'percentage' ? "100" : undefined}
                            />
                            <Input
                                id="remark"
                                label="Reason / Category"
                                placeholder="e.g., Sibling, Staff"
                                value={concessionData.remark}
                                onChange={(e) => setConcessionData({ ...concessionData, remark: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 p-4 border border-border bg-surface rounded-xl">
                            <Label>Upload Proof Document (Optional)</Label>
                            <input
                                type="file"
                                onChange={(e) => setConcessionFile(e.target.files ? e.target.files[0] : null)}
                                className="w-full text-xs text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-soft file:text-primary file:font-bold file:cursor-pointer cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1">
                        <div className="flex flex-col gap-1.5">
                            <Label>Student Type</Label>
                            <div className="flex bg-white rounded-lg border border-warning/30 p-1">
                                {['new', 'old'].map(type => (
                                    <label key={type} className={`flex-1 text-center py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${concessionData.newOld === type ? 'bg-warning text-white' : 'text-warning-700 hover:bg-warning/10'}`}>
                                        <input type="radio" className="hidden" checked={concessionData.newOld === type} onChange={() => setConcessionData({ ...concessionData, newOld: type })} />
                                        {type}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label>Bus Facility</Label>
                            <div className="flex bg-white rounded-lg border border-warning/30 p-1">
                                <label className={`flex-1 text-center py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${concessionData.isBusApplicable ? 'bg-warning text-white' : 'text-warning-700 hover:bg-warning/10'}`}>
                                    <input type="radio" className="hidden" checked={concessionData.isBusApplicable} onChange={() => setConcessionData({ ...concessionData, isBusApplicable: true })} />
                                    Yes
                                </label>
                                <label className={`flex-1 text-center py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${!concessionData.isBusApplicable ? 'bg-warning text-white' : 'text-warning-700 hover:bg-warning/10'}`}>
                                    <input type="radio" className="hidden" checked={!concessionData.isBusApplicable} onChange={() => setConcessionData({ ...concessionData, isBusApplicable: false, busPoint: '' })} />
                                    No
                                </label>
                            </div>
                        </div>
                    </div>

                    {concessionData.isBusApplicable && (
                        <Input id="busPoint" label="Bus Point Location" placeholder="e.g., Main Street" value={concessionData.busPoint} onChange={(e) => setConcessionData({ ...concessionData, busPoint: e.target.value })} required />
                    )}

                    <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-border">
                        <Button type="button" variant="outline" onClick={() => setIsConcessionModalOpen(false)} className="cursor-pointer">Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={applyConcessionMutation.isPending} className="cursor-pointer">
                            {isRecordCreated ? 'Apply Concession' : 'Initialize & Apply'}
                        </Button>
                    </div>
                </form>
            </SideModal>
        </div>
    );
}