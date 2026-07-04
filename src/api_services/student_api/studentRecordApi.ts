import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import { useAuthData } from '../../hooks/useAuthData';
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface GetAllStudentRecordsParams {
  schoolId?: string;
  page?: number;
  limit?: number;
  search?: string;
  academicYear?: string;
  classId?: string;
  sectionId?: string;
  newOld?: string;
  phone?:string;
  isActive?: boolean;
  isBusApplicable?: boolean;
  isFullyPaid?: boolean;
  hasConcession?: boolean;
  hasBusPoint?: boolean;
}

export interface AssignStudentParams {
  schoolId: string;
  studentId: string;
  classId: string;
  sectionId: string;
  studentName: string;
  newOld: string;
  rollNumber?: string;
  className?: string;
  sectionName?: string;
  isBusApplicable?: boolean;
  academicYear?: string;
}

export interface RemoveStudentParams {
  schoolId: string;
  studentId: string;
  academicYear?: string;
}

export interface UpdateConcessionParams {
  schoolId: string;
  studentRecordId: string;
  concessionType: string;
  concessionValue: number | string;
}

export interface VerifyConcessionParams {
  studentId: string;
  academicYear: string;
}

export interface ToggleStatusParams {
  studentId: string;
  isActive: boolean;
  academicYear: string; // 🌟 Added academicYear parameter
}

export interface RevertReceiptParams {
  receiptId: string;
  status: string;
  remarks: string;
  penaltyAmount?: number;
}

// Note: Replace `any` with your actual exact response interfaces
type ApiResponse<T = any> = {
  ok: boolean;
  message?: string;
  data: T;
};

// ==========================================
// 1. GET ALL STUDENT RECORDS
// ==========================================

export const useGetAllStudentRecords = (params: GetAllStudentRecordsParams) => {
  const { currentRole } = useAuthData();

  return useInfiniteQuery({
    queryKey: ['studentRecords', 'list', params],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      try {
        checkPermission(currentRole, [
          "correspondent", "accountant", "principal", "administrator", "viceprincipal", "teacher", "parent"
        ]);

        const { data } = await Api.get<any>('/api/studentrecord/getall', {
          params: { ...params, page: pageParam, limit: params.limit || 10 }
        });

        if (data.ok) {
          // Return the full object so we have access to data.data AND data.pagination
          return data;
        } else {
          throw new Error(data.message || 'Failed to fetch student records');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    getNextPageParam: (lastPage) => {
      // Use your backend's explicit pagination object!
      const { page, totalPages } = lastPage.pagination;
      if (page < totalPages) {
        return page + 1;
      }
      return undefined; // No more pages
    },
    enabled: true,
  });
};



export const useGetAllStudentRecordsV1 = (params: GetAllStudentRecordsParams) => {
  const { currentRole } = useAuthData();

  return useInfiniteQuery({
    queryKey: ['studentRecords', 'list', params],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      try {
        checkPermission(currentRole, [
          "correspondent", "accountant", "principal", "administrator", "viceprincipal", "teacher", "parent"
        ]);

        const { data } = await Api.get<any>('/api/studentrecord/v1/getall', {
          params: { ...params, page: pageParam, limit: params.limit || 10 }
        });

        if (data.ok) {
          // Return the full object so we have access to data.data AND data.pagination
          return data;
        } else {
          throw new Error(data.message || 'Failed to fetch student records');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    getNextPageParam: (lastPage) => {
      // Use your backend's explicit pagination object!
      const { page, totalPages } = lastPage.pagination;
      if (page < totalPages) {
        return page + 1;
      }
      return undefined; // No more pages
    },
    enabled: true,
  });
};

// ==========================================
// 2. GET SINGLE RECORD BY ID
// ==========================================
// export const useGetStudentRecordById = (schoolId: string | undefined, studentId: string | undefined) => {
//   const { currentRole } = useAuthData();

//   return useQuery({
//     queryKey: ['studentRecords', 'detail', schoolId, studentId],
//     queryFn: async () => {
//       try {
//         checkPermission(currentRole, [
//           "administrator", "correspondent", "principal", "viceprincipal", "accountant", "teacher", "parent"
//         ]);

//         const { data } = await Api.get<ApiResponse>(`/api/studentrecord/getrecord/${schoolId}/${studentId}`);

//         if (data.ok) {
//           return data.data;
//         } else {
//           throw new Error(data.message || 'Failed to fetch student record details');
//         }
//       } catch (error: any) {
//         const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
//         throw new Error(errorMessage);
//       }
//     },
//     enabled: !!schoolId && !!studentId,
//   });
// };


export const useGetStudentRecordByIdV1 = (schoolId: string | undefined, studentId: string | undefined, academicYear?: string) => {
  const { currentRole } = useAuthData();

  return useQuery({
    queryKey: ['studentRecords', 'detail', schoolId, studentId, academicYear],
    queryFn: async () => {
      try {
        checkPermission(currentRole, [
          "administrator", "correspondent", "principal", "viceprincipal", "accountant", "teacher", "parent"
        ]);

        // Build URL. Append query parameter if academicYear has a valid string value
        let url = `/api/studentrecord/v1/getrecord/${schoolId}/${studentId}`;
        if (academicYear) {
          url += `?academicYear=${encodeURIComponent(academicYear)}`;
        }

        const { data } = await Api.get<ApiResponse>(url);

        // const { data } = await Api.get<ApiResponse>(`/api/studentrecord/v1/getrecord/${schoolId}/${studentId}`);

        if (data.ok) {
          return data.data;
        } else {
          throw new Error(data.message || 'Failed to fetch student record details');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    enabled: !!schoolId && !!studentId,
  });
};

// ==========================================
// 3. APPLY CONCESSION (Requires FormData for upload.single)
// ==========================================
export const useApplyConcession = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        checkPermission(currentRole, ["correspondent", "accountant", "principal", "administrator"]);

        const { data } = await Api.post<ApiResponse>('/api/studentrecord/applyconcession', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to apply concession');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentRecords'] });
    },
  });
};



// ==========================================
// 3. APPLY CONCESSION (Requires FormData for upload.single)
// ==========================================
export const useApplyConcessionv1 = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        checkPermission(currentRole, ["correspondent", "accountant", "principal", "administrator"]);

        const { data } = await Api.post<ApiResponse>('/api/studentrecord/v1/applyconcession', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to apply concession');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentRecords'] });
    },
  });
};


// ==========================================
// 4. UPDATE CONCESSION DETAILS (JSON)
// ==========================================
export const useUpdateConcessionDetails = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (payload: UpdateConcessionParams) => {
      try {
        checkPermission(currentRole, ["correspondent", "accountant", "principal", "administrator"]);

        const { data } = await Api.put<ApiResponse>('/api/studentrecord/updatevalue', payload);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to update concession details');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentRecords'] });
    },
  });
};


// ==========================================
// 4. UPDATE CONCESSION DETAILS (JSON)
// ==========================================
export const useUpdateConcessionDetailsv1 = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (payload: UpdateConcessionParams) => {
      try {
        checkPermission(currentRole, ["correspondent", "accountant", "principal", "administrator"]);

        const { data } = await Api.put<ApiResponse>('/api/studentrecord/v1/updatevalue', payload);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to update concession details');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentRecords'] });
    },
  });
};

// ==========================================
// 5. UPLOAD CONCESSION PROOF (Requires FormData for upload.single)
// ==========================================
export const useUploadConcessionProof = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        checkPermission(currentRole, ["correspondent", "accountant", "principal", "administrator"]);

        const { data } = await Api.put<ApiResponse>('/api/studentrecord/update/proof', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to upload concession proof');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentRecords'] });
    },
  });
};

export const useVerifyConcession = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async ({ studentId, academicYear }: VerifyConcessionParams) => {
      try {
        checkPermission(currentRole, [
            "correspondent", "principal", "administrator", "viceprincipal"
        ]);

        // 🌟 PASS academicYear as a query parameter
        const { data } = await Api.patch<ApiResponse>(
            `/api/studentrecord/v1/verify-concession/${studentId}?academicYear=${academicYear}`
        );

        if (data.ok) return data;
        throw new Error(data.message || 'Failed to approve concession');
      } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentRecords'] });
    },
  });
};

// ==========================================
// 6. COLLECT FEE (Requires FormData for upload.array)
// ==========================================
export const useCollectFee = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        checkPermission(currentRole, ["correspondent", "accountant", "administrator"]);

        const { data } = await Api.post<ApiResponse>('/api/studentrecord/collectfee', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to collect fee');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentRecords'] });
      // You may also want to invalidate receipt queries if you have them
    },
  });
};



// ==========================================
// 6. COLLECT FEE (Requires FormData for upload.array)
// ==========================================
export const useCollectFeev1 = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        checkPermission(currentRole, ["correspondent", "accountant", "administrator"]);

        const { data } = await Api.post<ApiResponse>('/api/studentrecord/v1/collectfee', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to collect fee');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentRecords'] });
      // You may also want to invalidate receipt queries if you have them
    },
  });
};

// ==========================================
// 7. REVERT RECEIPT TRANSACTION
// ==========================================
export const useRevertFeeTransaction = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (payload: RevertReceiptParams) => {
      try {
        checkPermission(currentRole, ["correspondent", "accountant", "principal", "administrator"]);

        const { data } = await Api.put<ApiResponse>('/api/studentrecord/revertreceipt', payload);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to revert fee transaction');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentRecords'] });
    },
  });
};



// ==========================================
// 7. REVERT RECEIPT TRANSACTION
// ==========================================
export const useRevertFeeTransactionv1 = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (payload: RevertReceiptParams) => {
      try {
        checkPermission(currentRole, ["correspondent", "accountant", "principal", "administrator"]);

        const { data } = await Api.put<ApiResponse>('/api/studentrecord/v1/revertreceipt', payload);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to revert fee transaction');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentRecords'] });
    },
  });
};


// ==========================================
// 8. ASSIGN STUDENT TO CLASS
// ==========================================
export const useAssignStudentToClass = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (payload: AssignStudentParams) => {
      try {
        checkPermission(currentRole, ["correspondent", "administrator"]);

        const { data } = await Api.put<ApiResponse>('/api/studentrecord/assign', payload);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to assign student to class');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentRecords'] });
    },
  });
};



// ==========================================
// 8. ASSIGN STUDENT TO CLASS
// ==========================================
export const useAssignStudentToClassV1 = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (payload: AssignStudentParams) => {
      try {
        checkPermission(currentRole, ["correspondent", "administrator", "teacher"]);

        const { data } = await Api.put<ApiResponse>('/api/studentrecord/v1/assign', payload);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to assign student to class');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentRecords'] });
    },
  });
};

// ==========================================
// 9. REMOVE STUDENT FROM CLASS
// ==========================================
export const useRemoveStudentFromClassV1 = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (payload: RemoveStudentParams) => {
      try {
        checkPermission(currentRole, ["correspondent", "administrator"]);

        const { data } = await Api.put<ApiResponse>('/api/studentrecord/v1/remove', payload);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to remove student from class');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentRecords'] });
    },
  });
};

// ==========================================
// 10. TOGGLE STUDENT RECORD STATUS
// ==========================================
export const useToggleStudentRecordStatus = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async ({ studentId, isActive, academicYear }: ToggleStatusParams) => {
      try {
        // Note: backend lists "administrator" twice in multiRoleAuth.
        checkPermission(currentRole, ["administrator", "correspondent", "accountant"]);

        const { data } = await Api.patch<ApiResponse>(`/api/studentrecord/v1/togglestatus/${studentId}`, { isActive, academicYear });

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to toggle student record status');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentRecords'] });
    },
  });
};

// ==========================================
// 11. DELETE STUDENT RECORD
// ==========================================
export const useDeleteStudentRecord = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        checkPermission(currentRole, ["correspondent", "administrator"]);

        const { data } = await Api.delete<ApiResponse>(`/api/studentrecord/deleterecord/${id}`);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to delete student record');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentRecords', 'list'] });
    },
  });
};