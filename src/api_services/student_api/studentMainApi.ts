import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useAuthData } from '../../hooks/useAuthData';
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';
// Assuming you have a configured axios instance and an auth hook
// import api from '@/utils/api'; 
// import { useAuth } from '@/hooks/useAuth'; // Replace with your actual auth hook

// --- ROLE DEFINITIONS based on your backend ---
// const ROLES = {
//   CREATE: ["correspondent", "administrator", "accountant"],
//   UPDATE: ["correspondent", "administrator", "accountant", "parent"],
//   DELETE: ["correspondent"],
//   READ: ["correspondent", "administrator", "principal", "viceprincipal", "accountant", "teacher", "parent"],
//   ASSIGN_REMOVE: ["correspondent", "administrator"],
// };


// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import Api from '@/utils/Api'; // Adjust path as needed
// import { useAuthData } from '@/hooks/useAuthData'; // Adjust path as needed
// import { checkPermission } from '@/utils/checkPermission'; // Adjust path as needed

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface GetAllStudentsParams {
  schoolId?: string;
  classId?: string;
  sectionId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface UpdateStudentParams {
  id: string;
  formData: FormData;
}

export interface AssignRemoveStudentParams {
  parentId: string;
  studentId: string;
}

// Note: Replace `any` with your actual response interfaces (e.g., GetStudentsResponse)
type ApiResponse<T = any> = {
  ok: boolean;
  message?: string;
  data: T;
};

// ==========================================
// 1. GET ALL STUDENTS
// ==========================================
export const useGetAllStudents = (params: GetAllStudentsParams) => {
  const { currentRole } = useAuthData();

  // 1. Ensure we know the limit (defaulting to 10 if not provided)
  const limit = params.limit || 10;

  return useInfiniteQuery({
    queryKey: ['students', 'list', params],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      try {
        checkPermission(currentRole, [
          "correspondent", "administrator", "principal", "viceprincipal", "accountant", "teacher", "parent"
        ]);

        const { data } = await Api.get<ApiResponse>(`/api/student/getall`, {
          params: { ...params, page: pageParam, limit }
        });

        if (data.ok) {
          return data.data; // Returning JUST the array of students
        } else {
          throw new Error(data.message || 'Failed to fetch students');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    // 2. THE FIX: Check the length of the array to determine if there is a next page
    getNextPageParam: (lastPage: any, allPages: any) => {
      // If the last array returned is exactly the size of the limit, assume there is more data
      if (lastPage && lastPage.length === limit) {
        return allPages.length + 1; // Return the next page number
      }
      // If the array has fewer items than the limit (or is empty), we hit the end
      return undefined;
    },
    enabled: true,
  });
};

export const useGetAllStudentsV1 = (params: Omit<GetAllStudentsParams, "page" | "limit">) => {
  const { currentRole } = useAuthData();


  return useQuery({
    queryKey: ['students', "wihtout-pagination", params],
    queryFn: async () => {
      try {
        checkPermission(currentRole, [
          "correspondent", "administrator", "principal", "viceprincipal", "accountant", "teacher", "parent"
        ]);

        const { data } = await Api.get<ApiResponse>(`/api/student/v1/without-pagination/getall`, {
          params: params
        });

        if (data.ok) {
          return data.data; // Returning JUST the array of students
        } else {
          throw new Error(data.message || 'Failed to fetch students');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    enabled: true,
  });
};

// ==========================================
// 2. GET SINGLE STUDENT BY ID
// ==========================================
export const useGetStudentById = (id: string | undefined) => {
  const { currentRole } = useAuthData();

  return useQuery({
    queryKey: ['students', 'detail', id],
    queryFn: async () => {
      try {
        checkPermission(currentRole, [
          "correspondent", "administrator", "principal", "viceprincipal", "accountant", "teacher", "parent"
        ]);

        const { data } = await Api.get<ApiResponse>(`/api/student/get/${id}`);

        if (data.ok) {
          return data.data;
        } else {
          throw new Error(data.message || 'Failed to fetch student details');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    enabled: !!id,
  });
};

// ==========================================
// 3. CREATE STUDENT PROFILE
// ==========================================
export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        checkPermission(currentRole, ["correspondent", "administrator", "accountant"]);

        const { data } = await Api.post<ApiResponse>(`/api/student/create`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to create student');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', 'list'] });
    },
  });
};

// ==========================================
// 4. UPDATE STUDENT PROFILE
// ==========================================
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async ({ id, formData }: UpdateStudentParams) => {
      try {
        checkPermission(currentRole, ["correspondent", "administrator", "accountant", "parent"]);

        const { data } = await Api.put<ApiResponse>(`/api/student/update/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to update student');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['students', 'detail', variables.id] });
    },
  });
};

// ==========================================
// 5. DELETE STUDENT PROFILE
// ==========================================
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        checkPermission(currentRole, ["correspondent"]);

        const { data } = await Api.delete<ApiResponse>(`/api/student/delete/${id}`);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to delete student');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', 'list'] });
    },
  });
};

// ==========================================
// 6. ASSIGN STUDENT TO PARENT
// ==========================================
export const useAssignStudentToParent = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (payload: AssignRemoveStudentParams) => {
      try {
        checkPermission(currentRole, ["correspondent", "administrator"]);

        const { data } = await Api.put<ApiResponse>(`/api/student/assignstudent`, payload);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to assign student');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

// ==========================================
// 7. REMOVE STUDENT FROM PARENT
// ==========================================
export const useRemoveStudentFromParent = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (payload: AssignRemoveStudentParams) => {
      try {
        checkPermission(currentRole, ["correspondent", "administrator"]);

        const { data } = await Api.put<ApiResponse>(`/api/student/removestudent`, payload);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to remove student');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};