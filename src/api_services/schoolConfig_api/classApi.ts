import { useMutation, useQuery } from '@tanstack/react-query';
import { Api } from '../../lib/api';
// import { store } from '../../store/store';
// import { checkPermission } from '../../utils/rbac';
import { queryClient } from '../../lib/queryClient';
import { checkPermission } from '../../utils/utils';
import { useAuthData } from '../../hooks/useAuthData';
// import { type UserRole } from '../auth/authSlice';

// --- Types ---
export interface ClassData {
  _id: string;
  schoolId: string;
  name: string;
  order: number;
  hasSections: boolean;
  classTeacherId: any[]; // Populated data or empty array
}

interface BaseResponse {
  ok: boolean;
  message?: string;
}

interface GetClassesResponse extends BaseResponse {
  data: ClassData[];
}

interface CreateClassResponse extends BaseResponse {
  data: ClassData;
}

interface CreateClassParams {
  schoolId: string;
  data: {
    name: string;
    order?: number;
    hasSections?: boolean;
  };
}

interface UpdateClassParams {
  id: string;
  data: {
    name?: string;
    order?: number;
    hasSections?: boolean;
  };
}

// --- Hook 1: Get All Classes ---
export const useGetClasses = (schoolId: string | undefined) => {
  const { currentRole } = useAuthData();
  return useQuery({
    queryKey: ['classes', schoolId],
    queryFn: async () => {
      try {
        checkPermission(currentRole, [
          "correspondent", "teacher", "principal", "administrator", "viceprincipal", "accountant"
        ]);

        const { data } = await Api.get<GetClassesResponse>(`/api/class/getall/${schoolId}`);

        if (data.ok) {
          return data.data;
        } else {
          throw new Error(data.message || 'Failed to fetch classes');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    enabled: !!schoolId,
  });
};

// --- Hook 2: Create Class ---
export const useCreateClass = () => {
  const { currentRole } = useAuthData();
  return useMutation({
    mutationFn: async ({ schoolId, data: classData }: CreateClassParams) => {
      try {
        checkPermission(currentRole, ["correspondent", "administrator","teacher"]);


        const { data } = await Api.post<CreateClassResponse>(`/api/class/create/${schoolId}`, classData);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to create class');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classes', variables.schoolId] });
    },
  });
};

// --- Hook 3: Update Class ---
export const useUpdateClass = () => {
  const { currentRole } = useAuthData();
  return useMutation({
    mutationFn: async ({ id, data: updateData }: UpdateClassParams) => {
      try {
        checkPermission(currentRole, ["correspondent", "administrator","teacher"]);


        const { data } = await Api.put<BaseResponse>(`/api/class/update/${id}`, updateData);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to update class');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      // Invalidate all classes since the order or name might affect the UI list
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
};

// --- Hook 4: Delete Class ---
export const useDeleteClass = () => {
  const { currentRole } = useAuthData();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        checkPermission(currentRole, ["correspondent", "administrator","teacher"]);


        const { data } = await Api.delete<BaseResponse>(`/api/class/delete/${id}`);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to delete class');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
};