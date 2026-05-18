import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Api } from '../../lib/api'; // Adjust the path to your Axios instance
import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
import { checkPermission } from '../../utils/utils';
import type { UserRole } from '../../features/slices/authSlice';
// import { checkPermission } from '../../utils/permissions'; // Adjust path

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface IMarkSubjectPayload {
    _id?: string;
    subject: string;
    marksObtained: number;
    maxMarks: number;
    minPassingMarks: number;
    grade?: string | null;
}

export interface CreateMarkReportPayload {
    schoolId: string;
    academicYear?: string; // Optional because your backend has a fallback
    classId?: string | null;
    sectionId?: string | null;
    studentId: string;
    subjects: IMarkSubjectPayload[];
    remarks?: string;
    isAbsent?: boolean;
}

export interface UpdateMarkReportPayload extends Partial<CreateMarkReportPayload> {
    reportId: string;
}

export interface GetMarkReportsParams {
    schoolId: string;
    academicYear?: string;
    classId?: string;
    sectionId?: string;
    studentId?: string;
}

// The allowed roles for interacting with Mark Reports
const MARK_REPORT_ROLES: UserRole[] = [
    "administrator", "correspondent", "principal", "viceprincipal", "teacher", "accountant", "parent"
];

// ==========================================
// 1. CREATE MARK REPORT HOOK
// ==========================================
export const useCreateMarkReport = () => {
    const queryClient = useQueryClient();
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: CreateMarkReportPayload) => {
            checkPermission(currentRole, ["administrator", "correspondent", "principal", "viceprincipal", "teacher"]);

            const { data } = await Api.post('/api/mark-report/create', payload); // Adjust endpoint if different
            if (!data.ok) throw new Error(data.message);
            return data.data;
        },
        onSuccess: () => {
            // Invalidate the list queries to refresh the UI automatically
            queryClient.invalidateQueries({ queryKey: ['mark-reports'] });
        }
    });
};

// ==========================================
// 2. GET ALL MARK REPORTS (With Filters)
// ==========================================
export const useGetAllMarkReports = (params: GetMarkReportsParams) => {
    const { currentRole } = useAuthData();

    return useQuery({
        // Include all filter params in the queryKey so it refetches when they change
        queryKey: ['mark-reports', 'list', params],
        queryFn: async () => {
            checkPermission(currentRole, MARK_REPORT_ROLES);

            const { data } = await Api.get('/api/mark-report/getall', { params }); // Adjust endpoint
            if (!data.ok) throw new Error(data.message);
            return data; // Returns { ok, message, count, data: [...] }
        },
        // Only run the query if schoolId is provided (as mandated by your backend)
        enabled: !!params.schoolId,
    });
};

// ==========================================
// 3. UPDATE MARK REPORT
// ==========================================
export const useUpdateMarkReport = () => {
    const queryClient = useQueryClient();
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ reportId, ...updateData }: UpdateMarkReportPayload) => {
            checkPermission(currentRole, ["administrator", "correspondent", "principal", "viceprincipal", "teacher"]);

            const { data } = await Api.put(`/api/mark-report/update/${reportId}`, updateData); // Adjust endpoint
            if (!data.ok) throw new Error(data.message);
            return data.data;
        },
        onSuccess: (_updatedData, variables) => {
            // Invalidate the lists and the specific single report query
            queryClient.invalidateQueries({ queryKey: ['mark-reports'] });
            queryClient.invalidateQueries({ queryKey: ['mark-reports', 'single', variables.reportId] });
        }
    });
};

// ==========================================
// 4. DELETE MARK REPORT
// ==========================================
export const useDeleteMarkReport = () => {
    const queryClient = useQueryClient();
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (reportId: string) => {
            checkPermission(currentRole, ["administrator", "correspondent", "principal"]); // Restrict deletion to higher roles

            const { data } = await Api.delete(`/api/mark-report/delete/${reportId}`); // Adjust endpoint
            if (!data.ok) throw new Error(data.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mark-reports'] });
        }
    });
};

// ==========================================
// 5. GET SINGLE MARK REPORT BY ID
// ==========================================
export const useGetMarkReportById = (reportId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['mark-reports', 'single', reportId],
        queryFn: async () => {
            checkPermission(currentRole, MARK_REPORT_ROLES);

            const { data } = await Api.get(`/api/mark-report/get/${reportId}`); // Adjust endpoint
            if (!data.ok) throw new Error(data.message);
            return data.data;
        },
        // Only run the query if a reportId actually exists
        enabled: !!reportId,
    });
};