import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthData } from '../../hooks/useAuthData';
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';
// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface GetAttendanceSheetParams {
  schoolId?: string;
  classId?: string;
  sectionId?: string;
  date?: string; // e.g., YYYY-MM-DD
  academicYear?: string;
}

export interface AttendanceRecord {
  studentId: string;
  studentName?: string;
  rollNumber?: string;
  status: "present" | "absent" | "late" | "half-day";
  remark?: string | null;
}

export interface MarkAttendanceParams {
  schoolId: string;
  classId: string;
  sectionId: string;
  date: string;
  academicYear: string;
  records: AttendanceRecord[];
}

export interface GetClassHistoryParams {
  schoolId?: string;
  classId?: string;
  sectionId?: string;
  academicYear?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface GetStudentHistoryParams {
  studentId?: string;
  month?: number | string;
  year?: number | string;
}

// Note: Replace `any` with your actual exact response interfaces
type ApiResponse<T = any> = {
  ok: boolean;
  message?: string;
  data: T;
};

// ==========================================
// 1. GET ATTENDANCE SHEET (Smart Fetch)
// ==========================================
export const useGetAttendanceSheet = (params: GetAttendanceSheetParams) => {
  const { currentRole } = useAuthData();

  return useQuery({
    queryKey: ['attendance', 'sheet', params],
    queryFn: async () => {
      try {
        checkPermission(currentRole, [
          "administrator", "correspondent", "principal", "teacher", "parent"
        ]);

        const { data } = await Api.get<ApiResponse>('/api/attendance/sheet', { params });

        if (data.ok) {
          return data.data; 
        } else {
          throw new Error(data.message || 'Failed to fetch attendance sheet');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    // Only run query if essential identifiers are present
    enabled: !!params.schoolId && !!params.classId && !!params.sectionId && !!params.date && !!params.academicYear,
  });
};

// ==========================================
// 2. MARK OR UPDATE ATTENDANCE
// ==========================================
export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (payload: MarkAttendanceParams) => {
      try {
        checkPermission(currentRole, ["correspondent", "teacher"]);

        const { data } = await Api.post<ApiResponse>('/api/attendance/mark', payload);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to mark attendance');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to refresh the UI immediately
      queryClient.invalidateQueries({ queryKey: ['attendance', 'sheet'] });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'classHistory', variables.classId, variables.sectionId] });
    },
  });
};

// ==========================================
// 3. GET CLASS ATTENDANCE HISTORY
// ==========================================
export const useGetClassAttendanceHistory = (params: GetClassHistoryParams) => {
  const { currentRole } = useAuthData();

  return useQuery({
    queryKey: ['attendance', 'classHistory', params],
    queryFn: async () => {
      try {
        checkPermission(currentRole, [
          "administrator", "correspondent", "principal", "viceprincipal", "teacher"
        ]);

        const { data } = await Api.get<ApiResponse>('/api/attendance/getallclass', { params });

        if (data.ok) {
          return data.data; 
        } else {
          throw new Error(data.message || 'Failed to fetch class attendance history');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    enabled: !!params.schoolId && !!params.classId && !!params.sectionId && !!params.academicYear,
  });
};

// ==========================================
// 4. GET STUDENT ATTENDANCE HISTORY
// ==========================================
export const useGetStudentAttendanceHistory = (params: GetStudentHistoryParams) => {
  const { currentRole } = useAuthData();

  return useQuery({
    queryKey: ['attendance', 'studentHistory', params.studentId, params.month, params.year],
    queryFn: async () => {
      try {
        checkPermission(currentRole, [
          "administrator", "accountant", "correspondent", "principal", "viceprincipal", "teacher", "parent"
        ]);

        // Destructure to separate params for URL and query string
        const { studentId, ...queryParams } = params;

        const { data } = await Api.get<ApiResponse>(`/api/attendance/student/${studentId}`, { 
          params: queryParams 
        });

        if (data.ok) {
          return data.data; 
        } else {
          throw new Error(data.message || 'Failed to fetch student attendance history');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    enabled: !!params.studentId,
  });
};