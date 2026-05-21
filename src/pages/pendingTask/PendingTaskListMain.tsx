import { useState, useRef, useEffect } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetPendingTasks } from '../../api_services/pending_api/pendingApi';
import PendingTasksList from './PendingTasksList';
// import { useGetPendingTasks } from '../../../api_services/pending_api/pendingTaskApi'; // Adjust path
// import PendingTasksList from './PendingTasksList'; // Adjust path
// import { useAuthData } from '../../../hooks/useAuthData';

export default function PendingTaskListMain() {
    const { currentRole } = useAuthData();
    const { data, isLoading } = useGetPendingTasks();
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Only render the bell if the user is a parent
    if (currentRole !== 'parent') return null;

    const totalPending = data?.totalPending || 0;

    // Handle clicking outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // return (
    //     <div className="relative" ref={ref}>
    //         {/* The Bell Button */}
    //         <button
    //             onClick={() => setIsOpen(!isOpen)}
    //             className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
    //                 isOpen ? 'bg-sub-header text-foreground' : 'text-muted hover:bg-sub-header hover:text-foreground'
    //             }`}
    //             aria-label="Pending Tasks"
    //         >
    //             <i className="fas fa-bell text-[1.1rem]"></i>

    //             {/* The Red Notification Badge */}
    //             {totalPending > 0 && (
    //                 <span className="absolute top-1 right-1.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-inverse bg-danger rounded-full border-2 border-surface shadow-sm">
    //                     {totalPending > 9 ? '9+' : totalPending}
    //                 </span>
    //             )}
    //         </button>

    //         {/* The Dropdown Container */}
    //         {isOpen && (
    //             <div className="absolute right-0 mt-2 w-80 bg-surface rounded-xl shadow-lg border border-border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
    //                 <PendingTasksList 
    //                     tasks={data?.data || []} 
    //                     isLoading={isLoading} 
    //                     onClose={() => setIsOpen(false)} 
    //                 />
    //             </div>
    //         )}
    //     </div>
    // );


    return (
        <PendingTasksList
            tasks={data?.data || []}
            isLoading={isLoading}
            onClose={() => setIsOpen(false)}
        />
    )
}