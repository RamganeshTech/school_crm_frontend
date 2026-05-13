import  { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
// import { useGetExpenseById, useUpdateExpense, useDeleteExpenseProof } from '../../api_services/expenseApi'; // Adjust path
import { Button } from '../../shared/ui/Button';
import { Input, Label } from '../../shared/ui/Input';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { useDeleteExpenseProof, useGetExpenseById, useUpdateExpense } from '../../api_services/expense_api/expenseApi';

const CATEGORY_OPTIONS = [
    { label: 'Maintenance', value: 'Maintenance' },
    { label: 'Utilities', value: 'Utilities' },
    { label: 'Supplies', value: 'Supplies' },
    { label: 'Events', value: 'Events' },
    { label: 'Miscellaneous', value: 'Miscellaneous' },
];

const PAYMENT_MODE_OPTIONS = [
    { label: 'Cash', value: 'Cash' },
    { label: 'Bank Transfer', value: 'Bank Transfer' },
    { label: 'Cheque', value: 'Cheque' },
    { label: 'UPI', value: 'UPI' },
];

export default function ExpenseSingle() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { schoolId } = useAuthData();

    // --- State ---
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    
    // File upload states
    const [newBillProof, setNewBillProof] = useState<File | null>(null);
    const [newWorkProof, setNewWorkProof] = useState<File | null>(null);

    // --- Queries & Mutations ---
    const { data: expense, isLoading, isError } = useGetExpenseById(id);
    const updateExpenseMutation = useUpdateExpense();
    const deleteProofMutation = useDeleteExpenseProof();

    // --- Sync Backend Data to Local Edit Form ---
    useEffect(() => {
        if (expense && isEditing) {
            setEditForm({
                amount: expense.amount || '',
                category: expense.category || '',
                paymentMode: expense.paymentMode || '',
                date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
                chequeNumber: expense.chequeNumber || '',
                bankName: expense.bankName || '',
                remarks: expense.remarks || '',
            });
            // Reset file inputs when entering edit mode
            setNewBillProof(null);
            setNewWorkProof(null);
        }
    }, [expense, isEditing]);

    // --- Handlers ---
    const handleFieldChange = (field: string, value: any) => {
        setEditForm((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!id) return;

        try {
            const formData = new FormData();
            formData.append('schoolId', schoolId!);
            formData.append('amount', editForm.amount);
            formData.append('category', editForm.category);
            formData.append('paymentMode', editForm.paymentMode);
            formData.append('date', editForm.date);
            formData.append('remarks', editForm.remarks);
            
            if (editForm.paymentMode === 'Cheque' || editForm.paymentMode === 'Bank Transfer') {
                formData.append('chequeNumber', editForm.chequeNumber);
                formData.append('bankName', editForm.bankName);
            }

            // Append new files if the user selected them
            if (newBillProof) formData.append('billProof', newBillProof);
            if (newWorkProof) formData.append('workProof', newWorkProof);

            await updateExpenseMutation.mutateAsync({ id, formData });
            setIsEditing(false); // Switch back to view mode on success
        } catch (error) {
            console.error("Failed to update expense", error);
        }
    };

    const handleDeleteProof = async (proofId: string, type: 'bill' | 'workPhoto') => {
        if (!window.confirm(`Are you sure you want to delete this ${type === 'bill' ? 'Bill' : 'Work'} proof?`)) return;
        try {
            await deleteProofMutation.mutateAsync({ expenseId: id!, proofId, type });
        } catch (error) {
            console.error("Failed to delete proof", error);
        }
    };

    // --- UI Helpers ---
    const renderProofDisplay = (proofs: any[], type: 'bill' | 'workPhoto') => {
        if (!proofs || proofs.length === 0) return <p className="text-sm text-muted italic">No proof uploaded.</p>;

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {proofs.map((proof: any) => (
                    <div key={proof._id} className="relative group border border-border rounded-lg overflow-hidden bg-surface">
                        {proof.url?.toLowerCase().endsWith('.pdf') ? (
                            <div className="flex flex-col items-center justify-center h-40 bg-background/50">
                                <i className="fas fa-file-pdf text-4xl text-danger mb-2"></i>
                                <a href={proof.url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline font-medium">View PDF Document</a>
                            </div>
                        ) : (
                            <a href={proof.url} target="_blank" rel="noreferrer" className="block h-40">
                                <img src={proof.url} alt="Proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </a>
                        )}
                        
                        {/* Delete Proof Button (Only visible in Edit Mode) */}
                        {isEditing && (
                            <button 
                                onClick={() => handleDeleteProof(proof._id, type)}
                                className="absolute top-2 right-2 w-8 h-8 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-danger/90"
                                title="Delete this proof"
                            >
                                <i className="fas fa-trash-alt text-xs"></i>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    if (isLoading) return <div className="flex w-full h-full justify-center items-center"><i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i></div>;
    if (isError || !expense) return <div className="flex w-full h-full justify-center items-center text-danger font-medium">Failed to load expense details.</div>;

    return (
        <div className="w-full h-full flex flex-col bg-background">
            
            {/* 1. HEADER AREA */}
            <header className="shrink-0 px-6 py-5 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-surface sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-background border border-transparent hover:border-border text-muted hover:text-foreground transition-all shrink-0"
                    >
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-foreground">
                                Expense Details
                            </h1>
                            {!isEditing && (
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${expense.status === 'verified' ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                                    {expense.status || 'Pending'}
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-medium text-muted mt-1 uppercase tracking-wider">
                            Ref: {expense._id?.slice(-8)} • {new Date(expense.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleSave} isLoading={updateExpenseMutation.isPending} leftIcon="fas fa-save">
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={() => setIsEditing(true)} leftIcon="fas fa-pen">
                            Edit Expense
                        </Button>
                    )}
                </div>
            </header>

            {/* 2. MAIN CONTENT (Two Column Split) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT PANE: Form Details (7 Columns) */}
                    <div className="lg:col-span-7 space-y-8">
                        
                        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                            <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-6 flex items-center gap-2">
                                <i className="fas fa-info-circle text-primary"></i> Basic Information
                            </h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                {isEditing ? (
                                    <>
                                        <Input label="Amount (₹)" type="number" value={editForm.amount} onChange={(e) => handleFieldChange('amount', e.target.value)} />
                                        <Input label="Date" type="date" value={editForm.date} onChange={(e) => handleFieldChange('date', e.target.value)} />
                                        <div className="flex flex-col gap-1.5">
                                            <Label>Category</Label>
                                            <SearchSelect options={CATEGORY_OPTIONS} value={editForm.category} onChange={(opt: any) => handleFieldChange('category', opt?.value)} />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <Label>Payment Mode</Label>
                                            <SearchSelect options={PAYMENT_MODE_OPTIONS} value={editForm.paymentMode} onChange={(opt: any) => handleFieldChange('paymentMode', opt?.value)} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-xs text-muted mb-1 font-medium">Amount</p>
                                            <p className="text-lg font-bold text-foreground">₹ {expense.amount?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted mb-1 font-medium">Date</p>
                                            <p className="text-base font-semibold text-foreground">{new Date(expense.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted mb-1 font-medium">Category</p>
                                            <p className="text-base font-semibold text-foreground">{expense.category}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted mb-1 font-medium">Payment Mode</p>
                                            <p className="text-base font-semibold text-foreground">{expense.paymentMode}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                            <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-6 flex items-center gap-2">
                                <i className="fas fa-university text-primary"></i> Payment & Remarks
                            </h2>
                            
                            <div className="space-y-5">
                                {/* Bank Details (Conditional) */}
                                {(isEditing ? (editForm.paymentMode === 'Cheque' || editForm.paymentMode === 'Bank Transfer') : (expense.paymentMode === 'Cheque' || expense.paymentMode === 'Bank Transfer')) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 p-4 bg-background/50 rounded-lg border border-border border-dashed">
                                        {isEditing ? (
                                            <>
                                                <Input label="Bank Name" value={editForm.bankName} onChange={(e) => handleFieldChange('bankName', e.target.value)} />
                                                <Input label="Reference / Cheque No." value={editForm.chequeNumber} onChange={(e) => handleFieldChange('chequeNumber', e.target.value)} />
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <p className="text-xs text-muted mb-1 font-medium">Bank Name</p>
                                                    <p className="text-sm font-semibold text-foreground">{expense.bankName || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted mb-1 font-medium">Reference / Cheque No.</p>
                                                    <p className="text-sm font-semibold text-foreground">{expense.chequeNumber || 'N/A'}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {isEditing ? (
                                    <Input label="Remarks / Description" value={editForm.remarks} onChange={(e) => handleFieldChange('remarks', e.target.value)} />
                                ) : (
                                    <div>
                                        <p className="text-xs text-muted mb-1 font-medium">Remarks / Description</p>
                                        <p className="text-sm text-foreground bg-background p-3 rounded-md border border-border min-h-[80px]">
                                            {expense.remarks || <span className="text-muted italic">No remarks provided.</span>}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANE: Proofs & Attachments (5 Columns) */}
                  {/* RIGHT PANE: Proofs & Attachments (5 Columns) */}
                    <div className="lg:col-span-5 space-y-6">
                        
                        {/* Bill Proof Section */}
                        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                            <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2"><i className="fas fa-receipt text-primary"></i> Bill / Invoice Proof</span>
                            </h2>
                            
                            {/* FIX: Changed expense.billProof to expense.bill */}
                            {renderProofDisplay(expense.bill, 'bill')}

                            {isEditing && (
                                <div className="mt-4 pt-4 border-t border-border border-dashed">
                                    <Label className="!text-xs">Upload New Bill (Overrides existing)</Label>
                                    <input 
                                        type="file" 
                                        accept="image/*,.pdf" 
                                        onChange={(e) => setNewBillProof(e.target.files?.[0] || null)}
                                        className="mt-1 block w-full text-xs text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
                                    />
                                    {newBillProof && <p className="text-[10px] text-success font-medium mt-1">Ready to upload: {newBillProof.name}</p>}
                                </div>
                            )}
                        </div>

                        {/* Work Proof Section */}
                        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                            <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2"><i className="fas fa-camera text-primary"></i> Work / Product Photo</span>
                            </h2>
                            
                            {/* FIX: Changed expense.workProof to expense.workPhoto */}
                            {renderProofDisplay(expense.workPhoto, 'workPhoto')}

                            {isEditing && (
                                <div className="mt-4 pt-4 border-t border-border border-dashed">
                                    <Label className="!text-xs">Upload New Work Photo (Overrides existing)</Label>
                                    <input 
                                        type="file" 
                                        accept="image/*,.pdf" 
                                        onChange={(e) => setNewWorkProof(e.target.files?.[0] || null)}
                                        className="mt-1 block w-full text-xs text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
                                    />
                                    {newWorkProof && <p className="text-[10px] text-success font-medium mt-1">Ready to upload: {newWorkProof.name}</p>}
                                </div>
                            )}
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}