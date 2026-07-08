import { useMutation, useQuery } from '@tanstack/react-query';
import { Api } from '../../lib/api';
import { type UserRole } from '../../features/slices/authSlice';
import { checkPermission } from '../../utils/utils';
import { queryClient } from '../../lib/queryClient';
import { useAuthData } from '../../hooks/useAuthData';
import { AUTH_CHECK_ROLES } from '../../constants/constants';
// import { Api } from '../lib/api';

interface LoginParams {
  identifier: string; // Can be email or phoneNo
  password: string;
}

interface LoginResponse {
  ok: boolean;
  message: string;
  token: string;
  user: any; // Replace 'any' with your actual User interface
}

const loginUser = async ({ identifier, password }: LoginParams): Promise<LoginResponse> => {
  try {
    const { data } = await Api.post<LoginResponse>('/api/user/login', { identifier, password });

    if (data.ok) {
      return data;
    } else {
      // Handle cases where ok is false but the backend returns a 200 status
      throw new Error(data.message || 'Login failed');
    }
  } catch (error: any) {
    // Extract actual error message from Axios response if available
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    throw new Error(errorMessage, { cause: error });
  }
};

export const useLoginUser = () => {
  return useMutation({
    mutationFn: loginUser,
  });
};


export const useLogoutUser = () => {
  return useMutation({
    mutationFn: async () => {
      try {
        const { data } = await Api.post('/api/user/logout');
        return data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Logout failed';
        throw new Error(errorMessage, { cause: error });
      }
    }
  });
};




// --- Types ---
interface BaseResponse {
  ok: boolean;
  message: string;
}

interface UpdateUserParams {
  userId: string;
  data: {
    email?: string;
    phoneNo?: string;
    userName?: string;
  };
}

// interface UserData {
//   _id: string;
//   userName: string;
//   email: string;
//   phoneNo: string;
//   role: string;
//   schoolId: string;
// }

// interface GetUserResponse extends BaseResponse {
//   user: UserData;
// }


const ALLOWED_ROLES: UserRole[] = AUTH_CHECK_ROLES

// --- 1. Plain Function for useAuthCheck ---
export const fetchAuthSession = async (currentRole: UserRole) => {
  try {
    // Optional: Pre-verify locally if role exists in Redux
    if (currentRole) {
      checkPermission(currentRole, ALLOWED_ROLES);
    }

    const { data } = await Api.get('/api/user/isauthenticated');
    return data;
  } catch (error: any) {
    // throw error.response?.data?.message || error.message || "something went wrong";
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    throw new Error(errorMessage, { cause: error });
  }
};

// --- 2. TanStack Hook (for general use) ---
export const useUserIsAuthenticated = () => {

  const { currentRole } = useAuthData();

  return useQuery({
    queryKey: ['checkAuth'],
    queryFn: async () => {
      try {
        // Pre-check permission before waking up the network
        checkPermission(currentRole, ALLOWED_ROLES);

        const { data } = await Api.get('/api/user/isauthenticated');
        if (data.ok) return data.data;
        throw new Error(data.message || 'Not authenticated');
      } catch (error: any) {
        // throw new Error(error.response?.data?.message || 'Session expired', { cause: error });
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    retry: false,
    enabled: !!currentRole, // Only runs if we have a role
  });
};


// --- Hook: Create User ---
export const useCreateUser = () => {
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (userData: any) => {
      try {
        // Ensure only authorized roles can create users
        checkPermission(currentRole, [
          "correspondent", "administrator",
        ]);

        const { data } = await Api.post<BaseResponse>(`/api/user/v1/create`, userData);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to create user');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    // Replace 'users' with your exact queryKey from useGetAllUsers if different
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-user'] }),
  });
};


// --- Hook 1: Update User (Mutation) ---
export const useUpdateUser = () => {
  const { currentRole } = useAuthData();
  return useMutation({
    mutationFn: async ({ userId, data: updateData }: UpdateUserParams) => {
      try {
        checkPermission(currentRole, [
          "correspondent", "teacher", "principal", "parent", "accountant", "administrator", "viceprincipal"
        ]);

        const { data } = await Api.put<BaseResponse>(`/api/user/update/${userId}`, updateData);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Update failed');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
  });
};


export const useUpdateProfileImage = () => {

  return useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      try {
        // 1. We MUST use FormData to send files to the backend via Multer
        const formData = new FormData();
        
        // "file" MUST match the field name expected by your backend Multer middleware (e.g., upload.single('file'))
        formData.append("file", file); 

        // 2. Make the PUT request with the correct headers
        const { data } = await Api.put(`/api/user/update-profile-img/${userId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (data.ok) return data;
        throw new Error(data.message || 'Image upload failed');
        
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate the user query so the new image fetches immediately
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
  });
};

// --- Hook 2: Get Single User (Query) ---
export const useGetSingleUser = (userId: string | undefined) => {

  console.log("userDid frms nslkdfhslkdfj", userId)
  const { currentRole } = useAuthData();
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      try {

        checkPermission(currentRole, [
          "correspondent", "teacher", "principal", "administrator", "viceprincipal", "parent", "accountant"
        ]);

        const { data } = await Api.get(`/api/user/${userId}`);


        if (data.ok) {
          return data.data;
        } else {
          throw new Error(data.message || 'Failed to fetch user');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    enabled: !!userId,
  });
};


// --- Hook 6: Get all User (Query) ---
export const useGetAllUsers = ({ role, schoolId }: { role: string, schoolId: string }) => {
  const { currentRole } = useAuthData();
  return useQuery({
    queryKey: ['all-user', schoolId, role],
    queryFn: async () => {
      try {

        checkPermission(currentRole, [
          "correspondent", "teacher", "principal", "administrator", "viceprincipal", "parent", "accountant"
        ]);

        const { data } = await Api.get(`/api/user/${role}/${schoolId}`);

        if (data.ok) {
          return data.data;
        } else {
          throw new Error(data.message || 'Failed to fetch user');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    enabled: !!role && !!schoolId,
  });
};

// --- Hook 3: Assign Role (Mutation - High Security) ---
export const useAssignRole = () => {
  const { currentRole } = useAuthData();
  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: UserRole }) => {
      try {
        checkPermission(currentRole, ["correspondent", "administrator"]);

        const { data } = await Api.put<BaseResponse>(`/api/user/assignrole/${userId}`, { role: newRole });

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Role assignment failed');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['all-user'] });

    },
  });
};






// --- Hook: Create User ---
export const useDeleteUser = () => {
  const { currentRole } = useAuthData();

  return useMutation({
    mutationFn: async (userId: string) => {
      try {
        // Ensure only authorized roles can create users
        checkPermission(currentRole, [
          "correspondent", "administrator"
        ]);

        const { data } = await Api.delete(`/api/user/delete/${userId}`);

        if (data.ok) {
          return data;
        } else {
          throw new Error(data.message || 'Failed to create user');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    // Replace 'users' with your exact queryKey from useGetAllUsers if different
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-user'] }),
  });
};



// --- REQUEST FORGOT PASSWORD HOOK ---
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      try {
        const { data } = await Api.post(`/api/user/forgot-password`, { email });
        return data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    }
  });
};

// --- EXECUTE RESET PASSWORD HOOK ---
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({ id, token, newPassword, confirmPassword }: any) => {
      try {
        const { data } = await Api.post(`/api/user/reset-password/${id}/${token}`, {
          newPassword,
          confirmPassword
        });
        return data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    }
  });
};


export interface AssociatedStudentsResponse {
  ok: boolean;
  message: string;
  // Assuming your endpoint returns an array of student objects or strings
  data: any[];
}

export const useGetParentStudents = ({userId}:{userId:string}) => {
  const { currentRole } = useAuthData();

  return useQuery({
    // Unique cache key tied to the parent's user ID
    queryKey: ['parent-associated-students', userId],
    queryFn: async () => {
      try {
        checkPermission(currentRole, ["correspondent", "administrator", "parent"]);

        const { data } = await Api.get<AssociatedStudentsResponse>(
          `/api/user/associated-students/get/${userId}`
        );
        if (data.ok) return data.data;
        throw new Error(data.message || 'Failed to load associated students');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    // Performance optimization: Only execute if user is logged in as a parent
    enabled: !!userId,
    // staleTime: 10 * 60 * 1000, // Cache student links for 10 minutes (it rarely changes)
  });
};



