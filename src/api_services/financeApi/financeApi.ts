import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Api } from '../../lib/api'; // Adjust path
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
        currentPage: number;
        totalPages: number;
        limit: number;
    };
}

export interface ITransaction {
    _id: string;
    schoolId: string;
    academicYear: string;
    transactionType: "CREDIT" | "DEBIT";
    accountType: "CASH_IN_HAND" | "BANK_ACCOUNT";
    amount: number;
    date: string;
    paymentMode: string;
    status: "active" | "cancelled";
    section?: string;
    referenceId?: any;
    feeReceiptId?: any;
    studentRecordId?: any;
    createdBy?: any;
    cancelledBy?: any;
    createdAt: string;
    updatedAt: string;
}

// Params for APIs
export interface GetAllTransactionsParams {
    schoolId: string;
    academicYear?: string;
    transactionType?: "CREDIT" | "DEBIT";
    accountType?: "CASH_IN_HAND" | "BANK_ACCOUNT";
    status?: "active" | "cancelled";
    paymentMode?: string;
    section?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}

export interface FinanceStatsParams {
    schoolId: string;
    range?: "today" | "week" | "month" | "year" | "custom";
    startDate?: string;
    endDate?: string;
    section?: string;
}

export interface OutstandingStatsParams {
    schoolId: string;
    academicYear: string;
    section?: string;
}

// ==========================================
// 2. QUERIES (GET)
// ==========================================

// --- Hook: Get All Transactions (Infinite Scroll) ---
export const useGetAllTransactionsInfinite = (params: Omit<GetAllTransactionsParams, 'page'>) => {
    const { currentRole } = useAuthData();

    return useInfiniteQuery({
        queryKey: ['finance-transactions-infinite', params],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            checkPermission(currentRole, ["correspondent", "accountant", "principal"]);
            
            const { data } = await Api.get<BaseResponse<ITransaction[]>>('/api/financeledger/getall', { 
                params: { ...params, page: pageParam } 
            });

            if (data.ok) {
                return data; 
            } else {
                throw new Error(data.message || 'Failed to fetch transactions');
            }
        },
        getNextPageParam: (lastPage) => {
            const currentPage = Number(lastPage?.pagination?.currentPage) || 1;
            const totalPages = Number(lastPage?.pagination?.totalPages) || 1;
            
            if (currentPage < totalPages) {
                return currentPage + 1;
            }
            return undefined;
        },
        enabled: !!params.schoolId, // Only run if schoolId is provided
    });
};

// --- Hook: Get Single Transaction By ID ---
export const useGetTransactionById = (transactionId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['finance-transaction', transactionId],
        queryFn: async () => {
            checkPermission(currentRole, ["correspondent", "accountant", "principal"]);

            const { data } = await Api.get<BaseResponse<ITransaction>>(`/api/financeledger/get/${transactionId}`);

            if (data.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to fetch transaction details');
            }
        },
        enabled: !!transactionId,
    });
};

// --- Hook: Get Finance Stats (KPIs) ---
export const useGetFinanceStats = (params: FinanceStatsParams) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['finance-stats', params],
        queryFn: async () => {
            checkPermission(currentRole, ["correspondent", "accountant", "principal"]);

            // Backend returns data directly or inside a wrapper, adjusting based on your controller
            const { data } = await Api.get(`/api/financeledger/stats`, { params });

            return data.data || data; 
        },
        enabled: !!params.schoolId,
    });
};

// --- Hook: Get Finance Timeline (Charts) ---
export const useGetFinanceTimeline = (params: FinanceStatsParams) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['finance-timeline', params],
        queryFn: async () => {
            checkPermission(currentRole, ["correspondent", "accountant", "principal"]);

            const { data } = await Api.get(`/api/financeledger/timeline`, { params });

            return data.data || [];
        },
        enabled: !!params.schoolId,
    });
};

// --- Hook: Get Outstanding Stats (Dues) ---
export const useGetOutstandingStats = (params: OutstandingStatsParams) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['finance-outstanding', params],
        queryFn: async () => {
            checkPermission(currentRole, ["correspondent", "accountant", "principal"]);

            const { data } = await Api.get(`/api/financeledger/outstanding`, { params });

            return data.data || data;
        },
        enabled: !!params.schoolId && !!params.academicYear,
    });
};