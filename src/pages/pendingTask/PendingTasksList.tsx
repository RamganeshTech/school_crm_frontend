import { useNavigate } from 'react-router-dom';
import type { PendingTask } from '../../api_services/pending_api/pendingApi';
// import { PendingTask } from '../../../api_services/pending_api/pendingTaskApi'; // Adjust path

interface Props {
    tasks: PendingTask[];
    isLoading: boolean;
    onClose: () => void;
}

export default function PendingTasksList({ tasks, isLoading, onClose }: Props) {
    const navigate = useNavigate();

    // Route the parent to the correct page based on the task module
    const handleTaskClick = (task: PendingTask) => {
        onClose(); // Close dropdown
        
        if (task.module === 'studentProfile') {
            // Navigate to profile completion
            navigate(`/dashboard/student/single/${task.id}`);
        } else if (task.module === 'homeworkSubmission') {
            // Navigate to homework submission page (Adjust route as needed)
            navigate(`/dashboard/homework/submit/${task.homeworkId}?studentId=${task.id}`);
        }
    };

    return (
        <div className="flex flex-col max-h-[400px]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-sub-header flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Pending Action Items</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20">
                    {tasks.length}
                </span>
            </div>

            {/* List Body */}
            <div className="overflow-y-auto custom-scrollbar p-2">
                {isLoading ? (
                    <div className="flex justify-center py-6">
                        <i className="fas fa-circle-notch fa-spin text-primary text-xl"></i>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-8 text-muted">
                        <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mb-3">
                            <i className="fas fa-check text-xl"></i>
                        </div>
                        <p className="text-sm font-medium text-foreground">All Caught Up!</p>
                        <p className="text-xs mt-1">No pending tasks for your children.</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {tasks.map((task, index) => (
                            <button
                                key={`${task.id}-${index}`}
                                onClick={() => handleTaskClick(task)}
                                className="w-full text-left p-3 rounded-lg hover:bg-sub-header transition-colors border border-transparent hover:border-border flex gap-3 group cursor-pointer"
                            >
                                {/* Icon based on module type */}
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                    task.module === 'studentProfile' 
                                        ? 'bg-warning/10 text-warning' 
                                        : 'bg-primary-soft text-primary'
                                }`}>
                                    <i className={`fas ${task.module === 'studentProfile' ? 'fa-user-edit' : 'fa-book-open'} text-sm`}></i>
                                </div>
                                
                                {/* Text Content */}
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-bold text-foreground truncate">
                                        {task.name}
                                    </p>
                                    <p className="text-[11px] text-muted leading-snug mt-0.5">
                                        {task.message}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Footer */}
            {tasks.length > 0 && (
                <div className="p-2 border-t border-border bg-sub-header/50">
                    <button 
                        onClick={onClose}
                        className="w-full py-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}