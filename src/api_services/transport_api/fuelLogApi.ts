import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthData } from "../../hooks/useAuthData";
import { checkPermission } from "../../utils/utils";
import { Api } from "../../lib/api";

// --- Types ---

export type PaymentMode = "cash" | "card" | "upi" | "company_account" | string;

export interface IFuelLog {
    _id: string;
    schoolId: string;
    busId: any; // Can be string ID or populated bus object
    date: string; // ISO date string
    odometerReading: number;
    fuelQuantity: number; // in liters/kg
    pricePerLiter: number;
    totalAmount: number;
    fuelStation?: string;
    paymentMode?: PaymentMode;
    fuelBillNo?: string;
    notes?: string;
    enteredBy?: string;
    createdAt?: string;
    updatedAt?: string;
}
export interface FuelLogFilters {
    schoolId: string;
    busId?: string;
    academicYear?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
    minAmount?: number;
    maxAmount?: number;
    limit?: number;
}

// Assumed BaseResponse matching the infinite scroll requirements
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

export const useCreateFuelLog = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: Partial<IFuelLog>) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.post('/api/transport/fuellog/create', payload);

                if (!data.ok) throw new Error(data.message || 'Failed to create fuel log');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fuel-logs-infinite'] });
        },
    });
};


// ---------- 2. GET ALL (INFINITE SCROLL) ----------

export const useGetAllFuelLogsInfinite = (params: FuelLogFilters) => {
    const { currentRole } = useAuthData();

    return useInfiniteQuery({
        queryKey: ['fuel-logs-infinite', params],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.get<BaseResponse<IFuelLog[]>>('/api/transport/fuellog', {
                    params: { ...params, page: pageParam }
                });

                if (data.ok) {
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to fetch fuel logs');
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
        enabled: !!params.schoolId,
    });
};


// ---------- 3. GET BY ID ----------

export const useGetFuelLogById = (id?: string) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['fuel-log', id],
        queryFn: async () => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.get<BaseResponse<IFuelLog>>(`/api/transport/fuellog/${id}`);

                if (!data.ok) throw new Error(data.message || 'Failed to fetch fuel log details');
                return data.data as IFuelLog;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!id,
    });
};


// ---------- 4. UPDATE ----------

export const useUpdateFuelLog = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: Partial<IFuelLog> }) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.put(`/api/transport/fuellog/${id}`, payload);

                if (!data.ok) throw new Error(data.message || 'Failed to update fuel log');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['fuel-logs-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['fuel-log', variables.id] });
        },
    });
};


// ---------- 5. DELETE ----------

export const useDeleteFuelLog = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.delete(`/api/transport/fuellog/${id}`);

                if (!data.ok) throw new Error(data.message || 'Failed to delete fuel log');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fuel-logs-infinite'] });
        },
    });
};