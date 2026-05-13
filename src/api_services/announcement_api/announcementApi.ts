import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { Api } from '../../lib/api'; // Adjust path
import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
import { checkPermission } from '../../utils/utils'; // Adjust path
import { queryClient } from '../../lib/queryClient'; // Adjust path

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface BaseResponse<T = any> {
    ok: boolean;
    message?: string;
    data?: T;
    pagination?: {
        total: number;
        page: number;
        totalPages: number;
        limit: number;
    };
}

export interface IAnnouncementAttachment {
    _id: string;
    type: "image" | "pdf" | "video";
    key: string;
    url: string;
    originalName: string;
    uploadedAt: string;
}

export interface IAnnouncement {
    _id: string;
    schoolId: string;
    academicYear: string;
    title: string;
    description?: string;
    type: string;
    priority: string;
    targetAudience: string[];
    targetClasses: any[]; // Array of strings or objects depending on population
    attachments: IAnnouncementAttachment[];
    createdBy?: {
        _id: string;
        userName: string;
        role: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface GetAllAnnouncementsParams {
    schoolId: string;
    page?: number;
    limit?: number;
}

export interface UpdateAnnouncementPayload {
    academicYear?: string;
    title?: string;
    description?: string;
    type?: string;
    priority?: string;
    targetAudience?: string[] | string;
    targetClasses?: any[] | string;
}

// ==========================================
// 2. QUERIES (GET)
// ==========================================

// --- Hook: Get All Announcements (Infinite Scroll) ---
export const useGetAllAnnouncementsInfinite = (params: Omit<GetAllAnnouncementsParams, 'page'>) => {
    const { currentRole } = useAuthData();

    return useInfiniteQuery({
        queryKey: ['announcements-infinite', params],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            checkPermission(currentRole, ["correspondent", "principal", "viceprincipal", "teacher", "parent", "administrator"]);
            
            const { data } = await Api.get<BaseResponse<IAnnouncement[]>>('/api/announcement/getall', { 
                params: { ...params, page: pageParam } 
            });

            if (data.ok) {
                return data; 
            } else {
                throw new Error(data.message || 'Failed to fetch announcements');
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

// --- Hook: Get Single Announcement By ID ---
export const useGetAnnouncementById = (announcementId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['announcement-single', announcementId],
        queryFn: async () => {
            checkPermission(currentRole, ["correspondent", "administrator", "viceprincipal", "principal", "teacher", "parent"]);

            const { data } = await Api.get<BaseResponse<IAnnouncement>>(`/api/announcement/get/${announcementId}`);

            if (data.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to fetch announcement details');
            }
        },
        enabled: !!announcementId,
    });
};

// ==========================================
// 3. MUTATIONS (POST / PUT / DELETE)
// ==========================================

// --- Hook: Create Announcement ---
export const useCreateAnnouncement = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            checkPermission(currentRole, ["correspondent", "principal", "administrator"]);
            
            const { data } = await Api.post<BaseResponse<IAnnouncement>>('/api/announcement/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (!data.ok) throw new Error(data.message || 'Failed to create announcement');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements-infinite'] });
        },
    });
};

// --- Hook: Update Announcement Details (Text/JSON) ---
export const useUpdateAnnouncement = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: UpdateAnnouncementPayload }) => {
            checkPermission(currentRole, ["correspondent", "principal", "administrator"]);
            
            const { data } = await Api.put<BaseResponse<IAnnouncement>>(`/api/announcement/update/${id}`, payload);
            
            if (!data.ok) throw new Error(data.message || 'Failed to update announcement');
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['announcements-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['announcement-single', variables.id] });
        },
    });
};

// --- Hook: Add Attachments to Existing Announcement ---
export const useAddAnnouncementAttachment = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
            checkPermission(currentRole, ["correspondent", "principal", "administrator"]);
            
            const { data } = await Api.put<BaseResponse>(`/api/announcement/addattachment/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (!data.ok) throw new Error(data.message || 'Failed to add attachments');
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['announcement-single', variables.id] });
        },
    });
};

// --- Hook: Delete Single Attachment ---
export const useDeleteAnnouncementAttachment = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ announcementId, fileId }: { announcementId: string; fileId: string }) => {
            checkPermission(currentRole, ["correspondent", "principal", "administrator"]);
            
            const { data } = await Api.delete<BaseResponse>(`/api/announcement/deleteattachment/${announcementId}/${fileId}`);
            
            if (!data.ok) throw new Error(data.message || 'Failed to delete attachment');
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['announcement-single', variables.announcementId] });
        },
    });
};

// --- Hook: Delete Entire Announcement ---
export const useDeleteAnnouncement = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (announcementId: string) => {
            checkPermission(currentRole, ["correspondent", "principal", "administrator"]);
            
            const { data } = await Api.delete<BaseResponse>(`/api/announcement/delete/${announcementId}`);
            
            if (!data.ok) throw new Error(data.message || 'Failed to delete announcement');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements-infinite'] });
        },
    });
};