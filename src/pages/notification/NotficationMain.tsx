import { useNavigate } from 'react-router-dom';
import { toast } from '../../shared/ui/ToastContext';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetAllNotifications, 
useDeleteNotification, useMarkNotificationAsRead
  } from '../../api_services/notifcation_api/notficationApi';
import { useCurrentStudent } from '../../hooks/useCurrentStudent';

export default function NotificationMain() {
    const navigate = useNavigate();
    
    // Safely extract the user ID depending on how your auth payload is structured
    const { userId, currentRole } = useAuthData();
    const currentUserId = userId;

    // --- Hooks ---
    const { data: notifications = [], isLoading } = useGetAllNotifications();
    const { studentId, classId, sectionId } = useCurrentStudent();
    const deleteMutation = useDeleteNotification();
    const markReadMutation = useMarkNotificationAsRead();

    // Check if the user is in the creator roles group
    // const canManage = ["correspondent", "administrator", "principal", "viceprincipal", "teacher"].includes(currentRole as string);

   // ADD THIS: Filter notifications based on active student context
    // --- UNIFIED FILTERING: Announcements, Homework, and Attendance ---
    const filteredNotifications = notifications.filter((notif: any) => {
        // 1. STAFF BYPASS: Let the backend handle staff visibility
        if (currentRole !== 'parent') return true;

        // --- PARENT FILTERING BELOW ---

        // 2. STUDENT-SPECIFIC (e.g., Attendance)
        // If it explicitly targets students, the active child MUST be in the list.
        if (notif.targetStudents && notif.targetStudents.length > 0) {
            return notif.targetStudents.includes(studentId);
        }

        // 3. CLASS/SECTION-SPECIFIC (e.g., Homework, Targeted Announcements)
        // If it targets classes, the active child's class/section MUST match.
        if (notif.targetClasses && notif.targetClasses.length > 0) {
            const matchesClass = notif.targetClasses.includes(classId);
            const matchesSection = notif.targetSections && notif.targetSections.length > 0
                ? notif.targetSections.includes(sectionId)
                : true;

            return matchesClass && matchesSection;
        }

        // 4. GLOBAL / ALL PARENTS (e.g., General Announcements)
        // If it has no specific students or classes, it's a general blast. Show it.
        return true; 
    });

    // --- Handlers ---
   const handleNotificationClick = async (notif: any) => {
        // 1. Mark as read in the background
        console.log("notifaiton lkdsfklds", notif)
        if (!notif.isRead) {
            try {
                await markReadMutation.mutateAsync(notif._id);
            } catch (error) {
                console.error("Failed to mark as read:", error);
            }
        }

        // 2. Smart Navigation Routing
        if (notif.path) {
            let finalPath = notif.path;
            
            // Adjust paths dynamically for parents based on Redux State
            if (currentRole === 'parent') {
                
                // Rewrite backend staff paths to parent paths
                if (finalPath === '/dashboard/announcement') {
                    finalPath = '/dashboard/student/announcement';
                }
                
                // Always append the active student ID for parent routes
                // if (studentId) {
                //     // Check if path already has query params to append safely
                //     const separator = finalPath.includes('?') ? '&' : '?';
                //     finalPath = `${finalPath}${separator}studentId=${studentId}`;
                // }

                // B. Attendance: Append as URL Path Segment -> /dashboard/student/attendance/123
                else if (notif.type === 'attendance' || finalPath.includes('/attendance')) {
                    // Strip trailing slash if it exists, then append /studentId
                    finalPath = `${finalPath.replace(/\/$/, '')}/${studentId}`;
                }


                // C. Homework: Append as Query Parameter -> /dashboard/student/homework-submission?studentId=123
                else if (finalPath.includes('homework-submission')) {
                    const separator = finalPath.includes('?') ? '&' : '?';
                    finalPath = `${finalPath}${separator}studentId=${studentId}`;
                }

            }
            
            navigate(finalPath);
        }
    };

    const handleManualDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevents the card click event from firing (prevents navigation)

        if (!window.confirm('Are you sure you want to delete this notification?')) return;

        try {
            await deleteMutation.mutateAsync(id);
            toast.success("Notification deleted successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete notification");
        }
    };

    // --- Helpers ---
    const getIconForType = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'homework':
                return { icon: 'fas fa-book-open', bg: 'bg-info/10', text: 'text-info' };
            case 'attendance':
                return { icon: 'fas fa-user-check', bg: 'bg-warning/10', text: 'text-warning' };
            case 'general':
                return { icon: 'fas fa-bullseye', bg: 'bg-success/10', text: 'text-success' };
            case 'announcement':
            default:
                return { icon: 'fas fa-bullhorn', bg: 'bg-primary-soft', text: 'text-primary' };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(date);
    };

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden animate-in fade-in">
            {/* HEADER */}
            <header className="shrink-0 px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between gap-4 bg-surface z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shadow-sm shrink-0">
                        <i className="fas fa-bell text-lg"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground leading-tight">Notifications</h1>
                        <p className="text-[11px] text-muted font-medium tracking-wider uppercase">
                            Your Updates & Alerts
                        </p>
                    </div>
                </div>
            </header>

            {/* MAIN LIST */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-background">
                <div className="max-w-4xl mx-auto flex flex-col gap-3">
                    
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20 text-primary">
                            <i className="fas fa-circle-notch fa-spin text-3xl"></i>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-muted bg-surface rounded-2xl border border-dashed border-border shadow-sm">
                            <div className="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center mb-4 border border-primary/20">
                                <i className="fas fa-bell-slash text-2xl text-primary/60"></i>
                            </div>
                            <h3 className="text-lg font-bold text-foreground">No Notifications</h3>
                            <p className="text-sm">You're all caught up!</p>
                        </div>
                    ) : (
                        filteredNotifications.map((notif: any) => {
                            const { icon, bg, text } = getIconForType(notif.type);
                            const isUnread = !notif.isRead;
                            
                            // Check if the current user created this specific notification
                            // Assuming backend populates `createdBy` or stores the raw ObjectId string
                            const isCreator = typeof notif.createdBy === 'object' 
                                ? notif.createdBy?._id === currentUserId 
                                : notif.createdBy === currentUserId;

                            return (
                                <div 
                                    key={notif._id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`relative group flex items-start gap-4 p-4 sm:p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md
                                        ${isUnread 
                                            ? 'bg-surface border-primary/40 shadow-sm ring-1 ring-inset ring-primary/5' 
                                            : 'bg-surface/50 border-border hover:bg-surface hover:border-primary/30'
                                        }
                                    `}
                                >
                                    {/* Unread Dot Indicator */}
                                    {isUnread && (
                                        <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--color-primary),0.6)]"></div>
                                    )}

                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bg} ${text}`}>
                                        <i className={`${icon} text-xl`}></i>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pr-10">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-1">
                                            <h4 className={`text-sm sm:text-base font-bold truncate ${isUnread ? 'text-foreground' : 'text-foreground/80'}`}>
                                                {notif.title}
                                            </h4>
                                            <span className="text-[10px] sm:text-xs text-muted font-medium shrink-0 flex items-center gap-1.5">
                                                <i className="far fa-clock"></i>
                                                {formatDate(notif.createdAt)}
                                            </span>
                                        </div>
                                        
                                        <p className={`text-xs sm:text-sm line-clamp-2 leading-relaxed ${isUnread ? 'text-foreground/80' : 'text-muted'}`}>
                                            {notif.message}
                                        </p>
                                    </div>

                                    {/* Separate Manual Delete Action - ONLY IF CREATOR */}
                                    {(isCreator) && (
                                        <div className="absolute bottom-4 right-4 sm:top-4 sm:bottom-auto sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => handleManualDelete(e, notif._id)}
                                                className="w-8 h-8 rounded-full bg-danger/10 text-danger border border-danger/20 hover:bg-danger hover:text-white flex items-center justify-center transition-colors shadow-sm"
                                                title="Delete Notification"
                                            >
                                                <i className="fas fa-trash-alt text-xs"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
}