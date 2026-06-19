import { useQuery } from '@tanstack/react-query';
import { Api } from '../../../lib/api';

export const useGetSchoolProgressStatus = (schoolId: string) => {
    return useQuery({
        queryKey: ['schoolProgress', schoolId],
        queryFn: async () => {
            const { data } = await Api.get(`/api/school/progress-bar/get-progress`, {
                params: { schoolId }
            });
            if (data.ok) return data.data;
            throw new Error(data.message || "Failed to fetch progress status");
        },
        enabled: !!schoolId,
        // Refetch occasionally so it updates as they configure things in other tabs
        // refetchInterval: 5 * 60 * 1000, 
        retry: false
    });
};