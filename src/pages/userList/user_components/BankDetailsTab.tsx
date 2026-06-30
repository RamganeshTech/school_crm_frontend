import { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { toast } from '../../../shared/ui/ToastContext';
import { useUpdateEmployeeProfile } from '../../../api_services/auth_api/employeeProfileApi';

const INITIAL_STATE = { accountName: '', accountNumber: '', bankName: '', ifscCode: '' };

interface BankDetailsTabProps {
    userId: string;
    validProfile: any;
    hasProfile: boolean;
    canEdit?: boolean;
    refetch?: any;
}

export function BankDetailsTab({ userId, validProfile, hasProfile, canEdit = true, refetch }: BankDetailsTabProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [bankDetails, setBankDetails] = useState<any>(INITIAL_STATE);
    const { mutateAsync: updateProfile, isPending } = useUpdateEmployeeProfile();

    useEffect(() => {
        setBankDetails(validProfile?.bankDetails || INITIAL_STATE);
    }, [validProfile]);

    const handleSubmit = async () => {
        try {
            await updateProfile({ userId, updateData: { bankDetails } });
            toast.success("Bank details updated!");
            setIsEditing(false);
            refetch()
        } catch (error: any) {
            toast.error(error.message || "Failed to update bank details");
        }
    };

    // if (!hasProfile) {
    //     return (
    //         <div className="bg-surface border border-border rounded-xl p-6 shadow-sm max-w-7xl py-12 text-center text-muted text-sm">
    //             <i className="fas fa-circle-info mr-2"></i>
    //             Complete the professional details first before adding bank details.
    //         </div>
    //     );
    // }


    console.log("hasProfile", hasProfile)

    return (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm max-w-7xl">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-bold text-foreground">Bank Details</h2>
                {canEdit && !isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} leftIcon="fas fa-pen">Edit</Button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <Input label="Accountant Name" value={bankDetails.accountName || ''} onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })} />
                        <Input label="Account Number" value={bankDetails.accountNumber || ''} onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value.replace(/\D/g, '') })} />
                        <Input label="Bank Name" value={bankDetails.bankName || ''} onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })} />
                        <Input label="IFSC Code" value={bankDetails.ifscCode || ''} onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })} />
                    </div>
                    <div className="pt-4 border-t border-border flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button variant="primary" isLoading={isPending} onClick={handleSubmit}>Save</Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in">
                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Accountant Name</p><p className="font-medium text-foreground">{validProfile?.bankDetails?.accountName || '-'}</p></div>
                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Account Number</p><p className="font-medium text-foreground">{validProfile?.bankDetails?.accountNumber || '-'}</p></div>
                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Bank Name</p><p className="font-medium text-foreground">{validProfile?.bankDetails?.bankName || '-'}</p></div>
                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">IFSC Code</p><p className="font-medium text-foreground">{validProfile?.bankDetails?.ifscCode || '-'}</p></div>
                </div>
            )}
        </div>
    );
}