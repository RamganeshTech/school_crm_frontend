import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import Api from '../../api_services/Api'; // Adjust path
import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';
// import { checkPermission } from '../../utils/permissions'; // Adjust path

// --- Types ---
export interface SubscriptionFeatures {
    studentRecord?: boolean;
    attendance?: boolean;
    expense?: boolean;
    club?: boolean;
    announcement?: boolean;
    [key: string]: boolean | undefined; // For custom modules
}

export interface UpdateSubscriptionPayload {
    schoolId: string;
    planName?: 'basic' | 'standard' | 'premium' | 'custom';
    customModules?: SubscriptionFeatures;
}

interface FeatureResponse {
    ok: boolean;
    plan: string;
    features: SubscriptionFeatures;
    message?: string;
}

interface BaseResponse {
    ok: boolean;
    message: string;
    data?: any;
}

// --- Hook: Get School Features (Subscription) ---
export const useGetMyFeatures = (schoolId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['subscription-features', schoolId],
        queryFn: async () => {
            try {
                // Roles allowed: correspondent, principal
                checkPermission(currentRole, ["correspondent", "principal"]);

                const { data } = await Api.get<FeatureResponse>(`/api/subscription/get`, {
                    params: { schoolId }
                });

                if (data?.ok) {
                    return { plan: data.plan, features: data.features };
                } else {
                    throw new Error(data.message || 'Failed to fetch subscription features');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        enabled: !!schoolId,
    });
};

// --- Hook: Update School Subscription ---
export const useUpdateSchoolSubscription = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: UpdateSubscriptionPayload) => {
            try {
                // Roles allowed: correspondent
                // Note: Your backend also requires the user to be a platform admin.
                checkPermission(currentRole, ["correspondent"]);

                const { data } = await Api.put<BaseResponse>('/api/subscription/update', payload);
                
                if (!data.ok) throw new Error(data.message || 'Failed to update subscription');
                
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate the features query so the UI updates instantly
            queryClient.invalidateQueries({ queryKey: ['subscription-features', variables.schoolId] });
        },
    });
};