import React, { useState, useCallback, useMemo } from 'react';
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

    const { data: schoolData } = useGetSchoolById(schoolId!);
    const currentAcademicYear = schoolData?.currentAcademicYear || "";

    // --- State: Filters (30% Pane) ---
    const [filters, setFilters] = useState({
        transactionType: '',
        accountType: '',
        status: 'active', // Default to active
        fromDate: '',
        toDate: '',
    });

    // --- State: Modal & Selected ID ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTxnId, setSelectedTxnId] = useState<string | undefined>(undefined);

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
        <div className="w-full h-full flex flex-col bg-background overflow-hidden">

            {/* HEADER */}
            <header className="shrink-0 px-6 py-5 border-b border-border flex items-center justify-between bg-surface z-10 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-book-open text-primary"></i>
                        Finance Ledger
                    </h1>
                    <p className="text-sm text-muted mt-1">Master record of all credits, debits, and adjustments.</p>
                </div>
            </header>

            {/* 30-70 SPLIT LAYOUT */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                {/* 30% LEFT: FILTERS PANE */}
                <aside className="w-full lg:w-[20%] shrink-0 border-r border-border bg-surface/50 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <i className="fas fa-filter text-primary"></i> Filter Records
                    </h2>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <Label>Transaction Type</Label>
                            <SearchSelect
                                options={TXN_TYPES}
                                value={filters.transactionType}
                                onChange={(opt: any) => handleFilterChange('transactionType', opt?.value || '')}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label>Account Type</Label>
                            <SearchSelect
                                options={ACCOUNT_TYPES}
                                value={filters.accountType}
                                onChange={(opt: any) => handleFilterChange('accountType', opt?.value || '')}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label>Status</Label>
                            <SearchSelect
                                options={STATUS_OPTIONS}
                                value={filters.status}
                                onChange={(opt: any) => handleFilterChange('status', opt?.value || '')}
                            />
                        </div>

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
                            onClick={() => setFilters({ transactionType: '', accountType: '', status: 'active', fromDate: '', toDate: '' })}
                        >
                            Reset Filters
                        </Button>
                    </div>
                </aside>

                {/* 70% RIGHT: TABLE LIST PANE */}
                <main className="flex-1 w-full lg:w-[80%] p-6 flex flex-col overflow-hidden bg-background">
                    {isListLoading ? (
                        <div className="flex flex-1 justify-center items-center">
                            <i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i>
                        </div>
                    ) : allTransactions.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center text-muted">
                            <i className="fas fa-receipt text-5xl opacity-30 mb-4"></i>
                            <h2 className="text-lg font-bold text-foreground">No Transactions Found</h2>
                            <p className="text-sm mt-1">Adjust your filters to see more results.</p>
                        </div>
                    ) : (
                        <TableContainer onScroll={handleScroll} className="h-full custom-scrollbar overscroll-none">
                            <THead className="sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <Th>S.No</Th>
                                    <Th>Date</Th>
                                    {/* <Th>Ref ID</Th> */}
                                    <Th>Type</Th>
                                    <Th>Mode</Th>
                                    <Th className="text-right">Amount</Th>
                                    <Th className="text-center pr-6">Action</Th>
                                </tr>
                            </THead>
                            <TBody>
                                <>
                                    {allTransactions.map((txn: any, idx: number) => (
                                        <Tr key={txn._id} className="hover:bg-primary-soft/20 transition-colors">
                                            <Td className="font-medium whitespace-nowrap text-muted">{idx + 1}</Td>

                                            <Td className="whitespace-nowrap font-medium text-foreground">
                                                {new Date(txn.date).toLocaleDateString('en-GB')}
                                            </Td>

                                            {/* <Td>
                                                <span className="text-[11px] font-mono bg-surface border border-border px-1.5 py-0.5 rounded text-muted">
                                                    {txn._id.slice(-6).toUpperCase()}
                                                </span>
                                            </Td> */}

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
                                                    {txn.paymentMode.replace(/_/g, ' ')}
                                                </span>
                                            </Td>

                                            <Td className={`text-right font-bold whitespace-nowrap ${txn.status === 'cancelled' ? 'line-through opacity-50' : 'text-foreground'}`}>
                                                ₹ {txn.amount.toLocaleString()}
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
                                            <td colSpan={7} className="py-6 text-center">
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
                                    {/* FIX 1: Safely handle missing accountType */}
                                    <span className="text-xs font-bold text-muted uppercase">
                                        {singleTxnData.accountType?.replace(/_/g, ' ') || 'N/A'}
                                    </span>
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
                                <div className="grid grid-cols-2 divide-x divide-border">
                                    <div className="p-4 border-b border-border">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Transaction Date</p>
                                        <p className="text-sm font-medium text-foreground">{singleTxnData.date ? new Date(singleTxnData.date).toLocaleDateString('en-GB') : 'N/A'}</p>
                                    </div>
                                    <div className="p-4 border-b border-border">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Payment Mode</p>
                                        {/* FIX 2: Safely handle missing paymentMode */}
                                        <p className="text-sm font-medium text-foreground capitalize">
                                            {singleTxnData.paymentMode?.replace(/_/g, ' ') || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="p-4 col-span-2">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">System Record ID</p>
                                        <p className="text-xs font-mono text-primary bg-primary-soft px-2 py-1 rounded w-fit border border-primary/10">
                                            {singleTxnData._id}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Context References (Student / Reference Docs) */}
                            {(singleTxnData.studentRecordId || singleTxnData.section) && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Context & Reference</h4>
                                    <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
                                        {singleTxnData.section && (
                                            <div className="flex justify-between items-center pb-2 border-b border-border">
                                                <span className="text-xs text-muted">Ledger Section</span>
                                                {/* FIX 3: Safely handle missing section */}
                                                <span className="text-sm font-bold text-foreground capitalize">
                                                    {singleTxnData.section?.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        )}
                                        {singleTxnData.studentRecordId && (
                                            <div className="flex justify-between items-center pb-2 border-b border-border">
                                                <span className="text-xs text-muted">Student Record</span>
                                                <span className="text-sm font-bold text-foreground">
                                                    {(singleTxnData.studentRecordId as any)?.studentId?.studentName || "Linked Profile"}
                                                </span>
                                            </div>
                                        )}
                                        {singleTxnData.feeReceiptId && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-muted">Fee Receipt Ref</span>
                                                <span className="text-xs font-mono bg-background px-1.5 py-0.5 rounded border border-border">
                                                    {(singleTxnData.feeReceiptId as any)?._id || singleTxnData.feeReceiptId}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Audit Trail */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Audit Trail</h4>
                                <div className="bg-background border border-border rounded-lg p-4 space-y-3 text-sm">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted">Generated By</span>
                                            <span className="font-medium text-foreground">{(singleTxnData.createdBy as any)?.userName || 'System'}</span>
                                        </div>
                                        <span className="text-[10px] text-muted">{singleTxnData.createdAt ? new Date(singleTxnData.createdAt).toLocaleString() : ''}</span>
                                    </div>

                                    {singleTxnData.status === 'cancelled' && singleTxnData.cancelledBy && (
                                        <div className="flex justify-between items-start pt-3 border-t border-border">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-danger font-bold">Cancelled By</span>
                                                <span className="font-medium text-foreground">{(singleTxnData.cancelledBy as any)?.userName || 'System'}</span>
                                            </div>
                                            <span className="text-[10px] text-muted">{singleTxnData.updatedAt ? new Date(singleTxnData.updatedAt).toLocaleString() : ''}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </SideModal>
        </div>
    );
}