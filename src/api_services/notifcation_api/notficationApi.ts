import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthData } from '../../hooks/useAuthData';
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';

// ==========================================
// 1. GET ALL NOTIFICATIONS HOOK
// ==========================================
// ==========================================
// 1. GET ALL NOTIFICATIONS HOOK (No Pagination)
// ==========================================
export const useGetAllNotifications = () => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "principal", "parent", "accountant", "viceprincipal", "teacher"]);

                const { data } = await Api.get('/api/notifications');

                if (!data.ok) throw new Error(data.message);

                return data.data; // Just return the flat array now
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        }
    });
};

// ==========================================
// 2. GET SINGLE NOTIFICATION HOOK (Marks as read)
// ==========================================
export const useGetSingleNotification = (notificationId: string | null) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['notification', notificationId],
        queryFn: async () => {
            try {
                // Everyone mapped in routes can view a single notification
                checkPermission(currentRole, ["correspondent", "administrator", "principal", "parent", "accountant", "viceprincipal", "teacher"]);

                const { data } = await Api.get(`/api/notifications/${notificationId}`);

                if (!data.ok) throw new Error(data.message);

                return data.data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        enabled: !!notificationId,
    });
};

// ==========================================
// 3. DELETE NOTIFICATION HOOK
// ==========================================
export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            try {
                // Only Creator Roles can delete (matches your backend CREATOR_ROLES)
                checkPermission(currentRole, ["correspondent", "administrator", "principal", "viceprincipal", "teacher"]);

                const { data } = await Api.delete(`/api/notifications/${notificationId}`);

                if (!data.ok) throw new Error(data.message);

                return data.data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => {
            // Invalidate the list queries to refresh the UI automatically
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });
};


export const useMarkAllNotificationsAsRead = () => {

    const queryClient = useQueryClient();
    const { currentRole } = useAuthData();
    return useMutation({

        mutationFn: async () => {
            checkPermission(currentRole, ["correspondent", "administrator", "principal", "viceprincipal", "teacher", "parent"]);
            const { data } = await Api.patch('/api/notifications/mark-all-read');
            if (!data.ok) throw new Error(data.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();
    const { currentRole } = useAuthData();
    return useMutation({
        mutationFn: async (notificationId: string) => {
            checkPermission(currentRole, ["correspondent", "administrator", "principal", "viceprincipal", "teacher", "parent"]);
            const { data } = await Api.patch(`/api/notifications/mark-read/${notificationId}`);
            if (!data.ok) throw new Error(data.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        },
    });
};



export const useGetUnreadNotificationCount = () => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['notifications-unread-count'],
        queryFn: async () => {
            checkPermission(currentRole, ["correspondent", "administrator", "principal", "viceprincipal", "teacher", "parent"]);
            const { data } = await Api.get('/api/notifications/unread-count');
            if (!data.ok) throw new Error(data.message);
            return data.data.count as number;
        },
        refetchInterval: 60000,
        staleTime: 30000,
    });
};