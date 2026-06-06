
import  { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
import {
    useGetAnnouncementById,
    useCreateAnnouncement,
    useUpdateAnnouncement
} from '../../api_services/announcement_api/announcementApi'; // Adjust path
import AnnouncementSingle from './AnnouncementSingle';
import { useGetSchoolById } from '../../api_services/schoolConfig_api/schoolapi';
import { toast } from '../../shared/ui/ToastContext';

export default function AnnouncementConfig() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentRole, schoolId } = useAuthData();

    // --- Queries & Mutations ---
    const { data: schoolData } = useGetSchoolById(schoolId!);
    const currentAcademicYear = schoolData?.currentAcademicYear || "";

    // 1. Security & Permissions
    const isRestrictedRole = ['parent'].includes(currentRole || '');
    const isEditable = !isRestrictedRole; // Admins, Correspondents, Principals can edit

    // 2. Local Mode State (No need for /edit path checking)
    const [mode, setMode] = useState<'view' | 'edit' | 'create'>(id ? 'view' : 'create');

    // Reset mode to view/create if the ID changes in the URL
    useEffect(() => {
        if (!id) setMode('create');
        else if (id && mode === 'create') setMode('view');
    }, [id]);

    // Security Failsafe: Parents cannot access the create view
    useEffect(() => {
        if (!id && isRestrictedRole) {
            navigate('/dashboard/announcement', { replace: true });
        }
    }, [id, isRestrictedRole, navigate]);

    // 3. Fetch Data (Only runs if ID exists)
    const { data: announcement, isLoading: isFetching } = useGetAnnouncementById(id);

    // 4. Mutations
    const createMutation = useCreateAnnouncement();
    const updateMutation = useUpdateAnnouncement();

    // 5. Unified Submit Handler
    const handleSubmit = async (formDataState: any, files: File[]) => {
        try {
            if (mode === 'create') {
                const formData = new FormData();
                formData.append('schoolId', schoolId!);
                formData.append('academicYear', currentAcademicYear || '');

                Object.keys(formDataState).forEach(key => {
                    const value = formDataState[key];
                    if (Array.isArray(value)) {
                        formData.append(key, JSON.stringify(value));
                    } else if (value) {
                        formData.append(key, value);
                    }
                });

                if (files && files.length > 0) {
                    files.forEach(f => formData.append('attachment', f));
                }

                await createMutation.mutateAsync(formData);
                toast.success("Successfully Created")

                navigate('/dashboard/announcement');
            }
            else if (mode === 'edit' && id) {
                await updateMutation.mutateAsync({ id, payload: formDataState });
                // Return to view mode seamlessly after saving
                toast.success("Successfully Updated")

                setMode('view');
            }
        } catch (error: any) {
            toast.error(error.message || "Operation Failed.");
        }
    };

    if (id && isFetching) {
        return (
            <div className="w-full h-full flex justify-center items-center bg-background">
                <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
            </div>
        );
    }

    return (
        <AnnouncementSingle
            mode={mode}
            initialData={announcement}
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            isEditable={isEditable}
            onEdit={() => setMode('edit')}
            onCancel={() => {
                // If canceling an edit, just go back to view mode. Otherwise, go to list.
                if (mode === 'edit') setMode('view');
                else navigate('/dashboard/announcement');
            }}
        />
    );
}