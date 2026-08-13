// components/layout/NotificationIcon.tsx
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetAnnouncementsForNotificationsInfinite } from '../../api_services/announcement_api/announcementApi';

const LAST_SEEN_KEY_PREFIX = 'dg_announcements_last_seen_';

const ANNOUNCEMENT_PATH_BY_ROLE: Record<string, string> = {
    parent: '/dashboard/student/announcement',
};
const DEFAULT_ANNOUNCEMENT_PATH = '/dashboard/announcement';


export const NotificationIcon = () => {
    const navigate = useNavigate();
    const { schoolId, currentRole, userId } = useAuthData();

    const storageKey = `${LAST_SEEN_KEY_PREFIX}${schoolId}_${currentRole}_${userId || 'anon'}`;

         const announcementPath = ANNOUNCEMENT_PATH_BY_ROLE[currentRole as any] || DEFAULT_ANNOUNCEMENT_PATH;
    const isOnAnnouncementPage = location.pathname === announcementPath;


    
    const { data: announcementsData } = useGetAnnouncementsForNotificationsInfinite({
        schoolId: schoolId!,
        limit: 10000,
    });

      const allAnnouncements = useMemo(
        () => announcementsData?.pages?.flatMap(page => page?.data || []) ?? [],
        [announcementsData]
    );

     // Auto-clear the moment the user lands on the announcement page —
    // covers sidebar nav, refresh, deep links, not just bell clicks.
    // Re-runs when the list length changes too, so it keeps clearing
    // if a new announcement polls in while they're already sitting on the page.
    useEffect(() => {
        if (isOnAnnouncementPage) {
            localStorage.setItem(storageKey, new Date().toISOString());
        }
    }, [isOnAnnouncementPage, storageKey, allAnnouncements.length]);


    const unreadCount = useMemo(() => {
        const lastSeen = localStorage.getItem(storageKey);
        const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;

        const allAnnouncements = announcementsData?.pages.flatMap(page => page.data || []) ?? [];

        return allAnnouncements.filter((a: any) => {
            const createdAt = new Date(a.createdAt || a.updatedAt).getTime();
            return createdAt > lastSeenTime;
        }).length;
    }, [announcementsData, storageKey]);

    const handleBellClick = () => {
        localStorage.setItem(storageKey, new Date().toISOString());
        if(currentRole !== "parent"){
            navigate('/dashboard/announcement');
        }
        else{
            navigate('/dashboard/student/announcement');
            
        }
    };

    return (
        <button
            onClick={handleBellClick}
            className="relative cursor-pointer w-10 h-10 rounded-full flex items-center justify-center text-muted hover:bg-mainBg hover:text-primary transition-colors"
            title="Announcements"
        >
            <i className="fa-regular fa-bell text-lg"></i>

            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-[3px] rounded-full bg-danger text-inverse text-[10px] font-bold flex items-center justify-center leading-none shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </button>
    );
};