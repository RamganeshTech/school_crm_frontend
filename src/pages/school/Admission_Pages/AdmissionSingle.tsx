// import { useParams, useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import type { RootState } from '../../../features/store/store';
// import { useGetSingleAdmissionForm, useUpdateAdmissionFormStatus } from '../../../api_services/schoolConfig_api/admissionFormApi';
// import { toast } from '../../../shared/ui/ToastContext';
// import { Button } from '../../../shared/ui/Button';
// import {  Card, CardHeader, CardContent } from '../../../shared/ui/Card';

// export default function AdmissionFormSingle({isAdmin}: {isAdmin:boolean}) {
//     const { id } = useParams<{ id: string }>();
//     const navigate = useNavigate();
//     const { schoolId } = useSelector((state: RootState) => state.auth);

//     // --- API Hooks ---
//     const { data: form, isLoading, error } = useGetSingleAdmissionForm(id);
//     const updateStatusMutation = useUpdateAdmissionFormStatus();

//     // --- Handlers ---
//     const handleStatusChange = async (newStatus: 'Pending' | 'Approved' | 'Rejected') => {
//         if (!id || !schoolId) return;
        
//         // Optional: Add confirmation for rejections
//         if (newStatus === 'Rejected' && !window.confirm("Are you sure you want to reject this application?")) {
//             return;
//         }

//         try {
//             await updateStatusMutation.mutateAsync({ id, schoolId, status: newStatus });
//             toast.success(`Application marked as ${newStatus}!`);
//         } catch (error: any) {
//             toast.error(error.message || "Failed to update status");
//         }
//     };

//     const copyPublicLink = async () => {
//         const publicUrl = `${window.location.origin}/apply/${id}`;
//         await navigator.clipboard.writeText(publicUrl);
//         toast.success("Link copied to clipboard!");
//     };

//     // --- Loading & Error States ---
//     if (isLoading) {
//         return <div className="flex items-center justify-center p-12 text-muted animate-pulse">Loading application details...</div>;
//     }

//     if (error || !form) {
//         return (
//             <div className="p-6 text-center">
//                 <p className="text-danger mb-4">Failed to load admission form. It may have been deleted.</p>
//                 <Button variant="outline" onClick={() => navigate('..')}>Go Back</Button>
//             </div>
//         );
//     }

//     // --- SCENARIO 2: SUBMITTED FORM ---
//     return (
//         <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
//             {/* Header Area */}
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                 <div className="flex items-start gap-4">
//                     <Button variant="outline" className="px-3" onClick={() => navigate('..')} title="Go Back">
//                         <i className="fas fa-arrow-left"></i>
//                     </Button>
//                     <div>
//                         <div className="flex items-center gap-3">
//                             <h2 className="text-2xl font-bold text-foreground">{form.studentName}</h2>
//                             <span className={`px-2.5 py-1 text-xs uppercase rounded-md font-bold shadow-sm ${
//                                 form.status === 'Approved' ? 'bg-success/10 text-success border border-success/20' :
//                                 form.status === 'Rejected' ? 'bg-danger/10 text-danger border border-danger/20' :
//                                 'bg-warning/10 text-warning border border-warning/20'
//                             }`}>
//                                 {form.status}
//                             </span>
//                         </div>
//                         <p className="text-sm text-muted mt-1">
//                             Form No: <span className="font-semibold text-foreground">#{form.formNumber}</span> • 
//                             Submitted: {new Date(form.submittedAt).toLocaleDateString()}
//                         </p>
//                     </div>
//                 </div>

//                 {/* Admin Actions (Only show if not already processed, or allow reversing) */}
//                 <div className="flex items-center gap-3 w-full md:w-auto">
//                     <Button 
//                         variant="danger" 
//                         onClick={() => handleStatusChange('Rejected')}
//                         disabled={form.status === 'Rejected'}
//                         isLoading={updateStatusMutation.isPending && updateStatusMutation.variables?.status === 'Rejected'}
//                         className="flex-1 md:flex-none"
//                     >
//                         <i className="fas fa-times mr-2"></i> Reject
//                     </Button>
//                     <Button 
//                         variant="primary" 
//                         onClick={() => handleStatusChange('Approved')}
//                         disabled={form.status === 'Approved'}
//                         isLoading={updateStatusMutation.isPending && updateStatusMutation.variables?.status === 'Approved'}
//                         className="flex-1 md:flex-none"
//                     >
//                         <i className="fas fa-check mr-2"></i> Approve
//                     </Button>
//                 </div>
//             </div>

//             {/* Data Grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
//                 {/* Column 1: Student Details & Academics */}
//                 <div className="lg:col-span-1 space-y-6">
//                     <Card>
//                         <CardHeader title="Student Details" />
//                         <CardContent className="space-y-4">
//                             <DetailRow label="Date of Birth" value={new Date(form.dob).toLocaleDateString()} />
//                             <DetailRow label="Age" value={`${form.age} years`} />
//                             <DetailRow label="Gender" value={form.gender} />
//                             <DetailRow label="Mother Tongue" value={form.motherTongue} />
//                             <DetailRow label="Religion" value={form.religion} />
//                             <DetailRow label="Community" value={form.community} />
//                             {form.emisNumber && <DetailRow label="EMIS Number" value={form.emisNumber} />}
//                         </CardContent>
//                     </Card>

//                     <Card>
//                         <CardHeader title="Academic Information" />
//                         <CardContent className="space-y-4">
//                             <DetailRow label="Admission Sought For" value={form.admissionSoughtFor} highlight />
//                             <DetailRow label="Previous Examination" value={form.examinationPassed} />
//                         </CardContent>
//                     </Card>
//                 </div>

//                 {/* Column 2 & 3: Parents & Contact Info */}
//                 <div className="lg:col-span-2 space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <Card>
//                             <CardHeader title="Father's Details" />
//                             <CardContent className="space-y-4">
//                                 <DetailRow label="Name" value={form.fatherName} />
//                                 <DetailRow label="Education" value={form.fatherEducation} />
//                                 <DetailRow label="Occupation" value={form.fatherOccupation} />
//                             </CardContent>
//                         </Card>

//                         <Card>
//                             <CardHeader title="Mother's Details" />
//                             <CardContent className="space-y-4">
//                                 <DetailRow label="Name" value={form.motherName} />
//                                 <DetailRow label="Education" value={form.motherEducation} />
//                                 <DetailRow label="Occupation" value={form.motherOccupation} />
//                             </CardContent>
//                         </Card>
//                     </div>

//                     <Card>
//                         <CardHeader title="Contact & Address" />
//                         <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div className="space-y-4">
//                                 <DetailRow label="Primary Phone" value={form.phone} />
//                                 <div className="space-y-1">
//                                     <span className="text-xs font-semibold text-muted uppercase tracking-wider">Current Address</span>
//                                     <p className="text-sm text-foreground bg-surface p-3 rounded-lg border border-border">
//                                         {form.currentAddress}
//                                     </p>
//                                 </div>
//                             </div>
//                             <div className="space-y-4">
//                                 {/* Spacer to align with phone on larger screens */}
//                                 <div className="hidden md:block h-[52px]"></div> 
//                                 <div className="space-y-1">
//                                     <span className="text-xs font-semibold text-muted uppercase tracking-wider">Permanent Address</span>
//                                     <p className="text-sm text-foreground bg-surface p-3 rounded-lg border border-border">
//                                         {form.permanentAddress}
//                                     </p>
//                                 </div>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </div>

//             </div>
//         </div>
//     );
// }

// // --- Helper Component for clean UI layout ---
// function DetailRow({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) {
//     return (
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-border/50 last:border-0 last:pb-0 gap-1 sm:gap-4">
//             <span className="text-xs font-semibold text-muted uppercase tracking-wider shrink-0">{label}</span>
//             <span className={`text-sm text-foreground sm:text-right font-medium ${highlight ? 'bg-primary/10 text-primary px-2 py-0.5 rounded' : ''}`}>
//                 {value || '-'}
//             </span>
//         </div>
//     );
// }



//  SECOND VERSION

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../features/store/store';

// 🌟 Make sure to import your public submit hook!
import { 
    useGetSingleAdmissionForm, 
    useSubmitPublicAdmissionForm, 
    useUpdateAdmissionFormStatus 
} from '../../../api_services/schoolConfig_api/admissionFormApi';

import { toast } from '../../../shared/ui/ToastContext';
import { Button } from '../../../shared/ui/Button';
import { Card, CardHeader, CardContent } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';

export default function AdmissionFormSingle({ isAdmin }: { isAdmin: boolean }) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // We safely grab schoolId if it exists (Admins will have it, public parents won't)
    const schoolId = useSelector((state: RootState) => state.auth?.schoolId);

    // --- API Hooks ---
    const { data: form, isLoading, error, refetch } = useGetSingleAdmissionForm(id);
    const updateStatusMutation = useUpdateAdmissionFormStatus();
    const submitPublicFormMutation = useSubmitPublicAdmissionForm();

    // --- Parent Form State ---
    const [formData, setFormData] = useState({
        studentName: '', dob: '', age: '', gender: '',
        motherTongue: '', religion: '', community: '', emisNumber: '',
        admissionSoughtFor: '', examinationPassed: '',
        phone: '', currentAddress: '', permanentAddress: '',
        fatherName: '', fatherEducation: '', fatherOccupation: '',
        motherName: '', motherEducation: '', motherOccupation: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    // --- Handlers ---
    const handleStatusChange = async (newStatus: 'Pending' | 'Approved' | 'Rejected') => {
        if (!id || !schoolId) return;
        
        if (newStatus === 'Rejected' && !window.confirm("Are you sure you want to reject this application?")) {
            return;
        }

        try {
            await updateStatusMutation.mutateAsync({ id, schoolId, status: newStatus });
            toast.success(`Application marked as ${newStatus}!`);
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        }
    };

    const handleParentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        try {
            await submitPublicFormMutation.mutateAsync({ id, ...formData });
            toast.success("Application submitted successfully!");
            refetch(); // Instantly re-fetch the form to trigger the view-only mode
        } catch (error: any) {
            toast.error(error.message || "Failed to submit application");
        }
    };

    // --- Loading & Error States ---
    if (isLoading) {
        return <div className="flex items-center justify-center p-12 text-muted animate-pulse">Loading application details...</div>;
    }

    if (error || !form) {
        return (
            <div className="p-6 text-center">
                <p className="text-danger mb-4">Invalid or expired admission link.</p>
                {isAdmin && <Button variant="outline" onClick={() => navigate('..')}>Go Back</Button>}
            </div>
        );
    }

    // =========================================================================
    // SCENARIO 1: PARENT EDIT MODE (Public link, not yet submitted)
    // =========================================================================
    if (!isAdmin && !form.isSubmitted) {
        return (
            <form onSubmit={handleParentSubmit} className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300 p-4">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-foreground">Student Admission Application</h2>
                    <p className="text-muted">Application No: <span className="font-bold text-foreground">#{form.formNumber}</span></p>
                </div>

                <Card>
                    <CardHeader title="1. Student Information" />
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="studentName" label="Student Full Name" required value={formData.studentName} onChange={handleInputChange} />
                        <Input id="dob" type="date" label="Date of Birth" required value={formData.dob} onChange={handleInputChange} />
                        <Input id="age" type="number" label="Age" value={formData.age} onChange={handleInputChange} />
                        
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-muted">Gender *</label>
                            <select id="gender" required value={formData.gender} onChange={handleInputChange} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg outline-none focus:border-primary">
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        <Input id="motherTongue" label="Mother Tongue" value={formData.motherTongue} onChange={handleInputChange} />
                        <Input id="religion" label="Religion" value={formData.religion} onChange={handleInputChange} />
                        <Input id="community" label="Community/Caste" value={formData.community} onChange={handleInputChange} />
                        <Input id="emisNumber" label="EMIS Number (Optional)" value={formData.emisNumber} onChange={handleInputChange} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader title="2. Academic Details" />
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="admissionSoughtFor" label="Admission Sought For (Class/Grade)" value={formData.admissionSoughtFor} onChange={handleInputChange} />
                        <Input id="examinationPassed" label="Previous School/Examination Passed" value={formData.examinationPassed} onChange={handleInputChange} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader title="3. Parent/Guardian Details" />
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Father */}
                        <div className="space-y-4 border-r-0 md:border-r border-border pr-0 md:pr-4">
                            <h4 className="font-semibold text-sm text-foreground">Father's Details</h4>
                            <Input id="fatherName" label="Name" value={formData.fatherName} onChange={handleInputChange} />
                            <Input id="fatherEducation" label="Education" value={formData.fatherEducation} onChange={handleInputChange} />
                            <Input id="fatherOccupation" label="Occupation" value={formData.fatherOccupation} onChange={handleInputChange} />
                        </div>
                        {/* Mother */}
                        <div className="space-y-4 pl-0 md:pl-4 mt-6 md:mt-0">
                            <h4 className="font-semibold text-sm text-foreground">Mother's Details</h4>
                            <Input id="motherName" label="Name" value={formData.motherName} onChange={handleInputChange} />
                            <Input id="motherEducation" label="Education" value={formData.motherEducation} onChange={handleInputChange} />
                            <Input id="motherOccupation" label="Occupation" value={formData.motherOccupation} onChange={handleInputChange} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader title="4. Contact Information" />
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="phone" label="Primary Phone Number" value={formData.phone} onChange={handleInputChange} className="md:col-span-2" />
                        <Input id="currentAddress" label="Current Residential Address" value={formData.currentAddress} onChange={handleInputChange} />
                        <Input id="permanentAddress" label="Permanent Address"  value={formData.permanentAddress} onChange={handleInputChange} />
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button type="submit" variant="primary" size="lg" isLoading={submitPublicFormMutation.isPending}>
                        Submit Application
                    </Button>
                </div>
            </form>
        );
    }

    // =========================================================================
    // SCENARIO 2 & 3: VIEW MODE (Admin OR Submitted Parent View)
    // =========================================================================
    return (
        <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300 p-4 lg:p-0">
            
            {/* 🌟 If Admin is viewing a blank link that hasn't been filled yet */}
            {isAdmin && !form.isSubmitted && (
                <div className="bg-warning/10 border border-warning/20 text-warning px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3">
                    <i className="fas fa-exclamation-circle"></i>
                    This application has not been filled out by the parent yet. Showing empty template.
                </div>
            )}

            {/* 🌟 If Parent is viewing their successfully submitted form */}
            {!isAdmin && form.isSubmitted && (
                <div className="bg-success/10 border border-success/20 text-success px-4 py-4 rounded-lg text-center shadow-sm">
                    <i className="fas fa-check-circle text-2xl mb-2"></i>
                    <h3 className="text-lg font-bold">Application Submitted Successfully</h3>
                    <p className="text-sm opacity-90 mt-1">Thank you for submitting your application. The school administration will review it shortly.</p>
                </div>
            )}

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    {isAdmin && (
                        <Button variant="outline" className="px-3" onClick={() => navigate('..')} title="Go Back">
                            <i className="fas fa-arrow-left"></i>
                        </Button>
                    )}
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-foreground">
                                {form.isSubmitted ? form.studentName : "Pending Parent Submission"}
                            </h2>
                            {form.isSubmitted && (
                                <span className={`px-2.5 py-1 text-xs uppercase rounded-md font-bold shadow-sm ${
                                    form.status === 'Approved' ? 'bg-success/10 text-success border border-success/20' :
                                    form.status === 'Rejected' ? 'bg-danger/10 text-danger border border-danger/20' :
                                    'bg-warning/10 text-warning border border-warning/20'
                                }`}>
                                    {form.status}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-muted mt-1">
                            Form No: <span className="font-semibold text-foreground">#{form.formNumber}</span>
                            {form.isSubmitted && ` • Submitted: ${new Date(form.submittedAt).toLocaleDateString()}`}
                        </p>
                    </div>
                </div>

                {/* Admin Actions (Only show for Admins on submitted forms) */}
                {isAdmin && form.isSubmitted && (
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button 
                            variant="danger" 
                            onClick={() => handleStatusChange('Rejected')}
                            disabled={form.status === 'Rejected'}
                            isLoading={updateStatusMutation.isPending && updateStatusMutation.variables?.status === 'Rejected'}
                            className="flex-1 md:flex-none"
                        >
                            <i className="fas fa-times mr-2"></i> Reject
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={() => handleStatusChange('Approved')}
                            disabled={form.status === 'Approved'}
                            isLoading={updateStatusMutation.isPending && updateStatusMutation.variables?.status === 'Approved'}
                            className="flex-1 md:flex-none"
                        >
                            <i className="fas fa-check mr-2"></i> Approve
                        </Button>
                    </div>
                )}
            </div>

            {/* Data Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Student Details & Academics */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader title="Student Details" />
                        <CardContent className="space-y-4">
                            <DetailRow label="Date of Birth" value={form.dob ? new Date(form.dob).toLocaleDateString() : ''} />
                            <DetailRow label="Age" value={form.age ? `${form.age} years` : ''} />
                            <DetailRow label="Gender" value={form.gender} />
                            <DetailRow label="Mother Tongue" value={form.motherTongue} />
                            <DetailRow label="Religion" value={form.religion} />
                            <DetailRow label="Community" value={form.community} />
                            <DetailRow label="EMIS Number" value={form.emisNumber} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader title="Academic Information" />
                        <CardContent className="space-y-4">
                            <DetailRow label="Admission Sought For" value={form.admissionSoughtFor} highlight />
                            <DetailRow label="Previous Examination" value={form.examinationPassed} />
                        </CardContent>
                    </Card>
                </div>

                {/* Column 2 & 3: Parents & Contact Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader title="Father's Details" />
                            <CardContent className="space-y-4">
                                <DetailRow label="Name" value={form.fatherName} />
                                <DetailRow label="Education" value={form.fatherEducation} />
                                <DetailRow label="Occupation" value={form.fatherOccupation} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader title="Mother's Details" />
                            <CardContent className="space-y-4">
                                <DetailRow label="Name" value={form.motherName} />
                                <DetailRow label="Education" value={form.motherEducation} />
                                <DetailRow label="Occupation" value={form.motherOccupation} />
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader title="Contact & Address" />
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <DetailRow label="Primary Phone" value={form.phone} />
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">Current Address</span>
                                    <p className="text-sm text-foreground bg-surface p-3 rounded-lg border border-border min-h-[60px]">
                                        {form.currentAddress || '-'}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {/* Spacer to align with phone on larger screens */}
                                <div className="hidden md:block h-[52px]"></div> 
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">Permanent Address</span>
                                    <p className="text-sm text-foreground bg-surface p-3 rounded-lg border border-border min-h-[60px]">
                                        {form.permanentAddress || '-'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}

// --- Helper Component for clean UI layout ---
function DetailRow({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-border/50 last:border-0 last:pb-0 gap-1 sm:gap-4">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider shrink-0">{label}</span>
            <span className={`text-sm text-foreground sm:text-right font-medium ${highlight && value ? 'bg-primary/10 text-primary px-2 py-0.5 rounded' : ''}`}>
                {value || '-'}
            </span>
        </div>
    );
}