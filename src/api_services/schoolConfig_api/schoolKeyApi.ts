// schoolKeyApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthData } from '../../hooks/useAuthData';
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';

interface UpsertSchoolKeyParams {
    schoolId: string;
    publicKey: string;
}

// --- Hook 1: Get School Public Key ---
export const useGetSchoolPublicKey = (schoolId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['schoolPublicKey', schoolId],
        queryFn: async () => {
            try {
                // Ensure only allowed roles can trigger this
                checkPermission(currentRole, ["correspondent", "principal", "administrator", "viceprincipal", "accountant"]);

                const { data } = await Api.get(`/api/school-key/${schoolId}`);

                if (data.ok) {
                    return data.data; // Return just the key record object
                } else {
                    throw new Error(data.message || 'Failed to fetch School Public Key');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!schoolId, // Only run the query if schoolId exists
    });
};

// --- Hook 2: Upsert (Register or Rotate) School Public Key ---
export const useUpsertSchoolPublicKey = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: UpsertSchoolKeyParams) => {
            try {
                // Ensure only allowed roles can trigger this
                checkPermission(currentRole, ["correspondent", "principal", "administrator", "viceprincipal", "accountant"]);

                const { data } = await Api.post(`/api/school-key/${payload.schoolId}`, {
                    publicKey: payload.publicKey
                });

                if (data.ok) {
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to upsert School Public Key');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            // Instantly refresh the public key data for this specific school
            queryClient.invalidateQueries({ queryKey: ['schoolPublicKey', variables.schoolId] });
        },
    });
};