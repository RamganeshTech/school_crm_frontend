import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { Api } from '../../lib/api'; // Adjust path to your axios instance
import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
import { checkPermission } from '../../utils/utils'; // Adjust path
import { queryClient } from '../../lib/queryClient'; // Adjust path to queryClient

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface BaseResponse<T = any> {
    ok: boolean;
    message?: string;
    data?: T;
    pagination?: {
        total: number;
        currentPage: number;
        totalPages: number;
        limit: number;
    };
}

export interface IDeletedArchive {
    _id: string;
    schoolId: string;
    category: string;
    originalId: string;
    deletedData: any; // Can be any object structure depending on what was deleted
    deletedBy?: {
        _id: string;
        userName: string;
        role: string;
    } | string;
    reason: string | null;
    deletedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetAllArchiveParams {
    schoolId: string;
    category?: string;
    page?: number;
    limit?: number;
}

// ==========================================
// 2. QUERIES (GET)
// ==========================================

// --- Hook: Get All Archived Items (Infinite Scroll) ---
export const useGetAllDeletedItemsInfinite = (params: Omit<GetAllArchiveParams, 'page'>) => {
    const { currentRole } = useAuthData();

    return useInfiniteQuery({
        queryKey: ['delete-archives-infinite', params],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            // Role check based on your backend route
            checkPermission(currentRole, ["correspondent", "accountant", "principal", "viceprincipal"]);
            
            const { data } = await Api.get<BaseResponse<IDeletedArchive[]>>('/api/deletearchive/getall', { 
                params: { ...params, page: pageParam } 
            });

            if (data.ok) {
                return data; // Return full response to access data.pagination
            } else {
                throw new Error(data.message || 'Failed to fetch archived items');
            }
        },
        getNextPageParam: (lastPage) => {
            // Safely parse numbers to prevent string concatenation bugs
            const currentPage = Number(lastPage?.pagination?.currentPage) || 1;
            const totalPages = Number(lastPage?.pagination?.totalPages) || 1;
            
            if (currentPage < totalPages) {
                return currentPage + 1;
            }
            return undefined;
        },
        enabled: !!params.schoolId, // Only fetch if schoolId is available
    });
};

// --- Hook: Get Single Archived Item By ID ---
export const useGetDeletedItemById = (archiveId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['delete-archive-single', archiveId],
        queryFn: async () => {
            checkPermission(currentRole, ["correspondent", "accountant", "principal", "viceprincipal"]);

            const { data } = await Api.get<BaseResponse<IDeletedArchive>>(`/api/deletearchive/get/${archiveId}`);

            if (data.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to fetch archived item details');
            }
        },
        enabled: !!archiveId,
    });
};

// ==========================================
// 3. MUTATIONS (DELETE)
// ==========================================

// --- Hook: Permanently Delete Item (Empty Trash) ---
export const useDeletePermanently = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (archiveId: string) => {
            // Strictly Correspondent only as per backend route
            checkPermission(currentRole, ["correspondent"]);
            
            const { data } = await Api.delete<BaseResponse>(`/api/deletearchive/delete/${archiveId}`);
            
            if (!data.ok) throw new Error(data.message || 'Failed to permanently delete item');
            return data;
        },
        onSuccess: (_, archiveId) => {
            // Refresh lists upon successful permanent deletion
            queryClient.invalidateQueries({ queryKey: ['delete-archives-infinite'] });
            // Optionally remove the specific item from cache
            queryClient.removeQueries({ queryKey: ['delete-archive-single', archiveId] });
        },
    });
};