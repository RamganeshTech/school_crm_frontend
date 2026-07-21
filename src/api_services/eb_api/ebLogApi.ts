import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthData } from '../../hooks/useAuthData';
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';
import type { UserRole } from '../../features/slices/authSlice';
import { queryClient } from '../../lib/queryClient';
// Adjust your imports based on your actual file structure
// import { queryClient } from '...'; 
// import Api from '...';
// import { useAuthData } from '...';
// import { checkPermission } from '...';
// import type { BaseResponse } from '...';

// Replace with your actual interface based on your Mongoose model
export interface IEBLog {
    _id: string;
    schoolId: string;
    premisesId: any; // Can be string or populated object
    ebLogNo: string;
    date: string;
    time: string;
    meterReading: number;
    note?: string;
    createdAt: string;
    updatedAt: string;
}

export interface BaseResponse<T = any> {
    ok: boolean;
    data?: T;
    message?: string
}


// Separate role arrays for Read and Modify operations
const READ_ROLES: UserRole[] = ["correspondent", "administrator", "principal", "viceprincipal", "accountant"];
const MODIFY_ROLES: UserRole[] = ["correspondent", "administrator", "principal", "accountant"];

// ============================
// GET ALL EB LOGS (with filters)
// ============================
export const useGetAllEBLogs = (
    schoolId?: string,
    params?: {
        premisesId?: string;
        fromDate?: string;
        toDate?: string;
        minReading?: string;
        maxReading?: string;
        search?: string;
    }
) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['ebLogs', schoolId, params],
        queryFn: async () => {
            try {
                checkPermission(currentRole, READ_ROLES);

                const { data } = await Api.get<BaseResponse<IEBLog[]>>(`/api/eb/logs/get-all/${schoolId}`, {
                    params, // Axios will automatically format these as query strings
                });

                if (!data.ok) throw new Error(data.message || 'Failed to fetch EB logs');
                return data.data as IEBLog[];
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!schoolId,
    });
};

// ============================
// GET EB LOG BY ID
// ============================
export const useGetEBLogById = (schoolId?: string, logId?: string) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['ebLog', schoolId, logId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, READ_ROLES);

                // Fixed the double slash '//get/' from your routes to a single slash here
                const { data } = await Api.get<BaseResponse<IEBLog>>(`/api/eb/logs/get/${schoolId}/${logId}`);

                if (!data.ok) throw new Error(data.message || 'Failed to fetch EB log');
                return data.data as IEBLog;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!schoolId && !!logId,
    });
};

// ============================
// CREATE EB LOG
// ============================
export const useCreateEBLog = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({
            schoolId,
            payload
        }: {
            schoolId: string;
            payload: { premisesId: string; date: string; time: string; meterReading: number; note?: string }
        }) => {
            try {
                checkPermission(currentRole, MODIFY_ROLES);

                const { data } = await Api.post<BaseResponse<IEBLog>>(`/api/eb/logs/create/${schoolId}`, payload);

                if (!data.ok) throw new Error(data.message || 'Failed to create EB log');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['ebLogs', variables.schoolId] });
        },
    });
};

// ============================
// UPDATE EB LOG
// ============================
export const useUpdateEBLog = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({
            schoolId,
            logId,
            payload
        }: {
            schoolId: string;
            logId: string;
            payload: { date?: string; time?: string; meterReading?: number; note?: string }
        }) => {
            try {
                checkPermission(currentRole, MODIFY_ROLES);

                const { data } = await Api.put<BaseResponse<IEBLog>>(`/api/eb/logs/update/${schoolId}/${logId}`, payload);

                if (!data.ok) throw new Error(data.message || 'Failed to update EB log');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['ebLogs', variables.schoolId] });
            queryClient.invalidateQueries({ queryKey: ['ebLog', variables.schoolId, variables.logId] });
        },
    });
};

// ============================
// DELETE EB LOG
// ============================
export const useDeleteEBLog = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ schoolId, logId }: { schoolId: string; logId: string }) => {
            try {
                checkPermission(currentRole, MODIFY_ROLES);

                const { data } = await Api.delete<BaseResponse<null>>(`/api/eb/logs/delete/${schoolId}/${logId}`);

                if (!data.ok) throw new Error(data.message || 'Failed to delete EB log');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['ebLogs', variables.schoolId] });
            // Optionally invalidate the specific log if needed, though it's deleted
            queryClient.removeQueries({ queryKey: ['ebLog', variables.schoolId, variables.logId] });
        },
    });
};



// ============================
// TYPE DEFINITIONS
// ============================

export interface IEBDashboardOverview {
    totalConsumptionYesterday: number;
    premisesReportedYesterday: number;
    totalPremises: number;
    recentLogs: any[]; // Replace 'any' with 'IEBLog' if you have it imported
}

export interface IEBPremisesAnalytics {
    premisesId: string;
    premisesName: string;
    yesterdayConsumption: number | null;
    avg30DayConsumption: number | null;
    projectedThisMonthConsumption: number | null;
    totalConsumption: number | null;
}



// ============================
// DASHBOARD OVERVIEW HOOK
// ============================
export const useGetEBDashboardOverview = (schoolId?: string) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['ebDashboardOverview', schoolId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, READ_ROLES);

                const { data } = await Api.get<BaseResponse<IEBDashboardOverview>>(
                    `/api/eb/logs/analytics/${schoolId}/dashboard`
                );

                if (!data.ok) throw new Error(data.message || 'Failed to fetch EB dashboard overview');
                return data.data as IEBDashboardOverview;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!schoolId,
        // Optional: you can set staleTime if you don't want it refetching constantly on window focus
        // since the backend caches it for 10 minutes anyway
        // staleTime: 5 * 60 * 1000, 
    });
};

// ============================
// PREMISES ANALYTICS HOOK
// ============================
export const useGetEBPremisesAnalytics = (schoolId?: string) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['ebPremisesAnalytics', schoolId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, READ_ROLES);

                const { data } = await Api.get<BaseResponse<IEBPremisesAnalytics[]>>(
                    `/api/eb/logs/analytics/${schoolId}/premises`
                );

                if (!data.ok) throw new Error(data.message || 'Failed to fetch premises analytics');
                return data.data as IEBPremisesAnalytics[];
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!schoolId,
    });
};





export interface ISeriesPoint {
    label: string;
    kwUsed: number | null;
    cost?: number | null; // <-- Added this field
}

export interface IChartPremises {
    premisesId: string;
    premisesName: string;
    series: ISeriesPoint[];
}

export interface IEBConsumptionChartData {
    period: string;
    granularity: "day" | "month";
    rangeStart: string;
    rangeEnd: string;
    premises: IChartPremises[];
}

// ============================
// PREMISES ANALYTICS HOOK (LINE CHART)
// ============================
export const useGetPremisesEBConsumptionChart = (
    schoolId?: string,
    params?: { period?: string; fromDate?: string; toDate?: string }
) => {
    const { currentRole } = useAuthData();

    return useQuery({
        // 1. Include params in the queryKey so it refetches when the period/dates change
        queryKey: ['ebConsumptionChart', schoolId, params],
        queryFn: async () => {
            try {
                checkPermission(currentRole, READ_ROLES);

                // 2. Pass the params to Axios so they are sent in the URL query string
                const { data } = await Api.get<BaseResponse<IEBConsumptionChartData>>(
                    `/api/eb/logs/analytics/${schoolId}/line-chart/consumption`,
                    { params } 
                );

                if (!data.ok) throw new Error(data.message || 'Failed to fetch chart data');
                return data.data as IEBConsumptionChartData;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!schoolId,
    });
};





// Add to your existing interfaces
export interface IEBBillKpis {
    monthlyProjectedBill: number;
    projectedUnitsThisMonth: number;
    estimatedDailyEBCost: number;
}

// ============================
// BILLING KPIs HOOK
// ============================
export const useGetEBBillKpis = (schoolId?: string) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['ebBillKpis', schoolId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, READ_ROLES);

                const { data } = await Api.get<BaseResponse<IEBBillKpis>>(
                    `/api/eb/logs/analytics/${schoolId}/bill/kpi`
                );

                if (!data.ok) throw new Error(data.message || 'Failed to fetch billing KPIs');
                return data.data as IEBBillKpis;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!schoolId,
    });
};