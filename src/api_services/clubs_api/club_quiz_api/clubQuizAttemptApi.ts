import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthData } from '../../../hooks/useAuthData';
import { checkPermission } from '../../../utils/utils';
import { Api } from '../../../lib/api';

// ==========================================
// TYPES & INTERFACES
// ==========================================
export interface StudentAnswerPayload {
    questionId?: string;
    index?: number;
    selectedOptionIndex: number;
}

export interface CreateQuizAttemptPayload {
    quizId: string;
    classId?: string;
    sectionId?: string;
    academicYear?: string;
    studentAnswers: StudentAnswerPayload[];
}

export interface AttemptQueryParams {
    quizId?: string;
    classId?: string;
    sectionId?: string;
    studentId?: string;
    page?: number;
    limit?: number;
}

// ==========================================
// 1. MUTATION: Submit Quiz Attempt
// ==========================================
export const useCreateQuizAttempt = () => {
    const queryClient = useQueryClient();
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: CreateQuizAttemptPayload) => {
            try {
                // Allowed roles matched exactly from backend: "correspondent", "administrator", "teacher", "parent"
                checkPermission(currentRole, ["correspondent", "administrator", "teacher", "parent"]);

                const { data } = await Api.post('/api/club/quiz/attempt/create', payload);

                if (data.ok) return data;
                throw new Error(data.message || 'Failed to submit quiz attempt');
            } catch (error: any) {
                throw new Error(error.response?.data?.message || error.message);
            }
        },
        onSuccess: () => {
            // Invalidate attempt lists to refresh leaderboards/history
            queryClient.invalidateQueries({ queryKey: ['clubQuizAttempts'] });
        },
    });
};

// ==========================================
// 2. QUERY: Get All Attempts (Leaderboard/Review)
// ==========================================
export const useGetAllQuizAttempts = (params: AttemptQueryParams) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['clubQuizAttempts', params],
        queryFn: async () => {
            try {
                // Allowed roles matched from backend
                checkPermission(currentRole, [
                    "correspondent", "principal", "teacher", "parent", "administrator", "accountant", "viceprincipal"
                ]);

                const { data } = await Api.get('/api/club/quiz/attempt/getall', { params });
                
                if (data.ok) return data;
                throw new Error(data.message || 'Failed to fetch quiz attempts');
            } catch (error: any) {
                throw new Error(error.response?.data?.message || error.message);
            }
        },
    });
};

// ==========================================
// 3. QUERY: Get Single Attempt
// ==========================================
export const useGetSingleQuizAttempt = (attemptId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['clubQuizAttempts', 'single', attemptId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, [
                    "correspondent", "principal", "teacher", "parent", "administrator", "accountant", "viceprincipal"
                ]);

                const { data } = await Api.get(`/api/club/quiz/attempt/get/${attemptId}`);
                
                if (data.ok) return data.data;
                throw new Error(data.message || 'Failed to fetch attempt details');
            } catch (error: any) {
                throw new Error(error.response?.data?.message || error.message);
            }
        },
        enabled: !!attemptId, // Prevents execution if ID is missing
    });
};

// ==========================================
// 4. MUTATION: Delete Attempt (Cleanup)
// ==========================================
export const useDeleteQuizAttempt = () => {
    const queryClient = useQueryClient();
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (id: string) => {
            try {
                // Strictly Admin & Correspondent based on backend route
                checkPermission(currentRole, ["correspondent", "administrator"]);

                const { data } = await Api.delete(`/api/club/quiz/attempt/delete/${id}`);

                if (data.ok) return data;
                throw new Error(data.message || 'Failed to delete quiz attempt');
            } catch (error: any) {
                throw new Error(error.response?.data?.message || error.message);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clubQuizAttempts'] });
        },
    });
}; 