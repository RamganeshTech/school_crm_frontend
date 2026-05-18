import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
// import { useUserIsAuthenticated } from '../../api_services/authApi'; // Adjust path to where you saved the hook
import { Button } from '../../shared/ui/Button'; // Adjust path
import { useUserIsAuthenticated } from '../../api_services/auth_api/authApi';
import type { UserRole } from '../../features/slices/authSlice';

interface ProtectedRouteProps {
    allowedRoles: UserRole[];
    children?: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
    const navigate = useNavigate();

    // 1. Get the quick, synchronous role from Redux
    const { currentRole } = useAuthData();

    // 2. Ping the backend to ensure the session hasn't expired.
    // React Query handles the caching so it won't spam your server on every render.
    const { isLoading, isError } = useUserIsAuthenticated();

    // 3. Show loading state while the network request is pending
    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-background min-h-[60vh] space-y-3">
                <i className="fas fa-circle-notch fa-spin text-primary text-4xl"></i>
                <p className="text-sm font-semibold text-muted animate-pulse">Verifying secure session...</p>
            </div>
        );
    }

    // 4. CRITICAL FIX: Handle case where role is null or missing entirely
    if (!currentRole) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-background min-h-[60vh]">
                <div className="bg-surface border border-danger/20 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
                    <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-user-slash text-2xl"></i>
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Unauthorized</h2>
                    <p className="text-sm text-muted mb-6">
                        No user role configuration was found for your session. Please try logging out and logging back in.
                    </p>
                    <Button 
                        variant="primary" 
                        onClick={() => navigate('/login')} 
                        leftIcon="fas fa-sign-in-alt"
                        className="w-full justify-center"
                    >
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    // 4. Verify Authorization
    // - isValidSession: Checks if the API returned an error (e.g., 401 Unauthorized / Token Expired)
    // - hasCorrectRole: Checks if their Redux role exists and is allowed here
    const isValidSession = !isError;
    
    const hasCorrectRole = currentRole && (allowedRoles as string[]).includes((currentRole).toLowerCase());

    // 5. Render "Restricted" UI if they fail either check
    if (!isValidSession || !hasCorrectRole) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-background min-h-[60vh]">
                <div className="bg-surface border border-danger/20 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
                    <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className={`fas ${!isValidSession ? 'fa-user-clock' : 'fa-lock'} text-2xl`}></i>
                    </div>

                    <h2 className="text-xl font-bold text-foreground mb-2">
                        {!isValidSession ? 'Session Expired' : 'Access Restricted'}
                    </h2>

                    <p className="text-sm text-muted mb-6">
                        {!isValidSession
                            ? 'Your secure session has expired. Please log in again to continue.'
                            : 'You do not have the necessary permissions to view this page. If you believe this is an error, please contact your administrator.'}
                    </p>

                    <Button
                        variant="outline"
                        onClick={() => !isValidSession ? navigate('/login') : navigate(-1)}
                        leftIcon={`fas ${!isValidSession ? 'fa-sign-in-alt' : 'fa-arrow-left'}`}
                        className="w-full justify-center"
                    >
                        {!isValidSession ? 'Go to Login' : 'Go Back'}
                    </Button>
                </div>
            </div>
        );
    }

    // 6. If the backend confirms they are authenticated AND they have the right role, let them in!
    return children ? <>{children}</> : <Outlet />;
}