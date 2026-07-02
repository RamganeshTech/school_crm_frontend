import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthData } from '../../hooks/useAuthData';
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';


// --- Types ---
export interface GetAllEmployeeProfilesParams {
    schoolId: string;
    department?: string;
    designation?: string;
    isActive?: boolean | string;
    limit?: number;
    page?: number;
}

export interface IEmployeeProfilePayload {
    userId: string;
    schoolId: string;
    employeeNo?: string;
    designation?: string;
    department?: string;
    dateOfJoining?: string | Date;
    employmentType?: string;
    nationalId?: string;
    pfNumber?: string;
    // qualifications?: string[];
    educationDetails: {
        degree?: string | null;
        institution?: string | null;
        yearOfPassing?: string | null;
        grade?: string | null
    }[]
    currentAddress: string
    permanentAddress: string

    aadharNumber: string

    yearsOfExperience?: number;
    previousWorkplace?: string;
    bankDetails?: {
        accountName?: string;
        accountNumber?: string;
        bankName?: string;
        ifscCode?: string;
    };
    emergencyContact?: {
        name?: string;
        relation?: string;
        phone?: string;
    };
    isActive?: boolean;
}

// ==========================================
// 1. QUERIES (GET)
// ==========================================

// --- Hook: Get All Employee Profiles (Infinite / Paginated) ---
export const useGetAllEmployeeProfilesInfinite = (params: Omit<GetAllEmployeeProfilesParams, 'page'>) => {
    const { currentRole } = useAuthData();

    return useInfiniteQuery({
        queryKey: ['employee-profiles-infinite', params],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            try {
                // Roles match your backend route
                checkPermission(currentRole, ["correspondent", "administrator", "principal", "viceprincipal", "accountant", "teacher"]);

                const { data } = await Api.get('/api/employee-profile/getall', {
                    params: { ...params, page: pageParam }
                });

                if (data.ok) {
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to fetch employee profiles');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        getNextPageParam: (lastPage) => {
            // Using the pagination logic exactly as requested
            const currentPage = Number(lastPage?.pagination?.currentPage) || 1;
            const totalPages = Number(lastPage?.pagination?.totalPages) || 1;

            if (currentPage < totalPages) {
                return currentPage + 1; // There is a next page
            }
            return undefined; // No more pages
        },
        enabled: !!params.schoolId, // Only fetch if schoolId is available
    });
};

// --- Hook: Get Single Profile By User ID ---
export const useGetEmployeeProfileByUserId = (userId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['employee-profile-single', userId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "principal", "viceprincipal", "accountant", "teacher"]);

                const { data } = await Api.get(`/api/employee-profile/get/${userId}`);

                if (data.ok) {
                    return data.data;
                } else {
                    throw new Error(data.message || 'Failed to fetch employee profile details');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        enabled: !!userId,
    });
};


// ==========================================
// 2. MUTATIONS (POST / PUT / DELETE)
// ==========================================

// --- Hook: Create Employee Profile ---
export const useCreateEmployeeProfile = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: IEmployeeProfilePayload | FormData) => {
            try {
                // Admins/Correspondents only
                checkPermission(currentRole, ["correspondent", "administrator", "teacher", "principal", "viceprincipal", "accountant",]);

                const { data } = await Api.post('/api/employee-profile/create', payload);

                if (!data.ok) throw new Error(data.message || 'Failed to create employee profile');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => {
            // Invalidate the infinite list so it refetches new data
            queryClient.invalidateQueries({ queryKey: ['employee-profiles-infinite'] });
        },
    });
};

// --- Hook: Update Employee Profile ---
export const useUpdateEmployeeProfile = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, updateData }: { userId: string; updateData: Partial<IEmployeeProfilePayload> }) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "teacher", "principal", "viceprincipal", "accountant",]);

                const { data } = await Api.put(`/api/employee-profile/update/${userId}`, updateData);

                if (!data.ok) throw new Error(data.message || 'Failed to update employee profile');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate both the list and the specific user's detail query
            queryClient.invalidateQueries({ queryKey: ['employee-profiles-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['employee-profile-single', variables.userId] });
        },
    });
};

// --- Hook: Soft Delete Employee Profile ---
export const useDeleteEmployeeProfile = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator"]);

                const { data } = await Api.delete(`/api/employee-profile/delete/${userId}`);

                if (!data.ok) throw new Error(data.message || 'Failed to delete employee profile');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employee-profiles-infinite'] });
        },
    });
};


// --- Hook: Add Documents to Existing Employee Profile ---
export const useAddEmployeeDocuments = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, files }: { userId: string; files: File[] }) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "teacher", "principal", "viceprincipal", "accountant",]);

                const formData = new FormData();
                files.forEach((file) => formData.append("files", file));

                const { data } = await Api.post(`/api/employee-profile/${userId}/documents`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (!data.ok) throw new Error(data.message || 'Failed to add documents');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employee-profiles-infinite'] });
        },
    });
};

// --- Hook: Delete a Single Employee Document ---
export const useDeleteEmployeeDocument = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, documentId }: { userId: string; documentId: string }) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "teacher", "principal", "viceprincipal", "accountant",]);

                const { data } = await Api.delete(`/api/employee-profile/${userId}/documents/${documentId}`);

                if (!data.ok) throw new Error(data.message || 'Failed to delete document');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employee-profiles-infinite'] });
        },
    });
};


export const useAddSalarySlip = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, amount, salaryDate, file }: { userId: string; amount: number; salaryDate: string; file: File | null }) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "teacher", "principal", "viceprincipal", "accountant",]);

                const formData = new FormData();
                // formData.append("amount", String(amount));
                // formData.append("salaryDate", salaryDate);
                // formData.append("file", file);

                // 🌟 FIX 1: Only append if the value actually exists!
                if (amount) formData.append("amount", String(amount));
                if (salaryDate) formData.append("salaryDate", salaryDate);
                if (file) formData.append("file", file);

                const { data } = await Api.post(`/api/employee-profile/${userId}/salary-slips`, formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }

                );

                if (!data.ok) throw new Error(data.message || 'Failed to add salary slip');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: (_, variables) => {
            // queryClient.invalidateQueries({ queryKey: ['employee-profiles-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['employee-profile-single', variables.userId] });

        },
    });
};

export const useDeleteSalarySlip = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, slipId }: { userId: string; slipId: string }) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "teacher", "principal", "viceprincipal", "accountant",]);
                const { data } = await Api.delete(`/api/employee-profile/${userId}/salary-slips/${slipId}`);
                if (!data.ok) throw new Error(data.message || 'Failed to delete salary slip');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['employee-profile-single', variables.userId] });
        },
    });
};




// NEW VERSION

export const useUpsertEmployeeProfile = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId, schoolId, fields, documents, salaryAmount, salaryDate, salarySlipFile
        }: {
            userId: string;
            schoolId: string;
            fields?: Record<string, any>;
            documents?: File[];
            salaryAmount?: number;
            salaryDate?: string;
            salarySlipFile?: File;
        }) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "teacher", "principal", "viceprincipal", "accountant",]);

                const formData = new FormData();
                formData.append("schoolId", schoolId);

                if (fields) {
                    Object.entries(fields).forEach(([key, value]) => {
                        if (value === undefined || value === null) return;
                        formData.append(key, typeof value === "object" ? JSON.stringify(value) : value as string);
                    });
                }

                if (documents) {
                    documents.forEach((file) => formData.append("documents", file));
                }

                if (salaryAmount !== undefined) formData.append("salaryAmount", String(salaryAmount));
                if (salaryDate !== undefined) formData.append("salaryDate", salaryDate);
                if (salarySlipFile) formData.append("salarySlipFile", salarySlipFile);

                const { data } = await Api.post(`/api/employee-profile/${userId}/upsert`, formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                if (!data.ok) throw new Error(data.message || 'Failed to save profile');
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employee-profiles-infinite'] });
        },
    });
};