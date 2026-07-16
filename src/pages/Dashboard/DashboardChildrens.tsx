import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
// import Sidebar from './Sidebar'; // Adjust path as needed
// import { principalMenu } from '../../config/navigation'; // Import your specific role menu
// import { useAuthData } from '../../hooks/useAuthData'; // Assuming you use this hook
import Sidebar from '../../shared/components/Sidebar';
// import { accountantMenu, getParentInitialMenu, getParentMenu, principalMenu, teacherMenu } from '../../constants/constants';
import { useLogoutUser } from '../../api_services/auth_api/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/slices/authSlice';
import { queryClient } from '../../lib/queryClient';
import type { RootState } from '../../features/store/store';
import { GlobalHeader } from '../../shared/components/GlobalHeader';
// import { useCurrentStudent } from '../../hooks/useCurrentStudent';
// import { useAuthData } from '../../hooks/useAuthData';
import { useAuthorizedMenu } from '../../hooks/useAuthorizedMenu';
import { toast } from '../../shared/ui/ToastContext';
import MobileSidebar from '../../shared/components/MobileSidebar';

const DashboardChildrens: React.FC = () => {
    const navigate = useNavigate();
    // Get data from your auth hook or Redux store
    const dispatch = useDispatch();
    // const { schoolId } = useAuthData();
    // const { role, schoolName } = useSelector((state: RootState) => state.auth)

    // const activeStudentId = studentId && studentId.length > 0 ? studentId[0] : null;

    const { schoolName } = useSelector(
        (state: RootState) => state.auth
    );

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // const { studentId } = useCurrentStudent();

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
            toast.error(error.message || "failed to logout");
        } finally {
            // 2. Clear Redux State (Resets to initialState)
            dispatch(logout());

            // 3. Clear TanStack Query Cache
            queryClient.clear();

            // 4. Navigate to Login
            navigate('/login');
        }
    };



    // // Inside your component or a utils file:
    // const getAuthorizedMenu = (role: string | null, activeStudentId: string | null) => {
    //     if (role === 'parent') {
    //         return getParentMenu(activeStudentId);
    //     }

    //     // Start with the full list
    //     let menu = [...principalMenu];

    //     // RESTRICTION: Hide 'Staffs' if the role is NOT 'correspondent'
    //     if (role !== 'correspondent') {
    //         menu = menu.filter(item => item.name !== 'Staffs');
    //     }

    //     return menu;
    // };


    // const getAuthorizedMenu = (role: string | null, activeStudentId: string | null) => {
    //     // 1. Explicit Arrays for highly restricted roles
    //     if (role === 'parent') return getParentMenu(activeStudentId);
    //     if (role === 'teacher') return teacherMenu;
    //     if (role === 'accountant') return accountantMenu;

    //     // 2. Base list for powerful roles
    //     let menu = [...principalMenu];

    //     // 3. Neglect (Filter out) specific items based on role

    //     // Only correspondent gets to see 'Staffs'
    //     if (role !== 'correspondent') {
    //         menu = menu.filter(item => item.name !== 'Staffs');
    //     }

    //     // Administrators get everything except 'School List' (and Staffs, which is handled above)
    //     // if (role === 'administrator') {
    //     //     menu = menu.filter(item => item.name !== 'School List');
    //     // }

    //     // // Principals & Vice Principals get everything, but shouldn't see multi-school management 
    //     // if (role === 'principal' || role === 'viceprincipal') {
    //     //     menu = menu.filter(item => item.name !== 'School List');
    //     // }

    //     if (role !== 'correspondent' || schoolId !== '6942923ab194c60dc810cc6b') {
    //     menu = menu.filter(item => item.name !== 'School List');
    // }

    //     return menu;
    // };

    // const currentMenu = useMemo(() => {
    //     if (role === "parent") {
    //         return studentId
    //             ? getParentMenu(studentId)
    //             : getParentInitialMenu();
    //     }

    //     return getAuthorizedMenu(role, studentId);
    // }, [role, studentId]);

    const menuItems = useAuthorizedMenu();






    return (
        // Uses w-full and h-full to respect your index.css root boundaries
        <div className="w-full h-full border border-primary-soft flex bg-surface relative ">

            {/* Sidebar is fixed, so it sits on top of the layout structure */}
            {/* <Sidebar
                schoolName={schoolName || ""} 
                schoolPath="/dashboard"
                menuItems={menuItems}
                onLogout={handleLogout}
            /> */}

            {/* Desktop Sidebar (Hidden on small screens via standard tailwind wrapper) */}
            <div className="hidden md:flex h-full z-10 shrink-0">
                <Sidebar
                    schoolName={schoolName || ""}
                    schoolPath="/dashboard"
                    menuItems={menuItems}
                    onLogout={handleLogout}
                />
            </div>

            {/* Mobile Sidebar (Rendered conditionally via state) */}
            <MobileSidebar 
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                schoolName={schoolName || ""}
                schoolPath="/dashboard"
                menuItems={menuItems}
                onLogout={handleLogout}
            />

            {/* Main Content Area:
        - ml-20: Leaves exactly 5rem (80px) space for the collapsed sidebar.
        - flex-1 & w-full: Takes up all the remaining percentage of the width.
        - h-full & overflow-y-auto: Allows the content to scroll independently of the sidebar.
      */}
            {/* <main className="flex-1 w-full h-full bg-mainBg transition-all duration-300"> */}
            <main className="flex flex-col flex-1 min-w-0 h-full bg-mainBg">

                {/* Optional: Top Mobile Navbar / Header area can go here if needed later */}
                {/* <GlobalHeader /> */}
                <div className="shrink-0">
                    {/* <GlobalHeader /> */}
                    <GlobalHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
                </div>
                {/* The Outlet renders the nested routes (Profile, Class, Section, etc.) */}
                {/* <div className="w-full h-full p-4 md:p-6"> */}
                <div className="flex-1 w-full p-4 overflow-y-auto">
                    <Outlet />
                </div>

            </main>

        </div>
    );
};

export default DashboardChildrens;