import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Api } from '../../lib/api'; // Adjust path to your axios instance
import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
import { checkPermission } from '../../utils/utils';

// --- Interfaces ---
export interface CreateAdmissionBookParams {
    schoolId: string;
    bookName: string;
    startingFormNumber: string;
}

export interface UpdateAdmissionBookParams {
    id: string;
    schoolId: string; // Passed to invalidate the correct cache
    bookName?: string;
    isActive?: boolean;
}

export interface EditFormSequenceParams {
    id: string;
    schoolId: string; // Passed to invalidate the correct cache
    newFormNumber: string;
}

// --- Hook 1: Create Admission Book ---
export const useCreateAdmissionBook = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: CreateAdmissionBookParams) => {
            try {
                // Ensure only allowed roles can trigger this
                checkPermission(currentRole, ["correspondent", "administrator"]);

                const { data } = await Api.post(`/api/school-config/admission-book`, params);

                if (data.ok) {
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to create Admission Book');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            // Instantly refresh the table for this specific school
            queryClient.invalidateQueries({ queryKey: ['admissionBooks', variables.schoolId] });
        },
    });
};

// --- Hook 2: Get All Admission Books ---
export const useGetAllAdmissionBooks = (schoolId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['admissionBooks', schoolId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator"]);

                const { data } = await Api.get(`/api/school-config/admission-book/${schoolId}`);
                
                if (data.ok) {
                    return data.data; // Return just the data array
                } else {
                    throw new Error(data.message || 'Failed to fetch Admission Books');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!schoolId, // Only run the query if schoolId exists
    });
};

// --- Hook 3: Update Admission Book (Name / Active Status) ---
export const useUpdateAdmissionBook = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, bookName, isActive }: UpdateAdmissionBookParams) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator"]);

                const { data } = await Api.patch(`/api/school-config/admission-book/${id}`, { bookName, isActive });

                if (data.ok) {
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to update Admission Book');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admissionBooks', variables.schoolId] });
        },
    });
};

// --- Hook 4: Edit Form Sequence Number ---
export const useEditFormSequence = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, newFormNumber }: EditFormSequenceParams) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator"]);

                const { data } = await Api.patch(`/api/school-config/admission-book/${id}/sequence`, { newFormNumber });

                if (data.ok) {
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to update form sequence number');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admissionBooks', variables.schoolId] });
        },
    });
};


// --- Hook 5: Delete Admission Book ---
export const useDeleteAdmissionBook = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }: { id: string; schoolId: string }) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator"]);

                const { data } = await Api.delete(`/api/school-config/admission-book/${id}`);

                if (data.ok) {
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to delete Admission Book');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            // Instantly refresh the table
            queryClient.invalidateQueries({ queryKey: ['admissionBooks', variables.schoolId] });
        },
    });
};