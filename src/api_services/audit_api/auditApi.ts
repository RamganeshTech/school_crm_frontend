import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Api } from '../../lib/api'; // Adjust path to your axios instance
import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
import { checkPermission } from '../../utils/utils'; // Adjust path

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface BaseResponse<T = any> {
    ok: boolean;
    message?: string;
    data?: T;
    pagination?: {
        total: number;
        page: number; // Note: Backend uses 'page' here instead of 'currentPage'
        totalPages: number;
        limit: number;
    };
}

export interface IAuditLog {
    _id: string;
    schoolId: string;
    userId: string | { _id: string; userName: string }; // Populated in get single
    userName: string;
    role: string;
    action: string;
    module: string;
    targetId: string | null;
    description: string;
    ipAddress: string | null;
    userAgent: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetAllAuditLogsParams {
    schoolId: string;
    module?: string;
    action?: string;
    role?: string;
    userId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}

// ==========================================
// 2. QUERIES (GET)
// ==========================================

// --- Hook: Get All Audit Logs (Infinite Scroll) ---
export const useGetAllAuditLogsInfinite = (params: Omit<GetAllAuditLogsParams, 'page'>) => {
    const { currentRole } = useAuthData();

    return useInfiniteQuery({
        queryKey: ['audit-logs-infinite', params],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            // Role check based on backend middleware
            checkPermission(currentRole, ["administrator", "correspondent", "principal", "viceprincipal"]);
            
            const { data } = await Api.get<BaseResponse<IAuditLog[]>>('/api/audit/getall', { 
                params: { ...params, page: pageParam } 
            });

            if (data.ok) {
                return data; 
            } else {
                throw new Error(data.message || 'Failed to fetch audit logs');
            }
        },
        getNextPageParam: (lastPage) => {
            // FIX: Using lastPage?.pagination?.page because backend returns { page: pageNum }
            const currentPage = Number(lastPage?.pagination?.page) || 1;
            const totalPages = Number(lastPage?.pagination?.totalPages) || 1;
            
            if (currentPage < totalPages) {
                return currentPage + 1;
            }
            return undefined; // No more pages
        },
        enabled: !!params.schoolId, // Only fetch if schoolId is available
    });
};

// --- Hook: Get Single Audit Log By ID ---
export const useGetAuditLogById = (logId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['audit-log-single', logId],
        queryFn: async () => {
            checkPermission(currentRole, ["administrator", "correspondent", "principal", "viceprincipal"]);

            const { data } = await Api.get<BaseResponse<IAuditLog>>(`/api/audit/get/${logId}`);

            if (data.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to fetch audit log details');
            }
        },
        enabled: !!logId,
    });
};