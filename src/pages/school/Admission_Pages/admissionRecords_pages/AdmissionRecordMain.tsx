import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useGetInfiniteAdmissionForms, useGetSingleAdmissionForm } from '../../../../api_services/schoolConfig_api/admissionFormApi';
import { Card, CardContent, CardHeader } from '../../../../shared/ui/Card';
import { Button } from '../../../../shared/ui/Button';
import { SideModal } from '../../../../shared/ui/SideModal';
import type { RootState } from '../../../../features/store/store';

// API Hooks (Adjust paths to match your project structure)
// import { 
//     useGetInfiniteAdmissionForms, 
//     useGetSingleAdmissionForm 
// } from '../../../api_services/schoolConfig_api/admission_api'; // Update path

// // UI Components
// import { Card, CardHeader, CardContent } from '../../../shared/ui/Card';
// import { Button } from '../../../shared/ui/Button';
// import { SideModal } from '../../../shared/ui/SideModal';

interface AdmissionRecordMainProps {
    admissionBook: any;
    onBack: () => void;
}

export default function AdmissionRecordMain({ admissionBook, onBack }: AdmissionRecordMainProps) {
    const { schoolId, academicYear } = useSelector((state: RootState) => state.auth); // Assuming academicYear is in auth state
    const [searchParams, setSearchParams] = useSearchParams();

    // Modal State
    const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

    // --- 🌟 URL Query Param Listener ---
    useEffect(() => {
        const formId = searchParams.get('admissionFormId');
        if (formId) {
            setSelectedFormId(formId);
        }
    }, [searchParams]);

    const handleCloseModal = () => {
        setSelectedFormId(null);
        if (searchParams.get('admissionFormId')) {
            searchParams.delete('admissionFormId');
            // If there's a book ID in the URL, keep it, just remove the form ID
            setSearchParams(searchParams, { replace: true });
        }
    };

    // --- Infinite Query for Table ---
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useGetInfiniteAdmissionForms({
        schoolId: schoolId!,
        academicYear: academicYear || '2026-2027', // Fallback if needed
        admissionBookId: admissionBook._id,
        limit: '20'
    });

    // --- Single Query for Modal ---
    const { 
        data: singleFormData, 
        isFetching: isFetchingSingle 
    } = useGetSingleAdmissionForm({ 
        formId: selectedFormId || undefined 
    });

    // --- Native Intersection Observer Setup ---
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.5 }
        );

        const currentRef = loadMoreRef.current;
        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Flatten pages
    const records = data?.pages.flatMap(page => page.forms) || []; // Adjust 'forms' based on your API response structure
    const totalRecords = data?.pages[0]?.totalForms || 0;

    return (
        <Card className="h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
            <CardHeader
                title={`Admission Book: ${admissionBook.bookName}`}
                subtitle={`Total Forms: ${totalRecords}`}
                action={
                    <Button variant="outline" size="sm" leftIcon="fas fa-arrow-left" onClick={onBack}>
                        Back to Books
                    </Button>
                }
            />
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center text-muted">
                        <i className="fas fa-spinner fa-spin text-2xl"></i>
                    </div>
                ) : isError ? (
                    <div className="flex-1 flex items-center justify-center text-danger font-medium">
                        Failed to load admission records.
                    </div>
                ) : records.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted/60 py-12">
                        <i className="fas fa-file-signature text-4xl mb-3 opacity-50"></i>
                        <p className="text-sm font-medium">No admission forms found in this book.</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto custom-scrollbar relative flex flex-col">
                        {/* Responsive Table Wrapper */}
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm min-w-[1000px]">
                                <thead className="bg-surface sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3 font-bold text-muted uppercase tracking-wider text-[11px] border-b border-border w-12">S.No</th>
                                        <th className="px-4 py-3 font-bold text-muted uppercase tracking-wider text-[11px] border-b border-border">Date</th>
                                        <th className="px-4 py-3 font-bold text-muted uppercase tracking-wider text-[11px] border-b border-border">Form No.</th>
                                        <th className="px-4 py-3 font-bold text-muted uppercase tracking-wider text-[11px] border-b border-border">Student Name</th>
                                        <th className="px-4 py-3 font-bold text-muted uppercase tracking-wider text-[11px] border-b border-border">Class Applied</th>
                                        <th className="px-4 py-3 font-bold text-muted uppercase tracking-wider text-[11px] border-b border-border text-center">Status</th>
                                        <th className="px-4 py-3 font-bold text-muted uppercase tracking-wider text-[11px] border-b border-border text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {records?.map((record: any, index: number) => (
                                        <tr key={record._id} className="hover:bg-background/50 transition-colors">
                                            <td className="px-4 py-3 font-bold text-muted whitespace-nowrap">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-3 text-muted text-xs font-medium whitespace-nowrap">
                                                <div className="font-bold text-foreground">
                                                    {new Date(record.createdAt).toLocaleDateString('en-IN', {
                                                        day: '2-digit', month: 'short', year: 'numeric'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-primary whitespace-nowrap">
                                                {record.formNumber || <span className="text-muted italic">N/A</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-foreground capitalize whitespace-nowrap">
                                                    {record.studentDetails?.firstName} {record.studentDetails?.lastName}
                                                </p>
                                                <p className="text-[11px] text-muted font-medium whitespace-nowrap">
                                                    {record.parentDetails?.phoneNo || 'No Phone'}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                                                {record.admissionClass || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                {record.status?.toLowerCase() === 'approved' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20">
                                                        <i className="fas fa-check-circle"></i> Approved
                                                    </span>
                                                ) : record.status?.toLowerCase() === 'pending' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20">
                                                        <i className="fas fa-clock"></i> Pending
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-danger/10 text-danger border border-danger/20">
                                                        <i className="fas fa-times-circle"></i> {record.status || 'Unknown'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    leftIcon="fas fa-eye"
                                                    onClick={() => setSelectedFormId(record._id)}
                                                >
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Infinite Scroll Trigger */}
                        <div ref={loadMoreRef} className="py-6 flex justify-center items-center shrink-0">
                            {isFetchingNextPage ? (
                                <div className="flex items-center gap-2 text-primary font-medium text-sm">
                                    <i className="fas fa-circle-notch fa-spin"></i> Loading more...
                                </div>
                            ) : hasNextPage ? (
                                <span className="text-xs text-muted font-medium">Scroll down for more</span>
                            ) : (
                                <span className="text-[11px] text-muted/50 font-bold uppercase tracking-widest border-t border-border/50 pt-4 w-1/2 text-center">
                                    End of Records
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>

            {/* --- 🌟 SIDE MODAL FOR DETAILED VIEW --- */}
           {/* --- 🌟 SIDE MODAL FOR DETAILED VIEW --- */}
            <SideModal 
                isOpen={!!selectedFormId} 
                onClose={handleCloseModal} 
                title="Admission Form Details"
            >
                <div className="flex flex-col h-full animate-in fade-in duration-200">
                    {isFetchingSingle ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted">
                            <i className="fas fa-circle-notch fa-spin text-3xl text-primary mb-4"></i>
                            <p className="text-sm font-medium">Loading details...</p>
                        </div>
                    ) : !singleFormData ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted text-sm">
                            <i className="fas fa-file-excel text-3xl mb-3 opacity-30"></i>
                            <p>Form details not available.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-5 pb-6">
                            
                            {/* 1. Header Overview */}
                            <div className="bg-surface border border-border p-4 rounded-xl flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="text-xs text-muted font-bold uppercase tracking-wider">Form Number</p>
                                    <p className="text-lg font-bold text-primary">{singleFormData.formNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Status</p>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                        singleFormData.status?.toLowerCase() === 'approved' ? 'bg-success/10 text-success border-success/20' : 
                                        singleFormData.status?.toLowerCase() === 'pending' ? 'bg-warning/10 text-warning border-warning/20' : 
                                        'bg-danger/10 text-danger border-danger/20'
                                    }`}>
                                        {singleFormData.status || 'Unknown'}
                                    </span>
                                    {singleFormData.isSubmitted && singleFormData.submittedAt && (
                                        <p className="text-[10px] text-muted font-medium mt-1.5">
                                            Submitted: {new Date(singleFormData.submittedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* 2. Academic Request Section */}
                            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-background/50 px-4 py-2 border-b border-border flex items-center gap-2">
                                    <i className="fas fa-graduation-cap text-muted text-xs"></i>
                                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Academic Request</h4>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-xs text-muted mb-0.5">Admission Sought For</p>
                                        <p className="font-bold text-primary">{singleFormData.admissionSoughtFor || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted mb-0.5">Previous Examination Passed</p>
                                        <p className="font-semibold text-foreground">{singleFormData.examinationPassed || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Personal Details Section */}
                            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-background/50 px-4 py-2 border-b border-border flex items-center gap-2">
                                    <i className="fas fa-user text-muted text-xs"></i>
                                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Personal Details</h4>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                                    <div className="col-span-2 sm:col-span-1">
                                        <p className="text-xs text-muted mb-0.5">Student Name</p>
                                        <p className="font-bold text-foreground capitalize">{singleFormData.studentName || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted mb-0.5">Gender</p>
                                        <p className="font-semibold text-foreground capitalize">{singleFormData.gender || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted mb-0.5">Date of Birth</p>
                                        <p className="font-semibold text-foreground">
                                            {singleFormData.dob ? new Date(singleFormData.dob).toLocaleDateString('en-IN') : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted mb-0.5">Age</p>
                                        <p className="font-semibold text-foreground">{singleFormData.age ? `${singleFormData.age} years` : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted mb-0.5">Religion</p>
                                        <p className="font-semibold text-foreground">{singleFormData.religion || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted mb-0.5">Community</p>
                                        <p className="font-semibold text-foreground">{singleFormData.community || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted mb-0.5">Mother Tongue</p>
                                        <p className="font-semibold text-foreground">{singleFormData.motherTongue || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted mb-0.5">EMIS Number</p>
                                        <p className="font-semibold text-foreground">{singleFormData.emisNumber || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Contact & Address Section */}
                            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-background/50 px-4 py-2 border-b border-border flex items-center gap-2">
                                    <i className="fas fa-map-marker-alt text-muted text-xs"></i>
                                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Contact & Address</h4>
                                </div>
                                <div className="p-4 grid grid-cols-1 gap-4 text-sm">
                                    <div>
                                        <p className="text-xs text-muted mb-0.5">Mobile Number</p>
                                        <p className="font-semibold text-foreground">{singleFormData.mobileNumber || '-'}</p>
                                    </div>
                                    <div className="pt-2 border-t border-border/50">
                                        <p className="text-xs text-muted mb-1">Current Address</p>
                                        <p className="font-medium text-foreground text-sm">{singleFormData.currentAddress || '-'}</p>
                                    </div>
                                    <div className="pt-2 border-t border-border/50">
                                        <p className="text-xs text-muted mb-1">Permanent Address</p>
                                        <p className="font-medium text-foreground text-sm">{singleFormData.permanentAddress || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 5. Parent Details Section */}
                            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-background/50 px-4 py-2 border-b border-border flex items-center gap-2">
                                    <i className="fas fa-users text-muted text-xs"></i>
                                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Parent Details</h4>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                    {/* Father */}
                                    <div className="col-span-2 bg-mainBg/50 p-3 rounded-lg border border-border/50">
                                        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2 border-b border-border pb-1">Father's Info</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[10px] text-muted">Name</p>
                                                <p className="font-semibold text-foreground capitalize">{singleFormData.fatherName || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted">Education</p>
                                                <p className="font-medium text-foreground">{singleFormData.fatherEducation || '-'}</p>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <p className="text-[10px] text-muted">Occupation</p>
                                                <p className="font-medium text-foreground">{singleFormData.fatherOccupation || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mother */}
                                    <div className="col-span-2 bg-mainBg/50 p-3 rounded-lg border border-border/50">
                                        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2 border-b border-border pb-1">Mother's Info</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[10px] text-muted">Name</p>
                                                <p className="font-semibold text-foreground capitalize">{singleFormData.motherName || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted">Education</p>
                                                <p className="font-medium text-foreground">{singleFormData.motherEducation || '-'}</p>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <p className="text-[10px] text-muted">Occupation</p>
                                                <p className="font-medium text-foreground">{singleFormData.motherOccupation || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                    
                    {/* Modal Actions */}
                    <div className="shrink-0 pt-4 border-t border-border mt-auto flex justify-end">
                        <Button variant="outline" onClick={handleCloseModal}>Close</Button>
                    </div>
                </div>
            </SideModal>
        </Card>
    );
}