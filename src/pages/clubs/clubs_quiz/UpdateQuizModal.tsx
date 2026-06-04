import React, { useState, useEffect } from 'react';
import { useUpdateClubQuiz, type QuizQuestion, type UpdateQuizPayload } from '../../../api_services/clubs_api/club_quiz_api/clubQuizApi'; // Adjust path
import { toast } from '../../../shared/ui/ToastContext'; // Adjust path
import { SideModal } from '../../../shared/ui/SideModal';
import { Button } from '../../../shared/ui/Button';
import { useRoleCheck } from '../../../hooks/useRoleCheck';

interface Props {
    onClose: () => void;
    quiz: any; // The existing quiz object passed from the parent list
}

const UpdateQuizModal: React.FC<Props> = ({ onClose, quiz }) => {
    const updateQuizMutation = useUpdateClubQuiz();


    const { isAdmin, isCorrespondent, isTeacher } = useRoleCheck()

    const canModify = isAdmin || isCorrespondent || isTeacher


    // Initialize Form State with existing quiz data
    const [title, setTitle] = useState(quiz?.title || '');
    const [description, setDescription] = useState(quiz?.description || '');
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);

    useEffect(() => {
        if (quiz?.questions && quiz.questions.length > 0) {
            // Deep copy to avoid mutating the original prop directly before saving
            setQuestions(JSON.parse(JSON.stringify(quiz.questions)));
        } else {
            setQuestions([{ questionText: '', options: ['', ''], correctOptionIndex: 0, points: 1 }]);
        }
    }, [quiz]);

    // Dynamic Form Handlers
    const addQuestion = () => {
        setQuestions([...questions, { questionText: '', options: ['', ''], correctOptionIndex: 0, points: 1 }]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length === 1) return toast.error("Quiz must have at least one question.");
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestionText = (index: number, text: string) => {
        const updated = [...questions];
        updated[index].questionText = text;
        setQuestions(updated);
    };

    const updateOption = (qIndex: number, optIndex: number, text: string) => {
        const updated = [...questions];
        updated[qIndex].options[optIndex] = text;
        setQuestions(updated);
    };

    const addOption = (qIndex: number) => {
        const updated = [...questions];
        updated[qIndex].options.push('');
        setQuestions(updated);
    };

    const removeOption = (qIndex: number, optIndex: number) => {
        const updated = [...questions];
        if (updated[qIndex].options.length <= 2) return toast.error("A question must have at least 2 options.");

        updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== optIndex);

        if (updated[qIndex].correctOptionIndex >= updated[qIndex].options.length) {
            updated[qIndex].correctOptionIndex = 0;
        }
        setQuestions(updated);
    };

    const setCorrectOption = (qIndex: number, optIndex: number) => {
        const updated = [...questions];
        updated[qIndex].correctOptionIndex = optIndex;
        setQuestions(updated);
    };

    // Submit Handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) return toast.error("Quiz title is required");
        for (const q of questions) {
            if (!q.questionText.trim()) return toast.error("All questions must have text");
            if (q.options.some(opt => !opt.trim())) return toast.error("All options must be filled out");
        }

        const payload: UpdateQuizPayload = {
            title,
            description,
            questions
        };

        try {
            await updateQuizMutation.mutateAsync({
                id: quiz._id,
                payload
            });
            toast.success("Quiz updated successfully!");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to update quiz");
        }
    };

    return (
        <SideModal isOpen={true} onClose={onClose} title={canModify ? "Update Quiz" : "View Quiz"}>
            <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden bg-background">

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4 p-4 bg-surface border border-border rounded-xl shadow-sm">
                        <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Quiz Details</h3>
                        <div>
                            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">Quiz Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                placeholder="e.g., Space Exploration Basics"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[80px] resize-y"
                                placeholder="Brief instructions or summary..."
                            />
                        </div>
                    </div>

                    {/* Dynamic Questions List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-foreground">Questions ({questions.length})</h3>
                            {canModify && <Button type="button" variant="outline" size="sm" onClick={addQuestion} leftIcon="fas fa-plus" className="text-xs">
                                Add Question
                            </Button>}
                        </div>

                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="p-4 md:p-5 bg-surface border border-border rounded-xl shadow-sm space-y-4 relative group">
                                {canModify && <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 transition-colors">
                                    <i className="fas fa-trash-alt"></i>
                                </button>}

                                <div className="pr-8">
                                    <label className="block text-xs font-semibold text-foreground mb-1.5">Question {qIndex + 1}</label>
                                    <input
                                        type="text"
                                        value={q.questionText}
                                        onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                                        className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-all"
                                        placeholder="Type your question here..."
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wide">Options</label>
                                    {q.options.map((opt, optIndex) => (
                                        <div key={optIndex} className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name={`correct-${qIndex}`}
                                                checked={q.correctOptionIndex === optIndex}
                                                onChange={() => setCorrectOption(qIndex, optIndex)}
                                                className="w-4 h-4 accent-primary cursor-pointer shrink-0"
                                                title="Mark as correct answer"
                                            />
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                                className={`flex-1 bg-background border rounded-lg px-3 py-2 text-sm outline-none transition-colors ${q.correctOptionIndex === optIndex ? 'border-success ring-1 ring-success shadow-[0_0_0_1px_rgba(16,185,129,0.2)]' : 'border-border focus:border-primary'}`}
                                                placeholder={`Option ${optIndex + 1}`}
                                                required
                                            />
                                            <button type="button" onClick={() => removeOption(qIndex, optIndex)} className="text-muted hover:text-danger w-8 h-8 flex items-center justify-center rounded-full hover:bg-danger/10 transition-colors shrink-0">
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addOption(qIndex)} className="text-primary text-xs font-bold hover:underline mt-2 inline-flex items-center gap-1.5">
                                        <i className="fas fa-plus text-[10px]"></i> Add Option
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                {canModify && <div className="shrink-0 p-4 border-t border-border bg-surface flex items-center justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <Button variant="outline" type="button" onClick={onClose} disabled={updateQuizMutation.isPending}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" isLoading={updateQuizMutation.isPending} leftIcon="fas fa-save">
                        {updateQuizMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                </div>}
            </form>
        </SideModal>
    );
};

export default UpdateQuizModal;