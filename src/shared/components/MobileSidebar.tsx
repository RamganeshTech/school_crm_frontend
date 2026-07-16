import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetAllSchools } from '../../api_services/schoolConfig_api/schoolapi';
import { useDispatch } from 'react-redux';
import { setSchool } from '../../features/slices/authSlice';
import type { MenuItem } from './Sidebar'; // Import types from your main Sidebar file

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    schoolName: string;
    schoolPath: string;
    menuItems: MenuItem[];
    onLogout: () => void;
}

export default function MobileSidebar({ isOpen, onClose, schoolName, schoolPath, menuItems, onLogout }: MobileSidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});
    const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);

    const { isPlatformAdmin } = useAuthData();
    const { data: schools, isLoading: isSchoolsLoading } = useGetAllSchools();

    // Auto-expand active submenus on load
    useEffect(() => {
        const activeSubMenus: Record<string, boolean> = {};
        menuItems.forEach((item) => {
            if (item.subMenu?.some(
                (sub) => location.pathname === sub.path || location.pathname.startsWith(`${sub.path}/`)
            )) {
                activeSubMenus[item.name] = true;
            }
        });
        setOpenSubMenus(prev => ({ ...prev, ...activeSubMenus }));
    }, [location.pathname, menuItems]);

    // Close dropdowns if sidebar closes
    useEffect(() => {
        if (!isOpen) setIsSchoolDropdownOpen(false);
    }, [isOpen]);

    const handleSchoolChange = ({ selectedSchoolId, selectedSchoolName }: { selectedSchoolId: string, selectedSchoolName: string }) => {
        dispatch(setSchool({ schoolId: selectedSchoolId, schoolName: selectedSchoolName }));
        setIsSchoolDropdownOpen(false);
        onClose(); // Close sidebar on school switch
        navigate('/dashboard');
    };

    const toggleSubMenu = (menuName: string) => {
        setOpenSubMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
    };

    const handleNav = (path: string) => {
        navigate(path);
        onClose(); // Auto-close sidebar on mobile after navigation
    };

    return (
        <>
            {/* Backdrop Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[998] md:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Panel */}
            <aside
                className={`fixed inset-y-0 left-0 z-[999] w-64 bg-surface border-r border-border flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Header / School Info */}
                <div className="h-14 flex justify-between items-center px-4 border-b border-border shrink-0">
                    {isPlatformAdmin ? (
                        <div className="w-full relative">
                            <button
                                onClick={() => setIsSchoolDropdownOpen(!isSchoolDropdownOpen)}
                                className="flex outline-none items-center justify-between w-full p-1 rounded-xl transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md">
                                        <span className="text-inverse font-bold text-sm">
                                            {schoolName.charAt(0)}
                                        </span>
                                    </div>
                                    <span className="font-poppins font-semibold text-foreground text-sm truncate max-w-[120px]">
                                        {schoolName}
                                    </span>
                                </div>
                                <i className={`fas fa-chevron-down text-xs text-muted transition-transform duration-300 ${isSchoolDropdownOpen ? 'rotate-180' : ''}`}></i>
                            </button>

                            {isSchoolDropdownOpen && (
                                <div className="absolute top-[110%] left-0 w-full max-h-64 overflow-y-auto bg-surface border border-border shadow-lg rounded-xl z-50 flex flex-col p-2 gap-1 custom-scrollbar">
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider px-3 pt-1 pb-2">Switch School</span>
                                    {isSchoolsLoading ? (
                                        <div className="px-3 py-4 text-center">
                                            <i className="fas fa-circle-notch fa-spin text-primary opacity-50 text-sm"></i>
                                        </div>
                                    ) : (
                                        schools?.map((school: any) => (
                                            <button
                                                key={school._id}
                                                onClick={() => handleSchoolChange({ selectedSchoolId: school._id, selectedSchoolName: school.name })}
                                                className="flex items-center gap-3 w-full text-left p-2 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors group"
                                            >
                                                {school.logo?.url ? (
                                                    <img src={school.logo.url} alt={school.name} className="w-6 h-6 rounded-md object-cover shrink-0 border border-border" />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-md bg-mainBg text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-border">
                                                        {school.name.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="truncate">{school.name}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to={schoolPath} className="flex outline-none items-center gap-4 overflow-hidden w-full p-1 md:p-2">

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md">
                                    <span className="text-inverse font-bold text-sm">{schoolName.charAt(0)}</span>
                                </div>
                                <span className="font-poppins font-semibold text-foreground text-sm truncate max-w-[150px]">
                                    {schoolName}
                                </span>
                            </div>
                        </Link>

                    )}

                    {/* Close Button */}
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-mainBg text-muted hover:text-danger hover:bg-danger/10 transition-colors ml-2 shrink-0">
                        <i className="fas fa-times text-sm"></i>
                    </button>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2 no-scrollbar">
                    {menuItems.map((item) => {
                        const isParentActive = item.path === '/dashboard'
                            ? location.pathname === '/dashboard'
                            : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

                        const hasSubMenu = item.subMenu && item.subMenu.length > 0;
                        const isSubMenuOpen = openSubMenus[item.name];

                        return (
                            <div key={item.name} className="flex flex-col">
                                <button
                                    onClick={() => hasSubMenu ? toggleSubMenu(item.name) : handleNav(item.path)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 
                                        ${isParentActive ? 'bg-primary text-inverse shadow-md shadow-primary/20' : 'text-muted hover:bg-primary-soft hover:text-primary'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <i className={`${item.icon} text-lg w-6 text-center ${isParentActive ? 'text-inverse' : ''}`}></i>
                                        <span className="font-medium text-[15px] truncate">{item.name}</span>
                                    </div>
                                    {hasSubMenu && (
                                        <i className={`fas fa-chevron-down text-sm transition-transform duration-300 ${isSubMenuOpen ? 'rotate-180' : ''}`}></i>
                                    )}
                                </button>

                                {/* Sub-Menu */}
                                {hasSubMenu && (
                                    <div className={`grid transition-all duration-300 ease-in-out ${isSubMenuOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden">
                                            <div className="ml-4 pl-4 pr-2 py-2 space-y-1 border-l border-border flex flex-col">
                                                {item.subMenu?.map((sub) => {
                                                    const isChildActive = location.pathname === sub.path || location.pathname.startsWith(`${sub.path}/`);
                                                    return (
                                                        <button
                                                            key={sub.path}
                                                            onClick={() => handleNav(sub.path)}
                                                            className={`flex items-center gap-3 w-full text-left py-2 px-3 rounded-lg text-sm font-medium transition-colors
                                                                ${isChildActive ? 'text-primary bg-primary-soft' : 'text-muted hover:text-foreground hover:bg-surface'}`}
                                                        >
                                                            <i className={`${sub.icon} text-base w-5 text-center`}></i>
                                                            <span className="truncate">{sub.name}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-border shrink-0">
                    <button
                        onClick={() => { onClose(); onLogout(); }}
                        className="flex items-center justify-center gap-3 w-full p-3 rounded-xl text-danger bg-danger/10 hover:bg-danger hover:text-white transition-colors font-medium"
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}