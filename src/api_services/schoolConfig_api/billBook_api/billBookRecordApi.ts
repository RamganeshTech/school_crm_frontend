import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuthData } from '../../../hooks/useAuthData';
import { checkPermission } from '../../../utils/utils';
import { Api } from '../../../lib/api';

// --- Types ---
export interface GetBillRecordsParams {
    schoolId: string;
    academicYear?: string;
    billBookId?: string;
    billNumber?: string;
    limit?: number;
    page?: number;
}

// Adjust this interface to match your BaseResponse if needed
export interface BillRecordsData {
    records: any[]; // Replace 'any' with your IBillRecord type if available
    pagination: {
        totalRecords: number;
        totalPages: number;
        currentPage: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

// ==========================================
// INFINITE QUERY HOOK
// ==========================================
export const useGetAllBillRecordsInfinite = (params: Omit<GetBillRecordsParams, 'page'>) => {
    const { currentRole } = useAuthData();

    return useInfiniteQuery({
        // Include params in queryKey to trigger refetch when filters change
        queryKey: ['bill-records-infinite', params],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            try {
                // Protect the route locally based on your backend allowed roles
                checkPermission(currentRole, ["correspondent", "administrator"]);

                const { data } = await Api.get<any>('/api/school-config/bill-record/get', {
                    params: { ...params, page: pageParam }
                });

                if (data.ok) {
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to fetch bill records');
                }
            } catch (error: any) {
                // Extracts specific message from the server or falls back to generic
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        getNextPageParam: (lastPage) => {
            // Safely access the pagination object from your backend response structure
            const currentPage = Number(lastPage?.data?.pagination?.currentPage) || 1;
            const totalPages = Number(lastPage?.data?.pagination?.totalPages) || 1;

            if (currentPage < totalPages) {
                return currentPage + 1;
            }
            return undefined;
        },
        enabled: !!params.schoolId, // Only fetch if schoolId is provided
    });
};