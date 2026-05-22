import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
import {
    // useGetMarkReportById,
    useCreateMarkReport,
    useUpdateMarkReport,
    useGetMarkReportByIdV1
} from '../../api_services/markReport_api/markReportApi'; // Adjust path
import { useGetSchoolById } from '../../api_services/schoolConfig_api/schoolapi'; // Adjust path
import MarkReportSingle from './MarkReportSingle';
import { toast } from '../../shared/ui/ToastContext';

export default function MarkReportConfig() {
    const { id: studentId } = useParams();
    const [searchParams] = useSearchParams();

    const academicYear = searchParams.get('academicYear') || '';
    const classId = searchParams.get('classId') || '';
    const sectionId = searchParams.get('sectionId') || '';
    const navigate = useNavigate();


    const { currentRole, schoolId } = useAuthData();

    // --- Queries & Mutations ---
    const { data: schoolData } = useGetSchoolById(schoolId!);
    const currentAcademicYear = schoolData?.currentAcademicYear || "";

    // 1. Security & Permissions
    const isRestrictedRole = ['parent'].includes(currentRole || '');
    const isEditable = !isRestrictedRole; // Admins, Correspondents, Principals, Teachers can edit

    // 2. Local Mode State 
    const [mode, setMode] = useState<'view' | 'edit' | 'create'>(studentId ? 'view' : 'create');

   
    // 3. Fetch Data (Only runs if ID exists)
    const { data: reportPayload, isLoading: isFetching } = useGetMarkReportByIdV1({
        studentId:studentId!,
        academicYear,
        classId,
        sectionId
    });

    const markReport = reportPayload?.data || null;
    const isNewReport = reportPayload?.isNew || false;

    //  useEffect(() => {
    //     // if (isNewReport) {
    //     if (isNewReport && isRestrictedRole) {
    //         setMode('create');
    //     } else if (!isNewReport && markReport) {
    //         setMode('view');
    //     }
    // }, [isNewReport, markReport]);

    //  useEffect(() => {
    //     if (!isNewReport && isRestrictedRole) {
    //         // Redirect back to the main list if they try to manually enter the creation URL
    //         navigate('/dashboard/markreport', { replace: true });
    //     }
    // }, [isNewReport, isRestrictedRole, navigate]);


    // --- UNIFIED MODE & PERMISSION HANDLER ---
    useEffect(() => {
        // 1. DO NOTHING if the API is still loading. This prevents the instant-redirect bug!
        if (isFetching) return;

        if (isRestrictedRole) {
            // PARENT LOGIC
            if (isNewReport) {
                // If no report exists yet, a parent cannot create one.
                // We should NOT send them to the staff '/dashboard/markreport' list.
                // Instead, send them back to the previous page safely.
                toast.error("No mark report is available for this student yet.");
                navigate(-1); 
            } else if (markReport) {
                // If the report exists, let the parent view it
                setMode('view');
            }
        } else {
            // STAFF LOGIC
            if (isNewReport) {
                // Staff viewing an empty record should be put into create mode
                setMode('create');
            } else if (markReport) {
                // Staff viewing an existing record
                setMode('view');
            }
        }
    }, [isFetching, isNewReport, markReport, isRestrictedRole, navigate]);


    // 4. Mutations
    const createMutation = useCreateMarkReport();
    const updateMutation = useUpdateMarkReport();

    // 5. Unified Submit Handler
    const handleSubmit = async (formDataState: any) => {
        try {
            // Build the clean JSON payload for the backend
            const payload = {
                schoolId: schoolId!,
                academicYear: formDataState.academicYear || currentAcademicYear,
                classId: formDataState.classId || null,
                sectionId: formDataState.sectionId || null,
                studentId: formDataState.studentId,
                subjects: formDataState.subjects || [],
                examRecords: formDataState.examRecords || [],
                remarks: formDataState.remarks || "",
                isAbsent: formDataState.isAbsent || false,
            };

            if (mode === 'create') {
                await createMutation.mutateAsync(payload);
                toast.success("Mark Sheet Created Successfully")
                // navigate('/dashboard/markreport');
            }
            else if (mode === 'edit' && studentId) {
                await updateMutation.mutateAsync({ reportId: markReport?._id, ...payload });
                toast.success("Mark Sheet updated Successfully")
                // Return to view mode seamlessly after saving
                setMode('view');
            }
        } catch (error) {
            console.error("Submission failed", error);
        }
    };

    // Full Page Loading State
    if (studentId && isFetching) {
        return (
            <div className="w-full h-full flex justify-center items-center bg-mainBg">
                <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
            </div>
        );
    }

    return (
        <MarkReportSingle
            mode={mode}
            initialData={markReport}
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            isEditable={isEditable}
            onEdit={() => setMode('edit')}
            onCancel={() => {
                // If canceling an edit, just go back to view mode. Otherwise, navigate to the main list.
                if (mode === 'edit') setMode('view');
                // else navigate('/dashboard/markreport');
                else navigate(-1);
            }}
        />
    );
}