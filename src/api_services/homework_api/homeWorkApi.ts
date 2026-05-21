import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
// import { Api } from '../Api'; // Adjust path to your axios instance
import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';
import { queryClient } from '../../lib/queryClient';
// import { checkPermission } from '../../utils/permissionUtils'; // Adjust path
// import { queryClient } from '../../main'; // Adjust path to your queryClient export

// ==========================================
// 1. TYPES & INTERFACES (Mapped from Backend Models)
// ==========================================

export interface IHomeworkUpload {
    _id?: string;
    type: "image" | "pdf";
    key?: string;
    url?: string;
    originalName?: string;
    uploadedAt: string; // Dates come back as ISO strings from API
}

export interface ISubjectHomework {
    _id?: string;
    subjectName: string;
    teacherId: string | null;
    description: string;
    attachments: IHomeworkUpload[];
    updatedAt: string;
}

export interface IHomework {
    _id: string;
    schoolId: string | null;
    academicYear: string | null;
    classId: string | null;
    sectionId: string | null;
    homeworkDate: string;
    subjects: ISubjectHomework[];
    createdAt: string;
    updatedAt: string;
}

export interface BaseResponse<T = any> {
    ok: boolean;
    message?: string;
    data?: T;
    pagination?: any;
}

// Request Parameters
export interface GetAllHomeworkParams {
    schoolId: string;
    classId: string;
    academicYear: string;
    sectionId?: string | null;
    page?: number;
    limit?: number;
}

export interface UpdateHomeworkTextParams {
    homeworkId: string;
    subjectId: string;
    subjectName: string; // Depending on backend logic, maybe optional if just updating description
    description: string;
}

export interface DeleteSubjectParams {
    homeworkId: string;
    subjectId: string;
}

export interface DeleteAttachmentParams {
    homeworkId: string;
    subjectId: string;
    attachmentId: string;
}

export interface DeleteDailyHomeworkParams {
    homeworkId: string;
}

// ==========================================
// 2. QUERIES (GET)
// ==========================================

// --- Hook: Get All Homework (Infinite Scroll) ---
export const useGetAllHomeworkInfinite = (params: Omit<GetAllHomeworkParams, 'page'>) => {
    const { currentRole } = useAuthData();

    return useInfiniteQuery({
        queryKey: ['homework-infinite', params],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            try{
            checkPermission(currentRole, [
                "correspondent", "administrator", "principal", "parent", "accountant", "viceprincipal", "teacher"
            ]);
            
            const { data } = await Api.get<BaseResponse<IHomework[]>>('/api/homework/getall', { 
                params: { ...params, page: pageParam } 
            });

            if (data.ok) {
                return data; // Return full response to access data.pagination
            } else {
                throw new Error(data.message || 'Failed to fetch homework');
            }
             } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        getNextPageParam: (lastPage) => {
            const currentPage = Number(lastPage?.pagination?.currentPage) || 1;
            const totalPages = Number(lastPage?.pagination?.totalPages) || 1;
            
            if (currentPage < totalPages) {
                return currentPage + 1;
            }
            return undefined;
        },
        enabled: !!params.schoolId && !!params.classId,
    });
};

// --- Hook: Get Single Homework By ID ---
export const useGetSingleHomework = (homeworkId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['homework', homeworkId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, [
                    "correspondent", "administrator", "principal", "parent", "accountant", "viceprincipal", "teacher"
                ]);

                const { data } = await Api.get<BaseResponse<IHomework>>(`/api/homework/getsingle/${homeworkId}`);

                if (data.ok) {
                    return data.data;
                } else {
                    throw new Error(data.message || 'Failed to fetch homework details');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!homeworkId,
    });
};

// ==========================================
// 3. MUTATIONS (POST, PUT, DELETE)
// ==========================================

// --- Hook: Create Homework (Accepts FormData for files) ---
export const useCreateHomework = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            try {
                checkPermission(currentRole, ["correspondent", "teacher"]);
                
                const { data } = await Api.post<BaseResponse>('/api/homework/create', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                if (!data.ok) throw new Error(data.message || 'Failed to create homework');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homework-infinite'] });
        },
    });
};

// --- Hook: Update Homework Text (JSON Payload) ---
export const useUpdateHomeworkText = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: UpdateHomeworkTextParams) => {
            try {
                checkPermission(currentRole, ["correspondent", "teacher"]);
                
                const { data } = await Api.put<BaseResponse>('/api/homework/updatetext', payload);
                
                if (!data.ok) throw new Error(data.message || 'Failed to update homework text');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['homework-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['homework', variables.homeworkId] });
        },
    });
};

// --- Hook: Add Homework Attachments (Accepts FormData for files) ---
export const useAddHomeworkAttachments = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            try {
                checkPermission(currentRole, ["correspondent", "teacher"]);
                
                const { data } = await Api.put<BaseResponse>('/api/homework/addattachments', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                if (!data.ok) throw new Error(data.message || 'Failed to add attachments');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['homework-infinite'] });
            const hwId = variables.get('homeworkId') as string;
            if (hwId) queryClient.invalidateQueries({ queryKey: ['homework', hwId] });
        },
    });
};

// --- Hook: Delete Entire Subject from Homework ---
export const useDeleteSubjectFromHomework = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: DeleteSubjectParams) => {
            try {
                checkPermission(currentRole, ["correspondent", "teacher"]);
                
                const { data } = await Api.delete<BaseResponse>('/api/homework/deletesubject', { data: payload });
                
                if (!data.ok) throw new Error(data.message || 'Failed to delete subject');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['homework-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['homework', variables.homeworkId] });
        },
    });
};

// --- Hook: Delete Single Attachment ---
export const useDeleteHomeworkAttachment = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: DeleteAttachmentParams) => {
            try {
                checkPermission(currentRole, ["correspondent", "teacher"]);
                
                const { data } = await Api.delete<BaseResponse>('/api/homework/deleteattachment', { data: payload });
                
                if (!data.ok) throw new Error(data.message || 'Failed to delete attachment');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['homework-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['homework', variables.homeworkId] });
        },
    });
};

// --- Hook: Delete Entire Daily Homework Record ---
export const useDeleteDailyHomework = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: DeleteDailyHomeworkParams) => {
            try {
                checkPermission(currentRole, ["correspondent", "teacher"]);
                
                const { data } = await Api.delete<BaseResponse>('/api/homework/deleteentireday', { data: payload });
                
                if (!data.ok) throw new Error(data.message || 'Failed to delete daily homework');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homework-infinite'] });
            // Cannot easily invalidate single homework query without ID, but infinite query invalidation covers list view
        },
    });
};