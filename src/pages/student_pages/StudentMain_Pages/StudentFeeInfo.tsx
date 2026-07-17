import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../../features/store/store";
import { useGetSchoolById } from "../../../api_services/schoolConfig_api/schoolapi";
import { getAcademicYears } from "../../../utils/utils";
import { useGetStudentRecordByIdV1 } from "../../../api_services/student_api/studentRecordApi";
import { useGetFeeConfig, type FeeHeadItem } from "../../../api_services/feeStructure_api/feeStructureConfigApi";
import { SearchSelect } from "../../../shared/ui/SearchSelect";
import { BUS_FEE_HEADS } from "../StudentRecord_Pages/CollectFeeModal";
// import { RootState } from "@/store";
// import { useGetSchoolById } from "@/hooks/school/useGetSchoolById";
// import { useGetStudentRecordByIdV1 } from "@/hooks/student/useGetStudentRecordByIdV1";
// import { useGetFeeConfig } from "@/hooks/fee/useGetFeeConfig";
// import { getAcademicYears } from "@/utils/academicYears";
// import SearchSelect from "@/components/ui/SearchSelect";

interface StudentFeeInfoProps {
    canRevertFee?: boolean;
    revertFeeMutation?: {
        isPending: boolean;
        mutate: (txId: string) => void;
    };
    onRevertFee?: (txId: string) => void;
    studentId: string
}

const StudentFeeInfo: React.FC<StudentFeeInfoProps> = ({
    canRevertFee = false,
    revertFeeMutation,
    onRevertFee,
    studentId
}) => {
    const navigate = useNavigate();
    // const { studentId } = useParams<{ studentId: string }>();
    const { schoolId } = useSelector((state: RootState) => state.auth);

    const { data: schoolData } = useGetSchoolById(schoolId!);
    const currentAcademicYear = schoolData?.currentAcademicYear || "";

    const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");

    // Sync default once school data loads
    useEffect(() => {
        if (currentAcademicYear && !selectedAcademicYear) {
            setSelectedAcademicYear(currentAcademicYear);
        }
    }, [currentAcademicYear]);

    const academicYearOptions = getAcademicYears();

    const {
        data: record,
        isLoading,
        isError,
        refetch,
    } = useGetStudentRecordByIdV1(schoolId!, studentId!, selectedAcademicYear);

    const { data: feeConfig } = useGetFeeConfig(schoolId!);

    const fStruct = record?.feeStructurev1 || {};
    const fPaid = record?.feePaidv1 || {};
    const fDues = record?.duesv1 || {};
    const receipts = record?.receipts || [];
    const orderedHeads: FeeHeadItem[] = feeConfig?.feeHeads || [];

    // 🌟 Add this block:
    const standardHeadNames = orderedHeads.map(h => h.feeHead);
    const effectiveHeadNames = record?.isBusApplicable
        ? [...standardHeadNames, ...BUS_FEE_HEADS]
        : standardHeadNames;

    const totalSuccessfullyPaid = receipts
        .filter((tx: any) => tx.status === "success")
        .reduce((sum: number, tx: any) => sum + Number(tx.amountPaid || 0), 0);


    // const grandTotal = orderedHeads.reduce((sum, h) => sum + Number(fStruct?.[h.feeHead] ?? 0), 0);
    // const grandPaid = orderedHeads.reduce((sum, h) => sum + Number(fPaid?.[h.feeHead] ?? 0), 0);
    // const grandDue = orderedHeads.reduce((sum, h) => sum + Number(fDues?.[h.feeHead] ?? 0), 0);


    // 🌟 Replace the old reduce functions with these:
    const grandTotal = effectiveHeadNames.reduce((sum, headName) => sum + Number(fStruct?.[headName] ?? 0), 0);
    const grandPaid = effectiveHeadNames.reduce((sum, headName) => sum + Number(fPaid?.[headName] ?? 0), 0);
    const grandDue = effectiveHeadNames.reduce((sum, headName) => sum + Number(fDues?.[headName] ?? 0), 0);

    const handleRevertFee = (txId: string) => {
        if (onRevertFee) onRevertFee(txId);
        else if (revertFeeMutation) revertFeeMutation.mutate(txId);
    };

    // ─── Loading / Error States ───────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted">
                <i className="fas fa-spinner animate-spin text-2xl text-primary"></i>
                <p className="text-sm">Loading fee details…</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted">
                <i className="fas fa-circle-exclamation text-2xl text-danger opacity-60"></i>
                <p className="text-sm">Failed to load fee records.</p>
                <button
                    onClick={() => refetch()}
                    className="text-xs text-primary underline underline-offset-2"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 p-4 md:p-6">

            {/* ── Header Row: Academic Year Selector ──────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <i className="fas fa-graduation-cap text-primary text-sm"></i>
                    </div>
                    <div>
                        <p className="text-xs text-muted uppercase tracking-wider font-semibold">Academic Year</p>
                        <p className="text-sm font-bold text-foreground">{selectedAcademicYear || "—"}</p>
                    </div>
                </div>

                <div className="w-full sm:w-56">
                    <SearchSelect
                        label="Switch Year"
                        options={academicYearOptions}
                        value={selectedAcademicYear}
                        onChange={(opt) => setSelectedAcademicYear(String(opt.value))}
                        placeholder="Select Year…"
                    />
                </div>
            </div>

            {/* ── Summary Cards ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <SummaryCard
                    icon="fa-file-invoice-dollar"
                    label="Total Fee"
                    value={grandTotal}
                    colorClass="text-foreground"
                    bgClass="bg-primary/10"
                    iconClass="text-primary"
                />
                <SummaryCard
                    icon="fa-circle-check"
                    label="Amount Paid"
                    value={grandPaid}
                    colorClass="text-success"
                    bgClass="bg-success/10"
                    iconClass="text-success"
                />
                <SummaryCard
                    icon="fa-circle-exclamation"
                    label="Balance Due"
                    value={grandDue}
                    colorClass="text-danger"
                    bgClass="bg-danger/10"
                    iconClass="text-danger"
                />
            </div>

            {/* ── Financial Summary Table ──────────────────────────────────────── */}
            <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                    <i className="fas fa-wallet text-primary text-sm"></i>
                    <h3 className="font-semibold text-foreground text-sm">Financial Summary</h3>
                    <span className="ml-auto text-xs text-muted bg-background border border-border px-2 py-0.5 rounded-full">
                        {selectedAcademicYear}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    {/* {orderedHeads.length > 0 ? ( */}
                    {effectiveHeadNames.length > 0 ? (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-background text-muted uppercase text-xs tracking-wider border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Fee Category</th>
                                    <th className="px-4 py-3 font-medium text-right">Total Fee</th>
                                    <th className="px-4 py-3 font-medium text-right text-success">Paid</th>
                                    <th className="px-4 py-3 font-medium text-right text-danger">Due</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {/* {orderedHeads.map((head) => (
                                    <tr key={head} className="hover:bg-background/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground">{head}</td>
                                        <td className="px-4 py-3 text-right text-foreground">
                                            ₹{Number(fStruct?.[head] ?? 0).toLocaleString("en-IN")}
                                        </td>
                                        <td className="px-4 py-3 text-right text-success font-medium">
                                            ₹{Number(fPaid?.[head] ?? 0).toLocaleString("en-IN")}
                                        </td>
                                        <td className="px-4 py-3 text-right text-danger font-medium">
                                            ₹{Number(fDues?.[head] ?? 0).toLocaleString("en-IN")}
                                        </td>
                                    </tr>
                                ))} */}

                                {/* {orderedHeads.map((headObj, index) => {
                                    // Extract the actual string name from the object
                                    const headName = headObj.feeHead; */}

                                    {effectiveHeadNames.map((headName, index) => {

                                    return (
                                        <tr key={`${headName}-${index}`} className="hover:bg-background/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-foreground">{headName}</td>
                                            <td className="px-4 py-3 text-right text-foreground">
                                                ₹{Number(fStruct?.[headName] ?? 0).toLocaleString("en-IN")}
                                            </td>
                                            <td className="px-4 py-3 text-right text-success font-medium">
                                                ₹{Number(fPaid?.[headName] ?? 0).toLocaleString("en-IN")}
                                            </td>
                                            <td className="px-4 py-3 text-right text-danger font-medium">
                                                ₹{Number(fDues?.[headName] ?? 0).toLocaleString("en-IN")}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-primary-soft/30 border-t-2 border-border">
                                    <td className="px-4 py-4 font-bold text-foreground">Grand Total</td>
                                    <td className="px-4 py-4 text-right font-bold text-foreground">
                                        ₹{grandTotal.toLocaleString("en-IN")}
                                    </td>
                                    <td className="px-4 py-4 text-right font-bold text-success">
                                        ₹{grandPaid.toLocaleString("en-IN")}
                                    </td>
                                    <td className="px-4 py-4 text-right font-bold text-danger">
                                        ₹{grandDue.toLocaleString("en-IN")}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    ) : (
                        <EmptyState
                            icon="fa-wallet"
                            message="No fee structure configured for this year."
                        />
                    )}
                </div>
            </div>

            {/* ── Transaction History ──────────────────────────────────────────── */}
            <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <i className="fas fa-receipt text-primary text-sm"></i>
                        <h3 className="font-semibold text-foreground text-sm">Transaction History</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Total paid badge */}
                        {receipts.length > 0 && (
                            <div className="flex items-center gap-3 bg-background border-l-4 border-primary px-3 py-2 rounded-r-xl shadow-sm">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
                                    <i className="fas fa-wallet text-xs"></i>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Total Paid</span>
                                    <span className="text-base font-bold text-foreground leading-tight">
                                        ₹{totalSuccessfullyPaid.toLocaleString("en-IN")}
                                    </span>
                                </div>
                                <div className="flex flex-col border-l border-border pl-3">
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Receipts</span>
                                    <span className="text-sm font-bold text-foreground">{receipts.length}</span>
                                </div>
                            </div>
                        )}

                        {/* Full view link */}
                        <button
                            onClick={() => navigate("fee-transaction")}
                            className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors shrink-0"
                        >
                            <i className="fas fa-arrow-up-right-from-square text-xs"></i>
                            <span className="text-xs font-semibold">Full View</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {receipts.length > 0 ? (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-background text-muted uppercase text-xs tracking-wider border-b border-border">
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
                                            <p className="font-semibold text-foreground">{tx.receiptNo || "N/A"}</p>
                                            <p className="text-xs text-muted">
                                                {new Date(tx.paymentDate).toLocaleString()}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-foreground">{tx?.billNo || "N/A"}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-foreground capitalize">
                                                {tx.paymentMode.replace("_", " ")}
                                            </p>
                                            {(tx.referenceNumber || tx.bankName) && (
                                                <p className="text-xs text-muted truncate max-w-[150px]">
                                                    Ref: {tx.referenceNumber} | {tx.bankName}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-foreground">
                                            {tx.collectedBy?.userName || "System"}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-foreground">
                                            ₹{Number(tx.amountPaid || 0).toLocaleString("en-IN")}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge status={tx.status} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {tx.proofUpload?.length > 0 && (
                                                    <a
                                                        href={tx.proofUpload[0].url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline text-xs font-medium"
                                                        title="View Attachment"
                                                    >
                                                        <i className="fas fa-paperclip"></i>
                                                    </a>
                                                )}
                                                {canRevertFee && tx.status === "success" && (
                                                    revertFeeMutation?.isPending ? (
                                                        <i className="fas fa-spinner animate-spin text-muted"></i>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleRevertFee(tx._id)}
                                                            disabled={revertFeeMutation?.isPending}
                                                            className="text-danger hover:underline text-xs font-medium"
                                                            title="Revert Transaction"
                                                        >
                                                            <i className="fas fa-undo"></i>
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyState
                            icon="fa-file-invoice-dollar"
                            message="No transactions recorded yet."
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentFeeInfo;

// ─── Sub-components ─────────────────────────────────────────────────────────

interface SummaryCardProps {
    icon: string;
    label: string;
    value: number;
    colorClass: string;
    bgClass: string;
    iconClass: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
    icon, label, value, colorClass, bgClass, iconClass,
}) => (
    <div className="bg-surface border border-border rounded-xl px-4 py-4 flex items-center gap-3 shadow-sm">
        <div className={`w-10 h-10 rounded-lg ${bgClass} flex items-center justify-center shrink-0`}>
            <i className={`fas ${icon} ${iconClass} text-sm`}></i>
        </div>
        <div>
            <p className="text-xs text-muted uppercase tracking-wider font-semibold">{label}</p>
            <p className={`text-lg font-bold ${colorClass} leading-tight`}>
                ₹{value.toLocaleString("en-IN")}
            </p>
        </div>
    </div>
);

interface StatusBadgeProps {
    status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const cls =
        status === "success"
            ? "bg-success/10 text-success border-success/20"
            : status === "pending" || status === "draft"
                ? "bg-warning/10 text-warning border-warning/20"
                : "bg-danger/10 text-danger border-danger/20";

    return (
        <span className={`px-2.5 py-1 rounded text-xs font-medium border capitalize ${cls}`}>
            {status}
        </span>
    );
};

interface EmptyStateProps {
    icon: string;
    message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, message }) => (
    <div className="flex flex-col items-center justify-center text-center text-muted py-12">
        <i className={`fas ${icon} text-3xl mb-3 opacity-30`}></i>
        <p className="text-sm">{message}</p>
    </div>
);