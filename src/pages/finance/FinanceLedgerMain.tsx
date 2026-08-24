import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
// import { 
//     useGetAllTransactionsInfinite, 
//     useGetTransactionById 
// } from '../../api_services/finance_api/financeApi'; // Adjust path
import { Input, Label } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../shared/ui/TableLayout';
import { SideModal } from '../../shared/ui/SideModal';
import { useGetSchoolById } from '../../api_services/schoolConfig_api/schoolapi';
import { useGetAllTransactionsInfinite, useGetTransactionById } from '../../api_services/financeApi/financeApi';
import { getAcademicYears } from '../../utils/utils';
import { useSearchParams } from 'react-router-dom';
import useDebounce from '../../hooks/useDebounce';

// --- Filter Options ---
const TXN_TYPES = [
    { label: 'All Types', value: '' },
    { label: 'Credit (Income)', value: 'CREDIT' },
    { label: 'Debit (Expense)', value: 'DEBIT' },
];

const ACCOUNT_TYPES = [
    { label: 'All Accounts', value: '' },
    { label: 'Cash in Hand', value: 'CASH_IN_HAND' },
    { label: 'Bank Account', value: 'BANK_ACCOUNT' },
];

const STATUS_OPTIONS = [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Cancelled', value: 'cancelled' },
];

export default function FinanceLedgerMain() {
    const { schoolId } = useAuthData();
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const { data: schoolData } = useGetSchoolById(schoolId!);
    const currentAcademicYear = schoolData?.currentAcademicYear || "";

    // --- State: Filters (30% Pane) ---
    const [filters, setFilters] = useState({
        transactionType: '',
        accountType: '',
        search: '',
        academicYear: "",
        status: 'active', // Default to active
        fromDate: '',
        toDate: '',
    });

    const academicYearOptions = getAcademicYears();


    // --- State: Modal & Selected ID ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTxnId, setSelectedTxnId] = useState<string | undefined>(undefined);

    // 👇 NEW: Read ledgerId from URL and auto-open modal
    const [searchParams, setSearchParams] = useSearchParams();
    const ledgerIdFromUrl = searchParams.get('ledgerId');

    useEffect(() => {
        if (ledgerIdFromUrl) {
            setSelectedTxnId(ledgerIdFromUrl);
            setIsModalOpen(true);
        }
    }, [ledgerIdFromUrl]);


    const debouncedSearch = useDebounce(filters.search, 500)
    // --- Queries ---
    // 1. Get All Transactions (Infinite Scroll)
    const {
        data: transactionsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isListLoading
    } = useGetAllTransactionsInfinite({
        schoolId: schoolId!,
        academicYear: currentAcademicYear || undefined,
        search: debouncedSearch || undefined, // 👈 NEW
        transactionType: filters.transactionType as any || undefined,
        accountType: filters.accountType as any || undefined,
        status: filters.status as any || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
    });

    const allTransactions = useMemo(() => {
        return transactionsData?.pages.flatMap(page => page.data || []) || [];
    }, [transactionsData]);

    // 2. Get Single Transaction (Runs only when selectedTxnId is set)
    const {
        data: singleTxnData,
        isLoading: isSingleLoading
    } = useGetTransactionById(selectedTxnId);

    // --- Handlers ---
    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));

        setTimeout(() => {
            setSelectedTxnId(undefined);

            // 👇 NEW: Remove ledgerId from the URL without reloading the page
            if (searchParams.has('ledgerId')) {
                searchParams.delete('ledgerId');
                setSearchParams(searchParams, { replace: true });
            }
        }, 300);
    };

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const handleViewDetails = (id: string) => {
        setSelectedTxnId(id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Small timeout to allow exit animation before clearing data
        setTimeout(() => setSelectedTxnId(undefined), 300);
    };

    return (
        <div className="w-full h-full flex flex-col gap-3 bg-background overflow-hidden">

            {/* HEADER */}
            <header className="shrink-0 px-4 lg:px-6 py-2 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface z-10 shadow-sm">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-book-open text-primary"></i>
                        Finance Ledger
                    </h1>
                    <p className="text-xs lg:text-sm text-muted mt-1">Master record of all credits, debits, and adjustments.</p>
                </div>

                {/* NEW: Mobile Filter Toggle Button */}
                <div className="w-full sm:w-auto lg:hidden">
                    <Button
                        variant="outline"
                        className="w-full justify-center"
                        leftIcon="fas fa-filter"
                        onClick={() => setIsMobileFilterOpen(true)}
                    >
                        Filters
                    </Button>
                </div>
            </header>

            {/* MAIN LAYOUT (20-80 SPLIT) */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                {/* MOBILE OVERLAY: Darkens background when drawer is open */}
                {isMobileFilterOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />
                )}

                {/* 20% LEFT: FILTERS PANE (Drawer on Mobile, Static on Desktop) */}
                <aside className={`
                    fixed inset-y-0 left-0 z-31 w-[280px] bg-surface p-4 flex flex-col gap-6 shadow-2xl transition-transform duration-300 ease-in-out
                    lg:static lg:w-[20%] lg:shrink-0 lg:border-r lg:border-border lg:bg-surface/50 lg:p-3 lg:shadow-none lg:translate-x-0
                    ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}
                    overflow-y-auto custom-scrollbar
                `}>
                    <div className="flex items-center justify-between lg:block">
                        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                            <i className="fas fa-filter text-primary"></i> Filter Records
                        </h2>
                        {/* Close button for mobile drawer */}
                        <button
                            className="lg:hidden text-muted hover:text-danger p-1"
                            onClick={() => setIsMobileFilterOpen(false)}
                        >
                            <i className="fas fa-xmark text-xl"></i>
                        </button>
                    </div>

                    <div className="space-y-4">

                        <Input
                            id="search"
                            type="text"
                            label="Search Ref No"
                            placeholder="e.g. FL-2026..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />


                        <SearchSelect
                            label='Transaction Type'
                            options={TXN_TYPES}
                            value={filters.transactionType}
                            onChange={(opt: any) => handleFilterChange('transactionType', opt?.value || '')}
                        />

                        <SearchSelect
                            label='Account Type'
                            options={ACCOUNT_TYPES}
                            value={filters.accountType}
                            onChange={(opt: any) => handleFilterChange('accountType', opt?.value || '')}
                        />
                        {/* </div> */}


                        <SearchSelect
                            label='Status'
                            options={STATUS_OPTIONS}
                            value={filters.status}
                            onChange={(opt: any) => handleFilterChange('status', opt?.value || '')}
                        />

                        <SearchSelect
                            label="Academic Year"
                            options={academicYearOptions}
                            value={filters.academicYear}
                            onChange={(opt) => handleFilterChange('academicYear', String(opt.value))}
                            placeholder="Select Year..." />

                        <div className="pt-2 border-t border-border space-y-4">
                            <Label className="uppercase text-[10px] tracking-wider text-muted">Date Range</Label>
                            <Input
                                id="fromDate"
                                type="date"
                                label="From Date"
                                value={filters.fromDate}
                                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                            />
                            <Input
                                id="toDate"
                                type="date"
                                label="To Date"
                                value={filters.toDate}
                                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                            />
                        </div>

                        <Button
                            variant="outline"
                            className="w-full mt-2"
                            onClick={() => setFilters({ search: "", transactionType: '', accountType: '', status: 'active', fromDate: '', toDate: '', academicYear: "" })}
                        >
                            Reset Filters
                        </Button>

                        {/* Mobile 'Apply' button to close drawer after filtering */}
                        <Button
                            variant="primary"
                            className="w-full lg:hidden mt-2"
                            onClick={() => setIsMobileFilterOpen(false)}
                        >
                            Apply Filters
                        </Button>
                    </div>
                </aside>

                {/* 80% RIGHT: TABLE LIST PANE */}
                <main className="flex-1 w-full lg:w-[80%] px-2 lg:px-6 py-3 flex flex-col overflow-hidden bg-background">
                    {isListLoading ? (
                        <div className="flex flex-1 justify-center items-center">
                            <i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i>
                        </div>
                    ) : allTransactions.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center text-muted">
                            <i className="fas fa-receipt text-5xl opacity-30 mb-4"></i>
                            <h2 className="text-lg font-bold text-foreground">No Transactions Found</h2>
                            <p className="text-sm mt-1 text-center">Adjust your filters to see more results.</p>
                        </div>
                    ) : (
                        <TableContainer onScroll={handleScroll} className="h-full custom-scrollbar overscroll-none">
                            <THead className="sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <Th>S.No</Th>
                                    <Th>Ref No</Th>
                                    <Th>Date</Th>
                                    <Th>Type</Th>
                                    <Th>Mode</Th>
                                    <Th className="text-right">Amount</Th>
                                    <Th className="text-center pr-6">Action</Th>
                                </tr>
                            </THead>
                            <TBody>
                                <>
                                    {allTransactions.map((txn, idx: number) => (
                                        <Tr key={txn._id} className="hover:bg-primary-soft/20 transition-colors">
                                            <Td className="font-medium whitespace-nowrap text-muted">{idx + 1}</Td>
                                            <Td className="font-medium whitespace-nowrap text-muted">{txn?.referenceNo || "N/A"}</Td>

                                            <Td className="whitespace-nowrap font-medium text-foreground">
                                                {new Date(txn.date).toLocaleDateString('en-GB')}
                                            </Td>

                                            <Td>
                                                <span className={`px-2 py-1 text-[9px] rounded uppercase font-bold tracking-wider inline-flex items-center gap-1.5 border ${txn.transactionType === 'CREDIT'
                                                    ? 'bg-success/10 text-success border-success/20'
                                                    : 'bg-danger/10 text-danger border-danger/20'
                                                    }`}>
                                                    <i className={`fas ${txn.transactionType === 'CREDIT' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                                                    {txn.transactionType}
                                                </span>
                                            </Td>

                                            <Td>
                                                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                                                    {/* {txn.paymentMode.replace(/_/g, ' ')} */}
                                                    {txn.paymentMode?.replace(/_/g, ' ') || 'N/A'}
                                                </span>
                                            </Td>

                                            <Td className={`text-right font-bold whitespace-nowrap ${txn.status === 'cancelled' ? 'line-through opacity-50' : 'text-foreground'}`}>
                                                ₹ {txn?.amount?.toLocaleString()}
                                            </Td>

                                            <Td>
                                                <div className="flex items-center justify-end pr-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(txn._id)}
                                                    >
                                                        View
                                                    </Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))}

                                    {isFetchingNextPage && (
                                        <tr>
                                            <td colSpan={6} className="py-6 text-center">
                                                <i className="fas fa-circle-notch fa-spin text-primary text-xl"></i>
                                                <p className="text-xs text-muted mt-2">Loading older records...</p>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            </TBody>
                        </TableContainer>
                    )}
                </main>
            </div>

            {/* SIDE MODAL: SINGLE TRANSACTION DETAILS */}
            <SideModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Transaction Details"
            >
                <div className="flex flex-col h-full pr-2">
                    {isSingleLoading || !singleTxnData ? (
                        <div className="flex flex-1 justify-center items-center">
                            <i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i>
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-6 flex-1 overflow-y-auto custom-scrollbar pb-6">

                            {/* Top Status & Amount Banner */}
                            <div className={`p-5 rounded-xl border ${singleTxnData.status === 'cancelled'
                                ? 'bg-surface border-border opacity-70'
                                : singleTxnData.transactionType === 'CREDIT'
                                    ? 'bg-success/5 border-success/20'
                                    : 'bg-danger/5 border-danger/20'
                                }`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${singleTxnData.status === 'cancelled' ? 'bg-surface text-muted border-border' :
                                        singleTxnData.transactionType === 'CREDIT' ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'
                                        }`}>
                                        {singleTxnData.status === 'cancelled' ? 'CANCELLED' : singleTxnData.transactionType}
                                    </span>
                                    {/* <span className="text-xs font-bold text-muted uppercase">
                                        {singleTxnData.accountType?.replace(/_/g, ' ') || 'N/A'}
                                    </span> */}
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-muted mb-1">Total Amount</p>
                                    <h2 className={`text-3xl font-bold tracking-tight ${singleTxnData.status === 'cancelled' ? 'line-through text-muted' : 'text-foreground'}`}>
                                        ₹ {singleTxnData.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                                    </h2>
                                </div>
                            </div>

                            {/* Core Details Grid */}
                            <div className="bg-surface border border-border rounded-xl p-0 overflow-hidden">
                                <div className="grid grid-cols-2 divide-x divide-y sm:divide-y-0 divide-border">
                                    <div className="p-4 border-b sm:border-b-0 border-border">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Transaction Date</p>
                                        <p className="text-sm font-medium text-foreground">{singleTxnData.date ? new Date(singleTxnData.date).toLocaleDateString('en-GB') : 'N/A'}</p>
                                    </div>
                                    <div className="p-4 border-b sm:border-b-0 border-border">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Payment Mode</p>
                                        <p className="text-sm font-medium text-foreground capitalize">
                                            {singleTxnData.paymentMode?.replace(/_/g, ' ') || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="p-4 col-span-2 border-t border-border">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">System Record ID</p>
                                        <p className="text-xs font-mono text-primary bg-primary-soft px-2 py-1 rounded w-fit border border-primary/10 break-all">
                                            {singleTxnData._id}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Context References (Student / Reference Docs) */}
                            {/* {(singleTxnData.studentRecordId || singleTxnData.section) && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Context & Reference</h4>
                                    <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
                                        {singleTxnData.section && (
                                            <div className="flex justify-between items-center pb-2 border-b border-border">
                                                <span className="text-xs text-muted">Ledger Section</span>
                                                <span className="text-sm font-bold text-foreground capitalize">
                                                    {singleTxnData.section?.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        )}
                                        {singleTxnData.studentRecordId && (
                                            <div className="flex justify-between items-center pb-2 border-b border-border">
                                                <span className="text-xs text-muted">Student Record</span>
                                                <span className="text-sm font-bold text-foreground text-right ml-2 truncate">
                                                    {(singleTxnData.studentRecordId as any)?.studentId?.studentName || "Linked Profile"}
                                                </span>
                                            </div>
                                        )}
                                        {singleTxnData.feeReceiptId && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-muted">Fee Receipt Ref</span>
                                                <span className="text-xs font-mono bg-background px-1.5 py-0.5 rounded border border-border truncate ml-2">
                                                    {(singleTxnData.feeReceiptId as any)?._id || singleTxnData.feeReceiptId}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )} */}

                            {/* --- NEW: Unified Source Details (Expense / Fee Data) --- */}
                            {singleTxnData.unifiedSourceDetails && (
                                <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-2 mb-2">
                                        Source Document Details
                                    </h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        {singleTxnData.unifiedSourceDetails.documentType && (
                                            <div>
                                                <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Category</p>
                                                <p className="text-sm font-medium text-foreground capitalize">
                                                    {singleTxnData.unifiedSourceDetails.documentType.replace('Model', '').replace(/([A-Z])/g, ' $1').trim()}
                                                </p>
                                            </div>
                                        )}
                                        {singleTxnData.unifiedSourceDetails.documentNumber && (
                                            <div>
                                                <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Category Ref Number</p>
                                                <p className="text-sm font-medium text-foreground">{singleTxnData.unifiedSourceDetails.documentNumber}</p>
                                            </div>
                                        )}
                                        {singleTxnData.unifiedSourceDetails.billNo && (
                                            <div>
                                                <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Bill No</p>
                                                <p className="text-sm font-medium text-foreground">{singleTxnData.unifiedSourceDetails.billNo}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Remarks Section */}
                                    {singleTxnData.unifiedSourceDetails.remarks && (
                                        <div className="pt-2 border-t border-border mt-3">
                                            <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Remarks</p>
                                            <p className="text-sm text-foreground bg-background p-2 rounded border border-border">
                                                {singleTxnData.unifiedSourceDetails.remarks}
                                            </p>
                                        </div>
                                    )}

                                    {/* Bank Details Section */}
                                    {singleTxnData.unifiedSourceDetails.bankDetails && (
                                        <div className="pt-3 border-t border-border mt-3">
                                            <h5 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Bank / Cheque Details</h5>
                                            <div className="grid grid-cols-2 gap-3 text-sm bg-background p-3 rounded border border-border">
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-muted block">Ref/Cheque No</span>
                                                    <span className="font-medium text-foreground">{singleTxnData.unifiedSourceDetails.bankDetails.referenceNumber || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-muted block">Bank Name</span>
                                                    <span className="font-medium text-foreground">{singleTxnData.unifiedSourceDetails.bankDetails.bankName || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Attachments Section */}
                                    {singleTxnData.unifiedSourceDetails.attachments?.length > 0 && (
                                        <div className="pt-3 border-t border-border mt-3">
                                            <h5 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">
                                                Attachments ({singleTxnData.unifiedSourceDetails.attachments.length})
                                            </h5>
                                            <div className="flex flex-wrap gap-2">
                                                {singleTxnData.unifiedSourceDetails.attachments.map((file: any, i: number) => (
                                                    <a
                                                        key={i}
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-xs bg-primary-soft text-primary px-3 py-1.5 rounded border border-primary/20 hover:bg-primary hover:text-white transition-colors shadow-sm"
                                                    >
                                                        <i className={`fas ${file.type === 'pdf' ? 'fa-file-pdf' : 'fa-image'}`}></i>
                                                        <span className="truncate max-w-[150px]">{file.originalName || `Attachment ${i + 1}`}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* ------------------------------------------------------------- */}

                            {/* Audit Trail */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Audit Trail</h4>
                                <div className="bg-background border border-border rounded-lg p-4 space-y-3 text-sm">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted">Generated By</span>
                                            <span className="font-medium text-foreground">{(singleTxnData.createdBy as any)?.userName || 'System'}</span>
                                        </div>
                                        <span className="text-[10px] text-muted text-right ml-2">{singleTxnData.createdAt ? new Date(singleTxnData.createdAt).toLocaleString() : ''}</span>
                                    </div>

                                    {singleTxnData.status === 'cancelled' && singleTxnData.cancelledBy && (
                                        <div className="flex justify-between items-start pt-3 border-t border-border">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-danger font-bold">Cancelled By</span>
                                                <span className="font-medium text-foreground">{(singleTxnData.cancelledBy as any)?.userName || 'System'}</span>
                                            </div>
                                            <span className="text-[10px] text-muted text-right ml-2">{singleTxnData.updatedAt ? new Date(singleTxnData.updatedAt).toLocaleString() : ''}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </SideModal>
        </div>
    )
}