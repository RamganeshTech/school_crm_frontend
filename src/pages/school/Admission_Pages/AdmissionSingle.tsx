

// THIRD VERSION

import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../features/store/store';
import { toast } from '../../../shared/ui/ToastContext';
import { Button } from '../../../shared/ui/Button';

// --- Components & APIs ---
import AdmissionFormCompo, { type AdmissionFormData } from './AdmissionFormCompo'; // Adjust path
import { useSubmitPublicAdmissionForm, useUpdateAdmissionFormDetails, useUpdateAdmissionFormStatus } from '../../../api_services/schoolConfig_api/admissionFormApi';
// import { useUpdateAdmissionFormStatus } from '../../../api_services/schoolConfig_api/admissionFormApi';
// import { useSubmitPublicAdmissionForm } from '../../../api_services/schoolConfig_api/publicAdmissionApi';

export default function AdmissionFormSingle({ isAdmin }: { isAdmin: boolean }) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // We only try to grab schoolId for Admins. Parents won't have it in Redux.
    const schoolId = useSelector((state: RootState) => state.auth?.schoolId);

    // --- Mutations ---
    const updateStatusMutation = useUpdateAdmissionFormStatus();
    const submitPublicFormMutation = useSubmitPublicAdmissionForm();
    const updateDetailsMutation = useUpdateAdmissionFormDetails();



    // --- Handlers ---
    // --- Handlers ---
    const handleUpdateStatus = async (status: 'Pending' | 'Approved' | 'Rejected') => {
        if (!id || !schoolId) return;

        if (status === 'Rejected' && !window.confirm("Are you sure you want to reject this application?")) {
            return;
        }

        try {
            await updateStatusMutation.mutateAsync({ id, schoolId, status });
            toast.success(`Application marked as ${status}!`);
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        }
    };

    const handleSubmitForm = async (data: AdmissionFormData) => {
        if (!id) return;

        try {
            if (isAdmin) {
                if (!schoolId) throw new Error("School configuration missing.");
                // Admin updating existing details
                await updateDetailsMutation.mutateAsync({ id, schoolId, formData: data });
                toast.success("Application details updated successfully!");
            } else {
                // Parent submitting the public form for the first time
                await submitPublicFormMutation.mutateAsync({ id, ...data });
                toast.success("Application submitted successfully!");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to save application");
            throw error; // Throwing error prevents AdmissionFormCompo from switching to 'view' mode prematurely
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-4">

            {/* Top Navigation: Only show for Admins */}
            {isAdmin && (
                <Button
                    variant="ghost"
                    leftIcon="fas fa-arrow-left"
                    onClick={() => navigate('..')}
                    className="mb-2"
                >
                    Back to List
                </Button>
            )}

            {/* Render the Reusable Form Component */}
           <AdmissionFormCompo
                formId={id}
                
                // Admins default to view mode. Parents default to create mode.
                mode={isAdmin ? 'view' : 'create'} 
                
                // Only Admins get to see the "Edit" button to change data later
                canEdit={isAdmin} 

                showHeading={!isAdmin}
                
                // Pass down the combined submission logic
                onSubmit={handleSubmitForm}
                isSubmitting={isAdmin ? updateDetailsMutation.isPending : submitPublicFormMutation.isPending}
                
                // Pass down the Approval/Rejection logic (ONLY for Admins)
                onUpdateStatus={isAdmin ? handleUpdateStatus : undefined}
                isUpdatingStatus={updateStatusMutation.isPending}
                
                // Linking is disabled here because this is the single form view, not the Student Profile
                enableLinking={false} 
            />  
        </div>
    );
}