import React, { useState } from 'react';
import { useNavigate, useParams, useLocation, Outlet } from 'react-router-dom';
import { useAuthData } from '../../../hooks/useAuthData'; // Adjust path
import { useDeleteClubQuiz, useGetAllClubQuizzes } from '../../../api_services/clubs_api/club_quiz_api/clubQuizApi';
import { Button } from '../../../shared/ui/Button';
import CreateQuizModal from './CreateQuizModal';
import AIQuizModal from './AIQuizModal';
import { toast } from '../../../shared/ui/ToastContext';
import { Dropdown } from '../../../shared/ui/Dropdown';
import type { UserRole } from '../../../features/slices/authSlice';
import UpdateQuizModal from './UpdateQuizModal';
import { useRoleCheck } from '../../../hooks/useRoleCheck';
import { useGetSchoolById } from '../../../api_services/schoolConfig_api/schoolapi';
// import { useGetAllClubQuizzes } from '../../../hooks/useClubQuizHooks'; // Adjust path
// import Button from '../../../components/ui/Button'; // Adjust path
// import Spinner from '../../../components/ui/Spinner'; // Adjust path

const CLUB_STAFF_ROLE: UserRole[] = ["correspondent", "administrator", "principal", "viceprincipal", "teacher"]

const ClubQuizMain: React.FC = () => {
    const { id , videoId} = useParams() as { id: string,videoId:string };
    const navigate = useNavigate();
    const location = useLocation();
    const { currentRole, schoolId } = useAuthData();

    const {data} = useGetSchoolById(schoolId!)

    const currentAcademicYear = data?.currentAcademicYear || ""

    const { isAdmin, isCorrespondent, isTeacher } = useRoleCheck()

    const canModify = isAdmin || isCorrespondent || isTeacher

    // Check if a child route (like /attempt/:quizId) is active
    const isChild = location.pathname.includes('/attempt');

    // Roles allowed to create/manage quizzes
    const isStaff: boolean = CLUB_STAFF_ROLE.includes(currentRole!);

    // Modals state (To be implemented later)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [quizToUpdate, setQuizToUpdate] = useState<any>(null);

    // Fetch Quizzes using our React Query Hook
    const { data: response, isLoading, isError } = useGetAllClubQuizzes({ clubId: id , clubVideoId: videoId});
    const quizzes = response?.data || [];
    const deleteQuizMutation = useDeleteClubQuiz(); // 🌟 Initialize the delete hook

    // 🌟 Delete Handler
    const handleDelete = async (quizId: string, quizTitle: string) => {
        if (!window.confirm(`Are you sure you want to delete the quiz "${quizTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteQuizMutation.mutateAsync(quizId);
            toast.success("Quiz deleted successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete quiz");
        }
    };

    // 🌟 Dropdown Menu Generator
    const getDropdownItems = (quiz: any) => [
        {
            label: 'Delete Quiz',
            icon: 'fas fa-trash-alt',
            isDanger: true,
            onClick: () => handleDelete(quiz._id, quiz.title)
        }
    ];

    // 🌟 ROUTING HANDLER: If we are on the Attempt screen, let the Outlet take over entirely.
    if (isChild) {
        return <Outlet />;
    }

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden relative">

            {/* --- HEADER (Using strict CSS variables) --- */}
            <header className="shrink-0 px-4 md:px-6 py-4 md:py-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between bg-surface z-10 shadow-sm gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-border text-muted hover:bg-background transition-colors cursor-pointer"
                        title="Back to Club"
                    >
                        <i className="fas fa-arrow-left text-sm"></i>
                    </button>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-foreground">Club Assessments</h1>
                        <p className="text-xs font-semibold text-muted mt-0.5 tracking-wide uppercase">
                            <i className="fas fa-clipboard-list mr-1.5"></i>
                            {quizzes.length} Quizzes Available
                        </p>
                    </div>
                </div>

                {canModify && (
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <Button
                            variant="outline"
                            leftIcon="fas fa-robot"
                            onClick={() => setIsAIModalOpen(true)}
                            className="cursor-pointer text-xs md:text-sm border-primary text-primary hover:bg-primary/10"
                        >
                            AI Generate
                        </Button>
                        <Button
                            variant="primary"
                            leftIcon="fas fa-plus"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="cursor-pointer text-xs md:text-sm"
                        >
                            Create Quiz
                        </Button>
                    </div>
                )}
            </header>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">

                {isLoading ? (
                    // <div className="flex flex-col items-center justify-center h-40">
                    //     <Spinner className="text-primary text-3xl mb-3" />
                    //     <p className="text-muted text-sm animate-pulse">Loading assessments...</p>
                    // </div>

                    <div className="w-full h-full flex flex-col items-center justify-center bg-background rounded-xl">
                        <i className="fas fa-circle-notch fa-spin text-primary text-3xl mb-4"></i>
                        <p className="text-muted text-sm font-medium">Loading student directory...</p>
                    </div>
                ) : isError ? (
                    <div className="p-4 md:p-6 bg-danger/10 text-danger border border-danger/20 rounded-xl flex items-center gap-3">
                        <i className="fas fa-exclamation-circle text-xl"></i>
                        <p className="text-sm font-medium">Failed to load quizzes. Please try refreshing.</p>
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-surface border border-border rounded-xl shadow-sm">
                        <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4">
                            <i className="fas fa-box-open text-3xl text-muted/50"></i>
                        </div>
                        <h3 className="text-foreground font-bold text-lg">No Quizzes Found</h3>
                        <p className="text-muted text-sm mt-1 max-w-sm">
                            {isStaff
                                ? "There are currently no quizzes assigned to this club. Create one manually or use AI to generate one from a PDF."
                                : "Your instructors haven't posted any quizzes for this club yet. Check back soon!"}
                        </p>
                    </div>
                ) : (
                    /* --- QUIZZES GRID --- */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {quizzes.map((quiz: any) => (
                            <div key={quiz._id} className="group bg-surface border border-border rounded-xl p-5 flex flex-col shadow-sm hover:shadow-md transition-all duration-200">

                                <div className="flex justify-between items-start mb-3">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider">
                                        <i className="fas fa-clock"></i>
                                        {new Date(quiz.createdAt).toLocaleDateString()}
                                    </div>
                                    {canModify && (
                                        // <button className="text-muted hover:text-foreground transition-colors p-1">
                                        //     <i className="fas fa-ellipsis-v"></i>
                                        // </button>
                                        <Dropdown
                                            align="right"
                                            trigger={
                                                <Button variant="ghost" size="icon" className="hover:bg-background border border-transparent h-7 w-7 !p-0">
                                                    <i className="fas fa-ellipsis-v text-muted"></i>
                                                </Button>
                                            }
                                            items={getDropdownItems(quiz)}
                                        />
                                    )}
                                </div>

                                <h3 className="text-foreground font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
                                    {quiz.title}
                                </h3>

                                <p className="text-muted text-sm line-clamp-2 mb-4 flex-1">
                                    {quiz.description || "No description provided for this assessment."}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                                    <div className="flex items-center gap-4 text-xs font-semibold text-muted">
                                        <span className="flex items-center gap-1">
                                            <i className="fas fa-question-circle text-primary"></i>
                                            {quiz.questions?.length || 0} Qs
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <i className="fas fa-star text-warning"></i>
                                            {quiz.totalPoints || 0} Pts
                                        </span>
                                    </div>

                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="rounded-lg text-xs"
                                        onClick={() => navigate(`attempt/${quiz._id}`)}
                                        rightIcon="fas fa-arrow-right"
                                    >
                                        {isStaff ? "View Details" : "Attempt Quiz"}
                                    </Button>

                                    {isStaff ? (

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-lg text-xs border-primary text-primary hover:bg-primary/10"
                                            onClick={() => setQuizToUpdate(quiz)}
                                            rightIcon="fas fa-edit"
                                        >
                                            {canModify ? "Edit Quiz" : "View Quiz"}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="rounded-lg text-xs"
                                            onClick={() => navigate(`attempt/${quiz._id}`)}
                                            rightIcon="fas fa-arrow-right"
                                        >
                                            Attempt Quiz
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals will go here when you build them */}
            {isCreateModalOpen && <CreateQuizModal onClose={() => setIsCreateModalOpen(false)} clubId={id} videoId={videoId} schoolId={schoolId!} />}
            {quizToUpdate && (
                <UpdateQuizModal
                    quiz={quizToUpdate}
                    onClose={() => setQuizToUpdate(null)}
                />
            )}
            {isAIModalOpen && <AIQuizModal onClose={() => setIsAIModalOpen(false)} 
            videoId={videoId} clubId={id} academicYear={currentAcademicYear} />}
        </div>
    );
};

export default ClubQuizMain;