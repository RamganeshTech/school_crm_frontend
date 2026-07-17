import React, { useEffect, useState } from 'react';
import { SideModal } from '../../../shared/ui/SideModal'; // Adjust path
import { Input, Label } from '../../../shared/ui/Input'; // Adjust path
import { Button } from '../../../shared/ui/Button'; // Adjust path
import { Toggle } from '../../../shared/ui/Toggle'; // Adjust path
import { toast } from '../../../shared/ui/ToastContext'; // Adjust path
import { useCollectFeev1 } from '../../../api_services/student_api/studentRecordApi';
import type { FeeHeadItem } from '../../../api_services/feeStructure_api/feeStructureConfigApi';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { useGetAllBusRoutesDropDown } from '../../../api_services/transport_api/busRouteApi';
// import { useCollectFeeAndManageRecord } from '../../../api_services/feeStructure_api/feeStructureApi'; // Adjust path to actual mutation hook

interface CollectFeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedAcademicYear: string
    schoolId: string;
    studentId: string;
    record: any; // The student record data
    refetch: () => void;
    feeConfig: { feeHeads: FeeHeadItem[] } | null;  // add this

}

// export const BUS_FEE_HEADS = ["busFirstTerm", "busSecondTerm", "busThirdTerm"];
export const BUS_FEE_HEADS = ["bus first term", "bus second term", "bus third term"];



export default function CollectFeeModal({
    isOpen,
    onClose,
    selectedAcademicYear,
    schoolId,
    studentId,
    record,
    refetch,
    feeConfig
}: CollectFeeModalProps) {
    // const collectFeeMutation = useCollectFee(); // Replace with your actual hook name
    const collectFeeMutation = useCollectFeev1(); // Replace with your actual hook name

    // console.log("feeConfig student record", feeConfig)


    // Fetch Bus Routes
    const { data: busRoutes } = useGetAllBusRoutesDropDown({ schoolId });
    const busRouteOptions = busRoutes?.map((route: any) => ({
        value: route._id,
        label: route.routeName
    })) || [];


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
        paidHeads: {} as Record<string, number>,
        // isBusApplicable: false,
        // busPoint: ""
    });




    const [denominations, setDenominations] = useState({
        notes500: 0, notes200: 0, notes100: 0, notes50: 0, notes20: 0, notes10: 0
    });

    const [feeFiles, setFeeFiles] = useState<FileList | null>(null);

    // Transport States (Initialized from existing record if available)
    const [isBusApplicable, setIsBusApplicable] = useState(false);
    const [busPoint, setBusPoint] = useState<string>('');

    // --- Validations & Calculations ---
    const calculatedManualTotal = Object.values(feeData.paidHeads).reduce((a, b) => a + (Number(b) || 0), 0);
    const isManualValid = feeData.manualDueAllocation ? calculatedManualTotal === Number(feeData.amount) : true;

    const selectedBusRoute = (busRoutes || [])?.find((route: any) => String(route._id) === String(busPoint));
    const selectedRouteFeeAmount = Number(selectedBusRoute?.feeAmount || 0);

    const calculatedCashTotal =
        (denominations.notes500 * 500) +
        (denominations.notes200 * 200) +
        (denominations.notes100 * 100) +
        (denominations.notes50 * 50) +
        (denominations.notes20 * 20) +
        (denominations.notes10 * 10);

    const isCashValid = feeData.paymentMode === 'cash' ? calculatedCashTotal === Number(feeData.amount) : true;

    const isBusValid = !isBusApplicable || (isBusApplicable && busPoint);
    const canSubmit = Number(feeData.amount) > 0 && isManualValid && isCashValid && isBusValid;

    // Sync initial state when record changes
    useEffect(() => {
        if (record) {
            setIsBusApplicable(record.isBusApplicable || false);
            setBusPoint(record.busPoint?._id || record.busPoint || '');
        }
    }, [record]);

    // --- Dynamic Heads Calculation ---
    const effectiveHeadsToRender = [...(feeConfig?.feeHeads?.map(h => h.feeHead) || [])];
    if (isBusApplicable) {
        effectiveHeadsToRender.push(...BUS_FEE_HEADS);
    }



    // --- Submit Handler ---
    const handleFeeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schoolId || !studentId || !record) return;

        if (!selectedAcademicYear) {
            toast.error("Select the Academic Year")
            return;
        }

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
        formData.append('academicYear', selectedAcademicYear);
        // formData.append('isBusApplicable', selectedAcademicYear);
        // formData.append('academicYear', selectedAcademicYear);

        // 🌟 Append Transport Details
        formData.append('isBusApplicable', String(isBusApplicable));
        if (isBusApplicable && busPoint) {
            formData.append('busPoint', busPoint);
        }

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

            setIsBusApplicable(record?.isBusApplicable || false);
            setBusPoint(record?.busPoint?._id || record?.busPoint || '');

            toast.success("Fee collected successfully!");
            refetch();
            onClose(); // Close modal last
        } catch (err: any) {
            toast.error(err?.message || "Fee collection failed. Please try again.");
        }
    };

    // const totalDues = feeConfig?.feeHeads?.reduce((sum, headObj) => sum + Number(fDues?.[headObj.feeHead] ?? 0), 0) ?? 0;
    const totalDues = effectiveHeadsToRender.reduce((sum, headName) => sum + Number(fDues?.[headName] ?? 0), 0) ?? 0;


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


                    <div className="bg-background border border-border rounded-xl p-4 space-y-4">
                        <Toggle
                            checked={isBusApplicable}
                            // onChange={(checked) => setIsBusApplicable(checked)}
                            onChange={(checked) => {
                                setIsBusApplicable(checked);
                                if (!checked) {
                                    // Wipe out bus-related payments and reset the dropdown if turned off
                                    setFeeData((prev) => {
                                        const newPaidHeads = { ...prev.paidHeads };
                                        BUS_FEE_HEADS.forEach((head) => delete newPaidHeads[head]);
                                        return { ...prev, paidHeads: newPaidHeads };
                                    });
                                    setBusPoint('');
                                }
                            }}
                            label="Bus / Transport Applicable"
                            description="Enable to assign a bus point and include transport dues."
                        />

                        {isBusApplicable && (
                            <div className="pt-3 border-t border-border animate-in fade-in slide-in-from-top-2">
                                <Label className="mb-1.5 block">Bus Route Point</Label>
                                <SearchSelect
                                    options={busRouteOptions}
                                    // value={busRouteOptions.find((opt: any) => opt.value === busPoint) || null}
                                    value={busRouteOptions.find((opt: any) => String(opt.value) === String(busPoint)) || null}
                                    onChange={(selected: any) => setBusPoint(selected?.value || '')}
                                    placeholder="Select Bus Route..."
                                />
                                {!busPoint && (
                                    <p className="text-xs text-danger mt-1">Please select a bus point to proceed.</p>
                                )}
                            </div>
                        )}
                    </div>


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

                                {/* {feeConfig?.feeHeads?.map((headObj, index) => {
                                    const headName = headObj.feeHead; // 🌟 Extract string value
                                    const due = Number(fDues?.[headName] ?? 0); */}

                                {effectiveHeadsToRender.map((headName, index) => {
                                    // const due = Number(fDues?.[headName] ?? 0);

                                    const isBusHead = BUS_FEE_HEADS.includes(headName);
                                    const hasExistingStructure = Number(record?.feeStructurev1?.[headName] ?? 0) > 0;

                                    // 🌟 If it's a bus head and the structure isn't in the DB yet, fallback to the route's fee
                                    const due = (isBusHead && !hasExistingStructure)
                                        ? selectedRouteFeeAmount
                                        : Number(fDues?.[headName] ?? 0);

                                    // if (due <= 0) return null;

                                    return (
                                        <Input
                                            key={`${headName}-${index}`}
                                            // id={`m_${headName}`}
                                            id={`m_${headName.replace(/\s+/g, '_')}`} // 🌟 Replaces spaces with underscores
                                            type="number"
                                            label={`${headName} (Max ₹${due})`}
                                            value={feeData.paidHeads[headName] || ''}
                                            onChange={(e) => setFeeData({
                                                ...feeData,
                                                paidHeads: {
                                                    ...feeData.paidHeads,
                                                    [headName]: Math.max(0, Number(e.target.value))
                                                }
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