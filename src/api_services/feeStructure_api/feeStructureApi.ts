// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Api } from '../../lib/api'; // Adjust path to your axios instance
// import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
// import { checkPermission } from '../../utils/utils'; // Adjust path
// import type { UserRole } from '../../features/slices/authSlice';

// // ====================================================================
// // TYPES & INTERFACES
// // ====================================================================

// export interface IFeeHead {
//     admissionFee: number;
//     firstTermAmt: number;
//     secondTermAmt: number;
//     busFirstTermAmt: number;
//     busSecondTermAmt: number;
// }

// export interface IFeeStructure {
//     _id: string;
//     schoolId: string;
//     classId: string;
//     type: 'new' | 'old' | null;
//     feeHead: IFeeHead;
//     totalAmount: number;
//     createdAt: string;
//     updatedAt: string;
// }

// export interface BaseResponse<T = any> {
//     ok: boolean;
//     message: string;
//     data?: T;
// }

// export interface SetFeeStructurePayload {
//     schoolId: string;
//     classId: string;
//     type: 'new' | 'old';
//     feeHead: {
//         admissionFee: number;
//         firstTermAmt: number;
//         secondTermAmt: number;
//         busFirstTermAmt: number;
//         busSecondTermAmt: number;
//     };
// }

// // Role Arrays
// const ADMIN_ROLES: UserRole[] = ["correspondent", "administrator", "accountant"];
// const VIEW_ROLES: UserRole[] = ["correspondent", "administrator", "principal", "viceprincipal", "accountant", "teacher", "parent"];

// // ====================================================================
// // REACT QUERY HOOKS
// // ====================================================================

// // --- Hook: Get All Fee Structures for a School ---
// export const useGetAllFeeStructures = (schoolId: string | undefined) => {
//     const { currentRole } = useAuthData();

//     return useQuery({
//         queryKey: ['fee-structures', 'all', schoolId],
//         queryFn: async () => {
//             try {
//                 checkPermission(currentRole, VIEW_ROLES);
//                 const { data } = await Api.get<BaseResponse<IFeeStructure[]>>('/api/feestructure/getall', {
//                     params: { schoolId }
//                 });
//                 if (data.ok) return data.data;
//                 throw new Error(data.message || 'Failed to fetch fee structures');
//             } catch (error: any) {
//                 const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
//                 throw new Error(errorMessage, { cause: error });
//             }
//         },
//         enabled: !!schoolId,
//     });
// };

// // --- Hook: Get Fee Structure By Class ---
// export const useGetFeeStructureByClass = (schoolId: string | undefined, classId: string | undefined) => {
//     const { currentRole } = useAuthData();

//     return useQuery({
//         queryKey: ['fee-structures', 'class', schoolId, classId],
//         queryFn: async () => {
//             try {
//                 checkPermission(currentRole, VIEW_ROLES);
//                 const { data } = await Api.get<BaseResponse<IFeeStructure[]>>('/api/feestructure/getbyclass', {
//                     params: { schoolId, classId }
//                 });
//                 if (data.ok) return data.data;
//                 throw new Error(data.message || 'Failed to fetch class fee structure');
//             } catch (error: any) {
//                 const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
//                 throw new Error(errorMessage, { cause: error });
//             }
//         },
//         enabled: !!schoolId && !!classId,
//     });
// };

// // --- Hook: Set / Update Fee Structure ---
// export const useSetFeeStructure = () => {
//     const queryClient = useQueryClient();
//     const { currentRole } = useAuthData();

//     return useMutation({
//         mutationFn: async (payload: SetFeeStructurePayload) => {
//             try {
//                 checkPermission(currentRole, ADMIN_ROLES);
//                 const { data } = await Api.post<BaseResponse<IFeeStructure>>('/api/feestructure/set', payload);
//                 if (!data.ok) throw new Error(data.message || 'Failed to set fee structure');
//                 return data;
//             } catch (error: any) {
//                 const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
//                 throw new Error(errorMessage, { cause: error });
//             }
//         },
//         onSuccess: (_, variables) => {
//             // Invalidate both the specific class query and the all structures query
//             queryClient.invalidateQueries({ queryKey: ['fee-structures', 'all', variables.schoolId] });
//             queryClient.invalidateQueries({ queryKey: ['fee-structures', 'class', variables.schoolId, variables.classId] });
//         },
//     });
// };

// // --- Hook: Delete Fee Structure ---
// export const useDeleteFeeStructure = () => {
//     const queryClient = useQueryClient();
//     const { currentRole } = useAuthData();

//     return useMutation({
//         mutationFn: async (id: string) => {
//             try {
//                 checkPermission(currentRole, ADMIN_ROLES);
//                 const { data } = await Api.delete<BaseResponse>(`/api/feestructure/delete/${id}`);
//                 if (!data.ok) throw new Error(data.message || 'Failed to delete fee structure');
//                 return data;
//             } catch (error: any) {
//                 const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
//                 throw new Error(errorMessage, { cause: error });
//             }
//         },
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
//         },
//     });
// };



// NEW VERSION



import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Api } from '../../lib/api'; // Adjust path to your axios instance
import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
import { checkPermission } from '../../utils/utils'; // Adjust path
import type { UserRole } from '../../features/slices/authSlice';

// ====================================================================
// TYPES & INTERFACES (DYNAMICALLY UPDATED)
// ====================================================================

// Now fully dynamic: mapping lowercase keys to their respective values
export type IDynamicFeeHead = Record<string, number>;

export interface IFeeStructure {
    _id: string;
    schoolId: string;
    classId: string;
    type: 'new' | 'old' | null;
    feeHeads: IDynamicFeeHead; // Dynamic key-value pairing
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
}

export interface BaseResponse<T = any> {
    ok: boolean;
    message: string;
    data?: T;
}

export interface SetFeeStructurePayload {
    schoolId: string;
    classId: string;
    type: 'new' | 'old';
    feeHead: IDynamicFeeHead; // Matches backend expect payload shape
}

// Role Arrays
const ADMIN_ROLES: UserRole[] = ["correspondent", "administrator", "accountant"];
const VIEW_ROLES: UserRole[] = ["correspondent", "administrator", "principal", "viceprincipal", "accountant", "teacher", "parent"];

// ====================================================================
// REACT QUERY HOOKS
// ====================================================================

// --- Hook: Get All Fee Structures for a School ---
export const useGetAllFeeStructures = (schoolId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['fee-structures', 'all', schoolId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, VIEW_ROLES);
                const { data } = await Api.get<BaseResponse<IFeeStructure[]>>('/api/feestructure/getall', {
                    params: { schoolId }
                });
                if (data.ok) return data.data;
                throw new Error(data.message || 'Failed to fetch fee structures');
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        enabled: !!schoolId,
    });
};

// --- Hook: Get Fee Structure By Class ---
export const useGetFeeStructureByClass = (schoolId: string | undefined, classId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['fee-structures', 'class', schoolId, classId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, VIEW_ROLES);
                const { data } = await Api.get<BaseResponse<IFeeStructure[]>>('/api/feestructure/v1/getbyclass', {
                    params: { schoolId, classId }
                });
                if (data.ok) return data.data;
                throw new Error(data.message || 'Failed to fetch class fee structure');
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        enabled: !!schoolId && !!classId,
    });
};

// --- Hook: Set / Update Fee Structure ---
export const useSetFeeStructure = () => {
    const queryClient = useQueryClient();
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: SetFeeStructurePayload) => {
            try {
                checkPermission(currentRole, ADMIN_ROLES);
                const { data } = await Api.post<BaseResponse<IFeeStructure>>('/api/feestructure/v1/set', payload);
                if (!data.ok) throw new Error(data.message || 'Failed to set fee structure');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['fee-structures', 'all', variables.schoolId] });
            queryClient.invalidateQueries({ queryKey: ['fee-structures', 'class', variables.schoolId, variables.classId] });
        },
    });
};

// --- Hook: Delete Fee Structure ---
export const useDeleteFeeStructure = () => {
    const queryClient = useQueryClient();
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (id: string) => {
            try {
                checkPermission(currentRole, ADMIN_ROLES);
                const { data } = await Api.delete<BaseResponse>(`/api/feestructure/delete/${id}`);
                if (!data.ok) throw new Error(data.message || 'Failed to delete fee structure');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
        },
    });
};