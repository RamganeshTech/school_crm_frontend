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

export interface ISubmissionUpload {
    _id?: string;
    type: "image" | "pdf";
    key?: string;
    url?: string;
    originalName?: string;
    uploadedAt: string;
}

export interface IHomeworkSubmission {
    _id: string;
    schoolId: string | null;
    academicYear: string | null;
    homeworkId: string;
    subjectId?: string;
    studentId: string;
    status: "pending" | "completed";
    completedAt: string;
    remarks?: string | null;
    studentAttachments?: ISubmissionUpload[];
    createdAt: string;
    updatedAt: string;
}

export interface BaseResponse<T = any> {
    ok: boolean;
    message?: string;
    data?: T;
    pagination?: {
        totalSubmissions: number;
        currentPage: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

// Request Parameters
export interface SubmitHomeworkStatusParams {
    schoolId?: string; 
    academicYear?: string;
    homeworkId: string;
    subjectId?: string;
    studentId: string;
    status: "pending" | "completed";
    remarks?: string;
}

export interface GetAllHomeworkSubmissionsParams {
    homeworkId?: string;
    studentId?: string;
    subjectId?: string;
    status?: "pending" | "completed";
    page?: number;
    limit?: number;
}

// ==========================================
// 2. QUERIES (GET)
// ==========================================

// --- Hook: Get All Submissions (Infinite Scroll) ---
export const useGetAllHomeworkSubmissionsInfinite = (params: Omit<GetAllHomeworkSubmissionsParams, 'page'>) => {
    const { currentRole } = useAuthData();

    return useInfiniteQuery({
        queryKey: ['homework-submissions-infinite', params],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            checkPermission(currentRole, [
                "correspondent", "administrator", "principal", "parent", "accountant", "viceprincipal", "teacher"
            ]);
            
            const { data } = await Api.get<BaseResponse<IHomeworkSubmission[]>>('/api/homework/submission/getall', { 
                params: { ...params, page: pageParam } 
            });

            if (data.ok) {
                return data; // Return full response to access data.pagination
            } else {
                throw new Error(data.message || 'Failed to fetch homework submissions');
            }
        },
        getNextPageParam: (lastPage) => {
            // Safely parse numbers to prevent string concatenation bugs
            const currentPage = Number(lastPage?.pagination?.currentPage) || 1;
            const totalPages = Number(lastPage?.pagination?.totalPages) || 1;
            
            if (currentPage < totalPages) {
                return currentPage + 1;
            }
            return undefined;
        },
    });
};

// --- Hook: Get All Submissions (Without Pagination) ---
export const useGetAllHomeworkSubmissions = (params: Omit<GetAllHomeworkSubmissionsParams, 'page' | 'limit'>) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['homework-submissions-all', params],
        queryFn: async () => {
            try {
                checkPermission(currentRole, [
                    "correspondent", "administrator", "principal", "parent", "accountant", "viceprincipal", "teacher"
                ]);

                const { data } = await Api.get<BaseResponse<IHomeworkSubmission[]>>('/api/homework/submission/getall-without-pagination', {
                    params
                });

                if (data.ok) {
                    return data.data;
                } else {
                    throw new Error(data.message || 'Failed to fetch homework submissions');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        // Optionally disable until a specific parameter is present if needed
        // enabled: !!params.homeworkId, 
    });
};

// --- Hook: Get Single Submission By ID ---
export const useGetSingleHomeworkSubmission = (submissionId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['homework-submission', submissionId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, [
                    "correspondent", "administrator", "principal", "parent", "accountant", "viceprincipal", "teacher"
                ]);

                const { data } = await Api.get<BaseResponse<IHomeworkSubmission>>(`/api/homework/submission/getsingle/${submissionId}`);

                if (data.ok) {
                    return data.data;
                } else {
                    throw new Error(data.message || 'Failed to fetch submission details');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!submissionId,
    });
};

// ==========================================
// 3. MUTATIONS (POST)
// ==========================================

// --- Hook: Submit/Update Homework Status ---
export const useSubmitHomeworkStatus = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: SubmitHomeworkStatusParams) => {
            try {
                // Notice the backend route only allows correspondent and parent for this endpoint right now
                checkPermission(currentRole, ["correspondent", "parent"]);
                
                // Assuming JSON payload since upload.array("files") is not in your router snippet
                const { data } = await Api.post<BaseResponse>('/api/homework/submission/submit', payload);
                
                if (!data.ok) throw new Error(data.message || 'Failed to submit homework status');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate queries to refresh lists and single views automatically
            queryClient.invalidateQueries({ queryKey: ['homework-submissions-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['homework-submissions-all'] });
            if (variables.homeworkId) {
                queryClient.invalidateQueries({ queryKey: ['homework-submission'] });
            }
        },
    });
};