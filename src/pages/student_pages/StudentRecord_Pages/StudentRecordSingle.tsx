import React, { useState } from 'react';
import { useParams, useNavigate, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../features/store/store';

// API Hooks
import {
    useGetStudentRecordByIdV1,
    useToggleStudentRecordStatus,
    // useApplyConcession,
    // useRevertFeeTransaction,
    useVerifyConcession,
    useRevertFeeTransactionv1,
    useApplyConcessionv1,
    useUpdateStudentRecordNewOldType,
    useDeleteStudentRecord,
    // useUpdateConcessionDetails,
    useUpdateConcessionDetailsv1,
} from '../../../api_services/student_api/studentRecordApi';

// import { useGetClasses } from '../../../api_services/schoolConfig_api/classApi';
// import { useGetSections } from '../../../api_services/schoolConfig_api/sectionApi';

import { Button } from '../../../shared/ui/Button';
import { Input, Label } from '../../../shared/ui/Input';
import { SideModal } from '../../../shared/ui/SideModal';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { Toggle } from '../../../shared/ui/Toggle';
import { toast } from '../../../shared/ui/ToastContext';
import AssignClass from './AssignClass';
import CollectFeeModal from './CollectFeeModal';
import { getAcademicYears } from '../../../utils/utils';
import { useRoleCheck } from '../../../hooks/useRoleCheck';
import { useGetFeeConfig, type FeeHeadItem } from './../../../api_services/feeStructure_api/feeStructureConfigApi';
import { useGetSchoolById } from '../../../api_services/schoolConfig_api/schoolapi';
import InfoTooltip from '../../../shared/ui/InfoToolTip';

export default function StudentRecordSingle() {
    const { studentId } = useParams() as { studentId: string }
    const [searchParams] = useSearchParams()
    const studentAcademicYear = searchParams.get("academicYear")


    const navigate = useNavigate();
    const location = useLocation()

    const { isPrincipal, isCorrespondent, isAccountant, isVicePrincipal, isAdmin, isTeacher } = useRoleCheck()


    const canCollectFee = isCorrespondent || isAccountant || isAdmin
    const canAssignClass = isCorrespondent || isAccountant || isAdmin || isTeacher
    const canRevertFee = isCorrespondent || isAccountant || isPrincipal || isAdmin
    const canVerifyConcession = isCorrespondent || isAdmin || isPrincipal || isVicePrincipal
    const canConcession = isCorrespondent || isAdmin || isPrincipal || isAccountant
    const canUpdateConcession = isCorrespondent || isAdmin || isPrincipal || isAccountant
    const canDeleteStudentRecord = isCorrespondent;



    const { schoolId } = useSelector((state: RootState) => state.auth);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(studentAcademicYear || "")

    // --- Data Fetching ---
    // const { data: record, isLoading, isError, refetch } = useGetStudentRecordById(schoolId!, studentId);
    const { data: record, isLoading, isError, refetch, isFetching } = useGetStudentRecordByIdV1(schoolId!, studentId, selectedAcademicYear);
    const { data: feeConfig } = useGetFeeConfig(schoolId!);

    const { data: schoolData } = useGetSchoolById(schoolId!)



    // Mutations
    const deleteRecordMutation = useDeleteStudentRecord();

    const toggleStatusMutation = useToggleStudentRecordStatus();
    const updateStudentNewOldMutation = useUpdateStudentRecordNewOldType();

    // const applyConcessionMutation = useApplyConcession();
    const applyConcessionMutation = useApplyConcessionv1();
    const updateConcessionMutation = useUpdateConcessionDetailsv1();
    // const revertFeeMutation = useRevertFeeTransaction();
    const revertFeeMutation = useRevertFeeTransactionv1();
    const verifyMutation = useVerifyConcession();

    // --- Modal States ---
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isConcessionModalOpen, setIsConcessionModalOpen] = useState(false);
    const [concessionModalMode, setConcessionModalMode] = useState<'apply' | 'update'>('apply');


    const [concessionData, setConcessionData] = useState({
        type: record?.concession?.type || 'amount',     // 'amount' or 'percentage'
        value: record?.concession?.value || '',          // The numeric value
        remark: record?.concession?.remark || '',         // 'Sibling', 'Staff', etc.

        // Initialization fields (Only used if !isRecordCreated)
        classId: record?.classId || '',
        sectionId: record?.sectionId || '',
        newOld: record?.newOld || "new",
        // isBusApplicable: record?.isBusApplicable || false,
        busPoint: ''
    });

    const [isEditingType, setIsEditingType] = useState(false);
    const [pendingNewOld, setPendingNewOld] = useState<'new' | 'old'>(record?.newOld ?? 'new');


    const academicYearOptions = getAcademicYears();

    const [concessionFile, setConcessionFile] = useState<File | null>(null);
    // Detect if this is a Ghost Record (Not created in DB yet)
    const isRecordCreated = !!record?._id;

    // Safe extraction with fallbacks
    // const fStruct = record?.feeStructure || {};
    // const fPaid = record?.feePaid || {};
    // const fDues = record?.dues || {};


    // REPLACE WITH:
    const fStruct = record?.feeStructurev1 || {};
    const fPaid = record?.feePaidv1 || {};
    const fDues = record?.duesv1 || {};
    const orderedHeads: FeeHeadItem[] = feeConfig?.feeHeads || [];



    const concession = record?.concession || {};
    const receipts = record?.receipts || [];
    const profileImgUrl = record?.studentImage?.url || record?.studentId?.studentImage?.url;
    const actualRollNumber = record?.rollNumber || record?.nonMandatory?.rollNumber || 'N/A';

    // 🛑 THE FIX: Safely extract IDs whether they are populated objects or raw strings
    // const actualClassId = typeof record?.classId === 'object' ? record?.classId?._id : record?.classId;
    // const actualSectionId = typeof record?.sectionId === 'object' ? record?.sectionId?._id : record?.sectionId;
    // const actualStudentId = typeof record?.studentId === 'object' ? record?.studentId?._id : record?.studentId;

    // Use populated names if the flat string fields are missing
    const displayClassName = record?.className || record?.classId?.name || 'Unassigned';
    const displaySectionName = record?.sectionName || record?.sectionId?.name || 'Unassigned';

    // const { data: classesData } = useGetClasses(schoolId!);
    // const { data: sectionsData, } = useGetSections({ schoolId: schoolId!, classId: concessionData.classId });


    // const classOptions = classesData?.map((cls: any) => ({ label: cls.name, value: cls._id })) || [];
    // const sectionOptions = sectionsData?.map((sec: any) => ({ label: sec.name, value: sec._id })) || [];

    // --- Check if the selected class has sections ---
    // const selectedClassObj = classesData?.find((c: any) => c?._id === concessionData?.classId);
    // Assuming your class object has a 'hasSections' boolean, or check if sections array exists
    // const hasSections = selectedClassObj?.hasSections === true;


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

    // const openApplyConcessionModal = () => {
    //     setConcessionModalMode('apply');
    //     setConcessionData({
    //         type: record?.concession?.type || 'amount',
    //         value: record?.concession?.value || '',
    //         remark: record?.concession?.remark || '',
    //         // academicYear: record?.academicYear || '',
    //         classId: record?.classId || '',
    //         sectionId: record?.sectionId || '',
    //         newOld: record?.newOld || 'new',
    //         busPoint: '',
    //     });
    //     setIsConcessionModalOpen(true);
    // };

    const openUpdateConcessionModal = () => {
        setConcessionModalMode('update');
        setConcessionData((prev) => ({
            ...prev,
            type: concession?.type || 'amount',
            value: concession?.value ?? '',
            // academicYear: concession?.academicYear || record?.academicYear || '',
        }));
        setIsConcessionModalOpen(true);
    };

    const handleConcessionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!record || !schoolId) return;

        if (!selectedAcademicYear) {
            toast.error("Select the Academic Year")
            return;
        }


        if (!record || !schoolId) return;

        if (!selectedAcademicYear) {
            toast.error("Select the Academic Year")
            return;
        }


        if (concessionModalMode === 'update') {


            try {
                await updateConcessionMutation.mutateAsync({
                    schoolId, studentRecordId: record._id, concessionType: concessionData.type,
                    concessionValue: concessionData.value,
                    academicYear: selectedAcademicYear
                });
                setIsConcessionModalOpen(false);
                toast.success("Concession updated!");
                refetch(); // Refetches the Ghost record, which will now be a REAL record
            } catch (err: any) {
                toast.error(err?.message || "Failed to update concession.");
            }
            return;
        }



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
        formData.append('academicYear', selectedAcademicYear);

        if (concessionFile) formData.append('file', concessionFile);

        formData.append('newOld', concessionData.newOld);
        // formData.append('isBusApplicable', String(concessionData.isBusApplicable));
        // if (concessionData.isBusApplicable) {
        // }
        formData.append('busPoint', concessionData.busPoint);

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
        }
    };




    // --- Status Toggle Handler using Custom Toggle ---
    const handleToggleStatus = async (newStatus: boolean) => {
        if (!record) return;
        try {
            // await toggleStatusMutation.mutateAsync({ id: record._id, isActive: newStatus });
            await toggleStatusMutation.mutateAsync({
                studentId: studentId, // Can also be record.studentId depending on context source
                isActive: newStatus,
                academicYear: selectedAcademicYear // 🌟 Injects your local active selection state bound dynamically
            });
            refetch();
            toast.success("Status Updated!");
        } catch (error: any) {

            // toast.error("Status not updated!");
            toast.error(error.message || "Status not updated!");

        }
    };

    const handleSaveNewOld = async () => {
        // if (!record) return;

        if (!record || pendingNewOld === record.newOld) {
            setIsEditingType(false);
            return;
        }

        try {
            // await toggleStatusMutation.mutateAsync({ id: record._id, isActive: newStatus });
            await updateStudentNewOldMutation.mutateAsync({
                studentId: studentId, // Can also be record.studentId depending on context source
                newOld: pendingNewOld,
                academicYear: selectedAcademicYear, // 🌟 Injects your local active selection state bound dynamically
                schoolId: schoolId!
            });
            await refetch();
            toast.success("Student Record Updated!");
            setIsEditingType(false);
        } catch (error: any) {
            toast.error(error.message || "failed to update!");
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
            toast.error(error?.message || "Failed to revert transaction.");
        }
    };

    const handleVerify = async () => {
        // Pass both the ID and the Year from your state
        try {

            await verifyMutation.mutateAsync({
                studentId: record.studentId?._id,
                academicYear: selectedAcademicYear
            });
            toast.success("Verified successfully!");
            refetch();
        } catch (error: any) {
            toast.error(error?.message || "Failed to Verify.");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to permanently delete records for ${name} for this academic year ${selectedAcademicYear}?, This action cannot be undone.`)) {
            try {
                await deleteRecordMutation.mutateAsync(id);
                refetch();
                toast.success(`student data for ${name} has been reset for this academic year ${selectedAcademicYear}`)
            } catch (error: any) {
                toast.error(error.message || "Operation failed");
            }
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
                    <button onClick={() => navigate(-1)} className="w-10 h-10 cursor-pointer rounded-lg border border-border flex items-center justify-center text-muted hover:bg-background transition-colors">
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
                            {record?.studentName || record?.studentId?.studentName || 'Unknown Student'}
                        </h1>
                        <p className="text-sm text-muted mt-1">
                            {/* Academic Year: {record?.academicYear || '-'} | */}
                            SR-ID: {record?.srId || record?.studentId?.srId || 'N/A'}
                        </p>
                    </div>
                </div>


                {/* RIGHT SIDE: Perfectly aligned action cluster */}
                <div className="flex flex-wrap items-center justify-start lg:justify-end gap-3 w-full lg:w-auto">

                    {/* Academic Year Dropdown Wrapper with relative positioning to fix label spacing */}
                    <div className="w-full sm:w-48 relative -top-[9px]">
                        {/* 💡 The negative top margin beautifully counterbalances the absolute height of the "Academic Year" label text to line it up horizontally with the buttons */}
                        <SearchSelect
                            label="Academic Year"
                            options={academicYearOptions}
                            value={selectedAcademicYear}
                            onChange={(opt) => setSelectedAcademicYear(String(opt.value))}
                            placeholder="Select Year..."
                        />
                    </div>

                    {/* Active Status Toggle Wrapper */}
                    {canConcession && <div className="h-10 flex items-center bg-sub-header/40 px-4 rounded-lg border border-border transition-colors hover:bg-sub-header/60">
                        <Toggle
                            checked={record?.isActive || false}
                            onChange={handleToggleStatus}
                            label="Active Status"
                            disabled={toggleStatusMutation.isPending}
                            isLoading={toggleStatusMutation.isPending}
                            className="border border-border bg-sub-header peer-checked:bg-primary"
                            thumbClassName="border border-border"
                        />
                    </div>
                    }
                    {/* Standard Action Options */}
                    {canAssignClass && <Button
                        variant="outline"
                        className="h-10 !px-2 text-sm font-medium transition-all"
                        onClick={() => setIsAssignModalOpen(true)}
                        leftIcon="fas fa-chalkboard-user"
                    >
                        Manage Class
                    </Button>}

                    {canConcession && <Button
                        variant="outline"
                        className="h-10 !px-2 text-sm font-medium transition-all"
                        onClick={() => {
                            setConcessionModalMode('apply');
                            setIsConcessionModalOpen(true)
                        }}
                        leftIcon="fas fa-tags"
                    >
                        Concession
                    </Button>}

                    {/* Main Dynamic CTA Action */}
                    {canCollectFee && <Button
                        variant="primary"
                        className="h-10 !px-3 text-sm font-bold shadow-sm transition-all"
                        onClick={() => setIsFeeModalOpen(true)}
                        leftIcon="fas fa-rupee-sign"
                    >
                        Collect Fee
                    </Button>}

                    {(canDeleteStudentRecord && record?._id) &&
                        <div className='flex gap-2 items-center'>
                            <Button
                                variant="danger"
                                // size="icon"
                                className="h-10 !px-3 text-sm font-bold shadow-sm transition-all"
                                leftIcon='fas fa-trash'
                                onClick={() => handleDelete(record?._id, record?.studentId?.studentName)}
                                title="Delete Record"
                            >
                                Reset Data
                            </Button>

                            <InfoTooltip description={`it will reset all the data (along with fee receipts) for the ${selectedAcademicYear} which cant be retained`} />
                        </div>
                    }

                </div>
            </div>

            {/* Top Info Grids (Academic & Concession) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic & Class Details */}
                <section className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-4">

                    {/* 🌟 REDESIGNED HEADER: Status Badge on the Right */}
                    <div className="flex items-center justify-between border-b border-border pb-3 mb-2">
                        <div className="flex items-center gap-2">
                            <i className="fas fa-chalkboard-user text-primary"></i>
                            <h3 className="font-semibold text-foreground">Academic Information</h3>
                        </div>

                        {/* Dynamic Fee Status Badge */}
                        <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${record?.feeStatus === "paid"
                            ? 'bg-success/10 text-success border-success/20'
                            : 'bg-danger/10 text-danger border-danger/20' // Danger styling for unpaid
                            }`}>
                            <i className={`fas ${record?.feeStatus === "paid" ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                            {termLabel}: {record?.feeStatus || 'Unknown'}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                        <div>
                            <p className="text-muted text-xs font-semibold">Class & Section</p>
                            <p className="font-medium text-foreground text-sm mt-0.5">
                                {displayClassName} - {displaySectionName}
                            </p>
                        </div>

                        <div>
                            <p className="text-muted text-xs font-semibold">Roll Number & Type</p>
                            <p className="font-medium text-foreground text-sm mt-0.5">{actualRollNumber}</p>
                            {/* <p className="text-xs text-muted mt-1 capitalize">Admission: <span className='font-bold'>{record?.newOld || 'N/A'}</span></p> */}

                            <div className="flex items-center gap-2 mt-1">
                                {!isEditingType ? (
                                    <>
                                        <p className="text-xs text-muted capitalize">
                                            Admission: <span className="font-bold">{record?.newOld || 'N/A'}</span>
                                        </p>
                                        <button
                                            onClick={() => {
                                                setPendingNewOld(record?.newOld ?? 'new');
                                                setIsEditingType(true);
                                            }}
                                            className="cursor-pointer text-muted hover:text-primary transition-colors"
                                        >
                                            <i className="fa-solid fa-pen text-[10px]"></i>
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={pendingNewOld}
                                            onChange={(e) => setPendingNewOld(e.target.value as 'new' | 'old')}
                                            disabled={updateStudentNewOldMutation.isPending}
                                            className="text-xs font-medium border border-border rounded-md px-2 py-1 bg-surface text-foreground outline-none focus:border-primary disabled:opacity-50"
                                        >
                                            <option value="new">New</option>
                                            <option value="old">Old</option>
                                        </select>

                                        <button
                                            onClick={handleSaveNewOld}
                                            disabled={updateStudentNewOldMutation.isPending}
                                            className="text-success  hover:text-success/80 disabled:opacity-50"
                                        >
                                            {(updateStudentNewOldMutation.isPending || isFetching) ? (
                                                <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                                            ) : (
                                                <i className="fa-solid fa-check text-xs"></i>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => setIsEditingType(false)}
                                            disabled={updateStudentNewOldMutation.isPending}
                                            className="text-danger hover:text-danger/80 disabled:opacity-50"
                                        >
                                            <i className="fa-solid fa-xmark text-xs"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BOTTOM TAGS: Yearly Clearance & Subscriptions */}
                        <div className="col-span-2 flex flex-wrap gap-3 pt-2 border-t border-border/50">
                            {/* <span className={`px-2.5 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 ${record?.isBusApplicable ? 'bg-primary-soft text-primary border-primary/20' : 'bg-surface text-muted border-border'}`}>
                <i className={`fas fa-bus ${record?.isBusApplicable ? 'text-primary' : 'text-muted/50'}`}></i>
                Bus Subscriber: {record?.isBusApplicable ? 'Yes' : 'No'}
            </span> */}

                            <span className={`px-2.5 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 ${record?.isFullyPaid ? 'bg-success/10 text-success border-success/20' : 'bg-surface text-muted border-border'
                                }`}>
                                <i className={`fas ${record?.isFullyPaid ? 'fa-check-double text-success' : 'fa-clock text-muted/50'}`}></i>
                                Fully Paid: {record?.isFullyPaid ? 'Yes' : 'Pending'}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Concession Details */}
                <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b border-border pb-3 mb-2">
                        <div className="flex items-center gap-2">
                            <i className="fas fa-tags text-primary"></i>
                            <h3 className="font-semibold text-foreground">Concession Details</h3>
                        </div>

                        {/* 🌟 ONLY SHOW VERIFICATION IF CONCESSION IS APPLIED */}



                        {concession?.isApplied && (
                            <div className="flex items-center gap-2">
                                {canUpdateConcession && (
                                    <Button variant="outline" size="sm" onClick={openUpdateConcessionModal}>
                                        <i className="fas fa-pen mr-2"></i> Update
                                    </Button>
                                )}

                                {concession?.approvedBy ? (
                                    <div className="flex items-center gap-2 text-success bg-success/10 px-3 py-1 rounded-md text-xs font-bold">
                                        <i className="fas fa-check-circle"></i>
                                        <span>Verified</span>
                                    </div>
                                ) : (canVerifyConcession ?
                                    <>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={handleVerify}
                                            isLoading={verifyMutation.isPending}
                                        >
                                            <i className="fas fa-check mr-2"></i> Approve
                                        </Button>
                                    </>
                                    : <></>
                                )}
                            </div>
                        )}


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



                            {orderedHeads.map((headObj, index) => {
                                const headName = headObj.feeHead; // 🌟 Extract the string value

                                return (
                                    <tr key={`${headName}-${index}`} className="hover:bg-background/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground">{headName}</td>
                                        <td className="px-4 py-3 text-right">₹{fStruct?.[headName] ?? 0}</td>
                                        <td className="px-4 py-3 text-right text-success font-medium">₹{fPaid?.[headName] ?? 0}</td>
                                        <td className="px-4 py-3 text-right text-danger font-medium">₹{fDues?.[headName] ?? 0}</td>
                                    </tr>
                                );
                            })}



                            <tr className="bg-primary-soft/30 border-t-2 border-border">
                                <td className="px-4 py-4 font-bold text-foreground">Grand Total</td>
                                <td className="px-4 py-4 text-right font-bold">
                                    {/* 🌟 Use h.feeHead in the reduce functions */}
                                    ₹{orderedHeads.reduce((sum, h) => sum + Number(fStruct?.[h.feeHead] ?? 0), 0)}
                                </td>
                                <td className="px-4 py-4 text-right text-success font-bold">
                                    ₹{orderedHeads.reduce((sum, h) => sum + Number(fPaid?.[h.feeHead] ?? 0), 0)}
                                </td>
                                <td className="px-4 py-4 text-right text-danger font-bold">
                                    ₹{orderedHeads.reduce((sum, h) => sum + Number(fDues?.[h.feeHead] ?? 0), 0)}
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


                    <div className='flex gap-2'>
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

                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`fee-transaction`)}>
                            {/* <i className="fas fa-goto text-primary"></i> */}
                            <i className="fas fa-arrow-up-right-from-square text-xs text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></i>
                            <h3 className="font-semibold text-foreground">Full View</h3>
                        </div>
                    </div>
                </section>

                <div className="overflow-x-auto">
                    {receipts.length > 0 ? (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-background text-muted uppercase text-xs tracking-wider border-y border-border">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Receipt No</th>
                                    <th className="px-4 py-3 font-medium">Bill No</th>
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
                                            <p className="font-semibold text-foreground">{tx?.billNo || 'N/A'}</p>
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
                                                {(canRevertFee && tx.status === 'success') && (
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

            <CollectFeeModal
                isOpen={isFeeModalOpen}
                onClose={() => setIsFeeModalOpen(false)}
                schoolId={schoolId!}
                selectedAcademicYear={selectedAcademicYear}
                studentId={studentId!}
                record={record}
                refetch={refetch}
                feeConfig={feeConfig!}
            />


            {/* 2. ASSIGN CLASS MODAL */}

            <AssignClass
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                record={record} // Pass the data from useGetStudentRecordById
                schoolId={schoolId!}
                refetch={refetch} // Pass the refetch function so the table updates
                selectedAcademicYear={selectedAcademicYear}
            />

            {/* 3. CONCESSION MODAL */}


            <SideModal isOpen={isConcessionModalOpen} onClose={() => setIsConcessionModalOpen(false)} title="Manage Concession">
                <form onSubmit={handleConcessionSubmit} className="flex flex-col h-full space-y-6 pr-2">

                    {/* --- DYNAMIC INITIALIZATION WIDGET (Only shows for Ghost Records) --- */}
                    {/* {(concessionModalMode === 'apply' && !isRecordCreated) && (
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
                    )} */}


                    {concessionModalMode === 'update' ? (
                        /* --- MINIMAL UPDATE FORM: type, value, academic year only --- */
                        <div className="space-y-5">
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

                                {/* <SearchSelect
                                    label="Academic Year *"
                                    options={academicYearOptions}
                                    value={selectedAcademicYear}
                                    onChange={(opt) => setConcessionData({ ...concessionData, academicYear: String(opt?.value || '') })}
                                /> */}
                            </div>
                        </div>
                    ) : (
                        <>
                            {!record.classId && <div className="flex items-start gap-2.5 bg-warning/10 border border-warning/20 rounded-xl p-3.5">
                                <i className="fas fa-info-circle text-primary text-sm mt-0.5 shrink-0"></i>
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-xs font-bold text-foreground">Student Not Assigned to any class</p>
                                    <p className="text-[10px] text-muted leading-relaxed">
                                        {/* This concession will not change the master ledger balance immediately. The discount waterfall will apply dynamically during the student's first fee collection transaction. */}
                                        Please assign the student to a class by clicking on the <strong>Manage Class</strong> option.
                                    </p>
                                </div>
                            </div>}

                           
                            <div className="flex items-start gap-2.5 bg-primary-soft/30 border border-primary/20 rounded-xl p-3.5">
                                <i className="fas fa-info-circle text-primary text-sm mt-0.5 shrink-0"></i>
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-xs font-bold text-foreground">Deferred Allocation Rule</p>
                                    <p className="text-[10px] text-muted leading-relaxed">
                                        {/* This concession will not change the master ledger balance immediately. The discount waterfall will apply dynamically during the student's first fee collection transaction. */}
                                        This concession will not be applied to the student's balance right away. The amount will automatically adjust when you collect their first fee payment.
                                    </p>
                                </div>
                            </div>


                            {/* --- CORE CONCESSION FIELDS --- */}
                            < div className="space-y-5">
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
                                    <Label>Upload Proof Document</Label>
                                    <input
                                        type="file"
                                        onChange={(e) => setConcessionFile(e.target.files ? e.target.files[0] : null)}
                                        className="w-full text-xs text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-soft file:text-primary file:font-bold file:cursor-pointer cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-1">
                                {/* <div className="flex flex-col gap-1.5">
                                    <Label>Student Type</Label>
                                    <div className="flex bg-white rounded-lg border border-warning/30 p-1">
                                        {['new', 'old'].map(type => (
                                            <label key={type} className={`flex-1 text-center py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${concessionData.newOld === type ? 'bg-warning text-white' : 'text-warning-700 hover:bg-warning/10'}`}>
                                                <input type="radio" className="hidden" checked={concessionData.newOld === type} onChange={() => setConcessionData({ ...concessionData, newOld: type })} />
                                                {type}
                                            </label>
                                        ))}
                                    </div>
                                </div> */}

                                {/* <div className="flex flex-col gap-1.5">
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
                        </div> */}
                            </div>



                            <Input id="busPoint" label="Bus Point Location" placeholder="e.g., Main Street" value={concessionData.busPoint} onChange={(e) => setConcessionData({ ...concessionData, busPoint: e.target.value })} />
                        </>

                    )}


                    <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-border">
                        <Button type="button" variant="outline" onClick={() => setIsConcessionModalOpen(false)} className="cursor-pointer">Cancel</Button>
                        {/* <Button type="submit" variant="primary" isLoading={applyConcessionMutation.isPending} className="cursor-pointer">
                            {isRecordCreated ? 'Apply Concession' : 'Initialize & Apply'}
                        </Button> */}

                        <Button type="submit" variant="primary"
                        disabled={!record.classId}
                        title={`${!record.classId ? "disabled because student not assigned to any class" : ""}`}
                         isLoading={applyConcessionMutation.isPending || updateConcessionMutation.isPending} className="cursor-pointer">
                            {concessionModalMode === 'update' ? 'Update Concession' : (isRecordCreated ? 'Apply Concession' : 'Initialize & Apply')}
                        </Button>
                    </div>
                </form>
            </SideModal>
        </div >
    );
}