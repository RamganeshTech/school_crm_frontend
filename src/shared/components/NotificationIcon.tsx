import { useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetUnreadNotificationCount } from '../../api_services/notifcation_api/notficationApi';

const NOTIFICATION_PATH_BY_ROLE: Record<string, string> = {
    parent: '/dashboard/student/notifications', 
};
const DEFAULT_NOTIFICATION_PATH = '/dashboard/notifications';

export const NotificationIcon = () => {
    const navigate = useNavigate();
    const { currentRole } = useAuthData();

    const notificationPath = NOTIFICATION_PATH_BY_ROLE[currentRole as string] || DEFAULT_NOTIFICATION_PATH;

    // Using your hook directly
    const { data: unreadCount = 0 } = useGetUnreadNotificationCount();

    const handleBellClick = () => {
        navigate(notificationPath);
    };

    return (
        <button
            onClick={handleBellClick}
            className="relative cursor-pointer w-10 h-10 rounded-full flex items-center justify-center text-muted hover:bg-surface hover:text-primary transition-colors"
            title="Notifications"
        >
            <i className="fa-regular fa-bell text-lg"></i>

            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-[3px] rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-sm animate-in zoom-in">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </button>
    );
};