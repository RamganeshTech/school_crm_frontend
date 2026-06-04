import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
// import { Api } from '../Api'; // Adjust path to your axios instance
import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';
import { queryClient } from '../../lib/queryClient';
// import { checkPermission } from '../../utils/permissionUtils'; // Adjust path
// import { queryClient } from '../../main'; // Adjust path to your queryClient export

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface BaseResponse {
    ok: boolean;
    message?: string;
    data?: any;
}

export interface GetAllExpensesParams {
    schoolId: string;
    expenseNo?: string; // <-- ADD THIS LINE
    minAmount?: number;
    maxAmount?: number;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}

export interface DeleteProofParams {
    expenseId: string;
    proofId: string;
    type: 'bill' | 'workPhoto';
}

export interface UpdateStatusParams {
    id: string;
    status: 'verified' | 'pending';
}

// ==========================================
// 2. QUERIES (GET)
// ==========================================

// --- Hook: Get All Expenses (Paginated/Filtered) ---
export const useGetAllExpensesInfinite = (params: Omit<GetAllExpensesParams, 'page'>) => {
    const { currentRole } = useAuthData();

    return useInfiniteQuery({
        queryKey: ['expenses-infinite', params],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            try {
                checkPermission(currentRole, ["correspondent", "accountant", "principal", "viceprincipal"]);

                const { data } = await Api.get('/api/expense/getall', {
                    params: { ...params, page: pageParam }
                });

                if (data.ok) {
                    // Assuming your backend returns paginated format like { docs: [...], totalPages: N, page: X }
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to fetch expenses');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        getNextPageParam: (lastPage) => {
            // FIX: Correctly access the totalPages from your backend's pagination object
            //    const currentPage = lastPage?.pagination?.currentPage || 1;
            //     const totalPages = lastPage?.pagination?.totalPages || 1;

            const currentPage = Number(lastPage?.pagination?.currentPage) || 1;
            const totalPages = Number(lastPage?.pagination?.totalPages) || 1;

            if (currentPage < totalPages) {
                return currentPage + 1; // There is a next page
            }
            return undefined; // No more pages
        },
        enabled: !!params.schoolId,
    });
};

// --- Hook: Get Single Expense By ID ---
export const useGetExpenseById = (id: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['expense', id],
        queryFn: async () => {
            try {
                // Roles allowed: correspondent, accountant, principal
                checkPermission(currentRole, ["correspondent", "accountant", "principal", "viceprincipal"]);

                const { data } = await Api.get(`/api/expense/get/${id}`);

                if (data.ok) {
                    return data.data;
                } else {
                    throw new Error(data.message || 'Failed to fetch expense details');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!id,
    });
};

// ==========================================
// 3. MUTATIONS (POST, PUT, PATCH, DELETE)
// ==========================================

// --- Hook: Add Expense (Accepts FormData for files) ---
export const useAddExpense = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            try {
                // Roles allowed: correspondent, accountant
                checkPermission(currentRole, ["correspondent", "accountant"]);

                // Axios handles Content-Type 'multipart/form-data' automatically when passed FormData
                // const { data } = await Api.post<BaseResponse>('/api/expense/add', formData);
                const { data } = await Api.post<BaseResponse>('/api/expense/add', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });

                if (!data.ok) throw new Error(data.message || 'Failed to add expense');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses-infinite'] });
        },
    });
};

// --- Hook: Update Expense (Accepts FormData for files) ---
export const useUpdateExpense = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
            try {
                // Roles allowed: correspondent
                checkPermission(currentRole, ["correspondent"]);

                // const { data } = await Api.put<BaseResponse>(`/api/expense/update/${id}`, formData);

                // FIX: Explicitly set the multipart header
                const { data } = await Api.put<BaseResponse>(`/api/expense/update/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });

                if (!data.ok) throw new Error(data.message || 'Failed to update expense');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['expenses-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['expense', variables.id] });
        },
    });
};

// --- Hook: Update Expense Status ---
export const useUpdateExpenseStatus = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ id, status }: UpdateStatusParams) => {
            try {
                // Roles allowed: correspondent
                checkPermission(currentRole, ["correspondent"]);

                const { data } = await Api.patch<BaseResponse>(`/api/expense/updatestatus/${id}`, { status });

                if (!data.ok) throw new Error(data.message || 'Failed to update expense status');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['expenses-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['expense', variables.id] });
        },
    });
};

// --- Hook: Delete Entire Expense ---
export const useDeleteExpense = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (id: string) => {
            try {
                // Roles allowed: correspondent
                checkPermission(currentRole, ["correspondent"]);

                const { data } = await Api.delete<BaseResponse>(`/api/expense/delete/${id}`);

                if (!data.ok) throw new Error(data.message || 'Failed to delete expense');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses-infinite'] });
        },
    });
};

// --- Hook: Delete Specific Proof (File) ---
export const useDeleteExpenseProof = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: DeleteProofParams) => {
            try {
                // Roles allowed: correspondent
                checkPermission(currentRole, ["correspondent"]);

                // Axios DELETE with body requires passing the payload inside the 'data' property
                const { data } = await Api.delete<BaseResponse>('/api/expense/deleteproof', { data: payload });

                if (!data.ok) throw new Error(data.message || 'Failed to delete proof');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['expenses-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['expense', variables.expenseId] });
        },
    });
};



interface ExpenseReportFilters {
    schoolId: string;
    academicYear?: string;
    startDate?: string;
    endDate?: string;
    verificationStatus?: string;
    paymentMode?: string;
    range?: 'week' | 'month' | 'year';
}

export const useGetExpenseReport = (filters: ExpenseReportFilters) => {
    const { currentRole } = useAuthData();

    return useQuery({
        // The queryKey includes all filters so React Query automatically refetches when a filter changes!
        queryKey: ['expense-report', filters],
        queryFn: async () => {
            try {
                // Roles allowed: correspondent, accountant, principal
                checkPermission(currentRole, ["correspondent", "accountant", "principal", "viceprincipal", "administrator"]); // Assuming you have this imported

                const { data } = await Api.get(`/api/expense/v1/report`, {
                    params: filters // Pass the filters directly to the URL query string
                });

                if (data.ok) {
                    return data.data; // Returns { kpi, categorySummary, timeline }
                } else {
                    throw new Error(data.message || 'Failed to fetch expense report');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!filters.schoolId, // Only run if we have a schoolId
    });
};