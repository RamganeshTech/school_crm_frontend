import React, { useState, useCallback } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
// import { useGetAllExpensesInfinite, useAddExpense } from '../../api_services/expenseApi'; // Adjust path
import { Input, Label } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../shared/ui/TableLayout';
import { SideModal } from '../../shared/ui/SideModal';
import { useGetSchoolById } from '../../api_services/schoolConfig_api/schoolapi';
import { useAddExpense, useGetAllExpensesInfinite, useDeleteExpense } from '../../api_services/expense_api/expenseApi';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from '../../shared/ui/ToastContext';

export const EXPENSE_CATEGORY_OPTIONS = [
    { label: 'Maintenance', value: 'Maintenance' },
    { label: 'Utilities', value: 'Utilities' },
    { label: 'Operations', value: 'Operations' },
    { label: 'Events', value: 'Events' },
    { label: 'Salary', value: 'Salary' },
    { label: 'Fuel', value: 'Fuel' },
    { label: 'Miscellaneous', value: 'Miscellaneous' },
];

const PAYMENT_MODE_OPTIONS = [
    { label: 'Cash', value: 'Cash' },
    { label: 'Bank Transfer', value: 'Bank Transfer' },
    { label: 'Cheque', value: 'Cheque' },
    { label: 'UPI', value: 'UPI' },
];

export default function ExpenseMain() {
    const { schoolId } = useAuthData();
    const navigate = useNavigate();


    // --- Filter State (Left 30% Pane) ---
    const [filters, setFilters] = useState({
        expenseNo: '', // <-- Added search field
        minAmount: 0,
        maxAmount: 10000000,
        fromDate: '',
        toDate: '',
    });

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // --- Modal & Form State ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        paymentMode: '',
        date: '',
        chequeNumber: '',
        bankName: '',
        remarks: ''
    });

    // File states
    const [billProof, setBillProof] = useState<File | null>(null);
    const [workProof, setWorkProof] = useState<File | null>(null);

    // --- Queries & Mutations ---
    const { data: schoolData } = useGetSchoolById(schoolId!);


    const currentAcademicYear = schoolData?.currentAcademicYear || "";
    const addExpenseMutation = useAddExpense();
    const {
        data: expensesData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useGetAllExpensesInfinite({
        schoolId: schoolId!,
        ...filters
    });


    const deleteExpenseMutation = useDeleteExpense();


    // Flatten the infinite data pages into a single array
    // const allExpenses = expensesData?.pages.flatMap((page: any) => page.docs || page) || [];
    const allExpenses = expensesData?.pages.flatMap(page => page.data || []) || [];

    // --- Handlers ---
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    // Infinite Scroll detection
    // const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    //     const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    //     if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isFetchingNextPage) {
    //         fetchNextPage();
    //     }
    // }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    // Infinite Scroll detection (Matched to your working Student logic)
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);


    const handleAddSubmit = async () => {
        try {
            // Construct FormData for multipart/form-data upload
            const data = new FormData();
            data.append('schoolId', schoolId!);
            data.append('academicYear', currentAcademicYear || '');
            data.append('amount', formData.amount);
            data.append('category', formData.category);
            data.append('paymentMode', formData.paymentMode);
            data.append('date', formData.date);
            data.append('remarks', formData.remarks);

            // Optional fields based on payment mode
            if (formData.paymentMode === 'Cheque' || formData.paymentMode === 'Bank Transfer') {
                data.append('chequeNumber', formData.chequeNumber);
                data.append('bankName', formData.bankName);
            }

            // Append files if they exist
            if (billProof) data.append('billProof', billProof);
            if (workProof) data.append('workProof', workProof);

            await addExpenseMutation.mutateAsync(data);

            // Reset and close
            setIsAddModalOpen(false);
            setFormData({ amount: '', category: '', paymentMode: '', date: '', chequeNumber: '', bankName: '', remarks: '' });
            setBillProof(null);
            setWorkProof(null);
            toast.success("Created Successfully")
        } catch (error: any) {
            console.error("Failed to add expense", error);
            toast.error(error.message || "failed to create expense")
        }
    };



    const handleDeleteExpense = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
            try {
                await deleteExpenseMutation.mutateAsync(id);
                toast.success("Successfully Deleted");

            } catch (error: any) {
                toast.error(error.message || "Failed to Delete.");
                console.error("Failed to delete expense", error);
            }
        }
    };



    const isChild = location.pathname.includes("single")
    if (isChild) {
        return <Outlet />
    }


    // return (
    //     <div className="w-full h-full flex flex-col gap-3 bg-background overflow-hidden">

    //         {/* FLAT HEADER (Matches Class Configuration style) */}
    //         <header className="shrink-0 px-6 py-2 border-b border-border flex items-center justify-between gap-4 bg-surface z-10 shadow-sm">
    //             <div>
    //                 <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
    //                     <i className="fas fa-file-invoice-dollar text-primary"></i>
    //                     Expenses
    //                 </h1>
    //                 <p className="text-sm text-muted mt-1">Manage and track school expenditures and bills.</p>
    //             </div>
    //             <div>
    //                 <Button
    //                     variant="primary"
    //                     leftIcon="fas fa-plus"
    //                     onClick={() => setIsAddModalOpen(true)}
    //                 >
    //                     Add New Expense
    //                 </Button>
    //             </div>
    //         </header>

    //         {/* 30-70 SPLIT LAYOUT */}
    //         <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

    //             {/* 30% LEFT: FILTERS PANE */}
    //             <aside className="w-full lg:w-[20%] shrink-0 border-r border-border bg-surface/50 p-3 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
    //                 <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
    //                     <i className="fas fa-filter text-primary"></i> Filter Records
    //                 </h2>

    //                 <div className="space-y-4">

    //                     <Input
    //                         id="expenseNo"
    //                         type="text"
    //                         label="Search by Ref ID"
    //                         placeholder="e.g. EXP-014"
    //                         leftIcon="fas fa-search"
    //                         value={filters.expenseNo}
    //                         onChange={handleFilterChange}
    //                     />

    //                     <div className="grid grid-cols-2 gap-3">
    //                         <Input
    //                             id="minAmount"
    //                             type="number"
    //                             label="Min Amount (₹)"
    //                             placeholder="0"
    //                             value={filters.minAmount}
    //                             onChange={handleFilterChange}
    //                         />
    //                         <Input
    //                             id="maxAmount"
    //                             type="number"
    //                             label="Max Amount (₹)"
    //                             placeholder="10000"
    //                             value={filters.maxAmount}
    //                             onChange={handleFilterChange}
    //                         />
    //                     </div>
    //                     <Input
    //                         id="fromDate"
    //                         type="date"
    //                         label="From Date"
    //                         value={filters.fromDate}
    //                         onChange={handleFilterChange}
    //                     />
    //                     <Input
    //                         id="toDate"
    //                         type="date"
    //                         label="To Date"
    //                         value={filters.toDate}
    //                         onChange={handleFilterChange}
    //                     />
    //                 </div>
    //             </aside>

    //             {/* 70% RIGHT: TABLE LIST PANE */}
    //             <main className="flex-1 w-full lg:w-[80%] px-3 py-2 flex flex-col overflow-hidden bg-background">
    //                 {isLoading ? (
    //                     <div className="flex flex-1 justify-center items-center"><i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i></div>
    //                 ) : allExpenses.length === 0 ? (
    //                     <div className="flex flex-1 flex-col items-center justify-center text-muted">
    //                         <i className="fas fa-receipt text-4xl opacity-30 mb-3"></i>
    //                         <h2 className="text-lg font-bold text-foreground">No Expenses Found</h2>
    //                         <p className="text-sm">Adjust your filters or add a new expense to get started.</p>
    //                     </div>
    //                 ) : (
    //                     <TableContainer onScroll={handleScroll} className="h-full custom-scrollbar">
    //                         <THead className="sticky top-0 z-10 shadow-sm">
    //                             <tr>
    //                                 <Th>S.No</Th>
    //                                 <Th>Ref Id</Th>
    //                                 <Th>Date</Th>
    //                                 <Th>Category</Th>
    //                                 <Th>Amount</Th>
    //                                 <Th>Mode</Th>
    //                                 <Th>Status</Th>
    //                                 <Th className="text-center pr-6">Action</Th>
    //                             </tr>
    //                         </THead>
    //                         <TBody>
    //                             {/* FIX: Wrap the map and the loading indicator in a Fragment */}
    //                             <>
    //                                 {allExpenses.map((expense: any, idx: number) => (
    //                                     <Tr key={expense._id}>
    //                                         <Td className="font-medium whitespace-nowrap">
    //                                             {idx + 1}
    //                                         </Td>
    //                                         <Td className="font-medium whitespace-nowrap">
    //                                             {expense.expenseNo || "N/A"}
    //                                         </Td>
    //                                         <Td className="font-medium whitespace-nowrap">
    //                                             {new Date(expense.date).toLocaleDateString()}
    //                                         </Td>
    //                                         <Td>{expense.category}</Td>
    //                                         <Td className="font-bold text-foreground">
    //                                             ₹ {expense.amount.toLocaleString()}
    //                                         </Td>
    //                                         <Td>
    //                                             <span className="px-2 py-1 bg-primary-soft text-primary text-[10px] rounded uppercase font-bold tracking-wider border border-primary/10">
    //                                                 {expense.paymentMode}
    //                                             </span>
    //                                         </Td>
    //                                         <Td>
    //                                             <span className={`px-2 py-1 text-[10px] rounded uppercase font-bold tracking-wider ${expense.status === 'verified' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
    //                                                 {expense.status || 'Pending'}
    //                                             </span>
    //                                         </Td>
    //                                         <Td>
    //                                             <div className="flex items-center justify-end gap-2 pr-2">
    //                                                 <Button
    //                                                     variant="outline"
    //                                                     size="sm"
    //                                                     onClick={() => navigate(`single/${expense._id}`)}
    //                                                 // className='border-primary-spft'
    //                                                 >
    //                                                     View
    //                                                 </Button>
    //                                                 <Button
    //                                                     variant="danger"
    //                                                     size="sm"
    //                                                     className="!px-2.5"
    //                                                     onClick={() => handleDeleteExpense(expense._id)}
    //                                                     isLoading={deleteExpenseMutation.isPending && deleteExpenseMutation.variables === expense._id}
    //                                                     title="Delete Expense"
    //                                                 >
    //                                                     <i className="fas fa-trash-alt text-xs"></i>
    //                                                 </Button>
    //                                             </div>
    //                                         </Td>
    //                                     </Tr>
    //                                 ))}

    //                                 {/* FIX: Ensure this is correctly positioned outside the map */}
    //                                 {isFetchingNextPage && (
    //                                     <tr>
    //                                         <td colSpan={8} className="py-6 text-center">
    //                                             <i className="fas fa-circle-notch fa-spin text-primary text-xl"></i>
    //                                             <p className="text-xs text-muted mt-2">Loading more expenses...</p>
    //                                         </td>
    //                                     </tr>
    //                                 )}
    //                             </>
    //                         </TBody>
    //                     </TableContainer>
    //                 )}
    //             </main>
    //         </div>

    //         {/* SIDE MODAL: ADD EXPENSE */}
    //         <SideModal
    //             isOpen={isAddModalOpen}
    //             onClose={() => setIsAddModalOpen(false)}
    //             title="Add New Expense"
    //         >
    //             <div className="flex flex-col h-full space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6">

    //                 <div className="grid grid-cols-2 gap-4">
    //                     <Input id="amount" type="number" label="Amount (₹)" placeholder="0.00" value={formData.amount} onChange={handleFormChange} required />
    //                     <Input id="date" type="date" label="Date of Expense" value={formData.date} onChange={handleFormChange} required />
    //                 </div>

    //                 <div className="flex flex-col sm:flex-row gap-1.5">

    //                     <div className="flex flex-col gap-1.5">
    //                         <Label>Category</Label>
    //                         <SearchSelect
    //                             options={EXPENSE_CATEGORY_OPTIONS}
    //                             value={formData.category}
    //                             onChange={(opt: any) => setFormData(prev => ({ ...prev, category: opt?.value || '' }))}
    //                         />
    //                     </div>

    //                     <div className="flex flex-col gap-1.5">
    //                         <Label>Payment Mode</Label>
    //                         <SearchSelect
    //                             options={PAYMENT_MODE_OPTIONS}
    //                             value={formData.paymentMode}
    //                             onChange={(opt: any) => setFormData(prev => ({ ...prev, paymentMode: opt?.value || '' }))}
    //                         />
    //                     </div>
    //                 </div>


    //                 {(formData.paymentMode === 'Cheque' || formData.paymentMode === 'Bank Transfer') && (
    //                     <div className="grid grid-cols-2 gap-4 p-4 border border-border rounded-lg bg-surface/50">
    //                         <Input id="bankName" label="Bank Name" placeholder="e.g., HDFC Bank" value={formData.bankName} onChange={handleFormChange} />
    //                         <Input id="chequeNumber" label="Reference / Cheque No." placeholder="e.g., 001234" value={formData.chequeNumber} onChange={handleFormChange} />
    //                     </div>
    //                 )}

    //                 <Input id="remarks" label="Remarks / Description" placeholder="Enter details..." value={formData.remarks} onChange={handleFormChange} />

    //                 <div className="border-t border-border pt-4 space-y-4">
    //                     <h3 className="text-sm font-bold text-foreground">Upload Proofs</h3>

    //                     <div className="flex flex-col gap-1.5">
    //                         <Label>Bill / Invoice Proof</Label>
    //                         <input
    //                             type="file"
    //                             accept="image/*,.pdf"
    //                             onChange={(e) => setBillProof(e.target.files?.[0] || null)}
    //                             className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-soft file:text-primary hover:file:bg-primary/20 transition-colors"
    //                         />
    //                     </div>

    //                     <div className="flex flex-col gap-1.5">
    //                         <Label>Work / Product Photo (Optional)</Label>
    //                         <input
    //                             type="file"
    //                             accept="image/*,.pdf"
    //                             onChange={(e) => setWorkProof(e.target.files?.[0] || null)}
    //                             className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-soft file:text-primary hover:file:bg-primary/20 transition-colors"
    //                         />
    //                     </div>
    //                 </div>

    //                 <div className="shrink-0 pt-4 border-t border-border mt-auto flex justify-end gap-3 bg-surface z-10">
    //                     <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
    //                     <Button variant="primary" onClick={handleAddSubmit} isLoading={addExpenseMutation.isPending} leftIcon="fas fa-save">
    //                         Submit Expense
    //                     </Button>
    //                 </div>
    //             </div>


    //         </SideModal>
    //     </div>
    // );

    return (

        <div className="w-full h-full flex flex-col gap-3 bg-background overflow-hidden">

            {/* FLAT HEADER (Matches Class Configuration style) */}
            <header className="shrink-0 px-4 lg:px-6 py-2 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface z-10 shadow-sm">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-file-invoice-dollar text-primary"></i>
                        Expenses
                    </h1>
                    <p className="text-xs lg:text-sm text-muted mt-1">Manage and track school expenditures and bills.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* NEW: Mobile Filter Toggle Button */}
                    <Button
                        variant="outline"
                        className="lg:hidden flex-1 sm:flex-none justify-center"
                        leftIcon="fas fa-filter"
                        onClick={() => setIsMobileFilterOpen(true)}
                    >
                        Filters
                    </Button>
                    <Button
                        variant="primary"
                        className="flex-1 sm:flex-none justify-center"
                        leftIcon="fas fa-plus"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Add Expense
                    </Button>
                </div>
            </header>

            {/* MAIN LAYOUT */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                {/* MOBILE OVERLAY: Darkens background when drawer is open */}
                {isMobileFilterOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />
                )}

                {/* 30% LEFT: FILTERS PANE (Drawer on Mobile, Static on Desktop) */}
                <aside className={`
                    fixed inset-y-0 left-0 z-50 w-[280px] bg-surface p-4 flex flex-col gap-6 shadow-2xl transition-transform duration-300 ease-in-out
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
                            id="expenseNo"
                            type="text"
                            label="Search by Ref ID"
                            placeholder="e.g. EXP-014"
                            leftIcon="fas fa-search"
                            value={filters.expenseNo}
                            onChange={handleFilterChange}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                id="minAmount"
                                type="number"
                                label="Min (₹)"
                                placeholder="0"
                                value={filters.minAmount}
                                onChange={handleFilterChange}
                            />
                            <Input
                                id="maxAmount"
                                type="number"
                                label="Max (₹)"
                                placeholder="10000"
                                value={filters.maxAmount}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <Input
                            id="fromDate"
                            type="date"
                            label="From Date"
                            value={filters.fromDate}
                            onChange={handleFilterChange}
                        />
                        <Input
                            id="toDate"
                            type="date"
                            label="To Date"
                            value={filters.toDate}
                            onChange={handleFilterChange}
                        />

                        {/* Mobile 'Apply' button to close drawer after filtering */}
                        <Button
                            variant="primary"
                            className="w-full lg:hidden mt-4"
                            onClick={() => setIsMobileFilterOpen(false)}
                        >
                            Apply Filters
                        </Button>
                    </div>
                </aside>

                {/* 70% RIGHT: TABLE LIST PANE */}
                <main className="flex-1 w-full lg:w-[80%] px-2 lg:px-3 py-2 flex flex-col overflow-hidden bg-background">

                    {isLoading ? (
                        <div className="flex flex-1 justify-center items-center"><i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i></div>
                    ) : allExpenses.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center text-muted">
                            <i className="fas fa-receipt text-4xl opacity-30 mb-3"></i>
                            <h2 className="text-lg font-bold text-foreground">No Expenses Found</h2>
                            <p className="text-sm">Adjust your filters or add a new expense to get started.</p>
                        </div>
                    ) : (
                        <TableContainer onScroll={handleScroll} className="h-full custom-scrollbar">
                            <THead className="sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <Th>S.No</Th>
                                    <Th>Ref Id</Th>
                                    <Th>Date</Th>
                                    <Th>Category</Th>
                                    <Th>Amount</Th>
                                    <Th>Mode</Th>
                                    <Th>Status</Th>
                                    <Th className="text-center pr-6">Action</Th>
                                </tr>
                            </THead>
                            <TBody>
                                {/* FIX: Wrap the map and the loading indicator in a Fragment */}
                                <>
                                    {allExpenses.map((expense: any, idx: number) => (
                                        <Tr key={expense._id}>
                                            <Td className="font-medium whitespace-nowrap">
                                                {idx + 1}
                                            </Td>
                                            <Td className="font-medium whitespace-nowrap">
                                                {expense.expenseNo || "N/A"}
                                            </Td>
                                            <Td className="font-medium whitespace-nowrap">
                                                {new Date(expense.date).toLocaleDateString()}
                                            </Td>
                                            <Td>{expense.category}</Td>
                                            <Td className="font-bold text-foreground">
                                                ₹ {expense.amount.toLocaleString()}
                                            </Td>
                                            <Td>
                                                <span className="px-2 py-1 bg-primary-soft text-primary text-[10px] rounded uppercase font-bold tracking-wider border border-primary/10">
                                                    {expense.paymentMode}
                                                </span>
                                            </Td>
                                            <Td>
                                                <span className={`px-2 py-1 text-[10px] rounded uppercase font-bold tracking-wider ${expense.status === 'verified' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                                    {expense.status || 'Pending'}
                                                </span>
                                            </Td>
                                            <Td>
                                                <div className="flex items-center justify-end gap-2 pr-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`single/${expense._id}`)}
                                                    // className='border-primary-spft'
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        className="!px-2.5"
                                                        onClick={() => handleDeleteExpense(expense._id)}
                                                        isLoading={deleteExpenseMutation.isPending && deleteExpenseMutation.variables === expense._id}
                                                        title="Delete Expense"
                                                    >
                                                        <i className="fas fa-trash-alt text-xs"></i>
                                                    </Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))}

                                    {/* FIX: Ensure this is correctly positioned outside the map */}
                                    {isFetchingNextPage && (
                                        <tr>
                                            <td colSpan={8} className="py-6 text-center">
                                                <i className="fas fa-circle-notch fa-spin text-primary text-xl"></i>
                                                <p className="text-xs text-muted mt-2">Loading more expenses...</p>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            </TBody>
                        </TableContainer>
                    )}

                </main>
            </div>

            {/* SIDE MODAL: ADD EXPENSE */}
            {/* SIDE MODAL: ADD EXPENSE */}
            <SideModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Expense"
            >
                <div className="flex flex-col h-full space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6">

                    <div className="grid grid-cols-2 gap-4">
                        <Input id="amount" type="number" label="Amount (₹)" placeholder="0.00" value={formData.amount} onChange={handleFormChange} required />
                        <Input id="date" type="date" label="Date of Expense" value={formData.date} onChange={handleFormChange} required />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-1.5">

                        <div className="flex flex-col gap-1.5">
                            <Label>Category</Label>
                            <SearchSelect
                                options={EXPENSE_CATEGORY_OPTIONS}
                                value={formData.category}
                                onChange={(opt: any) => setFormData(prev => ({ ...prev, category: opt?.value || '' }))}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label>Payment Mode</Label>
                            <SearchSelect
                                options={PAYMENT_MODE_OPTIONS}
                                value={formData.paymentMode}
                                onChange={(opt: any) => setFormData(prev => ({ ...prev, paymentMode: opt?.value || '' }))}
                            />
                        </div>
                    </div>


                    {(formData.paymentMode === 'Cheque' || formData.paymentMode === 'Bank Transfer') && (
                        <div className="grid grid-cols-2 gap-4 p-4 border border-border rounded-lg bg-surface/50">
                            <Input id="bankName" label="Bank Name" placeholder="e.g., HDFC Bank" value={formData.bankName} onChange={handleFormChange} />
                            <Input id="chequeNumber" label="Reference / Cheque No." placeholder="e.g., 001234" value={formData.chequeNumber} onChange={handleFormChange} />
                        </div>
                    )}

                    <Input id="remarks" label="Remarks / Description" placeholder="Enter details..." value={formData.remarks} onChange={handleFormChange} />

                    <div className="border-t border-border pt-4 space-y-4">
                        <h3 className="text-sm font-bold text-foreground">Upload Proofs</h3>

                        <div className="flex flex-col gap-1.5">
                            <Label>Bill / Invoice Proof</Label>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => setBillProof(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-soft file:text-primary hover:file:bg-primary/20 transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label>Work / Product Photo (Optional)</Label>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => setWorkProof(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-soft file:text-primary hover:file:bg-primary/20 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="shrink-0 pt-4 border-t border-border mt-auto flex justify-end gap-3 bg-surface z-10">
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleAddSubmit} isLoading={addExpenseMutation.isPending} leftIcon="fas fa-save">
                            Submit Expense
                        </Button>
                    </div>
                </div>


            </SideModal>
        </div >
    )
}