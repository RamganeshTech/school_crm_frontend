// Mirrors backend Driver.model.ts — keep in sync if the model changes.

export type UploadFileType = "image" | "pdf" | "video";

export interface IUpload {
  _id: string;
  type: UploadFileType;
  key: string;
  url: string;
  originalName: string;
  uploadedAt: string;
}

export type DriverDocStatus = "valid" | "expiring_soon" | "expired";

export interface IDriverDocument {
  _id: string;
  documentName: string | null;
  detail: string | null;
  expiryDate: string | null;
  status: DriverDocStatus;
  files: IUpload[];
}

export type DriverStatus = "active" | "inactive" | "on_leave";

export interface IDriver {
  _id: string;
  schoolId: string;

  name: string;
  phone: string;
  assignedBusId: string | null;

  dateOfBirth: string | null;
  joinedDate: string | null;
  emergencyContact: string | null;
  address: string | null;
  photo: IUpload | null;

  documents: IDriverDocument[];

  status: DriverStatus;

  createdAt: string;
  updatedAt: string;
}

// payload shape for update text-fields (documents/photo go through FormData separately)
export interface IUpdateDriverPayload {
  name?: string;
  phone?: string;
  assignedBusId?: string | null;
  dateOfBirth?: string | null;
  joinedDate?: string | null;
  emergencyContact?: string | null;
  address?: string | null;
  status?: DriverStatus;
}


import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthData } from "../../hooks/useAuthData";
import { checkPermission } from "../../utils/utils";
import { Api } from "../../lib/api";
import { queryClient } from "../../lib/queryClient";

// ---------- CREATE ----------

interface BaseResponse<T> {
  ok: boolean;    // or 'ok'
  message?: string;
  data?: T;             // This is where your IDriver goes
}

export const useAddDriver = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.post('/api/transport/driver/create', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });

                if (!data.ok) throw new Error(data.message || 'Failed to add driver');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
        },
    });
};

// ---------- GET ALL ----------

export const useGetAllDrivers = (params?: { schoolId?: string; status?: string }) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['drivers', params],
        queryFn: async () => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.get<BaseResponse<IDriver[]>>('/api/transport/driver', {
                    params,
                });

                if (!data.ok) throw new Error(data.message || 'Failed to fetch drivers');
                return data.data as IDriver[];
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
    });
};


export const useGetDriverDropDown = (params: { schoolId: string }) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['driver', "dropdown"],
        queryFn: async () => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.get(`/api/transport/driver/dropdown/${params.schoolId}`);

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

export const useGetDriverById = (id: string) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['driver', id],
        queryFn: async () => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.get<BaseResponse<IDriver>>(`/api/transport/driver/${id}`);

                if (!data.ok) throw new Error(data.message || 'Failed to fetch driver');
                return data.data as IDriver;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!id,
    });
};

// ---------- UPDATE ----------

export const useUpdateDriver = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.put<BaseResponse<IDriver>>(`/api/transport/driver/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });

                if (!data.ok) throw new Error(data.message || 'Failed to update driver');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
            queryClient.invalidateQueries({ queryKey: ['driver', variables.id] });
        },
    });
};

// ---------- DELETE ----------

export const useDeleteDriver = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async (id: string) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.delete<BaseResponse<void>>(`/api/transport/driver/${id}`);

                if (!data.ok) throw new Error(data.message || 'Failed to delete driver');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
        },
    });
};

// ---------- DELETE DOCUMENT ATTACHMENT ----------

export const useDeleteDriverDocumentAttachment = () => {
    const { currentRole } = useAuthData();

    return useMutation({
        mutationFn: async ({ id, documentId, fileId }: { id: string; documentId: string; fileId: string }) => {
            try {
                checkPermission(currentRole, ["administrator", "correspondent"]);

                const { data } = await Api.delete<BaseResponse<IDriver>>(
                    `/api/transport/driver/${id}/documents/${documentId}/files/${fileId}`
                );

                if (!data.ok) throw new Error(data.message || 'Failed to delete attachment');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
            queryClient.invalidateQueries({ queryKey: ['driver', variables.id] });
        },
    });
};