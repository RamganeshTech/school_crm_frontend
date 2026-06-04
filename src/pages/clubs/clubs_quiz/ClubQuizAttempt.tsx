import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetSingleClubQuiz } from '../../../api_services/clubs_api/club_quiz_api/clubQuizApi';
import { useCreateQuizAttempt } from '../../../api_services/clubs_api/club_quiz_api/clubQuizAttemptApi';
import { toast } from '../../../shared/ui/ToastContext';
import { Button } from '../../../shared/ui/Button';
import { useRoleCheck } from '../../../hooks/useRoleCheck';

const ClubQuizAttempt: React.FC = () => {
    const { id: clubId, quizId } = useParams<{ id: string; quizId: string }>();
    const navigate = useNavigate();



    const { isCorrespondent, isAdmin, isTeacher , isParent} = useRoleCheck()

    // const canDelete = isAdmin || isCorrespondent
    const canCreate = isAdmin || isCorrespondent || isTeacher || isParent


    // Queries & Mutations
    const { data, isLoading, isError } = useGetSingleClubQuiz(quizId);
    const submitAttemptMutation = useCreateQuizAttempt();

    const quiz = data?.data || data; // Adjust based on exact Axios response nesting

    // State: Tracking answers by question index -> { [questionIndex]: selectedOptionIndex }
    const [answers, setAnswers] = useState<Record<number, number>>({});

    // State: Hold results after successful submission to swap the view
    const [result, setResult] = useState<{ score: number; percentage: string } | null>(null);

    // Handlers
    const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
    };

    const handleSubmit = async () => {
        if (!quiz || !quiz.questions) return;

        const totalQuestions = quiz.questions.length;
        const answeredCount = Object.keys(answers).length;

        // Backend requires exactly all answers to be sent
        if (answeredCount !== totalQuestions) {
            toast.error(`Please answer all questions. (${answeredCount}/${totalQuestions} completed)`);
            return;
        }

        try {
            // Map the local state to the exact payload structure your backend expects
            const studentAnswers = quiz.questions.map((q: any, index: number) => ({
                questionId: q._id, // Fallback safety for backend mapping
                index: index,
                selectedOptionIndex: answers[index]
            }));

            const res = await submitAttemptMutation.mutateAsync({
                quizId: quizId!,
                studentAnswers
            });

            toast.success("Quiz submitted successfully!");
            setResult({
                score: res.score,
                percentage: res.percentage
            });

        } catch (error: any) {
            toast.error(error.message || "Failed to submit quiz");
        }
    };

    // --- RENDER LOGIC ---

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-background">
                {/* <Spinner className="text-primary text-3xl mb-3" /> */}
                <div className="flex h-full items-center justify-center">
                    <i className="fas fa-circle-notch fa-spin text-primary text-4xl"></i>
                </div>
                {/* <p className="text-muted font-medium animate-pulse">Loading Quiz...</p> */}
            </div>
        );
    }

    if (isError || !quiz) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-background p-6">
                <div className="p-6 bg-danger/10 text-danger border border-danger/20 rounded-xl text-center">
                    <i className="fas fa-exclamation-triangle text-3xl mb-3"></i>
                    <h3 className="font-bold">Quiz Not Found</h3>
                    <p className="text-sm mt-1 mb-4">The quiz you are trying to access does not exist or has been removed.</p>
                    <Button variant="outline" onClick={() => navigate(`/club/single/${clubId}/quiz`)}>Go Back</Button>
                </div>
            </div>
        );
    }

    // --- RESULT SCREEN ---
    if (result) {
        const passed = parseFloat(result.percentage) >= 50; // Arbitrary 50% pass mark for UI color

        return (
            <div className="flex flex-col items-center justify-center h-full bg-background p-6 animate-in zoom-in-95 duration-500">
                <div className="bg-surface border border-border rounded-2xl shadow-lg p-8 md:p-12 text-center max-w-md w-full">
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 border-4 ${passed ? 'bg-success/10 border-success text-success' : 'bg-warning/10 border-warning text-warning'}`}>
                        <i className={`fas ${passed ? 'fa-trophy' : 'fa-star-half-alt'} text-4xl`}></i>
                    </div>

                    <h2 className="text-2xl font-bold text-foreground mb-2">Quiz Completed!</h2>
                    <p className="text-muted text-sm mb-8">Your answers have been graded and recorded successfully.</p>

                    <div className="bg-background border border-border rounded-xl p-6 mb-8 flex justify-around items-center">
                        <div>
                            <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Total Score</p>
                            <p className="text-3xl font-black text-foreground">{result.score} <span className="text-lg text-muted font-medium">/ {quiz.totalPoints}</span></p>
                        </div>
                        <div className="w-px h-12 bg-border"></div>
                        <div>
                            <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Percentage</p>
                            <p className={`text-3xl font-black ${passed ? 'text-success' : 'text-warning'}`}>{result.percentage}%</p>
                        </div>
                    </div>

                    <Button variant="primary" className="w-full" onClick={() => navigate(`/club/single/${clubId}/quiz`)}>
                        Return to Quizzes
                    </Button>
                </div>
            </div>
        );
    }

    // --- ATTEMPT SCREEN ---
    const totalQuestions = quiz.questions?.length || 0;
    const answeredCount = Object.keys(answers).length;
    const isComplete = answeredCount === totalQuestions;

    return (
        <div className="flex flex-col h-full bg-background relative">

            {/* Header */}
            <header className="shrink-0 px-4 md:px-6 py-4 border-b border-border bg-surface flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-border text-muted hover:bg-background transition-colors cursor-pointer"
                    >
                        <i className="fas fa-times text-sm"></i>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-foreground">{quiz.title}</h1>
                        <p className="text-xs font-semibold text-primary mt-0.5 uppercase tracking-wide">
                            {answeredCount} / {totalQuestions} Questions Answered
                        </p>
                    </div>
                </div>
            </header>

            {/* Questions Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-6 pb-24"> {/* pb-24 to ensure content isn't hidden behind the sticky footer */}

                    {quiz.description && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-foreground">
                            <i className="fas fa-info-circle text-primary mr-2"></i>
                            {quiz.description}
                        </div>
                    )}

                    {quiz.questions?.map((q: any, qIndex: number) => (
                        <div key={qIndex} className="bg-surface border border-border rounded-xl p-5 md:p-7 shadow-sm">

                            <div className="flex justify-between items-start mb-4 gap-4">
                                <h3 className="text-foreground font-semibold text-base md:text-lg leading-relaxed">
                                    <span className="text-muted mr-2">{qIndex + 1}.</span>
                                    {q.questionText}
                                </h3>
                                <span className="shrink-0 bg-background border border-border px-2 py-1 rounded text-xs font-bold text-muted whitespace-nowrap">
                                    {q.points || 1} {q.points === 1 ? 'Pt' : 'Pts'}
                                </span>
                            </div>

                            <div className="space-y-3 mt-5">
                                {q.options.map((opt: string, optIndex: number) => {
                                    const isSelected = answers[qIndex] === optIndex;

                                    return (
                                        <label
                                            key={optIndex}
                                            className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer select-none
                                                ${isSelected
                                                    ? 'border-primary bg-primary/5 shadow-sm'
                                                    : 'border-border bg-background hover:border-primary/40 hover:bg-surface'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${qIndex}`}
                                                value={optIndex}
                                                checked={isSelected}
                                                onChange={() => handleOptionSelect(qIndex, optIndex)}
                                                className="w-5 h-5 accent-primary cursor-pointer mr-4 shrink-0"
                                            />
                                            <span className={`text-sm md:text-base ${isSelected ? 'text-primary font-semibold' : 'text-foreground'}`}>
                                                {opt}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sticky Submission Footer */}
           {canCreate && <div className="shrink-0 p-4 border-t border-border bg-surface flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                <div className="hidden md:block">
                    <p className="text-sm font-medium text-foreground">
                        Ready to submit?
                    </p>
                    <p className="text-xs text-muted">
                        {isComplete ? "All questions answered." : "Please answer all questions before submitting."}
                    </p>
                </div>

                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSubmit}
                    isLoading={submitAttemptMutation.isPending}
                    disabled={!isComplete || submitAttemptMutation.isPending}
                    className={`w-full md:w-auto px-10 transition-all ${!isComplete ? 'opacity-50 cursor-not-allowed' : 'shadow-md shadow-primary/20'}`}
                    rightIcon={isComplete ? "fas fa-paper-plane" : "fas fa-lock"}
                >
                    {submitAttemptMutation.isPending ? "Submitting..." : "Submit Quiz"}
                </Button>
            </div>}

        </div>
    );
};

export default ClubQuizAttempt;