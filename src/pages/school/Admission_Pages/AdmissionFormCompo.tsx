import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardHeader, CardContent } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { toast } from '../../../shared/ui/ToastContext';
import type { RootState } from '../../../features/store/store';

// 🌟 Internal API Hooks Fully Encapsulated
import {
    useLinkStudentToForm,
    useGetSingleAdmissionForm,
    useGetAdmissionFormsDropdown
} from '../../../api_services/schoolConfig_api/admissionFormApi';
import { useGetSchoolById } from '../../../api_services/schoolConfig_api/schoolapi';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { useRoleCheck } from '../../../hooks/useRoleCheck';

// --- Interfaces ---
export interface AdmissionFormData {
    studentName: string; studentId: string; dob: string; age: string | number; gender: string;
    motherTongue: string; religion: string; community: string; emisNumber: string;
    admissionSoughtFor: string; examinationPassed: string;
    mobileNumber: string; currentAddress: string; permanentAddress: string;
    fatherName: string; fatherEducation: string; fatherOccupation: string;
    motherName: string; motherEducation: string; motherOccupation: string;
    formNumber?: string; status?: string; submittedAt?: string; isSubmitted?: boolean;
}

interface AdmissionFormCompoProps {
    formId?: string; // If provided, it fetches the data automatically
    mode?: 'create' | 'view' | 'edit';

    // Action Props
    onSubmit?: (data: AdmissionFormData) => Promise<void>;
    onUpdateStatus?: (status: 'Pending' | 'Approved' | 'Rejected') => Promise<void>;
    isSubmitting?: boolean;
    isUpdatingStatus?: boolean;
    canEdit?: boolean;

    // Linking Props
    enableLinking?: boolean;
    studentId?: string;
    onLinkSuccess?: (linkedFormId: string) => void;
    showHeading?: boolean
}

export default function AdmissionFormCompo({
    formId,
    mode: initialMode = 'view',
    onSubmit,
    onUpdateStatus,
    isSubmitting = false,
    isUpdatingStatus = false,
    canEdit = false,
    enableLinking = false,
    studentId,
    onLinkSuccess,
    showHeading = false
}: AdmissionFormCompoProps) {
    const { schoolId } = useSelector((state: RootState) => state.auth);

    const { data: schoolData } = useGetSchoolById(schoolId!);

    const { isParent } = useRoleCheck()


    const currentAcademicYear = schoolData?.currentAcademicYear || "";


    // --- State Management ---
    const [currentMode, setCurrentMode] = useState<'create' | 'view' | 'edit'>(initialMode);
    const [formData, setFormData] = useState<AdmissionFormData>({
        studentName: '', studentId: "", dob: '', age: '', gender: '', motherTongue: '', religion: '', community: '', emisNumber: '',
        admissionSoughtFor: '', examinationPassed: '', mobileNumber: '', currentAddress: '', permanentAddress: '',
        fatherName: '', fatherEducation: '', fatherOccupation: '', motherName: '', motherEducation: '', motherOccupation: ''
    });

    // Linking State
    const [selectedFormToLink, setSelectedFormToLink] = useState<string>("");

    // --- Internal Data Fetching ---
    const { data: fetchedForm, isLoading: isFetchingForm, refetch } = useGetSingleAdmissionForm({ formId: formId || undefined, studentId: studentId || undefined });

    // --- Internal API Hooks for Linking ---
    const linkMutation = useLinkStudentToForm();



    const { data: linkableForms = [] } = useGetAdmissionFormsDropdown({
        schoolId: schoolId!,
        academicYear: currentAcademicYear,
    });

    // 🌟 Map the API data to match your SearchSelect { label, value } requirement
    const formOptions = linkableForms.map((f: any) => ({
        label: `#${f.formNumber} - ${f.studentName} ${f.mobileNumber ? `(${f.mobileNumber})` : ''}`,
        value: f._id
    }));


    // --- Sync External Data ---
    useEffect(() => {
        if (fetchedForm) {

            // 🌟 Format the DOB to YYYY-MM-DD if it exists
            let formattedDob = '';
            if (fetchedForm.dob) {
                formattedDob = new Date(fetchedForm.dob).toISOString().split('T')[0];
            }

            setFormData(prev => ({ ...prev, ...fetchedForm, dob: formattedDob }));
            // Auto-switch to view if data is fetched and we aren't explicitly told to create
            if (initialMode !== 'create') setCurrentMode('view');
        } else {
            setCurrentMode(initialMode);
        }
    }, [fetchedForm, initialMode]);

    // --- Handlers ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            await onSubmit(formData);
            if (currentMode === 'edit') setCurrentMode('view');
        }
    };

    const handleLinkAction = async () => {
        if (!selectedFormToLink || !studentId) return;
        try {
            await linkMutation.mutateAsync({ id: selectedFormToLink, schoolId: schoolId!, studentId });
            toast.success("Admission Form linked successfully!");
            if (onLinkSuccess) onLinkSuccess(selectedFormToLink);
            refetch()
        } catch (error: any) {
            toast.error(error.message || "Failed to link form.");
        }
    };

    // --- Loading State ---
    if (isFetchingForm) {
        return <div className="flex justify-center p-8 text-muted animate-pulse"><i className="fas fa-spinner fa-spin mr-2"></i> Loading application data...</div>;
    }

    // ==========================================
    // RENDER: LINKING SECTION
    // ==========================================
    const renderLinkingSection = () => {
        if (!enableLinking || formId) return null; // Don't show if already linked

        return (
            <Card className="mb-4 border-primary/30 bg-primary/5">
                <CardContent className="p-4 flex flex-col md:flex-row items-end gap-3">
                    {/* 🌟 Your custom SearchSelect replaces both the old Input and Select! */}
                    <div className="flex-1 w-full">
                        <SearchSelect
                            label="Search & Select Application"
                            options={formOptions}
                            value={selectedFormToLink}
                            // onChange={(val: string) => setSelectedFormToLink(val)}
                            onChange={(selectedOption) => setSelectedFormToLink(String(selectedOption.value))}
                            placeholder="Type to search applications..."
                        />
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleLinkAction}
                        disabled={!selectedFormToLink}
                        isLoading={linkMutation.isPending}
                        className="w-full md:w-auto"
                    >
                        Link Application
                    </Button>
                </CardContent>
            </Card>
        );
    };

    // ==========================================
    // RENDER: VIEW MODE (READ-ONLY)
    // ==========================================
    if (currentMode === 'view') {
        return (
            <div className="space-y-4 animate-in fade-in duration-300">
                {(!isParent && !formData?.studentId) && renderLinkingSection()}

                {/* Header & Status Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface p-3.5 rounded-xl border border-border shadow-sm gap-3">
                    <div className="flex items-center gap-3">
                        <div>
                            <h3 className="text-base font-bold text-foreground">Application Data</h3>
                            <p className="text-xs text-muted">Form No: #{formData.formNumber || 'Pending'}</p>
                        </div>
                        {formData.status && (
                            <span className={`px-2 py-0.5 text-[10px] uppercase rounded font-bold ${formData.status === 'Approved' ? 'bg-success/10 text-success' :
                                formData.status === 'Rejected' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                                }`}>
                                {formData.status}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Status Buttons - Display ONLY if onUpdateStatus is passed */}
                        {onUpdateStatus && formData.status !== 'Rejected' && (
                            <Button
                                variant="danger" size="sm"
                                onClick={() => onUpdateStatus('Rejected')}
                                isLoading={isUpdatingStatus}
                            >
                                Reject
                            </Button>
                        )}
                        {onUpdateStatus && formData.status !== 'Approved' && (
                            <Button
                                variant="primary" size="sm"
                                onClick={() => onUpdateStatus('Approved')}
                                isLoading={isUpdatingStatus}
                            >
                                Approve
                            </Button>
                        )}

                        {/* Edit Button */}
                        {canEdit && (
                            <Button variant="outline" size="sm" leftIcon="fas fa-edit" onClick={() => setCurrentMode('edit')}>
                                Edit
                            </Button>
                        )}
                    </div>
                </div>

                {/* View Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader title="Student Details" className="py-2.5 px-4 bg-surface/50 border-b border-border/50" />
                        <CardContent className="p-4 space-y-1">
                            <DetailRow label="Name" value={formData.studentName} />
                            <DetailRow label="Date of Birth" value={formData.dob ? new Date(formData.dob).toLocaleDateString() : ''} />
                            <DetailRow label="Age / Gender" value={`${formData.age} yrs / ${formData.gender}`} />
                            <DetailRow label="Mother Tongue" value={formData.motherTongue} />
                            <DetailRow label="Religion / Community" value={`${formData.religion} / ${formData.community}`} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader title="Academic & Contact" className="py-2.5 px-4 bg-surface/50 border-b border-border/50" />
                        <CardContent className="p-4 space-y-1">
                            <DetailRow label="Sought For" value={formData.admissionSoughtFor} highlight />
                            <DetailRow label="Previous Exam" value={formData.examinationPassed} />
                            <DetailRow label="Mobile Number" value={formData.mobileNumber} />
                            <DetailRow label="Current Address" value={formData.currentAddress} />
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader title="Parent Information" className="py-2.5 px-4 bg-surface/50 border-b border-border/50" />
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <h4 className="font-semibold text-xs text-primary mb-2 uppercase tracking-wider">Father</h4>
                                <DetailRow label="Name" value={formData.fatherName} />
                                <DetailRow label="Education" value={formData.fatherEducation} />
                                <DetailRow label="Occupation" value={formData.fatherOccupation} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-semibold text-xs text-primary mb-2 uppercase tracking-wider">Mother</h4>
                                <DetailRow label="Name" value={formData.motherName} />
                                <DetailRow label="Education" value={formData.motherEducation} />
                                <DetailRow label="Occupation" value={formData.motherOccupation} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // ==========================================
    // RENDER: EDIT / CREATE MODE
    // ==========================================
    return (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">

            {showHeading && (
                <div className="text-center mb-6 pt-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground uppercase tracking-widest">Admission Form</h2>
                    <div className="h-1 w-24 bg-primary mx-auto mt-3 rounded-full"></div>
                </div>
            )}

            {(!isParent && !formData?.studentId) && renderLinkingSection()}

            {!showHeading && <div className="flex justify-between items-center bg-surface p-3.5 rounded-xl border border-border shadow-sm">
                <div>
                    <h3 className="text-base font-bold text-foreground">
                        {currentMode === 'edit' ? 'Edit Application Data' : 'New Application Entry'}
                    </h3>
                    <p className="text-xs text-muted">Please fill in all required fields.</p>
                </div>
                {currentMode === 'edit' && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => {
                        if (fetchedForm) setFormData(fetchedForm);
                        setCurrentMode('view');
                    }}>
                        Cancel
                    </Button>
                )}
            </div>
            }

            <Card>
                <CardHeader title="1. Student Information" className="py-2.5 px-4 bg-surface/50 border-b border-border/50" />
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Input id="studentName" label="Student Full Name" required value={formData.studentName} onChange={handleInputChange} />
                    <Input id="dob" type="date" label="Date of Birth" required value={formData.dob} onChange={handleInputChange} />
                    <Input id="age" type="number" label="Age" value={formData.age} onChange={handleInputChange} />
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-muted">Gender *</label>
                        <select id="gender" required value={formData.gender} onChange={handleInputChange} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg outline-none focus:border-primary">
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <Input id="motherTongue" label="Mother Tongue" value={formData.motherTongue} onChange={handleInputChange} />
                    <Input id="religion" label="Religion" value={formData.religion} onChange={handleInputChange} />
                    <Input id="community" label="Community/Caste" value={formData.community} onChange={handleInputChange} />
                    <Input id="emisNumber" label="EMIS Number" value={formData.emisNumber} onChange={handleInputChange} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader title="2. Academic & Contact Details" className="py-2.5 px-4 bg-surface/50 border-b border-border/50" />
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Input id="admissionSoughtFor" label="Admission Sought For" value={formData.admissionSoughtFor} onChange={handleInputChange} />
                    <Input id="examinationPassed" label="Previous Exam Passed" value={formData.examinationPassed} onChange={handleInputChange} />
                    <Input id="Mobile Number" label="Primary Mobile Number" value={formData.mobileNumber} onChange={handleInputChange} />
                    <Input id="currentAddress" label="Current Address" value={formData.currentAddress} onChange={handleInputChange} className="md:col-span-2 lg:col-span-3" />
                    <Input id="permanentAddress" label="Permanent Address" value={formData.permanentAddress} onChange={handleInputChange} className="md:col-span-2 lg:col-span-3" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader title="3. Parent Details" className="py-2.5 px-4 bg-surface/50 border-b border-border/50" />
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-3">
                        <h4 className="font-semibold text-xs text-primary uppercase tracking-wider">Father</h4>
                        <Input id="fatherName" label="Name" value={formData.fatherName} onChange={handleInputChange} />
                        <Input id="fatherEducation" label="Education" value={formData.fatherEducation} onChange={handleInputChange} />
                        <Input id="fatherOccupation" label="Occupation" value={formData.fatherOccupation} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-3">
                        <h4 className="font-semibold text-xs text-primary uppercase tracking-wider">Mother</h4>
                        <Input id="motherName" label="Name" value={formData.motherName} onChange={handleInputChange} />
                        <Input id="motherEducation" label="Education" value={formData.motherEducation} onChange={handleInputChange} />
                        <Input id="motherOccupation" label="Occupation" value={formData.motherOccupation} onChange={handleInputChange} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                    {currentMode === 'edit' ? 'Save Changes' : 'Submit Application'}
                </Button>
            </div>
        </form>
    );
}

// --- DetailRow Helper (Tighter padding) ---
function DetailRow({ label, value, highlight = false }: { label: string, value: string | number | undefined, highlight?: boolean }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-border/40 last:border-0 last:pb-0 gap-1 sm:gap-4">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider shrink-0">{label}</span>
            <span className={`text-sm text-foreground sm:text-right font-medium ${highlight && value ? 'bg-primary/10 text-primary px-2 py-0.5 rounded' : ''}`}>
                {value || '-'}
            </span>
        </div>
    );
}