import { useState } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { toast } from '../../../shared/ui/ToastContext';
import { useAddSalarySlip, useDeleteSalarySlip } from '../../../api_services/auth_api/employeeProfileApi';

interface SalarySlipsTabProps {
    userId: string;
    hasProfile: boolean;
    salarySlips: any[];
    refetch: () => void;
    canEdit?: boolean;
}

export function SalarySlipsTab({ userId, hasProfile, salarySlips, refetch, canEdit = true }: SalarySlipsTabProps) {
    const { mutateAsync: addSlip, isPending: isAdding } = useAddSalarySlip();
    const { mutateAsync: deleteSlip, isPending: isDeleting } = useDeleteSalarySlip();

    const [amount, setAmount] = useState('');
    const [salaryDate, setSalaryDate] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const sortedSlips = [...(salarySlips || [])].sort((a, b) => {
        const dateA = a.salaryDate ? new Date(a.salaryDate).getTime() : 0;
        const dateB = b.salaryDate ? new Date(b.salaryDate).getTime() : 0;
        return dateB - dateA;
    });

    const handleUpload = async () => {
        const hasTextData = amount || salaryDate;

        if (!hasTextData && !file) {
            toast.error("Please provide both Amount & Date, OR upload a file.");
            return;
        }


        console.log("fiel ls111111111", file)

        if (!file) {
            toast.error("please upload a file.");
            return;
        }


        try {
            await addSlip({ userId, amount: Number(amount), salaryDate, file: file || null });
            toast.success("Salary slip added successfully!");
            setAmount('');
            setSalaryDate('');
            setFile(null);
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Failed to add salary slip");
        }
    };

    const handleDelete = async (slipId: string) => {
        try {
            await deleteSlip({ userId, slipId });
            toast.success("Salary slip deleted.");
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete salary slip");
        }
    };

    // if (!hasProfile) {
    //     return (
    //         <div className="bg-surface border border-border rounded-xl p-6 shadow-sm max-w-7xl py-12 text-center text-muted text-sm">
    //             <i className="fas fa-circle-info mr-2"></i>
    //             Complete the professional details first before adding salary slips.
    //         </div>
    //     );
    // }

    console.log("hasProfile", hasProfile)


    return (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm max-w-7xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-bold text-foreground">Salary Slips</h2>
                    <p className="text-xs text-muted mt-1">Monthly salary slips with amount and payment date for quick reference.</p>
                </div>
            </div>

            {canEdit && (
                <div className="border border-border rounded-xl p-4 mb-6 bg-mainBg/30">
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Add New Salary Slip</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        <Input label="Amount (₹)" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
                        <Input label="Salary Month / Date" type="date" value={salaryDate} onChange={(e) => setSalaryDate(e.target.value)} />
                        <label
                            htmlFor="salary-slip-file-input"
                            className="flex items-center gap-2 border border-border rounded-lg px-3 py-2.5 cursor-pointer hover:border-primary transition-colors text-sm"
                        >
                            <i className="fas fa-paperclip text-muted"></i>
                            <span className="truncate text-foreground">{file ? file.name : "Choose file"}</span>
                            <input
                                id="salary-slip-file-input"
                                type="file"
                                accept=".pdf,image/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <div className="flex justify-end mt-3">
                        <Button variant="primary" size="sm" isLoading={isAdding} onClick={handleUpload}>Add Salary Slip</Button>
                    </div>
                </div>
            )}

            {sortedSlips.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 border border-dashed border-border rounded-xl text-center">
                    <div className="w-10 h-10 rounded-full bg-mainBg flex items-center justify-center text-muted">
                        <i className="far fa-file-lines"></i>
                    </div>
                    <p className="text-sm font-medium text-foreground">No salary slips uploaded yet</p>
                    <p className="text-xs text-muted">Slips added above will appear here, sorted by latest first.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {sortedSlips.map((slip: any) => (
                        <div key={slip._id} className="group border border-border rounded-lg p-4 hover:border-primary/40 transition-colors">
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="w-9 h-9 rounded-md bg-primary-soft flex items-center justify-center text-primary text-sm shrink-0">
                                    <i className="fas fa-file-invoice-dollar"></i>
                                </div>
                                {canEdit && (
                                    <button
                                        disabled={isDeleting}
                                        onClick={() => handleDelete(slip._id)}
                                        className="text-muted hover:text-red-500 text-xs transition-colors"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                )}
                            </div>
                            <p className="text-lg font-bold text-foreground">
                                {slip.amount != null ? `₹${slip.amount.toLocaleString('en-IN')}` : '-'}
                            </p>
                            <p className="text-xs text-muted mb-3">
                                {slip.salaryDate ? new Date(slip.salaryDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '-'}
                            </p>
                            {slip.file?.url && (
                                <a
                                    href={slip.file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                                >
                                    <i className="fas fa-eye"></i> View Slip
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}