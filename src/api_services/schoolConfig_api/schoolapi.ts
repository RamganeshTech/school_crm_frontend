import { useMutation, useQuery } from '@tanstack/react-query';
import { Api } from '../../lib/api';
// import { checkPermission } from '../../utils/rbac';
import { queryClient } from '../../lib/queryClient';
// import { type UserRole } from '../auth/authSlice';
import { useAuthData } from '../../hooks/useAuthData';
import { type UserRole } from '../../features/slices/authSlice';
import { checkPermission } from '../../utils/utils';

// --- Constants for Role Arrays ---
const CORRESPONDENT_ONLY: UserRole[] = ["correspondent"];
const GENERAL_READ_ROLES: UserRole[] = ["correspondent", "teacher", "principal", "administrator", "viceprincipal", "accountant", "parent"];
const SOCIAL_WRITE_ROLES: UserRole[] = ["correspondent", "administrator"];
const SOCIAL_READ_ROLES: UserRole[] = ["correspondent", "teacher", "parent", "principal", "administrator", "viceprincipal", "accountant"];

// --- Types ---
export interface SchoolData {
  _id: string;
  name: string;
  email: string;
  phoneNo: string;
  address: string;
  currentAcademicYear: string;
  logo?: {url:string} | null;
  socialPlatforms?: Record<string, string>;
}

interface BaseResponse {
  ok: boolean;
  message?: string;
}

interface GetAllSchoolsResponse extends BaseResponse {
  count: number;
  data: SchoolData[];
}

interface GetSingleSchoolResponse extends BaseResponse {
  data: SchoolData; // Adjust based on your actual backend response structure
}

interface UpdateSocialPlatformParams {
  id: string;
  data: {
    socialPlatform: string;
    link: string;
  };
}

// --- Hook 1: Create School (Handles File Upload via FormData) ---
export const useCreateSchool = () => {
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        checkPermission(currentRole, CORRESPONDENT_ONLY);

        // Send FormData directly; Axios automatically sets the correct multipart boundary
        const { data } = await Api.post<BaseResponse>('/api/school/create', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (data.ok) return data;
        throw new Error(data.message || 'Failed to create school');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
  });
};

// --- Hook 2: Get All Schools ---
export const useGetAllSchools = () => {
  const { currentRole } = useAuthData();

  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      try {
        checkPermission(currentRole, CORRESPONDENT_ONLY);

        const { data } = await Api.get<GetAllSchoolsResponse>('/api/school/getall');
        if (data.ok) return data.data;
        throw new Error(data.message || 'Failed to fetch schools');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
  });
};

// --- Hook 3: Get Single School By ID ---
export const useGetSchoolById = (schoolId: string | undefined) => {
  const { currentRole } = useAuthData();

  return useQuery({
    queryKey: ['school', schoolId],
    queryFn: async () => {
      try {
        checkPermission(currentRole, GENERAL_READ_ROLES);

        const { data } = await Api.get<GetSingleSchoolResponse>(`/api/school/getsingle/${schoolId}`);
        if (data.ok) return data.data;
        throw new Error(data.message || 'Failed to fetch school details');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    enabled: !!schoolId,
  });
};

// --- Hook 4: Update School Data (JSON) ---
export const useUpdateSchool = () => {
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async ({ id, data: updateData }: { id: string, data: Partial<SchoolData> }) => {
      try {
        checkPermission(currentRole, CORRESPONDENT_ONLY);

        const { data } = await Api.put<BaseResponse>(`/api/school/update/${id}`, updateData);
        if (data.ok) return data;
        throw new Error(data.message || 'Failed to update school');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['school', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
  });
};

// --- Hook 5: Update School Logo (Handles File Upload via FormData) ---
export const useUpdateSchoolLogo = () => {
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string, formData: FormData }) => {
      try {
        checkPermission(currentRole, CORRESPONDENT_ONLY);

        const { data } = await Api.put<BaseResponse>(`/api/school/updatelogo/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (data.ok) return data;
        throw new Error(data.message || 'Failed to update school logo');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['school', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
  });
};

// --- Hook 6: Delete School ---
export const useDeleteSchool = () => {
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        checkPermission(currentRole, CORRESPONDENT_ONLY);

        const { data } = await Api.delete<BaseResponse>(`/api/school/delete/${id}`);
        if (data.ok) return data;
        throw new Error(data.message || 'Failed to delete school');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
  });
};

// --- Hook 7: Update Social Platform ---
export const useUpdateSocialPlatform = () => {
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async ({ id, data: updateData }: UpdateSocialPlatformParams) => {
      try {
        checkPermission(currentRole, SOCIAL_WRITE_ROLES);

        const { data } = await Api.put<BaseResponse>(`/api/school/update/socialplatform/${id}`, updateData);
        if (data.ok) return data;
        throw new Error(data.message || 'Failed to update social platform');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schoolSocials', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['school', variables.id] });
    },
  });
};

// --- Hook 8: Get Social Platforms ---
export const useGetSchoolSocialPlatforms = (schoolId: string | undefined) => {
  const { currentRole } = useAuthData();

  return useQuery({
    queryKey: ['schoolSocials', schoolId],
    queryFn: async () => {
      try {
        checkPermission(currentRole, SOCIAL_READ_ROLES);

        const { data } = await Api.get<any>(`/api/school/getschool/socialplatform/${schoolId}`);
        if (data.ok) return data.data; // Adjust based on your actual backend response
        throw new Error(data.message || 'Failed to fetch social platforms');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    enabled: !!schoolId,
  });
};



//  SCHOOL ACADEMIC TERM DATE


// --- Hook: Upsert Academic Term Dates ---
export const useUpsertAcademicTermDates = () => {
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: { 
        academicYear: string; 
        firstTerm?: string | Date | null; 
        secondTerm?: string | Date | null; 
        thirdTerm?: string | Date | null; 
      } 
    }) => {
      try {
        // Adjust permissions based on your constants (e.g., CORRESPONDENT_ONLY or allow admins too)
        checkPermission(currentRole, SOCIAL_WRITE_ROLES);

        const response = await Api.put<BaseResponse>(`/api/school/update/academic-termdate/${id}`, data);
        if (response.data.ok) return response.data;
        throw new Error(response.data.message || 'Failed to update term dates');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate the school query so the UI instantly refreshes the term dates array
      queryClient.invalidateQueries({ queryKey: ['school', variables.id] });
    },
  });
};

// --- Hook: Delete Academic Term Date ---
export const useDeleteAcademicTermDates = () => {
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async ({ 
      schoolId, 
      academicTermDateId 
    }: { 
      schoolId: string; 
      academicTermDateId: string; 
    }) => {
      try {
        checkPermission(currentRole, SOCIAL_WRITE_ROLES);

        // Note: Make sure this URL matches your Express route exactly
        const response = await Api.delete<BaseResponse>(
          `/api/school/delete/academic-termdate/${schoolId}/${academicTermDateId}`
        );
        if (response.data.ok) return response.data;
        throw new Error(response.data.message || 'Failed to delete term date');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate the school query to clear the deleted item from the UI
      queryClient.invalidateQueries({ queryKey: ['school', variables.schoolId] });
    },
  });
};