import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetSingleUser } from '../../api_services/auth_api/authApi';
import { Button } from '../../shared/ui/Button';
import { useGetAllClassesWithSections, useManageTeacherAssignments, type ClassWithSections, } from '../../api_services/teacher_api/teacherApi';
import { toast } from '../../shared/ui/ToastContext';
import { useRoleCheck } from '../../hooks/useRoleCheck';


// Type for the queued updates
type AssignmentUpdate = {
    classId: string;
    sectionId?: string;
};

export default function TeacherAssignmentSingle() {
    const { id: teacherId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { schoolId } = useAuthData();
    const { isAdmin, isCorrespondent } = useRoleCheck()
    const canModify = isAdmin || isCorrespondent


    // --- State ---
    const [pendingUpdates, setPendingUpdates] = useState<AssignmentUpdate[]>([]);

    // --- Queries & Mutations ---
    // Fetch the specific teacher (includes populated assignments)
    const { data: teacherData, isLoading: isLoadingTeacher } = useGetSingleUser(teacherId);

    // Fetch the class structure
    const { data: classesData, isLoading: isLoadingClasses } = useGetAllClassesWithSections({ schoolId: schoolId! });

    // Mutation to save changes
    const manageAssignmentMutation = useManageTeacherAssignments();

    const teacher = teacherData;
    const classes: ClassWithSections[] = classesData || [];

    // ============================================================================
    // THE SIMULATOR: Accurately mirrors backend logic locally
    // Pre-fills data from the backend, then applies pending UI clicks.
    // ============================================================================
    const simulatedAssignments = useMemo(() => {
        if (!teacher) return [];

        // 1. Normalize backend data: 
        // Backend populates classId and sectionId as objects: { _id, name }. We map them to flat strings.
        let current = (teacher.assignments || []).map((a: any) => ({
            classId: typeof a.classId === 'object' && a.classId !== null ? String(a.classId._id) : String(a.classId),
            sectionId: a.sectionId
                ? (typeof a.sectionId === 'object' ? String(a.sectionId._id) : String(a.sectionId))
                : undefined
        }));

        // 2. Apply queued UI updates (Scenarios 1-4)
        for (const update of pendingUpdates) {
            if (!update.sectionId) {
                // BULK CLASS TOGGLE (Scenarios 3 & 4)
                const hasAny = current.some((a: any) => a.classId === update.classId);

                if (hasAny) {
                    // Scenario 4: Remove all sections of this class
                    current = current.filter((a: any) => a.classId !== update.classId);
                } else {
                    // Scenario 3: Add all sections of this class
                    const cls = classes.find(c => c._id === update.classId);
                    if (cls) {
                        if (cls.hasSections) {
                            cls.sections.forEach(s => {
                                if (!current.some((a: any) => a.classId === cls._id && String(a.sectionId) === String(s._id))) {
                                    current.push({ classId: cls._id, sectionId: s._id });
                                }
                            });
                        } else {
                            current.push({ classId: cls._id });
                        }
                    }
                }
            } else {
                // SINGLE SECTION TOGGLE (Scenarios 1 & 2)
                const idx = current.findIndex((a: any) => a.classId === update.classId && String(a.sectionId) === String(update.sectionId));
                if (idx !== -1) {
                    // Scenario 2: Remove specific
                    current.splice(idx, 1);
                } else {
                    // Scenario 1: Add specific
                    current.push({ classId: update.classId, sectionId: update.sectionId });
                }
            }
        }
        return current;
    }, [teacher, pendingUpdates, classes]);

    // --- Handlers ---
    const handleToggle = (classId: string, sectionId?: string) => {
        if(!canModify) return toast.warning("only administrator and correspondent can make the modification")
        setPendingUpdates(prev => {
            const payload: AssignmentUpdate = { classId };
            if (sectionId) payload.sectionId = sectionId;
            return [...prev, payload];
        });
    };

    const handleSave = async () => {
        if (pendingUpdates.length === 0) return;

        try {
            await manageAssignmentMutation.mutateAsync({
                teacherId: teacherId!,
                updates: pendingUpdates
            });
            // Clear queue on success. 
            // The mutation's onSuccess will refetch the teacher query, naturally updating the UI.
            setPendingUpdates([]);
            toast.success("Assinged Successfully!");

        } catch (error: any) {
            console.error("Save failed:", error);
            toast.error(error.message || "Operation Failed");

        }
    };

    // --- Helper Checks for UI Checkboxes ---
    const isSectionAssigned = (classId: string, sectionId: string) => {
        return simulatedAssignments.some((a: any) => a.classId === classId && String(a.sectionId) === String(sectionId));
    };

    const getClassStatus = (cls: ClassWithSections) => {
        const classAssignments = simulatedAssignments.filter((a: any) => a.classId === cls._id);

        if (!cls.hasSections) {
            return { hasAny: classAssignments.length > 0, hasAll: classAssignments.length > 0 };
        }

        const hasAny = classAssignments.length > 0;
        const hasAll = cls.sections.length > 0 && classAssignments.length === cls.sections.length;

        return { hasAny, hasAll };
    };

    // --- Loading & Error States ---
    if (isLoadingTeacher || isLoadingClasses) {
        return <div className="flex w-full h-full justify-center items-center"><i className="fas fa-spinner fa-spin text-3xl text-primary"></i></div>;
    }

    if (!teacher) {
        return <div className="flex w-full h-full justify-center items-center text-danger">Teacher profile could not be loaded.</div>;
    }

    const hasUnsavedChanges = pendingUpdates.length > 0;

    return (
        <div className="w-full h-full flex flex-col bg-background">

            {/* FLAT HEADER */}
            <header className="shrink-0 px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-background z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface border border-transparent hover:border-border text-muted hover:text-foreground transition-all shrink-0"
                    >
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            Assign Classes to <span className="text-primary">{teacher.userName}</span>
                        </h1>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs font-semibold text-muted">
                                {teacher.email || 'No email provided'}
                            </p>
                            {/* Shows the server's truth of total assignments */}
                            <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold">
                                {teacher.assignments?.length || 0} Current Assignments
                            </span>
                        </div>
                    </div>
                </div>

                {canModify && <div className="flex items-center gap-4">
                    {hasUnsavedChanges && (
                        <span className="text-xs font-bold text-warning animate-pulse flex items-center gap-1.5">
                            <i className="fas fa-circle text-[8px]"></i> Unsaved Changes Pending
                        </span>
                    )}
                    <Button
                        variant="primary"
                        leftIcon="fas fa-save"
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges || manageAssignmentMutation.isPending}
                        isLoading={manageAssignmentMutation.isPending}
                    >
                        Save Assignments
                    </Button>
                </div>}
            </header>

            {/* FULL WIDTH LIST */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {classes.length === 0 ? (
                    <div className="text-center py-20 text-muted">No classes available in this school.</div>
                ) : (
                    <div className="divide-y divide-border">
                        {classes.map((cls) => {
                            const { hasAny, hasAll } = getClassStatus(cls);

                            return (
                                <div key={cls._id} className="p-6 hover:bg-surface/30 transition-colors flex flex-col md:flex-row md:items-start gap-6 group">

                                    {/* Left Side: Class Bulk Action */}
                                    <div className="w-full md:w-64 shrink-0">
                                        <label className="flex items-center gap-3 cursor-pointer select-none group-hover:text-primary transition-colors w-fit">
                                            <input
                                                type="checkbox"
                                                className={`w-5 h-5 rounded border-border transition-colors cursor-pointer ${hasAny && !hasAll ? 'accent-warning opacity-70' : 'accent-primary'}`}
                                                checked={hasAny}
                                                onChange={() => handleToggle(cls._id)}
                                            />
                                            <div>
                                                <h3 className="text-base font-bold">{cls.name}</h3>
                                                <p className="text-xs text-muted font-medium mt-0.5">
                                                    {cls.hasSections ? `${cls.sections.length} Sections` : 'Class Only'}
                                                </p>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Right Side: Section Sub-Checkboxes */}
                                    <div className="flex-1">
                                        {cls.hasSections ? (
                                            cls.sections.length === 0 ? (
                                                <p className="text-sm text-muted italic">No sections created for this class.</p>
                                            ) : (
                                                <div className="flex flex-wrap gap-3">
                                                    {cls.sections.map(sec => {
                                                        const isChecked = isSectionAssigned(cls._id, sec._id);
                                                        return (
                                                            <label
                                                                key={sec._id}
                                                                className={`flex items-center gap-2.5 px-4 py-2 border rounded-md cursor-pointer select-none transition-all duration-200 ${isChecked
                                                                    ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                                                                    : 'bg-surface border-border text-foreground hover:border-muted/50'
                                                                    }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                                                                    checked={isChecked}
                                                                    onChange={() => handleToggle(cls._id, sec._id)}
                                                                />
                                                                Section {sec.name}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )
                                        ) : (
                                            <p className="text-sm text-muted flex items-center h-full">
                                                <i className="fas fa-info-circle mr-2"></i> This class does not require section assignments.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}