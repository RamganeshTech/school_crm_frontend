import { useQuery, useMutation } from '@tanstack/react-query';
// import { Api } from '../Api'; // Adjust path as needed
import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';
import { queryClient } from '../../lib/queryClient';
// import { checkPermission } from '../../utils/permissionUtils'; // Adjust path
// import { queryClient } from '../../main'; // Adjust path to your queryClient export

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface BaseResponse {
    ok: boolean;
    message?: string;
}

// Queries
export interface GetTimeTableParams {
    schoolId: string;
    classId?: string;
    sectionId?: string;
}

export interface GetTeacherScheduleParams {
    schoolId: string;
    teacherId: string;
}

// Mutations
export interface AddDayParams {
    schoolId: string;
    classId: string;
    sectionId?: string | null;
    day: string;
}

export interface UpdateDayParams {
    schoolId: string;
    weeklyScheduleId: string;
    day: string;
}

export interface DeleteDayParams {
    schoolId: string;
    classId: string;
    sectionId?: string | null;
    weeklyScheduleId: string;
}

export interface UpsertPeriodParams {
    schoolId: string;
    classId: string;
    sectionId?: string | null;
    weeklyScheduleId: string;
    periodData: any; // Replace 'any' with your actual period object type
}

export interface DeletePeriodParams {
    schoolId: string;
    classId: string;
    sectionId?: string | null;
    weeklyScheduleId: string;
    periodId: string;
}

export interface AssignTeacherPeriodParams {
    mode: 'add' | 'remove';
    schoolId: string;
    classId: string;
    sectionId?: string | null;
    weeklyScheduleId: string;
    periodNumber: number;
    teacherId: string;
}

// ==========================================
// 2. QUERIES (GET)
// ==========================================

// --- Hook: Get All Timetables ---
export const useGetTimeTables = ({ schoolId, classId, sectionId }: GetTimeTableParams) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['timetables', schoolId, classId, sectionId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, [
                    "correspondent", "administrator", "principal", "parent", "accountant", "viceprincipal", "teacher"
                ]);

                const { data } = await Api.get('/api/timetable/getall', {
                    params: { schoolId, classId, sectionId }
                });

                if (data.ok) {
                    return data.data;
                } else {
                    throw new Error(data.message || 'Failed to fetch timetables');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!schoolId,
    });
};

// --- Hook: Get Teacher Schedule ---
export const useGetTeacherSchedule = ({ schoolId, teacherId }: GetTeacherScheduleParams) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['teacherSchedule', schoolId, teacherId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, [
                    "correspondent", "administrator", "principal", "viceprincipal", "teacher"
                ]);

                const { data } = await Api.get('/api/timetable/teacherschedule', {
                    params: { schoolId, teacherId }
                });

                if (data.ok) {
                    return data.data;
                } else {
                    throw new Error(data.message || 'Failed to fetch teacher schedule');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!schoolId && !!teacherId,
    });
};


// ==========================================
// 3. MUTATIONS (POST, PUT, DELETE)
// ==========================================

// --- Hook: Add a Day ---
export const useAddTimeTableDay = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: AddDayParams) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);
                const { data } = await Api.post<BaseResponse>('/api/timetable/addday', payload);
                if (!data.ok) throw new Error(data.message || 'Failed to add day');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timetables'] });
        },
    });
};

// --- Hook: Update a Day Name ---
export const useUpdateTimeTableDay = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: UpdateDayParams) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator"]);
                const { data } = await Api.put<BaseResponse>('/api/timetable/updateday', payload);
                if (!data.ok) throw new Error(data.message || 'Failed to update day');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timetables'] });
        },
    });
};

// --- Hook: Delete a Day ---
export const useDeleteTimeTableDay = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: DeleteDayParams) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator"]);
                // Axios DELETE with body requires passing the payload inside the 'data' property
                const { data } = await Api.delete<BaseResponse>('/api/timetable/deleteday', { data: payload });
                if (!data.ok) throw new Error(data.message || 'Failed to delete day');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timetables'] });
        },
    });
};

// --- Hook: Upsert (Add/Edit) a Period ---
export const useUpsertPeriod = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: UpsertPeriodParams) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);
                const { data } = await Api.put<BaseResponse>('/api/timetable/updateperiod', payload);
                if (!data.ok) throw new Error(data.message || 'Failed to update period');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timetables'] });
            queryClient.invalidateQueries({ queryKey: ['teacherSchedule'] });
        },
    });
};

// --- Hook: Delete a Single Period ---
export const useDeletePeriod = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (payload: DeletePeriodParams) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);
                const { data } = await Api.delete<BaseResponse>('/api/timetable/deleteperiod', { data: payload });
                if (!data.ok) throw new Error(data.message || 'Failed to delete period');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timetables'] });
            queryClient.invalidateQueries({ queryKey: ['teacherSchedule'] });
        },
    });
};

// --- Hook: Assign/Remove Teacher to/from Period ---
export const useAssignTeacherToPeriod = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ mode, ...payload }: AssignTeacherPeriodParams) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "principal"]);
                const { data } = await Api.put<BaseResponse>(
                    `/api/timetable/assignteacher?mode=${mode}`, 
                    payload
                );
                if (!data.ok) throw new Error(data.message || `Failed to ${mode} teacher`);
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timetables'] });
            queryClient.invalidateQueries({ queryKey: ['teacherSchedule'] });
        },
    });
};

// --- Hook: Delete Entire Timetable ---
export const useDeleteTimeTable = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (id: string) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "principal"]);
                const { data } = await Api.delete<BaseResponse>(`/api/timetable/delete/${id}`);
                if (!data.ok) throw new Error(data.message || 'Failed to delete timetable');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timetables'] });
            queryClient.invalidateQueries({ queryKey: ['teacherSchedule'] });
        },
    });
};