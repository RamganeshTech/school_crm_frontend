import React, { useState } from 'react';
import { useCreateClubQuiz, type QuizQuestion } from '../../../api_services/clubs_api/club_quiz_api/clubQuizApi';
import { toast } from '../../../shared/ui/ToastContext';
import { SideModal } from '../../../shared/ui/SideModal';
import { Button } from '../../../shared/ui/Button';
// import { toast } from 'react-hot-toast';
// import { useCreateClubQuiz, QuizQuestion } from '../../../hooks/useClubQuizHooks'; // Adjust path
// import Button from '../../../components/ui/Button'; // Adjust path
// import SideModal from '../../../components/ui/SideModal'; // Adjust path based on your component

interface Props {
    onClose: () => void;
    clubId: string;
}

const CreateQuizModal: React.FC<Props> = ({ onClose, clubId }) => {
    const createQuizMutation = useCreateClubQuiz();

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState<QuizQuestion[]>([
        { questionText: '', options: ['', ''], correctOptionIndex: 0, points: 1 }
    ]);

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
        // Reset correct index if the deleted option was selected or out of bounds
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

        // Basic Validation
        if (!title.trim()) return toast.error("Quiz title is required");
        for (const q of questions) {
            if (!q.questionText.trim()) return toast.error("All questions must have text");
            if (q.options.some(opt => !opt.trim())) return toast.error("All options must be filled out");
        }

        try {
            await createQuizMutation.mutateAsync({
                clubId,
                title,
                description,
                questions
            });
            toast.success("Quiz created successfully!");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to create quiz");
        }
    };

    return (
        <SideModal isOpen={true} onClose={onClose} title="Create Manual Quiz">
            <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden bg-background">
                
                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4 p-4 bg-surface border border-border rounded-xl">
                        <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Quiz Details</h3>
                        <div>
                            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">Quiz Title *</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                placeholder="e.g., Space Exploration Basics"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">Description</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[80px]"
                                placeholder="Brief instructions or summary..."
                            />
                        </div>
                    </div>

                    {/* Dynamic Questions List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-foreground">Questions ({questions.length})</h3>
                            <Button type="button" variant="outline" size="sm" onClick={addQuestion} leftIcon="fas fa-plus" className="text-xs">
                                Add Question
                            </Button>
                        </div>

                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="p-4 bg-surface border border-border rounded-xl space-y-4 relative">
                                <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-3 right-3 text-muted hover:text-danger transition-colors">
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-foreground mb-1.5">Question {qIndex + 1}</label>
                                    <input 
                                        type="text" 
                                        value={q.questionText}
                                        onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                                        className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                                        placeholder="Type your question here..."
                                        required
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wide">Options</label>
                                    {q.options.map((opt, optIndex) => (
                                        <div key={optIndex} className="flex items-center gap-3">
                                            <input 
                                                type="radio" 
                                                name={`correct-${qIndex}`} 
                                                checked={q.correctOptionIndex === optIndex}
                                                onChange={() => setCorrectOption(qIndex, optIndex)}
                                                className="w-4 h-4 accent-primary cursor-pointer"
                                                title="Mark as correct answer"
                                            />
                                            <input 
                                                type="text" 
                                                value={opt}
                                                onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                                className={`flex-1 bg-background border rounded-lg px-3 py-2 text-sm outline-none transition-colors ${q.correctOptionIndex === optIndex ? 'border-success ring-1 ring-success' : 'border-border focus:border-primary'}`}
                                                placeholder={`Option ${optIndex + 1}`}
                                                required
                                            />
                                            <button type="button" onClick={() => removeOption(qIndex, optIndex)} className="text-muted hover:text-danger w-6 flex justify-center">
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addOption(qIndex)} className="text-primary text-xs font-semibold hover:underline mt-1">
                                        + Add Option
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="shrink-0 p-4 border-t border-border bg-surface flex justify-end gap-3">
                    <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" type="submit" isLoading={createQuizMutation.isPending} leftIcon="fas fa-save">
                        Create Quiz
                    </Button>
                </div>
            </form>
        </SideModal>
    );
};

export default CreateQuizModal;