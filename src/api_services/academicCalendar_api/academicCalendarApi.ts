import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthData } from '../../hooks/useAuthData';
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';

// Adjust BaseResponse and other types based on your project structure
export interface BaseResponse<T> {
    ok: boolean;
    message: string;
    data?: T;
    count?: number;
}

export interface ICalendarEventPayload {
    schoolId: string;
    title: string;
    startDate: string | Date;
    endDate: string | Date;
    type: string;
    description?: string;
    applicableToClasses?: string[];
    academicYear?: string;
}

// ==========================================
// 1. QUERIES (GET)
// ==========================================

// --- Hook: Get All Calendar Events ---
export const useGetAllCalendarEvents = (params: { schoolId: string; academicYear?: string; month?: number | string; type?: string }) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['calendar-events', params],
        queryFn: async () => {
            try {
                // Accessible by everyone
                checkPermission(currentRole, ["correspondent", "administrator", "principal", "parent", "accountant", "viceprincipal", "teacher"]);

                const { data } = await Api.get<BaseResponse<any>>(`/api/calendar/getall`, { params });

                if (data.ok) {
                    return data.data; // You can also return { data: data.data, count: data.count } if needed
                } else {
                    throw new Error(data.message || 'Failed to fetch calendar events');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        enabled: !!params.schoolId, // Only run if schoolId is provided
    });
};

// --- Hook: Get Single Calendar Event By ID ---
export const useGetSingleCalendarEvent = (eventId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['calendar-single', eventId],
        queryFn: async () => {
            try {
                // Accessible by everyone
                checkPermission(currentRole, ["correspondent", "administrator", "principal", "parent", "accountant", "viceprincipal", "teacher"]);

                const { data } = await Api.get<BaseResponse<any>>(`/api/calendar/getsingle/${eventId}`);

                if (data.ok) {
                    return data.data;
                } else {
                    throw new Error(data.message || 'Failed to fetch calendar event details');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        enabled: !!eventId,
    });
};

// ==========================================
// 2. MUTATIONS (POST / PUT / DELETE)
// ==========================================

// --- Hook: Create Calendar Event ---
export const useCreateCalendarEvent = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventData: ICalendarEventPayload) => {
            try {
                // Admins/Management only
                checkPermission(currentRole, ["correspondent", "administrator"]);

                const { data } = await Api.post<BaseResponse<any>>('/api/calendar/create', eventData);

                if (!data.ok) throw new Error(data.message || 'Failed to create calendar event');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        },
    });
};

// --- Hook: Update Calendar Event ---
export const useUpdateCalendarEvent = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updateData }: { id: string; updateData: Partial<ICalendarEventPayload> }) => {
            try {
                // Admins/Management only
                checkPermission(currentRole, ["correspondent", "administrator"]);

                const { data } = await Api.put<BaseResponse<any>>(`/api/calendar/update/${id}`, updateData);

                if (!data.ok) throw new Error(data.message || 'Failed to update calendar event');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
            queryClient.invalidateQueries({ queryKey: ['calendar-single'] }); // Optional: Invalidate specific single item
        },
    });
};

// --- Hook: Delete Calendar Event ---
export const useDeleteCalendarEvent = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            try {
                // Admins/Management only
                checkPermission(currentRole, ["correspondent", "administrator"]);

                const { data } = await Api.delete<BaseResponse<any>>(`/api/calendar/delete/${id}`);

                if (!data.ok) throw new Error(data.message || 'Failed to delete calendar event');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        },
    });
};