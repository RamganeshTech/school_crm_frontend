

export type StatutoryDocStatus = "valid" | "expiring_soon" | "expired";
export type BusOperationalStatus = "active" | "in_service" | "on_trip" | "inactive";
export type FuelType = "diesel" | "petrol" | "cng" | "electric";

export interface IUpload {
    _id: string;
    type: "image" | "pdf" | "video";
    key?: string;
    url?: string;
    originalName?: string;
    uploadedAt: string;
}

export interface IStatutoryDocument {
    _id: string;
    documentName: string | null;
    expiry: string | null; // ISO Date string
    lastCost?: number;
    status: StatutoryDocStatus;
    files: IUpload[];
}

export interface IBus {
    _id: string;
    schoolId: string;
    busNumber: string;
    registrationNo: string;
    makeModel: string;
    year: number;
    seatingCapacity: number;
    fuelType: FuelType;
    chassisNo: string;
    engineNo: string;
    purchaseDate: string; // ISO Date string
    rcOwner: string;
    statutoryDocuments: IStatutoryDocument[];
    nextServiceDate?: string;
    lastServiceDate?: string;
    assignedDriverId?: string;
    operationalStatus: BusOperationalStatus;
    createdAt: string;
    updatedAt: string;
}

// Helper filter type for listing buses
export interface IBusFilters {
    schoolId: string;
    operationalStatus?: BusOperationalStatus;
}


import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthData } from "../../hooks/useAuthData";
import { checkPermission } from "../../utils/utils";
import { Api } from "../../lib/api";
import { queryClient } from "../../lib/queryClient";
// Assume these match your project's import paths


interface BaseResponse<T> {
    ok: boolean;    // or 'ok'
    message?: string;
    data?: T;             // This is where your IDriver goes
}

// ---------- CREATE ----------

export const useAddBus = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.post<BaseResponse<IBus>>('/api/transport/bus/create', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });

                if (!data.ok) throw new Error(data.message || 'Failed to add bus');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['buses'] });
        },
    });
};

// ---------- GET ALL ----------

export const useGetAllBuses = (params?: {
    schoolId?: string; operationalStatus?: string, search?: string, nextServiceFrom?: string,
    nextServiceTo?: string
}) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['buses', params],
        queryFn: async () => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.get<BaseResponse<IBus[]>>('/api/transport/bus', {
                    params,
                });

                if (!data.ok) throw new Error(data.message || 'Failed to fetch buses');
                return data.data as IBus[];
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
    });
};

export const useGetBusDropDown = (params: { schoolId: string }) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['buses', "dropdown"],
        queryFn: async () => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.get(`/api/transport/bus/dropdown/${params.schoolId}`);

                if (!data.ok) throw new Error(data.message || 'Failed to fetch buses');
                return data.data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
    });
};

// ---------- GET BY ID ----------

export const useGetBusById = (id?: string) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['buses', id],
        queryFn: async () => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.get<BaseResponse<IBus>>(`/api/transport/bus/${id}`);

                if (!data.ok) throw new Error(data.message || 'Failed to fetch bus details');
                return data.data as IBus;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!id, // Only run the query if an ID is provided
    });
};

// ---------- UPDATE ----------

export const useUpdateBus = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.put<BaseResponse<IBus>>(`/api/transport/bus/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });

                if (!data.ok) throw new Error(data.message || 'Failed to update bus');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['buses'] });
        },
    });
};

// ---------- DELETE ----------

export const useDeleteBus = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (id: string) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.delete<BaseResponse<void>>(`/api/transport/bus/${id}`);

                if (!data.ok) throw new Error(data.message || 'Failed to delete bus');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['buses'] });
        },
    });
};

// ---------- DELETE DOCUMENT ATTACHMENT ----------

export const useDeleteBusDocumentAttachment = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ id, documentId, fileId }: { id: string; documentId: string; fileId: string }) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.delete<BaseResponse<void>>(
                    `/api/transport/bus/${id}/documents/${documentId}/files/${fileId}`
                );

                if (!data.ok) throw new Error(data.message || 'Failed to delete document attachment');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            // Re-fetch the bus data to update the UI after a file is removed
            queryClient.invalidateQueries({ queryKey: ['buses'] });
        },
    });
};