import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Api } from '../../../lib/api'; // Adjust path to your axios instance
import { useAuthData } from '../../../hooks/useAuthData'; // Adjust path
import { checkPermission } from '../../../utils/utils';

// --- Interfaces ---
export interface CreateBillBookParams {
    schoolId: string;
    bookName: string;
    billNumber: string;
}

export interface UpdateBillBookParams {
    id: string;
    schoolId: string; // Passed to invalidate the correct cache
    bookName?: string;
    isActive?: boolean;
}

export interface EditBillSequenceParams {
    id: string;
    schoolId: string; // Passed to invalidate the correct cache
    newBillNumber: string;
}

// --- Hook 1: Create Bill Book ---
export const useCreateBillBook = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateBillBookParams) => {
            try {
                // Ensure only allowed roles can trigger this
                checkPermission(currentRole, ["correspondent", "administrator", "accountant", "principal"]);

                const { data } = await Api.post(`/api/school-config/bill-book`, payload);

                if (data.ok) {
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to create Bill Book');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            // Instantly refresh the table for this specific school
            queryClient.invalidateQueries({ queryKey: ['billBooks', variables.schoolId] });
        },
    });
};

// --- Hook 2: Get All Bill Books ---
export const useGetAllBillBooks = (schoolId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['billBooks', schoolId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "accountant", "principal"]);

                const { data } = await Api.get(`/api/school-config/bill-book/${schoolId}`);

                if (data.ok) {
                    return data.data; // Return just the data array
                } else {
                    throw new Error(data.message || 'Failed to fetch Bill Books');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!schoolId, // Only run the query if schoolId exists
    });
};

// --- Hook 3: Update Bill Book (Name / Active Status) ---
export const useUpdateBillBook = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, bookName, isActive }: UpdateBillBookParams) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "accountant", "principal"]);

                const { data } = await Api.patch(`/api/school-config/bill-book/${id}`, { bookName, isActive });

                if (data.ok) {
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to update Bill Book');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['billBooks', variables.schoolId] });
        },
    });
};

// --- Hook 4: Edit Bill Sequence Number ---
export const useEditBillSequence = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, newBillNumber }: EditBillSequenceParams) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "accountant", "principal"]);

                const { data } = await Api.patch(`/api/school-config/bill-book/${id}/sequence`, { newBillNumber });

                if (data.ok) {
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to update sequence number');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['billBooks', variables.schoolId] });
        },
    });
};

// --- Hook 5: Delete Bill Book ---
export const useDeleteBillBook = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }: { id: string; schoolId: string }) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "accountant", "principal"]);

                const { data } = await Api.delete(`/api/school-config/bill-book/${id}`);

                if (data.ok) {
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to delete Bill Book');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            // Instantly refresh the table for this specific school
            queryClient.invalidateQueries({ queryKey: ['billBooks', variables.schoolId] });
        },
    });
};