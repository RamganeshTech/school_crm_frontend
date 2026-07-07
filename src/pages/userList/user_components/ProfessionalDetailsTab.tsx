import { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { toast } from '../../../shared/ui/ToastContext';
// import { useCreateEmployeeProfile, useUpdateEmployeeProfile } from '../../../api_services/auth_api/employeeProfileApi';
import { useUpsertEmployeeProfile } from '../../../api_services/auth_api/employeeProfileApi';

const INITIAL_STATE = {
    employeeNo: '', designation: '', department: '', employmentType: '',
    dateOfJoining: '', nationalId: '', pfNumber: '', yearsOfExperience: 0,
    previousWorkplace: '', aadharNumber: ""
};

interface ProfessionalDetailsTabProps {
    userId: string;
    schoolId: string;
    validProfile: any;
    hasProfile: boolean;
    isLoading: boolean;
    refetch: () => void;
    canEdit?: boolean;
}

export function ProfessionalDetailsTab({ userId, schoolId, validProfile, hasProfile, isLoading, refetch, canEdit = true }: ProfessionalDetailsTabProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>(INITIAL_STATE);

    // const { mutateAsync: createProfile, isPending: isCreating } = useCreateEmployeeProfile();
    // const { mutateAsync: updateProfile, isPending: isUpdating } = useUpdateEmployeeProfile();
    const { mutateAsync: upsertProfile, isPending: isUpserting } = useUpsertEmployeeProfile();

    useEffect(() => {
        if (hasProfile) {
            setFormData({
                employeeNo: validProfile.employeeNo || '',
                designation: validProfile.designation || '',
                department: validProfile.department || '',
                employmentType: validProfile.employmentType || '',
                dateOfJoining: validProfile.dateOfJoining ? new Date(validProfile.dateOfJoining).toISOString().split('T')[0] : '',
                nationalId: validProfile.nationalId || '',
                pfNumber: validProfile.pfNumber || '',
                yearsOfExperience: validProfile.yearsOfExperience || 0,
                previousWorkplace: validProfile?.previousWorkplace || '',
                aadharNumber: validProfile?.aadharNumber || ''
            });
            setIsEditing(false);
        } else {
            setFormData(INITIAL_STATE);
            setIsEditing(true);
        }
    }, [validProfile, hasProfile]);

    // const handleSubmit = async () => {
    //     try {
    //         if (hasProfile) {
    //             await updateProfile({ userId, updateData: formData });
    //             toast.success("Professional details updated!");
    //             setIsEditing(false);
    //         } else {
    //             const fd = new FormData();
    //             const payload = { ...formData, userId, schoolId };
    //             Object.entries(payload).forEach(([key, value]) => {
    //                 if (value === undefined || value === null) return;
    //                 fd.append(key, value as string);
    //             });
    //             await createProfile(fd);
    //             toast.success("Employment record created!");
    //             setIsEditing(false);
    //         }
    //         refetch();
    //     } catch (error: any) {
    //         toast.error(error.message || "Failed to save professional details");
    //     }
    // };

    const handleSubmit = async () => {
    try {
        await upsertProfile({ 
            userId, 
            schoolId, 
            fields: formData // Just send the flat object!
        });
        
        toast.success("Professional details saved successfully!");
        setIsEditing(false);
        refetch();
    } catch (error: any) {
        toast.error(error.message || "Failed to save details");
    }
};

    const handleCancel = () => {
        setFormData({
            employeeNo: validProfile?.employeeNo || '', designation: validProfile?.designation || '',
            department: validProfile?.department || '', employmentType: validProfile?.employmentType || '',
            dateOfJoining: validProfile?.dateOfJoining ? new Date(validProfile.dateOfJoining).toISOString().split('T')[0] : '',
            nationalId: validProfile?.nationalId || '', pfNumber: validProfile?.pfNumber || '',
            yearsOfExperience: validProfile?.yearsOfExperience || 0, previousWorkplace: validProfile?.previousWorkplace || ''
        });
        setIsEditing(false);
    };

    return (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm max-w-7xl">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-bold text-foreground">
                    {hasProfile ? "Professional Details" : "Registration Form"}
                </h2>
                {canEdit && hasProfile && !isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} leftIcon="fas fa-pen">Edit</Button>
                )}
            </div>

            {isLoading ? (
                <div className="py-12 text-center text-muted"><i className="fas fa-spinner fa-spin mr-2"></i> Loading...</div>
            ) : (!hasProfile || isEditing) ? (
                <div className="space-y-6 animate-fade-in">
                    {!hasProfile && (
                        <div className="bg-primary-soft/50 border border-primary/20 p-4 rounded-lg flex items-start gap-3 mb-2">
                            <i className="fas fa-info-circle text-primary mt-0.5"></i>
                            <p className="text-sm text-foreground">No employment record found. Fill out the form below to register them in the HR system.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <Input label="Employee Number" value={formData.employeeNo} onChange={(e) => setFormData({ ...formData, employeeNo: e.target.value })} />
                        <Input label="Designation" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} />
                        <Input label="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                        <SearchSelect
                            label="Employment Type"
                            options={[
                                { label: "Full Time", value: "full_time" }, { label: "Part Time", value: "part_time" },
                                { label: "Contract", value: "contract" }, { label: "Temporary", value: "temporary" }
                            ]}
                            value={formData.employmentType}
                            onChange={(opt: any) => setFormData({ ...formData, employmentType: opt.value })}
                            isClearable={false}
                        />
                        <Input label="Date of Joining" type="date" value={formData.dateOfJoining} onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })} />
                        <Input label="National ID (Aadhaar/PAN)" value={formData.nationalId} onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })} />
                        <Input label="PF Number" value={formData.pfNumber} onChange={(e) => setFormData({ ...formData, pfNumber: e.target.value })} />
                        <Input label="Years of Experience" type="number" min="0" value={formData.yearsOfExperience || ""} onChange={(e) => setFormData({ ...formData, yearsOfExperience: Math.max(0, Number(e.target.value)) })} />
                        {/* <Input label="Previous Workplace" value={formData.previousWorkplace} onChange={(e) => setFormData({ ...formData, previousWorkplace: e.target.value })} /> */}
                        <Input label="Aadhar Number" value={formData.aadharNumber} onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })} />
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end gap-3">
                        {hasProfile && <Button variant="outline" onClick={handleCancel}>Cancel</Button>}
                        <Button variant="primary" isLoading={isUpserting} onClick={handleSubmit}>
                            {hasProfile ? "Update" : "Save"}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Employee No</p><p className="font-medium text-foreground">{validProfile?.employeeNo || '-'}</p></div>
                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Designation</p><p className="font-medium text-foreground">{validProfile?.designation || '-'}</p></div>
                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Department</p><p className="font-medium text-foreground">{validProfile?.department || '-'}</p></div>
                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Employment Type</p><p className="font-medium text-foreground capitalize">{validProfile?.employmentType?.replace('_', ' ') || '-'}</p></div>
                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Date of Joining</p><p className="font-medium text-foreground">{validProfile?.dateOfJoining ? new Date(validProfile.dateOfJoining).toLocaleDateString() : '-'}</p></div>
                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">National ID</p><p className="font-medium text-foreground">{validProfile?.nationalId || '-'}</p></div>
                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">PF Number</p><p className="font-medium text-foreground">{validProfile?.pfNumber || '-'}</p></div>
                    {/* <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Experience</p><p className="font-medium text-foreground">{validProfile?.yearsOfExperience || 0} Years</p></div> */}
                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Experience</p><p className="font-medium text-foreground">{validProfile?.yearsOfExperience ? `${validProfile?.yearsOfExperience} years` : "-"}</p></div>

                    {/* <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Previous Workplace</p><p className="font-medium text-foreground">{validProfile?.previousWorkplace || '-'}</p></div> */}
                </div>
            )}
        </div>
    );
}