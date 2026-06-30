import { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { toast } from '../../../shared/ui/ToastContext';
import { useCreateEmployeeProfile, useUpdateEmployeeProfile, type IEmployeeProfilePayload } from '../../../api_services/auth_api/employeeProfileApi';

const INITIAL_PROFILE_STATE = {
    employeeNo: '', designation: '', department: '', employmentType: '',
    dateOfJoining: '', nationalId: '', pfNumber: '', yearsOfExperience: 0,
    currentAddress: '', permanentAddress: '',
    emergencyContact: { name: '', relation: '', phone: '' },
    bankDetails: { accountName: '', accountNumber: '', bankName: '', ifscCode: '' },
    educationDetails: [] as { degree: string; institution: string; yearOfPassing: string; grade: string }[],

};

interface HrDetailsTabProps {
    userId: string;
    schoolId: string;
    validProfile: IEmployeeProfilePayload;
    hasProfile: boolean;
    isLoading: boolean;
    refetch: () => void;
    // Set to false to hide edit affordances for self-service staff view if needed later
    canEdit?: boolean;
}

export function HrDetailsTab({ userId, schoolId, validProfile, hasProfile, isLoading, refetch, canEdit = true }: HrDetailsTabProps) {
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileFormData, setProfileFormData] = useState<any>(INITIAL_PROFILE_STATE);

    const { mutateAsync: createProfile, isPending: isCreatingProfile } = useCreateEmployeeProfile();
    const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateEmployeeProfile();

    useEffect(() => {
        if (hasProfile) {
            setProfileFormData({
                ...validProfile,
                dateOfJoining: validProfile.dateOfJoining ? new Date(validProfile.dateOfJoining).toISOString().split('T')[0] : '',
                emergencyContact: validProfile.emergencyContact || INITIAL_PROFILE_STATE.emergencyContact,
                bankDetails: validProfile?.bankDetails || INITIAL_PROFILE_STATE.bankDetails,
                educationDetails: validProfile?.educationDetails?.length ? validProfile.educationDetails : [],
                aadharNumber: validProfile?.aadharNumber || ""

            });
            setIsEditingProfile(false);
        } else {
            setProfileFormData(INITIAL_PROFILE_STATE);
            setIsEditingProfile(true);
        }
    }, [validProfile, hasProfile]);

    const handleProfileSubmit = async () => {
        try {
            if (hasProfile) {
                await updateProfile({ userId, updateData: profileFormData });
                toast.success("Employment record updated!");
                setIsEditingProfile(false);
            } else {
                const formData = new FormData();
                const payload = { ...profileFormData, userId, schoolId };

                Object.entries(payload).forEach(([key, value]) => {
                    if (value === undefined || value === null) return;
                    if (typeof value === "object") {
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, value as string);
                    }
                });

                await createProfile(formData);
                toast.success("Employment record created!");
                setIsEditingProfile(false);
            }
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Failed to save employment record");
        }
    };

    const handleCancelProfileEdit = () => {
        setProfileFormData({
            ...validProfile,
            dateOfJoining: validProfile?.dateOfJoining ? new Date(validProfile.dateOfJoining).toISOString().split('T')[0] : '',
            emergencyContact: validProfile?.emergencyContact || INITIAL_PROFILE_STATE.emergencyContact
        });
        setIsEditingProfile(false);
    };

    const handleAddEducationRow = () => {
        setProfileFormData({
            ...profileFormData,
            educationDetails: [
                ...(profileFormData.educationDetails || []),
                { degree: '', institution: '', yearOfPassing: '', grade: '' }
            ]
        });
    };

    const handleRemoveEducationRow = (index: number) => {
        setProfileFormData({
            ...profileFormData,
            educationDetails: profileFormData.educationDetails.filter((_: any, i: number) => i !== index)
        });
    };

    const handleEducationFieldChange = (index: number, field: string, value: string) => {
        const updated = [...profileFormData.educationDetails];
        updated[index] = { ...updated[index], [field]: value };
        setProfileFormData({ ...profileFormData, educationDetails: updated });
    };


    return (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm max-w-7xl">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-bold text-foreground">
                    {hasProfile ? "Employment Record" : "Registration Form"}
                </h2>
                {canEdit && hasProfile && !isEditingProfile && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)} leftIcon="fas fa-pen">Edit Record</Button>
                )}
            </div>

            {isLoading ? (
                <div className="py-12 text-center text-muted"><i className="fas fa-spinner fa-spin mr-2"></i> Loading HR data...</div>
            ) : (!hasProfile || isEditingProfile) ? (
                <div className="space-y-8 animate-fade-in">
                    {!hasProfile && (
                        <div className="bg-primary-soft/50 border border-primary/20 p-4 rounded-lg flex items-start gap-3 mb-6">
                            <i className="fas fa-info-circle text-primary mt-0.5"></i>
                            <p className="text-sm text-foreground">No employment record found for this user. Fill out the form below to register them in the HR system.</p>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Professional Identity</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <Input label="Employee Number" value={profileFormData.employeeNo} onChange={(e) => setProfileFormData({ ...profileFormData, employeeNo: e.target.value })} />
                            <Input label="Designation" value={profileFormData.designation} onChange={(e) => setProfileFormData({ ...profileFormData, designation: e.target.value })} />
                            <Input label="Department" value={profileFormData.department} onChange={(e) => setProfileFormData({ ...profileFormData, department: e.target.value })} />
                            <SearchSelect
                                label="Employment Type"
                                options={[
                                    { label: "Full Time", value: "full_time" }, { label: "Part Time", value: "part_time" },
                                    { label: "Contract", value: "contract" }, { label: "Temporary", value: "temporary" }
                                ]}
                                value={profileFormData.employmentType}
                                onChange={(opt: any) => setProfileFormData({ ...profileFormData, employmentType: opt.value })}
                                isClearable={false}
                            />
                            <Input label="Date of Joining" type="date" value={profileFormData.dateOfJoining} onChange={(e) => setProfileFormData({ ...profileFormData, dateOfJoining: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Compliance & Background</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <Input label="National ID (Aadhaar/PAN)" value={profileFormData.nationalId} onChange={(e) => setProfileFormData({ ...profileFormData, nationalId: e.target.value })} />
                            <Input label="PF Number" value={profileFormData.pfNumber} onChange={(e) => setProfileFormData({ ...profileFormData, pfNumber: e.target.value })} />
                            <Input label="Years of Experience" type="number" min="0" value={profileFormData.yearsOfExperience || ""} onChange={(e) => setProfileFormData({ ...profileFormData, yearsOfExperience: Math.max(0, Number(e.target.value)) })} />
                            <Input label="Current Address" value={profileFormData.currentAddress} onChange={(e) => setProfileFormData({ ...profileFormData, currentAddress: e.target.value })} />
                            <Input label="Permanent Address" value={profileFormData.permanentAddress} onChange={(e) => setProfileFormData({ ...profileFormData, permanentAddress: e.target.value })} />
                            <Input label="Aadhar Number" value={profileFormData.aadharNumber} onChange={(e) => setProfileFormData({ ...profileFormData, aadharNumber: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                            <h3 className="text-sm font-bold text-primary">Educational Qualifications</h3>
                            <Button variant="outline" size="sm" onClick={handleAddEducationRow} leftIcon="fas fa-plus">
                                Add Qualification
                            </Button>
                        </div>

                        {(!profileFormData.educationDetails || profileFormData.educationDetails.length === 0) ? (
                            <p className="text-sm text-muted">No qualifications added yet. Click "Add Qualification" to start.</p>
                        ) : (
                            <div className="space-y-3">
                                {profileFormData.educationDetails.map((edu: any, index: number) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-3 border border-border rounded-lg bg-mainBg/30">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1 w-full">
                                            <Input label="Degree" value={edu.degree || ''} onChange={(e) => handleEducationFieldChange(index, 'degree', e.target.value)} />
                                            <Input label="Institution" value={edu.institution || ''} onChange={(e) => handleEducationFieldChange(index, 'institution', e.target.value)} />
                                            <Input label="Year of Passing" value={edu.yearOfPassing || ''} onChange={(e) => handleEducationFieldChange(index, 'yearOfPassing', e.target.value.replace(/\D/g, ''))} maxLength={4} />
                                            <Input label="Grade / CGPA" value={edu.grade || ''} onChange={(e) => handleEducationFieldChange(index, 'grade', e.target.value)} />
                                        </div>
                                        <button
                                            onClick={() => handleRemoveEducationRow(index)}
                                            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted hover:text-red-500 hover:border-red-200 transition-colors mt-1 sm:mt-0"
                                            title="Remove this qualification"
                                        >
                                            <i className="fas fa-trash text-sm"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Bank Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <Input label="Accountant Name" value={profileFormData.bankDetails?.accountName || ''} onChange={(e) => setProfileFormData({ ...profileFormData, bankDetails: { ...profileFormData.bankDetails, accountName: e.target.value } })} />
                            <Input label="Account Number" value={profileFormData.bankDetails?.accountNumber || ''} onChange={(e) => setProfileFormData({ ...profileFormData, bankDetails: { ...profileFormData.bankDetails, accountNumber: e.target.value.replace(/\D/g, '') } })} />
                            <Input label="Bank Name" value={profileFormData.bankDetails?.bankName || ''} onChange={(e) => setProfileFormData({ ...profileFormData, bankDetails: { ...profileFormData.bankDetails, bankName: e.target.value } })} />
                            <Input label="IFSC Code" value={profileFormData.bankDetails?.ifscCode || ''} onChange={(e) => setProfileFormData({ ...profileFormData, bankDetails: { ...profileFormData.bankDetails, ifscCode: e.target.value.toUpperCase() } })} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Emergency Contact</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <Input label="Contact Name" value={profileFormData.emergencyContact.name} onChange={(e) => setProfileFormData({ ...profileFormData, emergencyContact: { ...profileFormData.emergencyContact, name: e.target.value } })} />
                            <Input label="Relation" value={profileFormData.emergencyContact.relation} onChange={(e) => setProfileFormData({ ...profileFormData, emergencyContact: { ...profileFormData.emergencyContact, relation: e.target.value } })} />
                            <Input label="Phone Number" maxLength={10} value={profileFormData.emergencyContact.phone} onChange={(e) => setProfileFormData({ ...profileFormData, emergencyContact: { ...profileFormData.emergencyContact, phone: e.target.value.replace(/\D/g, '') } })} />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border flex justify-end gap-3">
                        {hasProfile && <Button variant="outline" onClick={handleCancelProfileEdit}>Cancel</Button>}
                        <Button variant="primary" isLoading={isCreatingProfile || isUpdatingProfile} onClick={handleProfileSubmit}>
                            {hasProfile ? "Update Record" : "Save"}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    <div>
                        <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Professional Identity</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Employee No</p><p className="font-medium text-foreground">{validProfile?.employeeNo || '-'}</p></div>
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Designation</p><p className="font-medium text-foreground">{validProfile?.designation || '-'}</p></div>
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Department</p><p className="font-medium text-foreground">{validProfile?.department || '-'}</p></div>
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Employment Type</p><p className="font-medium text-foreground capitalize">{validProfile?.employmentType?.replace('_', ' ') || '-'}</p></div>
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Date of Joining</p><p className="font-medium text-foreground">{validProfile?.dateOfJoining ? new Date(validProfile.dateOfJoining).toLocaleDateString() : '-'}</p></div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Compliance & Background</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">National ID</p><p className="font-medium text-foreground">{validProfile?.nationalId || '-'}</p></div>
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">PF Number</p><p className="font-medium text-foreground">{validProfile?.pfNumber || '-'}</p></div>
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Experience</p><p className="font-medium text-foreground">{validProfile?.yearsOfExperience ? `${validProfile?.yearsOfExperience} years` : "-"}</p></div>
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Current Address</p><p className="font-medium text-foreground">{validProfile?.currentAddress || '-'}</p></div>
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Permanent Address</p><p className="font-medium text-foreground">{validProfile?.permanentAddress || '-'}</p></div>
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Aadhar Number</p><p className="font-medium text-foreground">{validProfile?.aadharNumber || '-'}</p></div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Educational Qualifications</h3>
                        {(!validProfile?.educationDetails || validProfile?.educationDetails.length === 0) ? (
                            <p className="text-sm text-muted">No qualifications on record.</p>
                        ) : (
                            <div className="space-y-2">
                                {validProfile?.educationDetails.map((edu: any, index: number) => (
                                    <div key={edu._id || index} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-3 border border-border rounded-lg">
                                        <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Degree</p><p className="font-medium text-foreground">{edu.degree || '-'}</p></div>
                                        <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Institution</p><p className="font-medium text-foreground">{edu.institution || '-'}</p></div>
                                        <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Year of Passing</p><p className="font-medium text-foreground">{edu.yearOfPassing || '-'}</p></div>
                                        <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Grade</p><p className="font-medium text-foreground">{edu.grade || '-'}</p></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Bank Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Accountant Name</p><p className="font-medium text-foreground">{validProfile?.bankDetails?.accountName || '-'}</p></div>
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Account Number</p><p className="font-medium text-foreground">{validProfile?.bankDetails?.accountNumber || '-'}</p></div>
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Bank Name</p><p className="font-medium text-foreground">{validProfile?.bankDetails?.bankName || '-'}</p></div>
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">IFSC Code</p><p className="font-medium text-foreground">{validProfile?.bankDetails?.ifscCode || '-'}</p></div>
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