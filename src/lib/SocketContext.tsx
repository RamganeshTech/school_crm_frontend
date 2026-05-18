import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthData } from '../hooks/useAuthData'; // Adjust path
import { toast } from '../shared/ui/ToastContext';
import { queryClient } from './queryClient';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // We only need the userId to know IF they are logged in. No token needed!
    const { userId } = useAuthData();

    useEffect(() => {
        if (!userId) return;

        const SOCKET_URL = import.meta.env.VITE_APP_BASE_API || "http://localhost:4000";

        const socketInstance = io(SOCKET_URL, {
            withCredentials: true, // 🟢 CRITICAL: This tells the browser to send HTTP-only cookies!
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        socketInstance.on('connect', () => {
            console.log('🟢 [FRONTEND] Socket connected:', socketInstance.id);
            setIsConnected(true);
        });

       

        // ==========================================
        // 📢 GLOBAL NOTIFICATION LISTENERS
        // ==========================================
        socketInstance.on('new_announcement', (announcementData) => {
            console.log("📥 [SOCKET] Received new announcement:", announcementData);

            // 1. Show global pop-up to the user
            toast.success(`New Notice: ${announcementData.title}`);

            // 2. Silently update the React Query cache so if they navigate 
            // to the announcement page, the new item is already there!
            queryClient.invalidateQueries({ queryKey: ['announcements-infinite'] });
        });


        socketInstance.on('connect_error', (err) => {
            console.error('⚠️ [FRONTEND] Socket connection error:', err.message);

            // If the connection was rejected by middleware (e.g., cookie lag),
            // Socket.io turns off auto-reconnect. We force a retry after 3 seconds
            // if the user state shows they are still technically logged in.
            if (userId) {
                console.log('🔄 [FRONTEND] Retrying connection in 3 seconds...');
                setTimeout(() => {
                    // Check if instance still exists and isn't already connected
                    if (socketInstance && !socketInstance.connected) {
                        socketInstance.connect();
                    }
                }, 3000);
            }
        });

         socketInstance.on('disconnect', (reason) => {
            console.log('🔴 [FRONTEND] Socket disconnected:', reason);
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            console.log('🧹 [FRONTEND] Cleaning up socket connection');
            socketInstance.disconnect();
        };
    }, [userId]); // Re-connects only if the userId changes

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};