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


// Note: Replace `any` with your actual exact response interfaces
type ApiResponse<T = any> = {
  ok: boolean;
  message?: string;
  data: T;
  summary: T;
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

export interface GetStudentHistoryParams {
    studentId: string;
    academicYear?: string;
    month?: string | number;
    year?: string | number;
    startDate?: string;
    endDate?: string;
}

// 1. History & Overview Hook
export const useGetStudentAttendanceHistory = (params: GetStudentHistoryParams) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['attendance', 'studentHistory', params],
        queryFn: async () => {
            checkPermission(currentRole, ["administrator", "correspondent", "teacher", "parent"]);
            const { studentId, ...queryParams } = params;
            
            const { data } = await Api.get(`/api/attendance/student/${studentId}`, { params: queryParams });
            if (data.ok) return data;
            throw new Error(data.message);
        },
        enabled: !!params.studentId,
    });
};

// 2. Trends (Line Chart) Hook
export const useGetStudentAttendanceTrends = (studentId: string | undefined, academicYear: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['attendance', 'studentTrends', studentId, academicYear],
        queryFn: async () => {
            checkPermission(currentRole, ["administrator", "correspondent", "teacher", "parent"]);
            
            const { data } = await Api.get(`/api/attendance/student/${studentId}/trends`, { params: { academicYear } });
            if (data.ok) return data.data;
            throw new Error(data.message);
        },
        enabled: !!studentId && !!academicYear,
    });
};

// 3. Patterns (Heatmap/Bars) Hook
export const useGetStudentAttendancePatterns = (studentId: string | undefined, academicYear: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['attendance', 'studentPatterns', studentId, academicYear],
        queryFn: async () => {
            checkPermission(currentRole, ["administrator", "correspondent", "teacher", "parent"]);
            
            const { data } = await Api.get(`/api/attendance/student/${studentId}/patterns`, { params: { academicYear } });
            if (data.ok) return data.data;
            throw new Error(data.message);
        },
        enabled: !!studentId && !!academicYear,
    });
};




export interface AttendanceReportFilters {
    schoolId: string;
    academicYear: string;
    classId: string;
    sectionId?: string | null;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
}

export interface AttendanceReportResponse {
    ok: boolean;
    message: string;
    data: {
        overview: {
            totalWorkingDays: number;
            totalStudentRecordsEvaluated: number;
            effectiveAttendanceRate: string;
            distribution: {
                present: number;
                absent: number;
                late: number;
                halfDay: number;
            };
            percentages: {
                present: string;
                absent: string;
            };
        };
        chartData: Array<{
            date: string;
            present: number;
            absent: number;
            late: number;
            halfDay: number;
        }>;
        atRiskStudents: Array<{
            _id: string;
            studentName: string;
            rollNumber: string;
            totalAbsences: number;
        }>;
    };
}


export const useGetClassAttendanceReport = (filters: AttendanceReportFilters) => {
    return useQuery({
        // 🌟 The object-driven query key tracks every filter change automatically
        queryKey: ["attendance",'attendance-report', filters],
        
        queryFn: async () => {
            // Clean up empty or null values before constructing query params
            const params: Record<string, string> = {
                schoolId: filters.schoolId,
                academicYear: filters.academicYear,
                classId: filters.classId,
                startDate: filters.startDate,
                endDate: filters.endDate,
            };

            if (filters.sectionId) {
                params.sectionId = filters.sectionId;
            }

            const { data } = await Api.get<AttendanceReportResponse>('/api/attendance/report/class', { params });
            
            if (!data.ok) {
                throw new Error(data.message || 'Failed to fetch attendance report analytics');
            }
            
            return data.data;
        },
        
        // 🌟 Production Guard: Prevent fetching if critical parameters are missing
        enabled: !!filters.schoolId && !!filters.academicYear && !!filters.classId && !!filters.startDate && !!filters.endDate,
        
        // Performance optimizations for high-traffic dashboards
        // staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        // placeholderData: (previousData) => previousData, // Keeps old charts visible while loading new filter data (prevents UI flickering)
    });
};


export interface YearlyLeaderboardFilters {
    schoolId: string;
    academicYear: string;
    classId?: string;       // Optional: Omitted for School-Wide view
    sectionId?: string | null; // Optional: Omitted for School-Wide view
}

export interface LeaderboardStudent {
    _id: string;
    studentName: string | null;
    rollNumber: string | null;
    classId: string;
    sectionId: string;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    halfDayCount: number;
    totalDaysEvaluated: number;
    effectivePresent: number;
    attendancePercentage: number;
}

export interface YearlyLeaderboardsResponse {
    ok: boolean;
    message: string;
    data: {
        topAttendance: LeaderboardStudent[];
        lowestAttendance: LeaderboardStudent[];
        mostLate: LeaderboardStudent[];
        mostHalfDays: LeaderboardStudent[];
    };
}

export const useGetAcademicYearLeaderboards = (filters: YearlyLeaderboardFilters) => {
    return useQuery({
        // 🌟 Tracking filters implicitly ensures automatic cache invalidation on view shifts
        queryKey: ["attendance", 'academic-year-leaderboards', filters],
        
        queryFn: async () => {
            // Build parameters object dynamically
            const params: Record<string, string> = {
                schoolId: filters.schoolId,
                academicYear: filters.academicYear,
            };

            // Force clean payload properties: only assign if structurally present
            if (filters.classId) {
                params.classId = filters.classId;
            }
            if (filters.sectionId) {
                params.sectionId = filters.sectionId;
            }

            const { data } = await Api.get<YearlyLeaderboardsResponse>('/api/attendance/report/leaderboard', { params });
            
            if (!data.ok) {
                throw new Error(data.message || 'Failed to assemble annual analytical leaderboards');
            }
            
            return data.data;
        },
        
        // 🌟 Production Guard: Block network calls if minimal core context properties are absent
        enabled: !!filters.schoolId && !!filters.academicYear,
        
        // Performance architectural tuning for long-running statistical sets
        // staleTime: 15 * 60 * 1000, // Keep historical charts fresh for 15 minutes to reduce DB aggregations
        // gcTime: 30 * 60 * 1000,    // Cache results in memory for 30 minutes
    });
};