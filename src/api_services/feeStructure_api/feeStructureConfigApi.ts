import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';

// ==========================================
// TYPES & INTERFACES
// ==========================================
export interface FeeConfigData {
    _id: string;
    schoolId: string;
    feeHeads: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface FeeConfigResponse {
    ok: boolean;
    message: string;
    data: FeeConfigData | null;
}

interface UpsertFeeConfigPayload {
    schoolId: string;
    feeHeads: string[];
    isActive?: boolean;
}

// ==========================================
// 1. GET FEE CONFIGURATION HOOK
// ==========================================
export const useGetFeeConfig = (schoolId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['feeConfig', schoolId],
        queryFn: async () => {
            // Frontend route guard based on your backend allowed roles
            checkPermission(currentRole, [
                "correspondent", "administrator", "principal", 
                "viceprincipal", "accountant", "teacher",
            ]);

            const { data } = await Api.get<FeeConfigResponse>(`/api/fee-config/get/${schoolId}`);
            
            if (!data.ok) {
                throw new Error(data.message || 'Failed to fetch fee configuration');
            }
            
            return data.data;
        },
        enabled: !!schoolId, // Only run the query if schoolId is available
        // staleTime: 5 * 60 * 1000, // Cache for 5 minutes to reduce unnecessary API calls
        retry: false,
    });
};

// ==========================================
// 2. UPSERT (SET) FEE CONFIGURATION HOOK
// ==========================================
export const useUpsertFeeConfig = () => {
    const queryClient = useQueryClient();
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: UpsertFeeConfigPayload) => {
            try {
                // Strict permission check for modifying financial settings
                checkPermission(currentRole, ["correspondent", "administrator", "accountant"]);

                const { data } = await Api.post<FeeConfigResponse>(
                    `/api/fee-config/set/${payload.schoolId}`, 
                    {
                        feeHeads: payload.feeHeads,
                        isActive: payload.isActive
                    }
                );

                if (data.ok) {
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to update fee configuration');
                }
            } catch (error: any) {
                const errorMessage = 
                    error.response?.data?.message || 
                    error.message || 
                    'An unexpected error occurred while saving fee configuration';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            // Instantly update the UI by invalidating the specific school's config cache
            queryClient.invalidateQueries({ queryKey: ['feeConfig', variables.schoolId] });
        },
    });
};