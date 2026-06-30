import { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { toast } from '../../../shared/ui/ToastContext';
import { useUpdateEmployeeProfile } from '../../../api_services/auth_api/employeeProfileApi';

interface EducationDetailsTabProps {
    userId: string;
    validProfile: any;
    hasProfile: boolean;
    canEdit?: boolean;
    refetch?:any
}

export function EducationDetailsTab({ userId, validProfile, hasProfile, canEdit = true, refetch }: EducationDetailsTabProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [educationDetails, setEducationDetails] = useState<any[]>([]);
    const { mutateAsync: updateProfile, isPending } = useUpdateEmployeeProfile();

    useEffect(() => {
        setEducationDetails(validProfile?.educationDetails?.length ? validProfile.educationDetails : []);
    }, [validProfile]);

    const handleAddRow = () => {
        setEducationDetails([...educationDetails, { degree: '', institution: '', yearOfPassing: '', grade: '' }]);
    };

    const handleRemoveRow = (index: number) => {
        setEducationDetails(educationDetails.filter((_, i) => i !== index));
    };

    const handleFieldChange = (index: number, field: string, value: string) => {
        const updated = [...educationDetails];
        updated[index] = { ...updated[index], [field]: value };
        setEducationDetails(updated);
    };

    const handleSubmit = async () => {
        try {
            await updateProfile({ userId, updateData: { educationDetails } });
            toast.success("Education details updated!");
            setIsEditing(false);
            refetch()
        } catch (error: any) {
            toast.error(error.message || "Failed to update education details");
        }
    };

    // if (!hasProfile) {
    //     return (
    //         <div className="bg-surface border border-border rounded-xl p-6 shadow-sm max-w-7xl py-12 text-center text-muted text-sm">
    //             <i className="fas fa-circle-info mr-2"></i>
    //             Complete the professional details first before adding education details.
    //         </div>
    //     );
    // }

    console.log("hasProfile", hasProfile)


    return (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm max-w-7xl">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-bold text-foreground">Educational Qualifications</h2>
                {canEdit && !isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} leftIcon="fas fa-pen">Edit</Button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={handleAddRow} leftIcon="fas fa-plus">Add Qualification</Button>
                    </div>

                    {educationDetails.length === 0 ? (
                        <p className="text-sm text-muted">No qualifications added yet. Click "Add Qualification" to start.</p>
                    ) : (
                        <div className="space-y-3">
                            {educationDetails.map((edu, index) => (
                                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-3 border border-border rounded-lg bg-mainBg/30">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1 w-full">
                                        <Input label="Degree" value={edu.degree || ''} onChange={(e) => handleFieldChange(index, 'degree', e.target.value)} />
                                        <Input label="Institution" value={edu.institution || ''} onChange={(e) => handleFieldChange(index, 'institution', e.target.value)} />
                                        <Input label="Year of Passing" value={edu.yearOfPassing || ''} onChange={(e) => handleFieldChange(index, 'yearOfPassing', e.target.value.replace(/\D/g, ''))} maxLength={4} />
                                        <Input label="Grade / CGPA" value={edu.grade || ''} onChange={(e) => handleFieldChange(index, 'grade', e.target.value)} />
                                    </div>
                                    <button onClick={() => handleRemoveRow(index)} className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted hover:text-red-500 hover:border-red-200 transition-colors mt-1 sm:mt-0">
                                        <i className="fas fa-trash text-sm"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pt-4 border-t border-border flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button variant="primary" isLoading={isPending} onClick={handleSubmit}>Save</Button>
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    {(!validProfile?.educationDetails || validProfile.educationDetails.length === 0) ? (
                        <p className="text-sm text-muted">No qualifications on record.</p>
                    ) : (
                        <div className="space-y-2">
                            {validProfile.educationDetails.map((edu: any, index: number) => (
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
            )}
        </div>
    );
}