import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthData } from '../../hooks/useAuthData';
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';
import type { UserRole } from '../../features/slices/authSlice';
import { queryClient } from '../../lib/queryClient';
// Adjust your imports based on your file structure
// import { queryClient } from '...'; 
// import Api from '...';
// import { useAuthData } from '...';
// import { checkPermission } from '...';
// import type { BaseResponse } from '...';

// Replace with your actual interface
export interface IPremises {
    _id: string;
    premisesName: string;
    premisesAddress?: string;
    meterLocation?: string;
    consumerNumber?: string;
    tariffId?: any;
    sanctionedLoad?: number;
    billingCycleStartDate?: Date;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}


// 2. Create a payload type for reusability in Create and Update hooks
export interface PremisesPayload {
    premisesName?: string; // Required for create, optional for update
    premisesAddress?: string;
    meterLocation?: string;
    consumerNumber?: string;
    tariffId?: string;
    sanctionedLoad?: number;
    billingCycleStartDate?: string;
    isActive?: boolean; // Usually only passed during updates
}

export interface BaseResponse<T = any> {
    ok: boolean;
    data?: T;
    message?: string
}



const MODIFY_ROLES: UserRole[] = ["accountant", "correspondent", "administrator", "principal", "viceprincipal", "teacher"];
const GET_ROLES: UserRole[] = ["administrator", "correspondent", "principal"];

// ============================
// GET ALL PREMISES
// ============================
export const useGetPremises = (schoolId?: string) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['premises', schoolId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, GET_ROLES);

                const { data } = await Api.get<BaseResponse<IPremises[]>>(`/api/premises/get/${schoolId}`);

                if (!data.ok) throw new Error(data.message || 'Failed to fetch premises');
                return data.data as IPremises[];
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!schoolId, // Only run the query if schoolId is provided
    });
};

// ============================
// CREATE PREMISES
// ============================
export const useCreatePremises = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ schoolId, payload }: { schoolId: string; payload: PremisesPayload }) => {
            try {
                checkPermission(currentRole, MODIFY_ROLES);

                const { data } = await Api.post<BaseResponse<IPremises>>(`/api/premises/create/${schoolId}`, payload);

                if (!data.ok) throw new Error(data.message || 'Failed to create premises');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['premises', variables.schoolId] });
        },
    });
};

// ============================
// UPDATE PREMISES
// ============================
export const useUpdatePremises = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ schoolId, premisesId, payload }: { schoolId: string; premisesId: string; payload: PremisesPayload }) => {
            try {
                checkPermission(currentRole, MODIFY_ROLES);

                const { data } = await Api.put<BaseResponse<IPremises>>(`/api/premises/update/${schoolId}/${premisesId}`, payload);

                if (!data.ok) throw new Error(data.message || 'Failed to update premises');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['premises', variables.schoolId] });
        },
    });
};

// ============================
// DELETE PREMISES
// ============================
export const useDeletePremises = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ schoolId, premisesId }: { schoolId: string; premisesId: string }) => {
            try {
                checkPermission(currentRole, MODIFY_ROLES);

                const { data } = await Api.delete<BaseResponse<null>>(`/api/premises/delete/${schoolId}/${premisesId}`);

                if (!data.ok) throw new Error(data.message || 'Failed to delete premises');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['premises', variables.schoolId] });
        },
    });
};