import  { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
import {
    useGetMarkReportById,
    useCreateMarkReport,
    useUpdateMarkReport
} from '../../api_services/markReport_api/markReportApi'; // Adjust path
import { useGetSchoolById } from '../../api_services/schoolConfig_api/schoolapi'; // Adjust path
import MarkReportSingle from './MarkReportSingle';

export default function MarkReportConfig() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentRole, schoolId } = useAuthData();

    // --- Queries & Mutations ---
    const { data: schoolData } = useGetSchoolById(schoolId!);
    const currentAcademicYear = schoolData?.currentAcademicYear || "";

    // 1. Security & Permissions
    const isRestrictedRole = ['parent', 'student'].includes(currentRole || '');
    const isEditable = !isRestrictedRole; // Admins, Correspondents, Principals, Teachers can edit

    // 2. Local Mode State 
    const [mode, setMode] = useState<'view' | 'edit' | 'create'>(id ? 'view' : 'create');

    // Reset mode to view/create if the ID changes in the URL
    useEffect(() => {
        if (!id) setMode('create');
        else if (id && mode === 'create') setMode('view');
    }, [id, mode]);

    // Security Failsafe: Parents/Students cannot access the /create route
    useEffect(() => {
        if (!id && isRestrictedRole) {
            // Redirect back to the main list if they try to manually enter the creation URL
            navigate('/dashboard/mark-report', { replace: true });
        }
    }, [id, isRestrictedRole, navigate]);

    // 3. Fetch Data (Only runs if ID exists)
    const { data: markReport, isLoading: isFetching } = useGetMarkReportById(id);

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
                remarks: formDataState.remarks || "",
                isAbsent: formDataState.isAbsent || false,
            };

            if (mode === 'create') {
                await createMutation.mutateAsync(payload);
                navigate('/dashboard/mark-report');
            } 
            else if (mode === 'edit' && id) {
                await updateMutation.mutateAsync({ reportId: id, ...payload });
                // Return to view mode seamlessly after saving
                setMode('view');
            }
        } catch (error) {
            console.error("Submission failed", error);
        }
    };

    // Full Page Loading State
    if (id && isFetching) {
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
                else navigate('/dashboard/mark-report');
            }}
        />
    );
}