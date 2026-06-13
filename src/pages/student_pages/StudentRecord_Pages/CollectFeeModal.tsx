import React, { useState } from 'react';
import { SideModal } from '../../../shared/ui/SideModal'; // Adjust path
import { Input, Label } from '../../../shared/ui/Input'; // Adjust path
import { Button } from '../../../shared/ui/Button'; // Adjust path
import { Toggle } from '../../../shared/ui/Toggle'; // Adjust path
import { toast } from '../../../shared/ui/ToastContext'; // Adjust path
import {  useCollectFeev1 } from '../../../api_services/student_api/studentRecordApi';
// import { useCollectFeeAndManageRecord } from '../../../api_services/feeStructure_api/feeStructureApi'; // Adjust path to actual mutation hook

interface CollectFeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    schoolId: string;
    studentId: string;
    record: any; // The student record data
    refetch: () => void;
    feeConfig: { feeHeads: string[] } | null;  // add this

}

export default function CollectFeeModal({
    isOpen,
    onClose,
    schoolId,
    studentId,
    record,
    refetch,
    feeConfig
}: CollectFeeModalProps) {
    // const collectFeeMutation = useCollectFee(); // Replace with your actual hook name
    const collectFeeMutation = useCollectFeev1(); // Replace with your actual hook name

    console.log("feeConfig student record", feeConfig)

    // Safe extraction of nested IDs
    const actualStudentId = typeof record?.studentId === 'object' ? record?.studentId?._id : record?.studentId;
    const actualClassId = typeof record?.classId === 'object' ? record?.classId?._id : record?.classId;
    const actualSectionId = typeof record?.sectionId === 'object' ? record?.sectionId?._id : record?.sectionId;

    const fDues = record?.duesv1;

    // --- State Management ---
    const [feeData, setFeeData] = useState({
        amount: '',
        paymentMode: 'cash',
        referenceNumber: '',
        bankName: '',
        chequeDate: '',
        remarks: '',
        manualDueAllocation: false,
        // paidHeads: {
        //     admissionFee: 0,
        //     firstTermAmt: 0,
        //     secondTermAmt: 0,
        //     busFirstTermAmt: 0,
        //     busSecondTermAmt: 0
        // }

        paidHeads: {} as Record<string, number>

    });


    

    const [denominations, setDenominations] = useState({
        notes500: 0, notes200: 0, notes100: 0, notes50: 0, notes20: 0, notes10: 0
    });

    const [feeFiles, setFeeFiles] = useState<FileList | null>(null);

    // --- Validations & Calculations ---
    const calculatedManualTotal = Object.values(feeData.paidHeads).reduce((a, b) => a + (Number(b) || 0), 0);
    const isManualValid = feeData.manualDueAllocation ? calculatedManualTotal === Number(feeData.amount) : true;

    const calculatedCashTotal =
        (denominations.notes500 * 500) +
        (denominations.notes200 * 200) +
        (denominations.notes100 * 100) +
        (denominations.notes50 * 50) +
        (denominations.notes20 * 20) +
        (denominations.notes10 * 10);

    const isCashValid = feeData.paymentMode === 'cash' ? calculatedCashTotal === Number(feeData.amount) : true;

    const canSubmit = Number(feeData.amount) > 0 && isManualValid && isCashValid;

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

        // Add Manual Allocation Data
        formData.append('manualDueAllocation', String(feeData.manualDueAllocation));
        if (feeData.manualDueAllocation) {
            formData.append('paidHeads', JSON.stringify(feeData.paidHeads));
        }

        // 1. If Cash, format and append the denominations
        if (feeData.paymentMode === 'cash') {
            const cashArray = [
                { label: "500", count: denominations.notes500 || 0 },
                { label: "200", count: denominations.notes200 || 0 },
                { label: "100", count: denominations.notes100 || 0 },
                { label: "50", count: denominations.notes50 || 0 },
                { label: "20", count: denominations.notes20 || 0 },
                { label: "10", count: denominations.notes10 || 0 },
            ];
            formData.append('cashDenominations', JSON.stringify(cashArray));
        }
        // 2. If Bank/UPI or Cheque, append those specific fields
        else {
            formData.append('referenceNumber', feeData.referenceNumber);
            formData.append('bankName', feeData.bankName);
            // Must strictly match the 'cheque' value from the select options
            if (feeData.paymentMode === 'cheque') {
                formData.append('chequeDate', feeData.chequeDate);
            }
        }

        // 3. Append the uploaded files
        if (feeFiles) {
            Array.from(feeFiles).forEach((file) => {
                formData.append('files', file); // Backend expects 'files' array
            });
        }

        try {
            await collectFeeMutation.mutateAsync(formData);

            // Reset everything on success
            setFeeData({
                amount: '', paymentMode: 'cash', referenceNumber: '', bankName: '', chequeDate: '', remarks: '', manualDueAllocation: false,
                // paidHeads: { admissionFee: 0, firstTermAmt: 0, secondTermAmt: 0, busFirstTermAmt: 0, busSecondTermAmt: 0 }
                paidHeads: {}

            });
            setFeeFiles(null);
            setDenominations({ notes500: 0, notes200: 0, notes100: 0, notes50: 0, notes20: 0, notes10: 0 });

            toast.success("Fee collected successfully!");
            refetch();
            onClose(); // Close modal last
        } catch (err: any) {
            toast.error(err?.message || "Fee collection failed. Please try again.");
        }
    };

    const totalDues = feeConfig?.feeHeads?.reduce((sum, head) => sum + Number(fDues?.[head] ?? 0), 0) ?? 0;

    // Performance Optimization: If modal is closed, don't render its heavy contents
    // if (!isOpen) return null;

    return (
        <SideModal isOpen={isOpen} onClose={onClose} title="Collect Fee">
            <form onSubmit={handleFeeSubmit} className="flex flex-col h-full space-y-6">
                <div className="space-y-5 overflow-y-auto custom-scrollbar pr-2 pb-4">

                    {/* Summary Box */}
                    <div className="bg-primary-soft/50 border border-primary/20 rounded-xl p-4 mb-2">
                        {/* <p className="text-sm font-semibold text-foreground">
                            Total Dues Available: ₹{(fDues?.admissionDues || 0) + (fDues?.firstTermDues || 0) + (fDues?.secondTermDues || 0) + (record?.isBusApplicable ? (fDues?.busfirstTermDues || 0) + (fDues?.busSecondTermDues || 0) : 0)}
                        </p> */}

                        <p className="text-sm font-semibold text-foreground">
                            Total Dues Available: ₹{totalDues}
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

                                {/* {fDues?.admissionDues > 0 && (
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
                                )} */}


                                {feeConfig?.feeHeads?.map((head) => {
                                    const due = Number(fDues?.[head] ?? 0);
                                    // if (due <= 0) return null;
                                    return (
                                        <Input
                                            key={head}
                                            id={`m_${head}`}
                                            type="number"
                                            label={`${head} (Max ₹${due})`}
                                            value={feeData.paidHeads[head] || ''}
                                            onChange={(e) => setFeeData({
                                                ...feeData,
                                                paidHeads: { ...feeData.paidHeads, [head]: Math.max(0, Number(e.target.value)) }
                                            })}
                                            max={due}
                                        />
                                    );
                                })}

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
                    <div className="flex flex-col gap-1.5 pt-2 px-2 border-t border-border">
                        <Label>Payment Mode</Label>
                        <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 outline-none" value={feeData.paymentMode} onChange={(e) => setFeeData({ ...feeData, paymentMode: e.target.value })}>
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cheque">Cheque</option>
                            <option value="upi">UPI</option>
                        </select>
                    </div>

                    {/* --- CASH DENOMINATIONS UI --- */}
                    {feeData.paymentMode === 'cash' && (
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
                    {(feeData.paymentMode === 'bank_transfer' || feeData.paymentMode === 'upi' || feeData.paymentMode === 'cheque') && (
                        <div className="space-y-4 bg-background border border-border rounded-xl p-4">
                            <Input id="referenceNumber" label={feeData.paymentMode === 'upi' ? "Upi ID" : "Reference / Cheque Number"} value={feeData.referenceNumber} onChange={(e) => setFeeData({ ...feeData, referenceNumber: e.target.value })} required />
                            <Input id="bankName" label="Bank Name" value={feeData.bankName} onChange={(e) => setFeeData({ ...feeData, bankName: e.target.value })} required />

                            {feeData.paymentMode === 'cheque' && (
                                <Input id="chequeDate" type="date" label="Cheque Date" value={feeData.chequeDate} onChange={(e) => setFeeData({ ...feeData, chequeDate: e.target.value })} required />
                            )}
                        </div>
                    )}

                    {/* --- UPLOADS & REMARKS --- */}
                    <div className="flex flex-col gap-1.5">
                        <Label>Upload Bill/Attachments (Optional)</Label>
                        <input type="file" multiple onChange={(e) => setFeeFiles(e.target.files)} className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-soft file:text-primary cursor-pointer" />
                    </div>
                    <Input id="remarks" label="Remarks / Note" value={feeData.remarks} onChange={(e) => setFeeData({ ...feeData, remarks: e.target.value })} />
                </div>

                {/* --- SUBMIT FOOTER --- */}
                <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-border bg-surface">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" isLoading={collectFeeMutation.isPending} disabled={!canSubmit}>Process Payment</Button>
                </div>
            </form>
        </SideModal>
    );
}