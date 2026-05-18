import React from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
// import Sidebar from './Sidebar'; // Adjust path as needed
// import { principalMenu } from '../../config/navigation'; // Import your specific role menu
// import { useAuthData } from '../../hooks/useAuthData'; // Assuming you use this hook
import Sidebar from '../../shared/components/Sidebar';
import { getParentMenu, principalMenu } from '../../constants/constants';
import { useLogoutUser } from '../../api_services/auth_api/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/slices/authSlice';
import { queryClient } from '../../lib/queryClient';
import type { RootState } from '../../features/store/store';

const DashboardChildrens: React.FC = () => {
    const navigate = useNavigate();
    // Get data from your auth hook or Redux store
    const dispatch = useDispatch();
    // const { schoolId, userName, currentRole } = useAuthData();
    const { role, studentId } = useSelector((state: RootState) => state.auth)

    const activeStudentId = studentId && studentId.length > 0 ? studentId[0] : null;

    // const searchParam = useSearchParams()

    // const activeStudentId = searchParam.get("studentId")

    
    

    const logoutMutation = useLogoutUser();

    const handleLogout = async () => {
        try {
            // 1. Call Backend API using mutateAsync
            const response = await logoutMutation.mutateAsync();

            if (response.ok) {
                // showToast(response.message || 'Logged out successfully', 'success');
            }
        } catch (error: any) {
            console.error("Server logout failed:", error.message);
            // Optional: showToast("Session ended", "warning");
        } finally {
            // 2. Clear Redux State (Resets to initialState)
            dispatch(logout());

            // 3. Clear TanStack Query Cache
            queryClient.clear();

            // 4. Navigate to Login
            navigate('/login');
        }
    };

    console.log("role from redux", role)


    let currentMenu:any[] = [];
    if (role !== 'parent') {
        currentMenu = principalMenu;
    } else if (role === 'parent') {
        currentMenu = getParentMenu(activeStudentId);
    }

    return (
        // Uses w-full and h-full to respect your index.css root boundaries
        <div className="w-full h-full border border-primary-soft flex bg-surface relative ">

            {/* Sidebar is fixed, so it sits on top of the layout structure */}
            <Sidebar
                schoolName="JAI HIND PUBLIC SCHOOL" // Replace with actual dynamic name if available
                schoolPath="/dashboard"
                menuItems={currentMenu} // You can dynamically pass menus based on currentRole here
                onLogout={handleLogout}
            />

            {/* Main Content Area:
        - ml-20: Leaves exactly 5rem (80px) space for the collapsed sidebar.
        - flex-1 & w-full: Takes up all the remaining percentage of the width.
        - h-full & overflow-y-auto: Allows the content to scroll independently of the sidebar.
      */}
            <main className="flex-1 w-full h-full bg-mainBg transition-all duration-300">

                {/* Optional: Top Mobile Navbar / Header area can go here if needed later */}

                {/* The Outlet renders the nested routes (Profile, Class, Section, etc.) */}
                <div className="w-full h-full p-4 md:p-6">
                    <Outlet />
                </div>

            </main>

        </div>
    );
};

export default DashboardChildrens;