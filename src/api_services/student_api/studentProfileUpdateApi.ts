import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthData } from '../../hooks/useAuthData';
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';

interface SubmitRequestParams {
  studentId: string;
  schoolId: string;
  changes: Record<string, string>;
  previousValues: Record<string, string>;
  section: Record<string, 'mandatory' | 'nonMandatory'>;
}

// ==========================================
// 1. MUTATION: Parent Submits Profile Update Request
// ==========================================
export const useSubmitProfileUpdateRequest = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (payload: SubmitRequestParams) => {
      try {
        // Enforce that only a parent can submit this form
        checkPermission(currentRole, ["parent"]);

        const { data } = await Api.post('/api/student/request-update', payload);

        if (data.ok) return data;
        throw new Error(data.message || 'Failed to submit profile update request');
      } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || 'An unexpected error occurred');
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate both lists and individual lookups to ensure freshness
      queryClient.invalidateQueries({ queryKey: ['profileUpdates', 'student', variables.studentId] });
    },
  });
};

// ==========================================
// 2. QUERY: Parent Fetches Pending Requests for Their Student
// ==========================================
export const useGetPendingRequestsForStudent = (studentId: string | undefined) => {
  const { currentRole } = useAuthData();

  return useQuery({
    queryKey: ['profileUpdates', 'student', studentId],
    queryFn: async () => {
      try {
        checkPermission(currentRole, ["parent", "correspondent", "administrator", "principal"]);

        const { data } = await Api.get(`/api/student/pending-requests?studentId=${studentId}`);
        
        if (data.ok) return data.data;
        throw new Error(data.message || 'Failed to fetch student profile updates');
      } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message);
      }
    },
    enabled: !!studentId, // Safeguard query execution until data is fully loaded
  });
};


interface ReviewRequestParams {
  requestId: string;
  action: 'approved' | 'rejected';
  reviewNote?: string;
}

// ==========================================
// 3. QUERY: Admin Fetches All Pending Records for School Queue
// ==========================================
export const useGetAllPendingProfileRequests = (schoolId: string | undefined, status: 'pending' | 'approved' | 'rejected' = 'pending') => {
  const { currentRole } = useAuthData();

  return useQuery({
    queryKey: ['profileUpdates', 'schoolQueue', schoolId, status],
    queryFn: async () => {
      try {
        checkPermission(currentRole, ["correspondent", "administrator", "principal"]);

        const { data } = await Api.get(`/api/student/all-pending?schoolId=${schoolId}&status=${status}`);
        
        if (data.ok) return data.data;
        throw new Error(data.message || 'Failed to load verification queue');
      } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message);
      }
    },
    enabled: !!schoolId,
  });
};

// ==========================================
// 4. MUTATION: Admin Approves or Rejects Request
// ==========================================
export const useReviewProfileUpdateRequest = () => {
  const queryClient = useQueryClient();
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async ({ requestId, action, reviewNote }: ReviewRequestParams) => {
      try {
        checkPermission(currentRole, ["correspondent", "administrator", "principal"]);

        const { data } = await Api.put(`/api/student/review-request/${requestId}`, {
          action,
          reviewNote,
        });

        if (data.ok) return data;
        throw new Error(data.message || 'Failed to process profile review decision');
      } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message);
      }
    },
    onSuccess: () => {
      // Clear out global cache contexts so that counters and detail views sync seamlessly
      queryClient.invalidateQueries({ queryKey: ['profileUpdates'] });
      queryClient.invalidateQueries({ queryKey: ['studentRecords'] }); // If global student registry metrics cache exists
    },
  });
};