import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { Api } from '../../lib/api'; // Adjust path
import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
import { checkPermission } from '../../utils/utils'; // Adjust path
import { queryClient } from '../../lib/queryClient'; // Adjust path
import { ADMIN_ROLES, ADMIN_ROLES_WITH_TEACHER, VIEW_ROLES, type BaseResponse, type GetAllClubVideosParams, type IClubVideo, type UpdateVideoDetailsPayload } from "./clubApi";


// ==========================================
// 3. CLUB VIDEO QUERIES & MUTATIONS
// ==========================================

// --- Hook: Get All Videos for a Club (Infinite) ---
export const useGetAllClubVideosInfinite = (params: Omit<GetAllClubVideosParams, 'page'>) => {
    const { currentRole } = useAuthData();

    return useInfiniteQuery({
        queryKey: ['club-videos-infinite', params],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            try {

                checkPermission(currentRole, VIEW_ROLES);
                const { data } = await Api.get<BaseResponse<IClubVideo[]>>('/api/club/video/getall', {
                    params: { ...params, page: pageParam }
                });
                if (data.ok) return data;
                throw new Error(data.message || 'Failed to fetch videos');
            } catch (error: any) {
                // This extracts the specific message from the server or falls back to a generic one
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        getNextPageParam: (lastPage) => {
            const currentPage = Number(lastPage?.pagination?.currentPage) || 1;
            const totalPages = Number(lastPage?.pagination?.totalPages) || 1;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        enabled: !!params.clubId,
    });
};

// --- Hook: Get Single Club Video ---
export const useGetClubVideoById = (videoId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['club-video-single', videoId],
        queryFn: async () => {
            try {

                checkPermission(currentRole, VIEW_ROLES);
                const { data } = await Api.get<BaseResponse<IClubVideo>>(`/api/club/video/get/${videoId}`);
                if (data.ok) return data.data;
                throw new Error(data.message || 'Failed to fetch video details');
            } catch (error: any) {
                // This extracts the specific message from the server or falls back to a generic one
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        enabled: !!videoId,
    });
};

// --- Hook: Upload New Video ---
export const useCreateClubVideo = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            try {

                checkPermission(currentRole, ADMIN_ROLES_WITH_TEACHER);
                const { data } = await Api.post<BaseResponse<IClubVideo>>('/api/club/video/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (!data.ok) throw new Error(data.message || 'Failed to upload video');
                return data;
            } catch (error: any) {
                // This extracts the specific message from the server or falls back to a generic one
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        // We don't have the clubId directly in the return variables unless we extract it from formData, 
        // but invalidating the infinite list is safe.
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['club-videos-infinite'] }),
    });
};

// --- Hook: Update Video Details (Text only) ---
export const useUpdateClubVideoDetails = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: UpdateVideoDetailsPayload }) => {
            try {

                checkPermission(currentRole, ADMIN_ROLES_WITH_TEACHER);
                const { data } = await Api.put<BaseResponse<IClubVideo>>(`/api/club/video/updatedetails/${id}`, payload);
                if (!data.ok) throw new Error(data.message || 'Failed to update video details');
                return data;
            } catch (error: any) {
                // This extracts the specific message from the server or falls back to a generic one
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['club-video-single', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['club-videos-infinite'] });
        },
    });
};

// --- Hook: Update Video File ---
export const useUpdateClubVideoFile = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
            try {

                checkPermission(currentRole, ADMIN_ROLES_WITH_TEACHER);
                const { data } = await Api.put<BaseResponse<IClubVideo>>(`/api/club/video/updatefile/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (!data.ok) throw new Error(data.message || 'Failed to update video file');
                return data;
            } catch (error: any) {
                // This extracts the specific message from the server or falls back to a generic one
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['club-video-single', variables.id] }),
    });
};

// --- Hook: Upload PDF to Video ---
export const useUploadClubVideoPDF = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
            try {

                // Include Teacher role as specified in the route
                checkPermission(currentRole, ["correspondent", "administrator", "teacher"]);
                const { data } = await Api.put<BaseResponse<IClubVideo>>(`/api/club/video/upload-pdf/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (!data.ok) throw new Error(data.message || 'Failed to upload PDF(s)');
                return data;
            } catch (error: any) {
                // This extracts the specific message from the server or falls back to a generic one
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['club-video-single', variables.id] }),
    });
};

// --- Hook: Delete Single Attached PDF ---
export const useDeleteClubVideoFile = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ id, fileId }: { id: string; fileId: string }) => {
            try {

                checkPermission(currentRole, ADMIN_ROLES_WITH_TEACHER);
                const { data } = await Api.delete<BaseResponse>(`/api/club/video/deletefile/${id}/${fileId}`);
                if (!data.ok) throw new Error(data.message || 'Failed to delete file');
                return data;
            } catch (error: any) {
                // This extracts the specific message from the server or falls back to a generic one
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['club-videos-infinite'] });
        },
    });
};

// --- Hook: Delete Club Video ---
export const useDeleteClubVideo = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (id: string) => {
            try {

                checkPermission(currentRole, ADMIN_ROLES);
                const { data } = await Api.delete<BaseResponse>(`/api/club/video/delete/${id}`);
                if (!data.ok) throw new Error(data.message || 'Failed to delete video');
                return data;
            } catch (error: any) {
                // This extracts the specific message from the server or falls back to a generic one
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['club-videos-infinite'] }),
    });
};