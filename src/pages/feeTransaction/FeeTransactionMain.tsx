import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

// UI Components
import { useGetAllFeeTransactions, useGetFeeTransactionById, useUpdateFeeReceiptStatus } from '../../api_services/feeTransaction_api/feeTransactionApi';

// UI Components
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../shared/ui/TableLayout';
import { SideModal } from '../../shared/ui/SideModal';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { toast } from '../../shared/ui/ToastContext';
import { useAuthData } from '../../hooks/useAuthData';

export default function FeeTransactionMain() {
    const { studentId, id } = useParams<{ studentrecordId: string; studentId: string; id: string }>();
    const [searchParams, setSearchParams] = useSearchParams(); // 🌟 ADD THIS

    const { schoolId } = useAuthData()

    // console.log("studentId", studentId)
    // 1. Table State (Backend Data)
    const {
        data: transactions,
        isLoading,
        isError
    } = useGetAllFeeTransactions({ studentId: studentId || id, schoolId: schoolId! });

    const updateStatusMutation = useUpdateFeeReceiptStatus();
    const [statusUpdateMode, setStatusUpdateMode] = useState<boolean>(false);
    const [updateRemarks, setUpdateRemarks] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>(''); // NEW STATE

    // 2. Frontend Filter State
    const [filters, setFilters] = useState({
        searchQuery: '',
        status: '',
        paymentMode: '',
        paymentDate: ''
    });

    // 3. Apply Frontend Filters
    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];

        return transactions.filter((txn: any) => {
            // Receipt Search (Case insensitive)
            const matchesSearch = txn.receiptNo?.toLowerCase().includes(filters.searchQuery.toLowerCase());

            // Status Match
            const matchesStatus = filters.status ? txn.status === filters.status : true;

            // Payment Mode Match
            const matchesMode = filters.paymentMode ? txn.paymentMode === filters.paymentMode : true;

            // Date Match (Compare YYYY-MM-DD strings)
            let matchesDate = true;
            if (filters.paymentDate) {
                const txnDate = new Date(txn.paymentDate || txn.createdAt).toISOString().split('T')[0];
                matchesDate = txnDate === filters.paymentDate;
            }

            return matchesSearch && matchesStatus && matchesMode && matchesDate;
        });
    }, [transactions, filters]);

    // 4. Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);

    useEffect(() => {
        const receiptId = searchParams.get('receiptId');
        if (receiptId) {
            setSelectedTxnId(receiptId);
            setIsModalOpen(true);
        }
    }, [searchParams]);

    const {
        data: singleTxn,
        isFetching: isSingleLoading
    } = useGetFeeTransactionById(selectedTxnId);

    // --- Handlers ---
    const handleViewReceipt = (id: string) => {
        setSelectedTxnId(id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setStatusUpdateMode(false); // 🌟 Reset mode
        setUpdateRemarks('');
        setTimeout(() => setSelectedTxnId(null), 300);

        // 🌟 NEW: Remove the receiptId from the URL without reloading the page
        if (searchParams.get('receiptId')) {
            searchParams.delete('receiptId');
            setSearchParams(searchParams, { replace: true });
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // 🌟 Dedicated Handler for Status Update
    const handleStatusUpdate = async () => {
        if (!selectedStatus) {
            return toast.error("Please select a status to update.");
        }

        // 🌟 Safeguard warning for BOTH bounced and cancelled
        if (selectedStatus === 'bounced' || selectedStatus === 'cancelled') {
            const actionText = selectedStatus === 'bounced' ? 'bounced' : 'cancelled';
            if (!window.confirm(`Marking this transaction as ${actionText} will reverse the fee payment and update the student's dues. Continue?`)) {
                return;
            }
        }

        try {
            // Using mutateAsync to properly catch errors in the block
            await updateStatusMutation.mutateAsync({
                id: singleTxn?._id!,
                status: selectedStatus,
                remarks: updateRemarks
            });

            toast.success(`Transaction successfully marked as ${selectedStatus}.`);

            // Clean up and close panel on success
            setStatusUpdateMode(false);
            setSelectedStatus('');
            setUpdateRemarks('');

        } catch (error: any) {
            toast.error(error.message || "Failed to update transaction status.");
        }
    };

    // --- Dropdown Options ---
    const statusOptions = [
        { label: 'All Statuses', value: '' },
        { label: 'Success', value: 'success' },
        { label: 'Pending', value: 'pending' },
        { label: 'Bounced', value: 'bounced' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Draft', value: 'draft' }
    ];

    const updateActionOptions = [
        { label: 'Cleared (Success)', value: 'success' },
        { label: 'Bounced (Failed)', value: 'bounced' },
        { label: 'Cancelled', value: 'cancelled' }
    ];


    const paymentModeOptions = [
        { label: 'All Modes', value: '' },
        { label: 'Cash', value: 'cash' },
        { label: 'UPI', value: 'upi' },
        { label: 'Cheque', value: 'cheque' },
        { label: 'Bank Transfer', value: 'bank_transfer' } // Kept original value, clean label
    ];

    // --- Helpers ---
    const renderStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'success':
                return <span className="px-2.5 py-1 bg-success/10 text-success border border-success/20 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">Success</span>;
            case 'failed':
            case 'bounced':
                return <span className="px-2.5 py-1 bg-danger/10 text-danger border border-danger/20 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">{status}</span>;
            case 'pending':
                return <span className="px-2.5 py-1 bg-warning/10 text-warning border border-warning/20 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">Pending</span>;
            case 'refunded':
            case 'cancelled':
                return <span className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">{status}</span>;
            case 'draft':
                return <span className="px-2.5 py-1 bg-surface text-muted border border-border rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">Draft</span>;
            default:
                return <span className="px-2.5 py-1 bg-background text-muted border border-border rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">{status || 'Unknown'}</span>;
        }
    };

    return (
        <div className="w-full h-full flex flex-col space-y-4 animate-in fade-in duration-300">

            {/* --- HEADER & FILTERS --- */}
            {/* --- HEADER & FILTERS --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0 pb-2">

                {/* Title */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-file-invoice-dollar text-primary"></i>
                        Fee Transactions
                    </h1>
                    <p className="text-sm text-muted mt-1">Payment history and receipts for this academic record.</p>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full lg:w-auto">

                    <div className="w-full sm:w-48 shrink-0">
                        <Input
                            id="searchReceipt"
                            placeholder="Search Receipt No..."
                            leftIcon="fas fa-search"
                            value={filters.searchQuery}
                            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                        />
                    </div>

                    <div className="w-full sm:w-36 shrink-0">
                        <SearchSelect
                            label=""
                            placeholder="All Modes"
                            options={paymentModeOptions}
                            value={filters.paymentMode}
                            onChange={(opt: any) => handleFilterChange('paymentMode', String(opt?.value || ''))}
                        />
                    </div>

                    <div className="w-full sm:w-36 shrink-0">
                        <SearchSelect
                            label=""
                            placeholder="All Statuses"
                            options={statusOptions}
                            value={filters.status}
                            onChange={(opt: any) => handleFilterChange('status', String(opt?.value || ''))}
                        />
                    </div>

                    <div className="w-full sm:w-36 shrink-0">
                        <Input
                            id="paymentDate"
                            type="date"
                            value={filters.paymentDate}
                            onChange={(e) => handleFilterChange('paymentDate', e.target.value)}
                        />
                    </div>

                    {/* Clear Filters Button */}
                    {(filters.searchQuery || filters.status || filters.paymentMode || filters.paymentDate) && (
                        <button
                            onClick={() => setFilters({ searchQuery: '', status: '', paymentMode: '', paymentDate: '' })}
                            className="text-xs text-danger font-medium hover:underline shrink-0"
                        >
                            Clear
                        </button>
                    )}
                </div>

            </div>

            {/* --- TABLE AREA --- */}
            <div className="flex-1 bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col relative">
                <TableContainer className="h-full overflow-auto custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                        <THead className="sticky top-0 z-10 bg-background shadow-sm border-b border-border">
                            <tr>
                                <Th>Date</Th>
                                <Th>Receipt No.</Th>
                                <Th>Bill No</Th>
                                <Th>Amount</Th>
                                <Th>Mode</Th>
                                <Th>Status</Th>
                                <Th className="text-right">Action</Th>
                            </tr>
                        </THead>
                        <TBody >
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-20">
                                        <div className="flex flex-col items-center justify-center w-full">
                                            <i className="fas fa-circle-notch fa-spin text-primary text-2xl mb-3"></i>
                                            <p className="text-sm text-muted font-medium">Loading transactions...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : isError ? (
                                <tr>
                                    <td colSpan={6} className="py-20 bg-danger/5">
                                        <div className="flex flex-col items-center justify-center w-full text-danger">
                                            <i className="fas fa-exclamation-circle text-2xl mb-3 opacity-80"></i>
                                            <p className="font-medium">Failed to load transactions. Please try again.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-24">
                                        {/* FIX: Centered div inside the table cell */}
                                        <div className="flex flex-col items-center justify-center text-center text-muted w-full mx-auto">
                                            <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4 shadow-sm">
                                                <i className="fas fa-receipt text-2xl text-muted/50"></i>
                                            </div>
                                            <p className="font-medium text-foreground">No transactions found</p>
                                            <p className="text-xs mt-1">
                                                {transactions && transactions.length > 0
                                                    ? "No transactions match your current filters."
                                                    : "There are no fee records available for this student."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((txn: any) => (
                                    <Tr key={txn._id} className="hover:bg-background/80 transition-colors group">
                                        <Td className="text-muted text-xs">
                                            {new Date(txn.paymentDate || txn.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </Td>
                                        <Td className="font-semibold text-primary">{txn.receiptNo}</Td>
                                        <Td className="font-semibold text-primary">{txn?.billNo}</Td>
                                        <Td className="font-bold text-foreground">₹{txn.amountPaid?.toLocaleString()}</Td>
                                        <Td>
                                            <span className="flex items-center gap-1.5 text-xs text-muted font-medium capitalize bg-surface border border-border px-2 py-0.5 rounded shadow-sm w-fit">
                                                {txn.paymentMode === 'cash' && <i className="fas fa-money-bill-wave text-success"></i>}
                                                {txn.paymentMode === 'upi' && <i className="fas fa-mobile-alt text-primary"></i>}
                                                {txn.paymentMode === 'cheque' && <i className="fas fa-money-check text-warning"></i>}
                                                {txn.paymentMode === 'bank_transfer' && <i className="fas fa-university text-foreground"></i>}
                                                {txn.paymentMode ? txn.paymentMode.replace('_', ' ') : 'N/A'}
                                            </span>
                                        </Td>
                                        <Td>{renderStatusBadge(txn.status)}</Td>
                                        <Td className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewReceipt(txn._id)}
                                                className=""
                                            >
                                                View Receipt
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </TBody>
                    </table>
                </TableContainer>
            </div>

            {/* =========================================================
                RECEIPT DETAILS MODAL
            ========================================================= */}
            <SideModal isOpen={isModalOpen} onClose={handleCloseModal} title="Transaction Details">

                {/* LOCALIZED PRINT STYLES - Only affects this specific receipt print */}
                {/* LOCALIZED PRINT STYLES - Centered and full width */}
                <style media="print">
                    {`
                        @page {
                            size: A4 portrait;
                            margin: 15mm auto;
                        }
                        
                        /* Hide everything on the screen */
                        body * {
                            visibility: hidden;
                        }
                        
                        /* Make ONLY the receipt visible */
                        #printable-receipt, #printable-receipt * {
                            visibility: visible;
                        }
                        
                        /* Break out of the SideModal and center it on the paper */
                        #printable-receipt {
                            position: fixed !important;
                            left: 0 !important;
                            right: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            max-width: 700px !important; /* Keeps it readable, not stretched */
                            margin: 0 auto !important; /* Centers horizontally */
                            transform: none !important; /* Removes drawer slide animations */
                            overflow: visible !important;
                            padding: 0 20px !important;
                        }

                        /* Force browsers to print background colors and badges properly */
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    `}
                </style>

                <div className="flex flex-col h-full">
                    {isSingleLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted">
                            <i className="fas fa-circle-notch fa-spin text-3xl text-primary mb-4"></i>
                            <p className="text-sm font-medium">Retrieving receipt data...</p>
                        </div>
                    ) : !singleTxn ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted text-sm">
                            <i className="fas fa-file-excel text-3xl mb-3 opacity-30"></i>
                            <p>Receipt details not available.</p>
                        </div>
                    ) : (
                        // ADDED ID: printable-receipt
                        <div id="printable-receipt" className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 pb-6 animate-in fade-in duration-200">

                            {/* 1. Big Highlight Header */}
                            <div className="flex flex-col items-center justify-center p-6 bg-background border border-border rounded-xl text-center shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-success/5 rounded-tr-[100px] pointer-events-none"></div>

                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-3 shadow-sm ${singleTxn.status === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                                    <i className={`fas ${singleTxn.status === 'success' ? 'fa-check' : 'fa-exclamation'}`}></i>
                                </div>
                                <h3 className="text-3xl font-bold text-foreground tracking-tight">₹{singleTxn.amountPaid?.toLocaleString()}</h3>
                                <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] mt-1">{singleTxn.status} Payment</p>
                            </div>

                            {/* 🌟 Status Update Panel (Only for Pending Cheques/Transfers) */}
                            {/* 🌟 Status Update Panel (Only for Pending Cheques/Transfers) */}
                            {singleTxn.status === 'pending' && (singleTxn.paymentMode === 'cheque' || singleTxn.paymentMode === 'bank_transfer') && (
                                <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 shadow-sm print:hidden">
                                    <h4 className="text-xs font-bold text-warning-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <i className="fas fa-tasks"></i> Pending Verification
                                    </h4>
                                    <p className="text-xs text-muted mb-4">Update the status once the {singleTxn.paymentMode.replace('_', ' ')} has cleared or bounced.</p>

                                    {!statusUpdateMode ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-warning-800 border-warning-800 hover:bg-warning hover:text-white"
                                            onClick={() => setStatusUpdateMode(true)}
                                        >
                                            Update Status
                                        </Button>
                                    ) : (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">

                                            {/* Container to make inputs look neat together */}
                                            <div className="bg-surface rounded-lg border border-border p-3 space-y-3">
                                                <SearchSelect
                                                    label="Select New Status"
                                                    placeholder="Choose action..."
                                                    options={updateActionOptions}
                                                    value={selectedStatus}
                                                    onChange={(opt: any) => setSelectedStatus(opt?.value || '')}
                                                />

                                                <Input
                                                    id="statusRemarks"
                                                    label="Remarks (Optional)"
                                                    placeholder="Add reference or bounce reason..."
                                                    value={updateRemarks}
                                                    onChange={(e) => setUpdateRemarks(e.target.value)}
                                                />
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    className="flex-1"
                                                    isLoading={updateStatusMutation.isPending}
                                                    disabled={!selectedStatus}
                                                    onClick={handleStatusUpdate}
                                                >
                                                    <i className="fas fa-save mr-2"></i> Save Update
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => {
                                                        setStatusUpdateMode(false);
                                                        setSelectedStatus('');
                                                        setUpdateRemarks('');
                                                    }}
                                                    disabled={updateStatusMutation.isPending}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 2. Core Transaction Details Box */}
                            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                                <div className="px-4 py-3 border-b border-border bg-background/50 flex items-center gap-2">
                                    <i className="fas fa-info-circle text-muted text-xs"></i>
                                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Transaction Info</h4>
                                </div>
                                <div className="p-4 space-y-4 text-sm">
                                    <div className="flex justify-between items-center border-b border-border/50 pb-3">
                                        <span className="text-muted text-xs">Receipt No.</span>
                                        <span className="font-bold text-primary bg-primary/5 px-2 py-1 rounded border border-primary/10">{singleTxn.receiptNo}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-border/50 pb-3">
                                        <span className="text-muted text-xs">Bill No.</span>
                                        <span className="font-bold text-primary bg-primary/5 px-2 py-1 rounded border border-primary/10">{singleTxn.billNo || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-border/50 pb-3">
                                        <span className="text-muted text-xs">Date & Time</span>
                                        <span className="font-medium text-foreground">
                                            {new Date(singleTxn.paymentDate || singleTxn.createdAt).toLocaleString('en-IN', {
                                                dateStyle: 'medium', timeStyle: 'short'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-border/50 pb-3">
                                        <span className="text-muted text-xs">Payment Mode</span>
                                        <span className="font-medium text-foreground capitalize flex items-center gap-2">
                                            {singleTxn.paymentMode ? singleTxn.paymentMode.replace('_', ' ') : 'N/A'}
                                        </span>
                                    </div>

                                    {(singleTxn.paymentMode === 'cheque' || singleTxn.paymentMode === 'bank_transfer' || singleTxn.paymentMode === 'upi') && (
                                        <div className="bg-background border border-border p-3 rounded-lg space-y-2 mt-2">
                                            {singleTxn.referenceNumber && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-muted">Ref/Cheque No:</span>
                                                    <span className="font-semibold text-foreground">{singleTxn.referenceNumber}</span>
                                                </div>
                                            )}
                                            {singleTxn.bankName && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-muted">Bank Name:</span>
                                                    <span className="font-semibold text-foreground">{singleTxn.bankName}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3. Fee Allocation Breakdown */}
                            {singleTxn.allocation && singleTxn.allocation.length > 0 && (
                                <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                                    <div className="px-4 py-3 border-b border-border bg-background/50 flex items-center gap-2">
                                        <i className="fas fa-list-ul text-muted text-xs"></i>
                                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Fee Allocation</h4>
                                    </div>
                                    <div className="p-4 space-y-3 text-sm">
                                        {singleTxn.allocation.map((alloc: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <span className="text-muted text-xs font-medium">{alloc.feeHead || 'General Fee'}</span>
                                                <span className="font-medium text-foreground">₹{alloc.amount?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div className="pt-3 mt-2 border-t border-dashed border-border flex justify-between items-center">
                                            <span className="font-bold text-foreground text-xs uppercase tracking-wider">Total Allocated</span>
                                            <span className="font-bold text-foreground">₹{singleTxn.amountPaid?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 4. Uploaded Proofs (Hidden during print because links don't matter on paper) */}
                            {singleTxn.proofUpload && singleTxn.proofUpload.length > 0 && (
                                <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm print:hidden">
                                    <div className="px-4 py-3 border-b border-border bg-background/50 flex items-center gap-2">
                                        <i className="fas fa-paperclip text-muted text-xs"></i>
                                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Attached Proofs</h4>
                                    </div>
                                    <div className="p-4 grid grid-cols-2 gap-3">
                                        {singleTxn.proofUpload.map((doc: any, index: number) => (
                                            <a
                                                key={index}
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-2 border border-border rounded-lg hover:bg-background transition-colors group"
                                            >
                                                <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-inverse transition-colors">
                                                    <i className={`fas ${doc.type === 'pdf' ? 'fa-file-pdf' : 'fa-image'}`}></i>
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-xs font-semibold text-foreground truncate">{doc.originalName || 'Document'}</p>
                                                    <p className="text-[10px] text-muted capitalize">{doc.type}</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 5. Cash Denominations */}
                            {singleTxn.paymentMode === 'cash' && singleTxn.cashDenominations && singleTxn.cashDenominations.length > 0 && (
                                <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                                    <div className="px-4 py-3 border-b border-border bg-background/50 flex items-center gap-2">
                                        <i className="fas fa-money-bill text-muted text-xs"></i>
                                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Cash Breakdown</h4>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {singleTxn.cashDenominations.map((denom: any, index: number) => {
                                                if (denom.count === 0) return null;
                                                return (
                                                    <div key={index} className="flex items-center gap-1.5 bg-background border border-border px-2 py-1 rounded shadow-sm">
                                                        <span className="font-semibold text-success text-xs">₹{denom.label}</span>
                                                        <span className="text-[10px] text-muted">x</span>
                                                        <span className="font-bold text-foreground text-xs">{denom.count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 6. Remarks Box */}
                            {singleTxn.remarks && (
                                <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl shadow-sm">
                                    <p className="text-xs text-warning-800 font-bold uppercase tracking-wider mb-1">
                                        <i className="fas fa-comment-dots mr-1.5"></i>Remarks
                                    </p>
                                    <p className="text-sm text-foreground">{singleTxn.remarks}</p>
                                </div>
                            )}

                        </div>
                    )}

                    {/* --- Modal Actions (ADDED print:hidden) --- */}
                    <div className="shrink-0 pt-4 border-t border-border mt-auto flex justify-end gap-3 bg-surface z-10 print:hidden">
                        <Button variant="outline" onClick={handleCloseModal}>Close</Button>
                        {/* <Button
                            variant="primary"
                            leftIcon="fas fa-print"
                            disabled={isSingleLoading || !singleTxn}
                            onClick={() => {
                                setTimeout(() => window.print(), 100);
                            }}
                        >
                            Print Receipt
                        </Button> */}
                    </div>
                </div>
            </SideModal>
        </div >
    );
}