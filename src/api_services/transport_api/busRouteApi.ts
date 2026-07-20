import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthData } from "../../hooks/useAuthData";
import { checkPermission } from "../../utils/utils";
import { Api } from "../../lib/api";

// --- Types ---


export interface IStops {
    _id: string
    stopName: string;
    landmark?: string;
    order: number;
    latitude: number;
    longitude: number;
    googlePlaceId: string;
}

export interface IStopTiming {
    stopName: string;
    time: string;
}

export interface IAssignment {
    busId: string;
    driverId: string;
    shift: string;
    stopTimings: IStopTiming[];
}

export interface IBusRoute {
    _id: string;
    schoolId: string;
    routeNo?: string;
    routeName: string;
    stops: IStops[];
    feeAmount?: number;
    feeFrequency?: string;
    assignments?: IAssignment[];
    createdAt?: string;
    updatedAt?: string;
}

export interface BusRouteFilters {
    schoolId: string;
    search?: string;
    minFee?: number;
    maxFee?: number;
    limit?: number;
}

interface BaseResponse<T> {
    ok: boolean;
    message?: string;
    data?: T;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
}


// ---------- 1. CREATE ROUTE ----------

export const useCreateBusRoute = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: Partial<IBusRoute>) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.post('/api/transport/bus-route', payload);

                if (!data.ok) throw new Error(data.message || 'Failed to create bus route');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bus-routes-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['bus-routes-dropdown'] });
        },
    });
};


// ---------- 2. ADD ROUTE ASSIGNMENTS ----------

export const useAddBusRouteAssignment = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ routeId, payload }: { routeId: string; payload: { schoolId: string; assignments: IAssignment[] } }) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.post(`/api/transport/bus-route/${routeId}/assignments`, payload);

                if (!data.ok) throw new Error(data.message || 'Failed to add route assignments');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['bus-routes-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['bus-route', variables.routeId] });
        },
    });
};


export const useUpdateBusRouteAssignment = () => {
  const { currentRole } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      routeId,
      payload,
    }: {
      routeId: string;
      payload: {
        schoolId: string;
        assignmentId: string;
        busId?: string;
        driverId?: string;
        shift?: string;
        stopTimings?: { stopName: string; time: string }[];
      };
    }) => {
      try {
        checkPermission(currentRole, ["administrator", "correspondent"]);

        const { data } = await Api.put(`/api/transport/bus-route/${routeId}/assignments`, payload);

        if (!data.ok) throw new Error(data.message || 'Failed to update route assignment');
        return data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bus-routes-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['bus-route', variables.routeId] });
    },
  });
};

export const useRemoveBusRouteAssignment = () => {
  const { currentRole } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ routeId, payload }: { routeId: string; payload: { schoolId: string; assignmentId: string } }) => {
      try {
        checkPermission(currentRole, ["administrator", "correspondent"]);

        const { data } = await Api.delete(`/api/transport/bus-route/${routeId}/assignments`, {
          data: payload,
        });

        if (!data.ok) throw new Error(data.message || 'Failed to remove route assignment');
        return data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bus-routes-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['bus-route', variables.routeId] });
    },
  });
};

// ---------- 3. GET ALL (INFINITE SCROLL) ----------

export const useGetAllBusRoutesInfinite = (params: BusRouteFilters) => {
    const { currentRole } = useAuthData();

    return useInfiniteQuery({
        queryKey: ['bus-routes-infinite', params],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.get<BaseResponse<IBusRoute[]>>('/api/transport/bus-route', {
                    params: { ...params, page: pageParam }
                });

                if (data.ok) {
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to fetch bus routes');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        getNextPageParam: (lastPage) => {
            const currentPage = Number(lastPage?.pagination?.page) || 1;
            const totalPages = Number(lastPage?.pagination?.totalPages) || 1;

            if (currentPage < totalPages) {
                return currentPage + 1;
            }
            return undefined;
        },
        enabled: !!params.schoolId,
    });
};


// ---------- 4. GET ALL (DROPDOWN) ----------

export const useGetAllBusRoutesDropDown = (params: { schoolId: string }) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['bus-routes-dropdown', params.schoolId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                // Passing schoolId in params as per standard, though check your backend to ensure it extracts from req.query if req.params is undefined.
                const { data } = await Api.get(`/api/transport/bus-route/drop-down/${params.schoolId}`);

                if (!data.ok) throw new Error(data.message || 'Failed to fetch bus route dropdown');
                return data.data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!params.schoolId,
    });
};


// ---------- 5. GET SINGLE ROUTE ----------

export const useGetSingleBusRoute = (routeId?: string) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['bus-route', routeId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.get<BaseResponse<IBusRoute>>(`/api/transport/bus-route/${routeId}`);

                if (!data.ok) throw new Error(data.message || 'Failed to fetch bus route details');
                return data.data as IBusRoute;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!routeId,
    });
};


export const useGetAssignedRoutesForDriver = (driverId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['driver-assigned-routes', driverId],
        queryFn: async () => {
            try {
                // Matches the backend multiRoleAuth array
                checkPermission(currentRole, ["administrator", "correspondent", "principal"]);

                // Adjust the base URL prefix (/api/transport/...) if your busStoprouter is mounted differently in server.ts
                const { data } = await Api.get(`/api/transport/bus-route/assigned-routes/${driverId}`);

                if (!data.ok) throw new Error(data.message || 'Failed to fetch assigned routes');
                return data.data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        // The query will only execute when a valid driverId is passed
        enabled: !!driverId,
    });
};

// ---------- 6. UPDATE ROUTE ----------

export const useUpdateBusRoute = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ routeId, payload }: { routeId: string; payload: Partial<IBusRoute> }) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.put(`/api/transport/bus-route/${routeId}`, payload);

                if (!data.ok) throw new Error(data.message || 'Failed to update bus route');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['bus-routes-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['bus-route', variables.routeId] });
            queryClient.invalidateQueries({ queryKey: ['bus-routes-dropdown'] });
        },
    });
};


// ---------- 7. DELETE ROUTE ----------

export const useDeleteBusRoute = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (routeId: string) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                // Using standard axios delete implementation based on your route param (/:routeId)
                const { data } = await Api.delete(`/api/transport/bus-route/${routeId}`);

                if (!data.ok) throw new Error(data.message || 'Failed to delete bus route');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bus-routes-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['bus-routes-dropdown'] });
        },
    });
};