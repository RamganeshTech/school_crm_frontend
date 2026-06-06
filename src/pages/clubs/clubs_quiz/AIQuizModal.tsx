import React, { useState } from 'react';
import { useCreateAIClubQuiz } from '../../../api_services/clubs_api/club_quiz_api/clubQuizApi';
import { toast } from '../../../shared/ui/ToastContext';
import { SideModal } from '../../../shared/ui/SideModal';
import { Button } from '../../../shared/ui/Button';
import { useGetClubVideoById } from '../../../api_services/clubs_api/clubVideoApi';
// import { toast } from 'react-hot-toast';
// import { useCreateAIClubQuiz } from '../../../hooks/useClubQuizHooks'; // Adjust path
// // import { useGetAllClubVideos } from '../../../hooks/useClubVideoHooks'; // ⚠️ Import your actual video fetch hook here
// import Button from '../../../components/ui/Button'; // Adjust path
// import SideModal from '../../../components/ui/SideModal'; // Adjust path

interface Props {
    onClose: () => void;
    clubId: string;
    videoId: string;
    academicYear:string
}

const AIQuizModal: React.FC<Props> = ({ onClose, clubId, videoId, academicYear }) => {
    const createAIQuizMutation = useCreateAIClubQuiz();

    // ⚠️ Replace this with your actual video fetching logic so users can pick which PDF to analyze
    const { data: videoData } = useGetClubVideoById(videoId);
    const pdfs = videoData?.pdfs || [];

    // Form State
    const [selectedPdfId, setSelectedPdfId] = useState<string | null>(null);
    const [numberOfQuestions, setNumberOfQuestions] = useState(10);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if(!selectedPdfId){
            return toast.error("Please select a PDF.");
        }

        // if (!videoId) {
        //     return toast.error("Please select a lesson/video that contains a PDF.");
        // }

        try {
            await createAIQuizMutation.mutateAsync({
                clubId,
                academicYear,
                clubVideoId: videoId,
                numberOfQuestions,
                pdfId: selectedPdfId
            });
            toast.success("AI Quiz successfully generated!");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to generate AI quiz.");
        }
    };

    return (
        <SideModal isOpen={true} onClose={onClose} title="Generate Quiz with AI">
            <form onSubmit={handleSubmit} className="flex flex-col h-full bg-background overflow-hidden">

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">

                    {/* Header Banner */}
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-4">
                        <div className="mt-1">
                            <i className="fas fa-sparkles text-primary text-xl"></i>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-primary mb-1">Gemini 2.0 Powered</h3>
                            <p className="text-xs text-muted leading-relaxed">
                                Our AI will scan the PDF attached to the selected lesson and automatically generate a title, description, and multiple-choice questions.
                            </p>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4 p-4 bg-surface border border-border rounded-xl">

                        <div>
                            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">Select Source Material *</label>
                            <select
                                value={selectedPdfId || ""}
                                onChange={(e) => setSelectedPdfId(String(e.target.value))}
                                className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                required
                            >
                                <option value="" disabled>Select a lesson to analyze...</option>
                                {pdfs.length === 0 && <option value="" disabled>No PDFs found for this video.</option>}

                                {pdfs.map((video: any) => (
                                    <option key={video._id} value={video._id}>
                                        📄 {video?.originalName}
                                    </option>
                                ))}
                            </select>
                            <p className="text-[10px] text-muted mt-1.5">
                                Note: The selected lesson must have a PDF attached for the AI to analyze.
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide flex justify-between">
                                <span>Number of Questions</span>
                                <span className="text-primary">{numberOfQuestions}</span>
                            </label>
                            <input
                                type="range"
                                min="5"
                                max="30"
                                step="1"
                                value={numberOfQuestions}
                                onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                                className="w-full accent-primary cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-muted mt-1">
                                <span>5 (Quick)</span>
                                <span>30 (Comprehensive)</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 p-4 border-t border-border bg-surface flex justify-end gap-3">
                    <Button variant="outline" type="button" onClick={onClose} disabled={createAIQuizMutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        isLoading={createAIQuizMutation.isPending}
                        leftIcon={createAIQuizMutation.isPending ? "fas fa-spinner fa-spin" : "fas fa-magic"}
                    >
                        {createAIQuizMutation.isPending ? "Analyzing PDF..." : "Generate Quiz"}
                    </Button>
                </div>
            </form>
        </SideModal>
    );
};

export default AIQuizModal;