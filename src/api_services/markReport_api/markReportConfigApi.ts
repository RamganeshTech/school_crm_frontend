import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import Api from '../config/Api'; // Adjust this import based on your axios instance path
import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';
// import { checkPermission } from '../../utils/permissionUtils'; // Adjust path

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface IExamConfig {
    _id?: string
    examName: string;
    maxMarks?: number;
    passingMarks?: number;
    order: number
}

export interface ISubjectConfig {
    subjectName: string;
    subjectCode?: string;
    order: number

}

export interface CreateConfigPayload {
    schoolId: string;
    academicYear?: string; // Optional if you rely on backend fallback
    classId: string;
    exams: IExamConfig[];
    subjects: ISubjectConfig[];
}

export interface UpdateConfigPayload {
    configId: string;
    exams?: IExamConfig[];
    subjects?: ISubjectConfig[];
}

export interface GetConfigParams {
    schoolId: string;
    academicYear: string;
    classId: string;
}

// ==========================================
// 1. HOOK: GET CONFIGURATION BY CLASS
// ==========================================
export const useGetMarkReportConfigByClass = (params: GetConfigParams) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['markReportConfig', params],
        queryFn: async () => {
            try {
                // Everyone needs to read this to draw the UI table
                checkPermission(currentRole, ["correspondent", "administrator", "principal", "viceprincipal", "teacher", "parent"]);

                const { data } = await Api.get(`/api/markreport/config/by-class`, { params });
                return data?.data || data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        // Only run the query if we have the mandatory IDs
        enabled: !!params.schoolId && !!params.classId && !!params.academicYear,
        retry: false // Don't retry if it 404s (meaning no config exists yet)
    });
};

// ==========================================
// 2. HOOK: CREATE CONFIGURATION
// ==========================================
export const useCreateMarkReportConfig = () => {
    const queryClient = useQueryClient();
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: CreateConfigPayload) => {
            try {
                // Administrative action
                checkPermission(currentRole, ["correspondent", "administrator", "principal", "viceprincipal"]);

                const { data } = await Api.post('/api/markreport/config/create', payload);
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: (_data, variables) => {
            // Invalidate the cache so the UI immediately fetches the new config
            queryClient.invalidateQueries({
                queryKey: ['markReportConfig', {
                    schoolId: variables.schoolId,
                    classId: variables.classId
                }]
            });
        }
    });
};

// ==========================================
// 3. HOOK: UPDATE CONFIGURATION
// ==========================================
export const useUpdateMarkReportConfig = () => {
    const queryClient = useQueryClient();
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: UpdateConfigPayload) => {
            try {
                // Administrative action
                checkPermission(currentRole, ["correspondent", "administrator", "principal", "viceprincipal"]);

                const { configId, ...updateData } = payload;
                const { data } = await Api.put(`/api/markreport/config/update/${configId}`, updateData);
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => {
            // Invalidate the generic key so the UI refreshes the updated grid
            queryClient.invalidateQueries({ queryKey: ['markReportConfig'] });
        }
    });
};