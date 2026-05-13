import { useMutation, useQuery } from '@tanstack/react-query';
import { type UserRole } from '../../features/slices/authSlice';
import { useAuthData } from '../../hooks/useAuthData';
import { checkPermission } from '../../utils/utils';
import { queryClient } from '../../lib/queryClient';
import { Api } from '../../lib/api';
// import { Api } from '../../lib/api';
// import { checkPermission } from '../../utils/rbac';
// import { queryClient } from '../../lib/queryClient';
// import { type UserRole } from '../auth/authSlice';
// import { useAuthData } from '../../hooks/useAuthData';

// --- Constants for Role Arrays ---
const READ_ROLES: UserRole[] = ["correspondent", "teacher", "principal", "administrator", "viceprincipal", "accountant"];
const WRITE_ROLES: UserRole[] = ["correspondent", "administrator"];
const DELETE_ROLES: UserRole[] = ["correspondent"];

// --- Types ---
export interface SectionData {
  _id: string;
  schoolId: string;
  classId: any;
  name: string;
  classTeacherId: any[];
  roomNumber?: string;
  capacity?: number;
}

interface BaseResponse {
  ok: boolean;
  message?: string;
}

interface GetSectionsResponse extends BaseResponse {
  data: SectionData[];
}

interface CreateSectionResponse extends BaseResponse {
  data: SectionData;
}

interface CreateSectionParams {
  schoolId: string;
  classId: string;
  name: string;
  roomNumber?: string;
  capacity?: number;
}

interface UpdateSectionParams {
  id: string;
  data: {
    name?: string;
    roomNumber?: string;
    capacity?: number;
  };
}

interface GetSectionsParams {
  schoolId?: string;
  classId?: string;
}

// --- Hook 1: Get All Sections ---
export const useGetSections = ({ schoolId, classId }: GetSectionsParams) => {
  const { currentRole } = useAuthData();

  return useQuery({
    // Cache by both schoolId and classId depending on what is provided
    queryKey: ['sections', schoolId, classId],
    queryFn: async () => {
      try {
        checkPermission(currentRole, READ_ROLES);

        const { data } = await Api.get<GetSectionsResponse>('/api/section/getall', {
          params: { schoolId, classId }
        });

        if (data.ok) {
          return data.data;
        } else {
          throw new Error(data.message || 'Failed to fetch sections');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    // Only run if at least one ID is provided
    enabled: !!schoolId || !!classId,
  });
};

// --- Hook 2: Create Section ---
export const useCreateSection = () => {
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (sectionData: CreateSectionParams) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);

        const { data } = await Api.post<CreateSectionResponse>('/api/section/create', sectionData);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to create section');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      // Invalidate sections and classes (since creating a section might update Class.hasSections)
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
};

// --- Hook 3: Update Section ---
export const useUpdateSection = () => {
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async ({ id, data: updateData }: UpdateSectionParams) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);

        const { data } = await Api.put<BaseResponse>(`/api/section/update/${id}`, updateData);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to update section');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
};

// --- Hook 4: Delete Section ---
export const useDeleteSection = () => {
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        checkPermission(currentRole, DELETE_ROLES);

        const { data } = await Api.delete<BaseResponse>(`/api/section/delete/${id}`);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to delete section');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      // Invalidate classes because deleting the last section updates Class.hasSections
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
};