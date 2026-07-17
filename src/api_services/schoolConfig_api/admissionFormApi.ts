import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Api } from '../../lib/api'; // Adjust path
import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
import { checkPermission } from '../../utils/utils';
// import { checkPermission } from '../../utils/permissionUtils'; // Adjust path


// --- Interfaces ---
// This matches the schema we built earlier
export interface SubmitPublicAdmissionParams {
    id: string
    // schoolId: string;
    // academicYear: string;

    // Student Details
    studentName: string;
    mobileNumber: string;
    dob: string | Date;
    age: number | string; // 🌟 Changed to allow string since the input field sends a string
    gender: string;
    motherTongue: string;
    religion: string;
    community: string;
    emisNumber?: string;

    // Addresses
    currentAddress: string;
    permanentAddress: string;

    // Parent Details
    fatherName: string;
    fatherEducation: string;
    fatherOccupation: string;
    motherName: string;
    motherEducation: string;
    motherOccupation: string;

    // Academic Details
    examinationPassed: string;
    admissionSoughtFor: string;
}

// --- Interfaces ---
export interface DeleteAdmissionFormParams {
    id: string;
    schoolId: string; // Needed to invalidate the correct cache
}

export interface AdmissionFilterParams {
    schoolId: string;
    academicYear: string;
    admissionBookId?:string
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    limit: string
}

// --- Hook 1: Get All Forms (INFINITE SCROLL) ---
export const useGetInfiniteAdmissionForms = (filters: AdmissionFilterParams) => {
    const { currentRole } = useAuthData();

    return useInfiniteQuery({
        // Include all filters in the queryKey so it resets when filters change
        queryKey: ['admissionForms', filters],
        queryFn: async ({ pageParam = 1 }) => {
            checkPermission(currentRole, ["correspondent", "administrator", "principal"]);

            // Build query string dynamically
            const params = new URLSearchParams({
                academicYear: filters.academicYear,
                page: pageParam.toString(),
                limit: filters.limit
            });

            if (filters.status && filters.status !== 'All') params.append('status', filters.status);
            if (filters.search) params.append('search', filters.search);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const { data } = await Api.get(`/api/school/admission-form/${filters.schoolId}?${params.toString()}`);

            if (!data.ok) throw new Error(data.message);
            return data.data; // { forms, totalPages, hasNextPage, etc. }
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
        },
        enabled: !!filters.schoolId && !!filters.academicYear,
    });
};

// --- Hook 2: Get Single Admission Form Details ---
export const useGetSingleAdmissionForm = ({ formId, studentId = undefined }: { formId: string | undefined, studentId?: string | undefined }) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['singleAdmissionForm', formId, studentId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "principal"]);


                // const params = new URLSearchParams({
                //     formId: formId,
                //     studentId: studentId
                // });

                // 🌟 FIX 1: Safely append query strings only if they exist to avoid sending "undefined" as a string
                const params = new URLSearchParams();

                // 🌟 FIX 2: Use 'id' instead of 'formId' to match your backend destructuring -> const { id, studentId } = req.query;
                if (formId) params.append('id', formId);
                if (studentId) params.append('studentId', studentId);



                const { data } = await Api.get(`/api/school/admission-form/form?${params.toString()}`);

                if (data.ok) {
                    return data.data;
                } else {
                    throw new Error(data.message || 'Failed to fetch the admission form');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        enabled: !!formId || !!studentId,
        retry: false
    });
};

interface DropdownParams {
    schoolId: string;
    academicYear?: string;
    search?: string;
}

// --- Hook: Get Lightweight Dropdown Data ---
export const useGetAdmissionFormsDropdown = (params: DropdownParams) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['admissionFormsDropdown', params.schoolId, params.academicYear, params.search],
        queryFn: async () => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "principal"]);

                const queryParams = new URLSearchParams({
                    schoolId: params.schoolId,
                    // academicYear: params.academicYear,
                });
                if (params.search) queryParams.append('search', params.search);

                const { data } = await Api.get(`/api/school/admission-form/dropdown?${queryParams.toString()}`);

                if (data.ok) return data.data;
                throw new Error(data.message);
            } catch (error: any) {
                throw new Error(error.response?.data?.message || error.message);
            }
        },
        enabled: !!params.schoolId && !!params.academicYear,
    });
};

// --- Hook: Submit Public Admission Form ---
export const useSubmitPublicAdmissionForm = () => {
    return useMutation({
        mutationFn: async (params: SubmitPublicAdmissionParams) => {
            try {
                // Notice: No checkPermission() here. This is public!
                // const { data } = await Api.post(`/api/public/admissions/submit/${params.id}`, params);

                // 🌟 FIX 2: We don't need to pass `id` inside the body, so we separate it
                const { id, ...bodyData } = params;

                const { data } = await Api.put(`/api/school/admission-form/admissions/submit/${id}`, bodyData);

                if (data.ok) {
                    return data; // Returns the success message and generated formNumber
                } else {
                    throw new Error(data.message || 'Failed to submit admission form.');
                }
            } catch (error: any) {
                // Handles the 409 duplicate sequence error gracefully
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.';
                throw new Error(errorMessage);
            }
        }
    });
};


// --- Hook: Generate Admission Link (Admin) ---
export const useGenerateAdmissionLink = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ schoolId }: { schoolId: string }) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "principal"]);

                const { data } = await Api.post(`/api/school/admission-form/generate-link`, { schoolId });

                if (data.ok) {
                    return data; // Returns { id, formNumber }
                } else {
                    throw new Error(data.message || 'Failed to generate link');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate to update the list of generated forms
            queryClient.invalidateQueries({ queryKey: ['admissionForms', variables.schoolId] });
        },
    });
};

// --- Hook 3: Delete Admission Form ---
export const useDeleteAdmissionForm = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }: DeleteAdmissionFormParams) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "principal"]);

                const { data } = await Api.delete(`/api/school/admission-form/${id}`);

                if (data.ok) {
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to delete admission form');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            // Instantly refresh the forms table
            queryClient.invalidateQueries({ queryKey: ['admissionForms', variables.schoolId] });
        },
    });
};


// --- Interfaces ---
export interface UpdateStatusParams {
    id?: string;
    studentId?: string;
    schoolId: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export const useUpdateAdmissionFormStatus = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, studentId, status }: UpdateStatusParams) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "principal"]);

                const params = new URLSearchParams();
                if (id) params.append('id', id);
                if (studentId) params.append('studentId', studentId);

                const { data } = await Api.patch(`/api/school/admission-form/status?${params.toString()}`, { status });

                if (!data.ok) throw new Error(data.message);
                return data;
            } catch (error: any) {
                throw new Error(error.response?.data?.message || error.message);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admissionForms'] });
            queryClient.invalidateQueries({ queryKey: ['singleAdmissionForm', variables.id, variables.studentId] });
        },
    });
};

export interface UpdateDetailsParams {
    id?: string;
    studentId?: string;
    schoolId: string;
    formData: any; // Or use your AdmissionFormData interface
}

// --- Hook: Update Form Details (Admin Edit) ---
export const useUpdateAdmissionFormDetails = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, studentId, formData }: UpdateDetailsParams) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "principal"]);

                const params = new URLSearchParams();
                if (id) params.append('id', id);
                if (studentId) params.append('studentId', studentId);

                const { data } = await Api.put(`/api/school/admission-form/details?${params.toString()}`, formData);

                if (!data.ok) throw new Error(data.message);
                return data;
            } catch (error: any) {
                throw new Error(error.response?.data?.message || error.message);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admissionForms', variables.schoolId] });
            queryClient.invalidateQueries({ queryKey: ['singleAdmissionForm', variables.id, variables.studentId] });
        },
    });
};


// --- Interfaces ---
export interface LinkStudentParams {
    id: string; // The form ID
    schoolId: string; // Needed to refresh the correct cache
    studentId: string; // The ID of the student being linked
}

// --- Hook 5: Link Student to Admission Form ---
export const useLinkStudentToForm = () => {
    const { currentRole } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, studentId }: LinkStudentParams) => {
            try {
                checkPermission(currentRole, ["correspondent", "administrator", "principal"]);

                const { data } = await Api.patch(`/api/school/admission-form/${id}/link-student`, { studentId });

                if (data.ok) {
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to link student');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        onSuccess: (_, variables) => {
            // Instantly refresh the main list AND the single form view so the UI stays in sync
            queryClient.invalidateQueries({ queryKey: ['admissionForms', variables.schoolId] });
            queryClient.invalidateQueries({ queryKey: ['singleAdmissionForm', variables.studentId, ] });
        },
    });
};



