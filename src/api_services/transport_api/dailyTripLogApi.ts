import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthData } from "../../hooks/useAuthData";
import { checkPermission } from "../../utils/utils";
import { Api } from "../../lib/api";

// --- Types ---
// export interface IDailyTripLog {
//     _id: string;
//     busId: any; // Can be string or populated bus object
//     date: string;
//     openingOdometer: number;
//     closingOdometer?: number;
//     notes?: string;
//     schoolId: string;
//     enteredBy?: string;
//     createdAt?: string;
//     updatedAt?: string;
// }

export interface IDailyTripLog {
    schoolId: string;
    busId: any;
    date: string;
    dailyLogNo: string
    enteredBy: string;
    openingOdometer: number;
    closingOdometer: number;
    kmRun: number;
    academicYear: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DailyTripLogFilters {
    schoolId: string;
    busId?: string;
    academicYear?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
    minKmRun?: number;
    maxKmRun?: number;
    minOpeningOdometer?: number;
    maxOpeningOdometer?: number;
    minClosingOdometer?: number;
    maxClosingOdometer?: number;
    limit?: number;
}

// --- BaseResponse Interface (Assumed based on your infinite hook reference) ---
interface BaseResponse<T> {
    ok: boolean;
    message?: string;
    data?: T;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}


// ---------- 1. CREATE ----------

export const useCreateDailyTripLog = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: Partial<IDailyTripLog>) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.post('/api/transport/dailytriplog/create', payload);

                if (!data.ok) throw new Error(data.message || 'Failed to create daily trip log');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            // Invalidate the infinite query list to refresh data
            queryClient.invalidateQueries({ queryKey: ['daily-trip-logs-infinite'] });
        },
    });
};


// ---------- 2. GET ALL (INFINITE SCROLL) ----------

export const useGetAllDailyTripLogsInfinite = (params: DailyTripLogFilters) => {
    const { currentRole } = useAuthData();

    return useInfiniteQuery({
        queryKey: ['daily-trip-logs-infinite', params],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.get<BaseResponse<IDailyTripLog[]>>('/api/transport/dailytriplog', {
                    params: { ...params, page: pageParam }
                });

                if (data.ok) {
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to fetch daily trip logs');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        getNextPageParam: (lastPage) => {
            const currentPage = Number(lastPage?.pagination?.page) || 1;
            const totalPages = Number(lastPage?.pagination?.totalPages) || 1;

            if (currentPage < totalPages) {
                return currentPage + 1;
            }
            return undefined;
        },
        enabled: !!params.schoolId, // Ensures the query only runs if a schoolId is present
    });
};


// ---------- 3. GET BY ID ----------

export const useGetDailyTripLogById = (id?: string) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['daily-trip-log', id],
        queryFn: async () => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.get<BaseResponse<IDailyTripLog>>(`/api/transport/dailytriplog/${id}`);

                if (!data.ok) throw new Error(data.message || 'Failed to fetch trip log details');
                return data.data as IDailyTripLog;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!id, // Only run the query if an ID is actually provided
    });
};


// ---------- 4. UPDATE ----------

export const useUpdateDailyTripLog = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: Partial<IDailyTripLog> }) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.put(`/api/transport/dailytriplog/${id}`, payload);

                if (!data.ok) throw new Error(data.message || 'Failed to update daily trip log');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_data, variables) => {
            // Refresh both the list and the specific detailed view
            queryClient.invalidateQueries({ queryKey: ['daily-trip-logs-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['daily-trip-log', variables.id] });
        },
    });
};


// ---------- 5. DELETE ----------

export const useDeleteDailyTripLog = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.delete(`/api/transport/dailytriplog/${id}`);

                if (!data.ok) throw new Error(data.message || 'Failed to delete daily trip log');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['daily-trip-logs-infinite'] });
        },
    });
};