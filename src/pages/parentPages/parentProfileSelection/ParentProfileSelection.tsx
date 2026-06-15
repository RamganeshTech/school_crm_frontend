import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import type { RootState } from '../../../features/store/store';
import { useGetParentStudents } from '../../../api_services/auth_api/authApi';
import { useGetStudentById } from '../../../api_services/student_api/studentMainApi';
import { clearCurrentstudent, setClassId, setSectionId, setStudentId } from '../../../features/slices/activeStudentSlice';
import { useEffect } from 'react';
import { useAuthData } from '../../../hooks/useAuthData';
import { useGetSchoolById } from '../../../api_services/schoolConfig_api/schoolapi';

export default function ParentProfileSelection() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userName: parentName, _id } = useSelector((state: RootState) => state.auth);

    // Get the schoolId from your auth/redux state
    const { schoolId } = useAuthData();

    // Fetch the school details
    const { data: schoolData, isLoading: isSchoolLoading } = useGetSchoolById(schoolId!);

    // Dynamic Fetch: Pull student array directly from specialized
    const { data: studentIds, isLoading: isListLoading, isError } = useGetParentStudents({ userId: _id! });

    const handleProfileSelect = (student: any) => {
        dispatch(setStudentId(student._id));
        dispatch(setClassId(student.currentClassId?._id || student?.currentClassId || null));
        dispatch(setSectionId(student.currentSectionId?._id || student?.currentSectionId || null));
        // navigate(`/dashboard/student/record-profile/${student._id}`);
        navigate(`/dashboard/student/club`);
    };


    useEffect(() => {
        dispatch(clearCurrentstudent());
    }, [dispatch]);

    const isChild = location.pathname.includes("student") || location.pathname.includes("parent")

    if (isChild) {
        return <Outlet />
    }

    return (
        <div className="w-full h-full flex flex-col items-center bg-mainBg p-2 animate-in fade-in duration-500">

            {/* Top Branding Section */}
            <div className="text-center mb-12 space-y-3 max-w-2xl">
                {/* <p className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
                    Academic Workspace Portal
                </p> */}

                {/* --- SCHOOL BRANDING BANNER --- */}
                <div className="shrink-0 bg-surface border border-border rounded-xl shadow-sm p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4 z-10 animate-in fade-in">

                    <div className="flex items-center gap-4 mx-auto">
                        {/* Conditional Logo Rendering */}
                        {schoolData?.logo?.url ? (
                            <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full bg-background border border-border overflow-hidden flex items-center justify-center shadow-sm p-1">
                                <img
                                    src={schoolData.logo.url}
                                    alt={schoolData?.name || "School Logo"}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        // Fallback just in case the URL is broken
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement?.classList.add('bg-primary/10', 'text-primary', 'after:content-["🏫"]', 'after:font-["Font_Awesome_5_Free"]', 'after:font-bold');
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xl shadow-sm">
                                {schoolData?.name?.charAt(0) || <i className="fas fa-school"></i>}
                            </div>
                        )}

                        {/* School Name & Portal Tagline */}
                        <div className="flex flex-col">
                            {isSchoolLoading ? (
                                <div className="h-6 w-48 bg-border/50 rounded animate-pulse mb-1"></div>
                            ) : (
                                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground line-clamp-1">
                                    {schoolData?.name || 'School Portal'}
                                </h1>
                            )}
                            <p className="text-[10px] sm:text-xs font-semibold text-muted tracking-wide mt-0.5">
                                Parent Portal
                            </p>
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-foreground tracking-tight md:text-4xl">
                    Welcome back, {parentName}
                </h1>
                <p className="text-sm text-muted leading-relaxed">
                    Select a student profile to view daily updates, attendance, and fee configurations.
                </p>
            </div>

            {/* Profiles Container Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 max-w-7xl w-full px-4 justify-items-center">
                {isListLoading ? (
                    [1, 2].map((n) => (
                        <div key={n} className="w-full flex flex-col items-center space-y-4">
                            <div className="w-full aspect-[1/1] rounded-3xl bg-surface border border-border flex items-center justify-center shadow-sm">
                                <i className="fas fa-circle-notch fa-spin text-primary opacity-40"></i>
                            </div>
                        </div>
                    ))
                ) : isError || !studentIds || studentIds.length === 0 ? (
                    <div className="text-center p-12 bg-surface border border-border rounded-3xl max-w-md shadow-sm col-span-full">
                        <i className="fas fa-users-slash text-4xl text-muted/40 mb-4"></i>
                        <p className="text-base font-bold text-foreground">No Students Linked</p>
                        <p className="text-sm text-muted mt-1 leading-relaxed">There are currently no child profiles assigned to this account.</p>
                    </div>
                ) : (
                    studentIds.map((id: any) => {
                        const targetId = typeof id === 'object' ? id._id : id;
                        return (
                            <StudentProfileCard
                                key={targetId}
                                studentId={targetId}
                                onSelect={handleProfileSelect}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}

// ==========================================================
// INTERNAL CARD COMPONENT
// ==========================================================
interface CardProps {
    studentId: string;
    onSelect: (student: any) => void;
}

function StudentProfileCard({ studentId, onSelect }: CardProps) {
    const { data: student, isLoading, isError } = useGetStudentById(studentId);

    if (isLoading) {
        return (
            <div className="w-full flex flex-col items-center space-y-4">
                <div className="w-full aspect-[1/1] rounded-3xl bg-surface border border-border flex items-center justify-center shadow-sm">
                    <i className="fas fa-circle-notch fa-spin text-primary opacity-40"></i>
                </div>
                <div className="w-full flex flex-col items-center space-y-2 px-3">
                    <div className="w-full h-5 bg-sub-header rounded animate-pulse" />
                    <div className="w-full h-4 bg-sub-header rounded-md animate-pulse" />
                </div>
            </div>
        );
    }

    if (isError || !student) {
        return (
            <div className="w-full aspect-[1/1] border border-border bg-surface p-6 rounded-3xl flex flex-col items-center justify-center text-center text-xs text-muted space-y-2">
                <i className="fas fa-exclamation-triangle text-2xl text-danger opacity-80"></i>
                <p className="font-semibold text-danger">Profile Unresolved</p>
            </div>
        );
    }

    const fallbackInitial = student.studentName?.charAt(0) || 'S';

    return (
        <button
            onClick={() => onSelect(student)}
            className="group flex flex-col items-center space-y-4 cursor-pointer focus:outline-none w-full max-w-[18rem]"
        >
            {/* The Avatar Container (Flat Layout - Simple Pointer Interactivity) */}
            <div className="relative w-full aspect-[1/1] rounded-3xl bg-surface border-2 border-border shadow-sm overflow-hidden flex items-center justify-center">
                {student.studentImage?.url ? (
                    <img
                        src={student.studentImage.url}
                        alt={student.studentName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-sub-header flex items-center justify-center font-bold text-4xl text-primary uppercase">
                        {fallbackInitial}
                    </div>
                )}
            </div>

            {/* Profile Meta Info Block (High Contrast Fields) */}
            <div className="text-center w-full px-2 space-y-2">
                <h3 className="text-base font-bold text-foreground truncate leading-tight">
                    {student.studentName}
                </h3>

                {/* Meta Details List */}
                <div className="flex flex-col items-center space-y-1 text-xs font-medium text-muted leading-tight">
                    <span className="flex items-center gap-1.5 truncate max-w-full">
                        <i className="fas fa-chalkboard text-primary text-[11px] shrink-0"></i>
                        Class: <span className="text-foreground font-semibold truncate">{student.currentClassId?.name || '--'}</span>
                    </span>
                    <span className="flex items-center gap-1.5 truncate max-w-full">
                        <i className="fas fa-layer-group text-primary text-[11px] shrink-0"></i>
                        Section: <span className="text-foreground font-semibold truncate">{student.currentSectionId?.name || '--'}</span>
                    </span>
                </div>
            </div>
        </button>
    );
}