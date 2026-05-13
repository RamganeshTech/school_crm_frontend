import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { Api } from '../../lib/api'; // Adjust path
import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
import { checkPermission } from '../../utils/utils'; // Adjust path
import { queryClient } from '../../lib/queryClient'; // Adjust path
import type { UserRole } from '../../features/slices/authSlice';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface BaseResponse<T = any> {
    ok: boolean;
    message?: string;
    data?: T;
    pagination?: {
        totalClubs?: number; // From Club getAll
        totalVideos?: number; // From Video getAll (assumption)
        currentPage: number;
        totalPages: number;
        limit: number;
    };
}

export interface IClubThumbnail {
    url: string;
    key: string;
    type: string;
    originalName: string;
    uploadedAt: string;
}

export interface IClub {
    _id: string;
    schoolId: string;
    classId?: string | null;
    name: string;
    description: string;
    thumbnail: IClubThumbnail | null;
    isActive: boolean;
    studentId: string[]; // Array of student IDs
    createdAt: string;
    updatedAt: string;
}

export interface IClubVideo {
    _id: string;
    clubId: string;
    title?: string;
    topic?: string;
    level?: string;
    video?: IClubThumbnail;
    pdfs?: IClubThumbnail[];
    createdAt: string;
    updatedAt: string;
}

// Params
export interface GetAllClubsParams {
    schoolId: string;
    classId?: string;
    page?: number;
    limit?: number;
}

export interface GetAllClubVideosParams {
    clubId: string;
    page?: number;
    limit?: number;
}

// Mutation Payloads
export interface UpdateClubTextPayload {
    name: string;
    description: string;
    isActive: boolean;
    classId?: string | null;
}

export interface StudentClubPayload {
    studentId: string;
    clubId: string;
}

export interface ToggleClassClubPayload {
    clubId: string;
    classId: string;
}

export interface UpdateVideoDetailsPayload {
    title?: string;
    topic?: string;
    level?: string;
}

// Roles Arrays for Permission Checks
export const VIEW_ROLES: UserRole[] = ["correspondent", "principal", "teacher", "parent", "administrator", "accountant", "viceprincipal"];
export const ADMIN_ROLES: UserRole[] = ["correspondent", "administrator"];

// ==========================================
// 2. CLUB QUERIES & MUTATIONS
// ==========================================

// --- Hook: Get All Clubs (Infinite Scroll) ---
export const useGetAllClubsInfinite = (params: Omit<GetAllClubsParams, 'page'>) => {
    const { currentRole } = useAuthData();

    return useInfiniteQuery({
        queryKey: ['clubs-infinite', params],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            checkPermission(currentRole, VIEW_ROLES);

            const { data } = await Api.get<BaseResponse<IClub[]>>('/api/club/getall', {
                params: { ...params, page: pageParam }
            });

            if (data.ok) return data;
            throw new Error(data.message || 'Failed to fetch clubs');
        },
        getNextPageParam: (lastPage) => {
            const currentPage = Number(lastPage?.pagination?.currentPage) || 1;
            const totalPages = Number(lastPage?.pagination?.totalPages) || 1;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        enabled: !!params.schoolId,
    });
};

// --- Hook: Get Single Club By ID ---
export const useGetClubById = (clubId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['club-single', clubId],
        queryFn: async () => {
            checkPermission(currentRole, VIEW_ROLES);
            const { data } = await Api.get<BaseResponse<IClub>>(`/api/club/get/${clubId}`);
            if (data.ok) return data.data;
            throw new Error(data.message || 'Failed to fetch club details');
        },
        enabled: !!clubId,
    });
};

// --- Hook: Create Club ---
export const useCreateClub = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            checkPermission(currentRole, ADMIN_ROLES);
            const { data } = await Api.post<BaseResponse<IClub>>('/api/club/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (!data.ok) throw new Error(data.message || 'Failed to create club');
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clubs-infinite'] }),
    });
};

// --- Hook: Update Club Text ---
export const useUpdateClubText = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: UpdateClubTextPayload }) => {
            checkPermission(currentRole, ADMIN_ROLES);
            const { data } = await Api.put<BaseResponse<IClub>>(`/api/club/updatetext/${id}`, payload);
            if (!data.ok) throw new Error(data.message || 'Failed to update club details');
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['clubs-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['club-single', variables.id] });
        },
    });
};

// --- Hook: Update Club Thumbnail ---
export const useUpdateClubThumbnail = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
            checkPermission(currentRole, ADMIN_ROLES);
            const { data } = await Api.put<BaseResponse<IClub>>(`/api/club/updatethumbnail/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (!data.ok) throw new Error(data.message || 'Failed to update club thumbnail');
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['clubs-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['club-single', variables.id] });
        },
    });
};

// --- Hook: Delete Club ---
export const useDeleteClub = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (id: string) => {
            checkPermission(currentRole, ADMIN_ROLES);
            const { data } = await Api.delete<BaseResponse>(`/api/club/delete/${id}`);
            if (!data.ok) throw new Error(data.message || 'Failed to delete club');
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clubs-infinite'] }),
    });
};

// --- Hook: Add Single Student to Club ---
export const useAddStudentToClub = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: StudentClubPayload) => {
            checkPermission(currentRole, ADMIN_ROLES);
            const { data } = await Api.put<BaseResponse>('/api/club/addtoclub', payload);
            if (!data.ok) throw new Error(data.message || 'Failed to add student');
            return data;
        },
        onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['club-single', variables.clubId] }),
    });
};

// --- Hook: Remove Single Student from Club ---
export const useRemoveStudentFromClub = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: StudentClubPayload) => {
            checkPermission(currentRole, ADMIN_ROLES);
            const { data } = await Api.put<BaseResponse>('/api/club/removefromclub', payload);
            if (!data.ok) throw new Error(data.message || 'Failed to remove student');
            return data;
        },
        onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['club-single', variables.clubId] }),
    });
};

// --- Hook: Toggle Entire Class In/Out of Club ---
export const useToggleClassStudentsToClub = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: ToggleClassClubPayload) => {
            checkPermission(currentRole, ADMIN_ROLES);
            const { data } = await Api.put<BaseResponse>('/api/club/toggleclub/student', payload);
            if (!data.ok) throw new Error(data.message || 'Failed to toggle class students');
            return data;
        },
        onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['club-single', variables.clubId] }),
    });
};
