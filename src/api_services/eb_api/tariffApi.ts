import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthData } from '../../hooks/useAuthData';
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';
import type { UserRole } from '../../features/slices/authSlice';
import { queryClient } from '../../lib/queryClient';

// ============================
// TYPE DEFINITIONS
// ============================

export interface ITariffSlab {
    minKw: number;
    maxKw: number; // Use a high number or null to represent "above X"
    ratePerUnit: number;
}

export interface ITariff {
    _id: string;
    schoolId: string;
    tariffName: string;
    fixedChargePerKw: number;
    slabs: ITariffSlab[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TariffPayload {
    tariffName?: string;
    fixedChargePerKw?: number;
    slabs?: ITariffSlab[];
    isActive?: boolean;
}


export interface BaseResponse<T = any> {
    ok: boolean;
    data?: T;
    message?: string
}
// Separate role arrays for Read and Modify operations
const READ_ROLES:UserRole[] = ["correspondent", "administrator", "principal", "viceprincipal", "accountant"];
const MODIFY_ROLES:UserRole[] = ["correspondent", "administrator", "principal", "accountant"];

// ============================
// GET ALL TARIFFS
// ============================
export const useGetTariffs = (schoolId?: string) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['tariffs', schoolId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, READ_ROLES);

                const { data } = await Api.get<BaseResponse<ITariff[]>>(`/api/eb/tariff/get-all/${schoolId}`);

                if (!data.ok) throw new Error(data.message || 'Failed to fetch tariffs');
                return data.data as ITariff[];
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!schoolId,
    });
};

// ============================
// GET TARIFF BY ID
// ============================
export const useGetTariffById = (schoolId?: string, tariffId?: string) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['tariff', schoolId, tariffId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, READ_ROLES);

                const { data } = await Api.get<BaseResponse<ITariff>>(`/api/eb/tariff/get/${schoolId}/${tariffId}`);

                if (!data.ok) throw new Error(data.message || 'Failed to fetch tariff details');
                return data.data as ITariff;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!schoolId && !!tariffId,
    });
};

// ============================
// CREATE TARIFF
// ============================
export const useCreateTariff = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ schoolId, payload }: { schoolId: string; payload: TariffPayload }) => {
            try {
                checkPermission(currentRole, MODIFY_ROLES);

                const { data } = await Api.post<BaseResponse<ITariff>>(`/api/eb/tariff/create/${schoolId}`, payload);

                if (!data.ok) throw new Error(data.message || 'Failed to create tariff');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tariffs', variables.schoolId] });
        },
    });
};

// ============================
// UPDATE TARIFF
// ============================
export const useUpdateTariff = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ 
            schoolId, 
            tariffId, 
            payload 
        }: { 
            schoolId: string; 
            tariffId: string; 
            payload: TariffPayload 
        }) => {
            try {
                checkPermission(currentRole, MODIFY_ROLES);

                const { data } = await Api.put<BaseResponse<ITariff>>(`/api/eb/tariff/update/${schoolId}/${tariffId}`, payload);

                if (!data.ok) throw new Error(data.message || 'Failed to update tariff');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tariffs', variables.schoolId] });
            queryClient.invalidateQueries({ queryKey: ['tariff', variables.schoolId, variables.tariffId] });
        },
    });
};

// ============================
// DELETE TARIFF
// ============================
export const useDeleteTariff = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ schoolId, tariffId }: { schoolId: string; tariffId: string }) => {
            try {
                checkPermission(currentRole, MODIFY_ROLES);

                const { data } = await Api.delete<BaseResponse<null>>(`/api/eb/tariff/delete/${schoolId}/${tariffId}`);

                if (!data.ok) throw new Error(data.message || 'Failed to delete tariff');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tariffs', variables.schoolId] });
            queryClient.removeQueries({ queryKey: ['tariff', variables.schoolId, variables.tariffId] });
        },
    });
};