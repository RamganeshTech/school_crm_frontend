import { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { toast } from '../../../shared/ui/ToastContext';
import { useUpsertEmployeeProfile } from '../../../api_services/auth_api/employeeProfileApi';
import { useAuthData } from '../../../hooks/useAuthData';

const INITIAL_STATE = {
    currentAddress: '', permanentAddress: '',
    emergencyContact: { name: '', relation: '', phone: '' }
};

interface ContactDetailsTabProps {
    userId: string;
    validProfile: any;
    hasProfile: boolean;
    canEdit?: boolean;
    refetch?:any
}

export function ContactDetailsTab({ userId, validProfile, hasProfile, canEdit = true, refetch }: ContactDetailsTabProps) {

    console.log("hasProfile", hasProfile)
    const {schoolId} = useAuthData()
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>(INITIAL_STATE);
    // const { mutateAsync: updateProfile, isPending } = useUpdateEmployeeProfile();
    const { mutateAsync: upsertProfile, isPending } = useUpsertEmployeeProfile();

    useEffect(() => {
        setFormData({
            currentAddress: validProfile?.currentAddress || '',
            permanentAddress: validProfile?.permanentAddress || '',
            emergencyContact: validProfile?.emergencyContact || INITIAL_STATE.emergencyContact
        });
    }, [validProfile]);

    // const handleSubmit = async () => {
    //     if (formData.emergencyContact.phone && !/^\d{10}$/.test(formData.emergencyContact.phone)) {
    //         toast.error("Emergency contact phone must be exactly 10 digits.");
    //         return;
    //     }
    //     try {
    //         await updateProfile({ userId, updateData: formData });
    //         toast.success("Contact information updated!");
    //         setIsEditing(false);
    //     } catch (error: any) {
    //         toast.error(error.message || "Failed to update contact information");
    //     }
    // };


    const handleSubmit = async () => {
        // Keep your phone validation
        if (formData.emergencyContact.phone && !/^\d{10}$/.test(formData.emergencyContact.phone)) {
            toast.error("Emergency contact phone must be exactly 10 digits.");
            return;
        }

        try {
            await upsertProfile({
                userId,
                schoolId: schoolId!, // Pass the schoolId from the existing profile
                fields: formData
            });

            refetch()

            toast.success("Contact information saved!");
            setIsEditing(false);
            // Note: No need for manual refetch() here if your upsert hook 
            // invalidates the 'employee-profile-single' query in onSuccess!
        } catch (error: any) {
            toast.error(error.message || "Failed to update contact information");
        }
    };

    // if (!hasProfile) {
    //     return (
    //         <div className="bg-surface border border-border rounded-xl p-6 shadow-sm max-w-7xl py-12 text-center text-muted text-sm">
    //             <i className="fas fa-circle-info mr-2"></i>
    //             Complete the professional details first before adding contact information.
    //         </div>
    //     );
    // }

    return (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm max-w-7xl">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-bold text-foreground">Contact Information</h2>
                {canEdit && !isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} leftIcon="fas fa-pen">Edit</Button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Address</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="Current Address" value={formData.currentAddress} onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })} />
                            <Input label="Permanent Address" value={formData.permanentAddress} onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Emergency Contact</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <Input label="Contact Name" value={formData.emergencyContact.name} onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, name: e.target.value } })} />
                            <Input label="Relation" value={formData.emergencyContact.relation} onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, relation: e.target.value } })} />
                            <Input label="Phone Number" maxLength={10} value={formData.emergencyContact.phone} onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, phone: e.target.value.replace(/\D/g, '') } })} />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button variant="primary" isLoading={isPending} onClick={handleSubmit}>Save</Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    <div>
                        <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Address</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Current Address</p><p className="font-medium text-foreground">{validProfile?.currentAddress || '-'}</p></div>
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Permanent Address</p><p className="font-medium text-foreground">{validProfile?.permanentAddress || '-'}</p></div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Emergency Contact</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Contact Name</p><p className="font-medium text-foreground">{validProfile?.emergencyContact?.name || '-'}</p></div>
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Relation</p><p className="font-medium text-foreground">{validProfile?.emergencyContact?.relation || '-'}</p></div>
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Phone Number</p><p className="font-medium text-foreground">{validProfile?.emergencyContact?.phone || '-'}</p></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}