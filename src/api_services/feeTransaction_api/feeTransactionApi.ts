import { useQuery } from '@tanstack/react-query';
import { useAuthData } from '../../hooks/useAuthData';
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';




// ==========================================
// TYPES & INTERFACES (Mapped from Backend Schema)
// ==========================================

export interface Denomination {
    label: string;
    count: number;
}

export interface FeeHeadAllocation {
    _id?: string;
    feeHead: string | null;
    amount: number;
}

export interface TransactionUpload {
    _id?: string;
    type: "image" | "pdf" | "video";
    key?: string;
    url?: string;
    originalName?: string;
    uploadedAt: string; // Dates are returned as ISO strings in JSON
}

export interface FeeTransaction {
    _id: string;
    schoolId: string;
    studentId: string;
    recordId: string;
    academicYear: string | null;
    receiptNo: string;
    paymentDate: string;
    paymentMode: "cash" | "upi" | "cheque" | "bank_transfer";
    amountPaid: number;
    allocation: FeeHeadAllocation[];
    cashDenominations: Denomination[];
    proofUpload: TransactionUpload[];
    referenceNumber?: string;
    bankName?: string;
    chequeDate?: string;
    collectedBy: string; // Will be string (ID) unless populated by backend
    remarks?: string;
    status: "success" | "cancelled" | "bounced" | "pending" | "draft";
    createdAt: string;
    updatedAt: string;
}

// API Response Types
export interface GetAllFeeTransactionsResponse {
    ok: boolean;
    message?: string;
    data: FeeTransaction[];
}

export interface GetFeeTransactionByIdResponse {
    ok: boolean;
    message?: string;
    data: FeeTransaction;
}

// ==========================================
// HOOK 1: GET ALL TRANSACTIONS BY RECORD ID
// ==========================================
export const useGetAllFeeTransactions = (studentId: string | undefined) => {
    const { currentRole } = useAuthData();

    return useQuery({
        // The query key depends on the studentRecordId so it caches/refetches per student
        queryKey: ['feeTransactions', 'list', studentId],
        queryFn: async () => {
            try {
                // Access control mirroring the backend route
                checkPermission(currentRole, [
                    "correspondent", "administrator", "principal", "viceprincipal", "accountant", "parent"
                ]);

                // Passing the studentRecordId as a query parameter.
                // NOTE: Make sure your backend controller uses req.query.recordId (or studentRecordId) to filter!
                const { data } = await Api.get<GetAllFeeTransactionsResponse>(`/api/fee/receipt/getall`, {
                    params: { studentId: studentId } 
                });

                if (data.ok) {
                    return data.data;
                } else {
                    throw new Error(data.message || 'Failed to fetch fee transactions');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        // Only run this query if the record ID is actually present in the URL
        enabled: !!studentId,
    });
};

// ==========================================
// HOOK 2: GET SINGLE TRANSACTION BY ID
// ==========================================
export const useGetFeeTransactionById = (transactionId: string | null) => {
    const { currentRole } = useAuthData();

    return useQuery({
        queryKey: ['feeTransaction', 'single', transactionId],
        queryFn: async () => {
            try {
                // Access control mirroring the backend route
                checkPermission(currentRole, [
                    "correspondent", "administrator", "principal", "viceprincipal", "accountant", "parent"
                ]);

                const { data } = await Api.get<GetFeeTransactionByIdResponse>(`/api/fee/receipt/get/${transactionId}`);

                if (data.ok) {
                    return data.data;
                } else {
                    throw new Error(data.message || 'Failed to fetch the fee transaction details');
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage);
            }
        },
        // Only fetch when a transaction is explicitly clicked/selected
        enabled: !!transactionId, 
    });
};