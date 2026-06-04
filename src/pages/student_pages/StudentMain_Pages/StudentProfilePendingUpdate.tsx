import React, { useState } from 'react';
import { useAuthData } from '../../../hooks/useAuthData';
import { useGetPendingRequestsForStudent, useReviewProfileUpdateRequest } from '../../../api_services/student_api/studentProfileUpdateApi';
import { Button } from '../../../shared/ui/Button';
import { toast } from '../../../shared/ui/ToastContext';

interface Props {
    studentId: string;
}

// Helper to convert camelCase keys (like 'mobileNumber') to readable 'Mobile Number'
const formatFieldLabel = (key: string) => {
    const result = key.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
};

export const StudentProfilePendingUpdate: React.FC<Props> = ({ studentId }) => {
    const { currentRole } = useAuthData();
    const isParent = currentRole === 'parent';

    // Queries & Mutations
    const { data: requests, isLoading, isError } = useGetPendingRequestsForStudent(studentId);


    // const isLoading = false;
    // const isError = false;
    // const requests = [
    //     {
    //         _id: "req_001",
    //         studentId: studentId,
    //         status: "pending",
    //         createdAt: "2026-05-28T10:30:00.000Z",
    //         changes: {
    //             fatherName: "Rajesh Kumar Sharma",
    //             mobileNumber: "9876543210"
    //         },
    //         previousValues: {
    //             fatherName: "Rajesh Sharma",
    //             mobileNumber: "9876543200"
    //         },
    //         section: {
    //             fatherName: "mandatory",
    //             mobileNumber: "mandatory"
    //         }
    //     },
    //     {
    //         _id: "req_002",
    //         studentId: studentId,
    //         status: "pending",
    //         createdAt: "2026-05-27T14:15:00.000Z",
    //         changes: {
    //             bloodGroup: "O+",
    //             address: "123, New Anna Nagar, Madurai, Tamil Nadu 625020"
    //         },
    //         previousValues: {
    //             bloodGroup: "", // Testing how the UI handles empty old values
    //             address: "12, Anna Nagar, Madurai"
    //         },
    //         section: {
    //             bloodGroup: "mandatory",
    //             address: "mandatory"
    //         }
    //     },
    //     {
    //         _id: "req_003",
    //         studentId: studentId,
    //         status: "pending",
    //         createdAt: "2026-05-26T09:00:00.000Z",
    //         changes: {
    //             heightInCm: "145",
    //             weightInKg: "42",
    //             participatedInActivities: "State Level Chess Tournament"
    //         },
    //         previousValues: {
    //             heightInCm: "140",
    //             weightInKg: "39",
    //             participatedInActivities: "None"
    //         },
    //         section: {
    //             heightInCm: "nonMandatory",
    //             weightInKg: "nonMandatory",
    //             participatedInActivities: "nonMandatory"
    //         }
    //     }
    // ];

    const reviewMutation = useReviewProfileUpdateRequest();

    // Local state to track review notes for specific requests
    const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

    const handleReview = async (requestId: string, action: 'approved' | 'rejected') => {
        const note = reviewNotes[requestId] || "";

        if (!window.confirm(`Are you sure you want to ${action.toUpperCase()} this request?`)) return;

        try {
            await reviewMutation.mutateAsync({
                requestId,
                action,
                reviewNote: note
            });
            toast.success(`Profile update ${action} successfully!`);
        } catch (error: any) {
            toast.error(error.message || `Failed to ${action} request`);
        }
    };

    const handleNoteChange = (requestId: string, value: string) => {
        setReviewNotes(prev => ({ ...prev, [requestId]: value }));
    };

    // if (isLoading) {
    //     return (
    //         <div className="flex justify-center items-center p-8 bg-surface rounded-xl border border-border">
    //             <Spinner className="text-primary text-2xl" /> 
    //         </div>
    //     );
    // }
    
    if (isLoading) return <div className="flex-1 flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-3xl text-primary"></i>
        </div>;


    if (isError) {
        return (
            <div className="p-6 bg-danger/10 text-danger border border-danger/20 rounded-xl text-sm">
                <i className="fas fa-exclamation-triangle mr-2"></i> Failed to load pending requests.
            </div>
        );
    }

    if (!requests || requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-surface rounded-xl border border-border shadow-sm text-muted">
                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-3">
                    <i className="fas fa-check-circle text-2xl opacity-50"></i>
                </div>
                <h4 className="text-foreground font-semibold">No Pending Updates</h4>
                <p className="text-sm mt-1">This student's profile is fully up to date.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {requests.map((request: any) => {
                const changes = request.changes || {};
                const previousValues = request.previousValues || {};
                
                return (
                    <div key={request._id} className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden animate-in fade-in duration-300">
                        
                        {/* --- CARD HEADER --- */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 border-b border-border bg-background/30">
                            <div>
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <i className="fas fa-clock text-warning"></i> Profile Update Request
                                </h3>
                                <p className="text-xs text-muted mt-1">
                                    Requested on: <span className="font-medium text-foreground">{new Date(request.createdAt).toLocaleDateString()}</span>
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-warning/10 text-warning text-xs font-bold rounded-full uppercase tracking-wide w-max">
                                <span className="w-1.5 h-1.5 bg-warning rounded-full animate-pulse"></span>
                                Pending Review
                            </div>
                        </div>

                        {/* --- CHANGES DIFF VIEWER --- */}
                        <div className="p-4 md:p-5">
                            <h4 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wider">Requested Changes</h4>
                            <div className="grid grid-cols-1 gap-3">
                                {Object.keys(changes).map((key) => (
                                    <div key={key} className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg bg-background border border-border gap-2">
                                        
                                        {/* Field Name */}
                                        <div className="text-sm font-medium text-foreground md:w-1/3">
                                            {formatFieldLabel(key)}
                                        </div>

                                        {/* Diff Arrow Section */}
                                        <div className="flex items-center gap-3 md:w-2/3 bg-surface p-2 rounded border border-border/50">
                                            <span className="text-muted line-through text-xs md:text-sm truncate w-[45%] text-right" title={previousValues[key] || 'Empty'}>
                                                {previousValues[key] || <span className="italic opacity-50">Empty</span>}
                                            </span>
                                            
                                            <div className="w-[10%] flex justify-center text-primary">
                                                <i className="fas fa-long-arrow-alt-right"></i>
                                            </div>

                                            <span className="text-success font-semibold text-xs md:text-sm truncate w-[45%]" title={changes[key]}>
                                                {changes[key]}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* --- ACTION FOOTER (Only for Admins) --- */}
                        {!isParent && (
                            <div className="p-4 md:p-5 border-t border-border bg-background/20 flex flex-col sm:flex-row items-end sm:items-center gap-4">
                                <div className="flex-1 w-full">
                                    <input 
                                        type="text" 
                                        placeholder="Add a review note (optional)..." 
                                        className="w-full text-sm bg-surface text-foreground border border-border rounded-lg px-3 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        value={reviewNotes[request._id] || ''}
                                        onChange={(e) => handleNoteChange(request._id, e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Button 
                                        variant="outline" 
                                        className="flex-1 sm:flex-none border-danger text-danger hover:bg-danger/10"
                                        onClick={() => handleReview(request._id, 'rejected')}
                                        isLoading={reviewMutation.isPending}
                                        disabled={reviewMutation.isPending}
                                    >
                                        <i className="fas fa-times mr-2"></i> Reject
                                    </Button>
                                    <Button 
                                        variant="primary" 
                                        className="flex-1 sm:flex-none bg-success hover:bg-success/90 text-white"
                                        onClick={() => handleReview(request._id, 'approved')}
                                        isLoading={reviewMutation.isPending}
                                        disabled={reviewMutation.isPending}
                                    >
                                        <i className="fas fa-check mr-2"></i> Approve
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};