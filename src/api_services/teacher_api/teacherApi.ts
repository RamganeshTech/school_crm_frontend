import { useMutation, useQuery } from '@tanstack/react-query';
import { Api } from '../../lib/api';
// import { checkPermission } from '../../utils/rbac';
// import { queryClient } from '../../lib/queryClient';
// import { type UserRole } from '../auth/authSlice';
import { useAuthData } from '../../hooks/useAuthData';
import { type UserRole } from '../../features/slices/authSlice';
import { checkPermission } from '../../utils/utils';
import { queryClient } from '../../lib/queryClient';

// --- Constants for Role Arrays ---
const READ_ROLES: UserRole[] = ["correspondent", "administrator", "accountant", "teacher", "principal", "viceprincipal"];
const MANAGE_ASSIGNMENTS_ROLES: UserRole[] = ["correspondent", "administrator"];

// --- Types ---
interface BaseResponse {
  ok: boolean;
  message?: string;
}

// Structure for the Get All Classes/Sections response
export interface SectionDetail {
  _id: string;
  name: string;
}

export interface ClassWithSections {
  _id: string;
  name: string;
  hasSections: boolean;
  sections: SectionDetail[];
}

interface GetAllClassesWithSectionsResponse extends BaseResponse {
  data: ClassWithSections[];
}

// Structure for the Assignment Mutation
export interface AssignmentUpdate {
  classId: string;
  sectionId?: string; // Optional: If omitted, triggers "Select All" / "Deselect All" logic
}

interface ManageAssignmentsParams {
  teacherId: string;
  updates: AssignmentUpdate[];
}

interface GetClassesWithSectionsParams {
  schoolId: string;
}

// --- Hook 1: Get All Classes with nested Sections (For the UI Tree) ---
export const useGetAllClassesWithSections = ({ schoolId }: GetClassesWithSectionsParams) => {
  const { currentRole } = useAuthData();

  return useQuery({
    queryKey: ['classesWithSections', schoolId],
    queryFn: async () => {
      try {
        checkPermission(currentRole, READ_ROLES);

        const { data } = await Api.get<GetAllClassesWithSectionsResponse>('/api/teacher/getall/class/section', {
          params: { schoolId }
        });

        if (data.ok) {
          return data.data;
        } else {
          throw new Error(data.message || 'Failed to fetch classes and sections structure');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    enabled: !!schoolId,
  });
};

// --- Hook 2: Manage Teacher Assignments (The Toggle Switch Logic) ---
export const useManageTeacherAssignments = () => {
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (assignmentData: ManageAssignmentsParams) => {
      try {
        // Only Admins/Correspondents can manage assignments
        checkPermission(currentRole, MANAGE_ASSIGNMENTS_ROLES);

        const { data } = await Api.post<BaseResponse>('/api/teacher/assignments/manage', assignmentData);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to update teacher assignments');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific teacher's profile so their updated assignments are fetched immediately
      queryClient.invalidateQueries({ queryKey: ['user', variables.teacherId] });
      // Depending on your UI, you might also want to invalidate sections to reflect new teacher assignments
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
};