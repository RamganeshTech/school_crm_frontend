import { useQuery } from '@tanstack/react-query';
import { Api } from '../../lib/api'; // Adjust to your axios instance path
import { useAuthData } from '../../hooks/useAuthData'; // Adjust to your auth hook
import { checkPermission } from '../../utils/utils';

export interface PendingTask {
    id: string; // Student ID
    homeworkId?: string;
    name: string;
    module: 'studentProfile' | 'homeworkSubmission';
    message: string;
}

export interface PendingTaskResponse {
    ok: boolean;
    totalPending: number;
    data: PendingTask[];
    message: string;
}

export const useGetPendingTasks = () => {
    const { userId, currentRole } = useAuthData();

    return useQuery({
        queryKey: ['pending-tasks', userId, currentRole],
        queryFn: async () => {
            try {
                // Administrative action
                checkPermission(currentRole, ["correspondent", "administrator", "principal", "viceprincipal"]);

                const { data } = await Api.get<PendingTaskResponse>('/api/pending/getall', {
                    params: { userId, role: currentRole }
                });
                if (data.ok) return data;
                throw new Error(data.message || 'Failed to fetch pending tasks');
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        // IMPORTANT: Only fetch if the user is logged in and is a parent
        enabled: !!userId && currentRole === 'parent',
        // Auto-refresh every 5 minutes so parents don't miss new homework
        // refetchInterval: 5 * 60 * 1000,
    });
};