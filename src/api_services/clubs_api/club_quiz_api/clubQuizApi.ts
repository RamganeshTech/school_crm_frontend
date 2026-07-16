import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthData } from '../../../hooks/useAuthData';
import { checkPermission } from '../../../utils/utils';
import { Api } from '../../../lib/api';
// import { Api } from '../../api_services/api'; // Adjust path
// import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
// import { checkPermission } from '../../utils/permissionUtils'; // Adjust path
// import { ApiResponse } from '../../types/api'; // Adjust path

// ==========================================
// TYPES & INTERFACES
// ==========================================
export interface QuizQuestion {
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    points?: number;
}

export interface CreateQuizPayload {
    clubId: string;
    clubVideoId?: string;
    schoolId?: string;
    classId?: string;
    sectionId?: string;
    title: string;
    description?: string;
    questions: QuizQuestion[];
    academicYear?: string;
}

export interface UpdateQuizPayload extends Partial<CreateQuizPayload> {
    isActive?: boolean;
}

export interface CreateAIQuizPayload {
    clubId: string;
    clubVideoId: string;
    classId?: string;
    sectionId?: string;
    academicYear?: string;
    numberOfQuestions?: number;
    pdfId:string
}

export interface QuizQueryParams {
    clubId?: string;
    clubVideoId? :string
    classId?: string;
    sectionId?: string;
    page?: number;
    limit?: number;
}

// ==========================================
// 1. QUERY: Get All Club Quizzes
// ==========================================
export const useGetAllClubQuizzes = (params: QuizQueryParams) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['clubQuizzes', params],
        queryFn: async () => {
            try {
                // Strict permission check based on backend route
                checkPermission(currentRole, [
                    "correspondent", "principal", "teacher", "parent", "administrator", "accountant", "viceprincipal"
                ]);

                const { data } = await Api.get('/api/club/quiz/getall', { params });
                
                if (data.ok) return data;
                throw new Error(data.message || 'Failed to fetch club quizzes');
            } catch (error: any) {
                throw new Error(error.response?.data?.message || error.message);
            }
        },
    });
};

// ==========================================
// 2. QUERY: Get Single Club Quiz
// ==========================================
export const useGetSingleClubQuiz = (quizId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['clubQuizzes', 'single', quizId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, [
                    "correspondent", "principal", "teacher", "parent", "administrator", "accountant", "viceprincipal"
                ]);

                const { data } = await Api.get(`/api/club/quiz/get/${quizId}`);
                
                if (data.ok) return data.data;
                throw new Error(data.message || 'Failed to fetch quiz details');
            } catch (error: any) {
                throw new Error(error.response?.data?.message || error.message);
            }
        },
        enabled: !!quizId, // Only run if a quizId is provided
    });
};

// ==========================================
// 3. MUTATION: Create Manual Club Quiz
// ==========================================
export const useCreateClubQuiz = () => {
    const queryClient = useQueryClient();
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: CreateQuizPayload) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "teacher"]);

                const { data } = await Api.post('/api/club/quiz/create', payload);

                if (data.ok) return data;
                throw new Error(data.message || 'Failed to create quiz');
            } catch (error: any) {
                throw new Error(error.response?.data?.message || error.message);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clubQuizzes'] });
        },
    });
};

// ==========================================
// 4. MUTATION: Update Club Quiz
// ==========================================
export const useUpdateClubQuiz = () => {
    const queryClient = useQueryClient();
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: UpdateQuizPayload }) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "teacher"]);

                const { data } = await Api.put(`/api/club/quiz/update/${id}`, payload);

                if (data.ok) return data;
                throw new Error(data.message || 'Failed to update quiz');
            } catch (error: any) {
                throw new Error(error.response?.data?.message || error.message);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['clubQuizzes'] });
            queryClient.invalidateQueries({ queryKey: ['clubQuizzes', 'single', variables.id] });
        },
    });
};

// ==========================================
// 5. MUTATION: Delete Club Quiz
// ==========================================
export const useDeleteClubQuiz = () => {
    const queryClient = useQueryClient();
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (id: string) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "teacher"]);

                const { data } = await Api.delete(`/api/club/quiz/delete/${id}`);

                if (data.ok) return data;
                throw new Error(data.message || 'Failed to delete quiz');
            } catch (error: any) {
                throw new Error(error.response?.data?.message || error.message);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clubQuizzes'] });
        },
    });
};

// ==========================================
// 6. MUTATION: Create AI-Powered Club Quiz
// ==========================================
export const useCreateAIClubQuiz = () => {
    const queryClient = useQueryClient();
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: CreateAIQuizPayload) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "teacher"]);

                const { data } = await Api.post('/api/club/quiz/create/ai', payload);

                if (data.ok) return data;
                throw new Error(data.message || 'Failed to generate AI quiz');
            } catch (error: any) {
                throw new Error(error.response?.data?.message || error.message);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clubQuizzes'] });
        },
    });
};