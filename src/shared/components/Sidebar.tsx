

//  THIRD VERSION

import { useEffect, useState, type ElementType } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetAllSchools } from '../../api_services/schoolConfig_api/schoolapi';
import { useDispatch } from 'react-redux';
import { setSchool } from '../../features/slices/authSlice';

export interface SubMenuItem {
    icon: string;
    name: string;
    path: string;
}

export interface MenuItem {
    name: string;
    path: string;
    icon: ElementType | string;
    subMenu?: SubMenuItem[];
}

interface SidebarProps {
    schoolName: string;
    schoolPath: string;
    menuItems: MenuItem[];
    onLogout: () => void;
}

export default function Sidebar({ schoolName, schoolPath, menuItems, onLogout }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isHovered, setIsHovered] = useState(false);
    const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

    const { isPlatformAdmin } = useAuthData();
    const { data: schools, isLoading: isSchoolsLoading } = useGetAllSchools();

    const isExpanded = isManuallyExpanded || isHovered;

    const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);

    // 🌟 3. Auto-close the school dropdown if the sidebar shrinks
    useEffect(() => {
        if (!isExpanded) {
            setIsSchoolDropdownOpen(false);
        }
    }, [isExpanded]);


    // useEffect(() => {
    //     if (!isExpanded) {
    //         setOpenSubMenus({});
    //     }
    // }, [isExpanded]);


    // 🌟 2. Handle the school selection
    const handleSchoolChange = ({ selectedSchoolId, selectedSchoolName }: { selectedSchoolId: string, selectedSchoolName: string }) => {
        // Dispatch the ID into your authSlice exactly as you structured it
        dispatch(setSchool({ schoolId: selectedSchoolId, schoolName: selectedSchoolName }));

        // Close the dropdown and navigate to the dashboard root
        setIsSchoolDropdownOpen(false);
        navigate('/dashboard');
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        // ✅ Batching: Both states update at once, triggering only ONE render.
        setIsHovered(false);
        setOpenSubMenus({});
    };


    const toggleSubMenu = (menuName: string) => {
        setOpenSubMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    const handleNav = (path: string) => {
        navigate(path);
    };

    // 🛑 THE FIX: Force the hover state off when clicking the manual toggle
    const toggleSidebar = () => {
        setIsManuallyExpanded(!isManuallyExpanded);
        // setIsHovered(false); // This stops the hover state from "blocking" the collapse!
    };

    return (
        <aside
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`h-full bg-surface border-r border-border transition-all duration-300 ease-in-out flex flex-col shadow-sm shrink-0
        ${isExpanded ? 'w-36 md:w-64' : 'w-10 md:w-20'}`}
        >
            <div className="h-14 flex items-center px-3 border-b border-border border-opacity-50 shrink-0">
                {/* <Link to={schoolPath} className="flex outline-none items-center gap-4 overflow-hidden w-full">
                    <div className="w-7 h-7 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                        <span className="text-inverse  font-bold text-md md:text-lg">
                            {schoolName.charAt(0)}
                        </span>
                    </div>
                    <span className={`font-poppins font-semibold text-foreground text-[12px] md:text-lg truncate transition-all duration-300 overflow-hidden
            ${isExpanded ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0'}`}>
                        {schoolName}
                    </span>
                </Link> */}


                {isPlatformAdmin ? (
                    <div className="w-full relative">
                        <button
                            onClick={() => setIsSchoolDropdownOpen(!isSchoolDropdownOpen)}
                            className="flex outline-none items-center justify-between w-full hover:bg-mainBg p-1 md:p-2 rounded-xl transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className="w-7 h-7 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/20 overflow-hidden">
                                    <span className="text-inverse font-bold text-md md:text-lg">
                                        {schoolName.charAt(0)}
                                    </span>
                                </div>
                                <span className={`font-poppins font-semibold text-foreground text-[12px] md:text-lg truncate transition-all duration-300 overflow-hidden text-left
                                    ${isExpanded ? 'opacity-100 max-w-[120px]' : 'opacity-0 max-w-0'}`}>
                                    {schoolName}
                                </span>
                            </div>

                            {isExpanded && (
                                <i className={`fas fa-chevron-down text-xs text-muted transition-transform duration-300 ${isSchoolDropdownOpen ? 'rotate-180' : ''}`}></i>
                            )}
                        </button>

                        {isSchoolDropdownOpen && (
                            <div className="absolute top-[110%] left-0 w-48 md:w-full max-h-64 overflow-y-auto 
                            bg-surface border border-border shadow-lg rounded-xl z-50 flex flex-col p-2 gap-1 animate-fade-in show-scrollbar">
                                <span className="text-[10px] font-bold text-muted uppercase tracking-wider px-3 pt-1 pb-2">
                                    Switch School
                                </span>

                                {isSchoolsLoading ? (
                                    <div className="px-3 py-4 text-center">
                                        <i className="fas fa-circle-notch fa-spin text-primary opacity-50 text-sm"></i>
                                    </div>
                                ) : (
                                    schools?.map((school: any) => (
                                        <button
                                            key={school._id}
                                            onClick={() => handleSchoolChange({ selectedSchoolId: school._id, selectedSchoolName: school.name })}
                                            className="flex cursor-pointer items-center gap-3 w-full text-left px-2 py-2 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors group"
                                        >
                                            {school.logo?.url ? (
                                                <img
                                                    src={school.logo.url}
                                                    alt={school.name}
                                                    className="w-6 h-6 rounded-md object-cover shrink-0 border border-border group-hover:border-primary/30"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 rounded-md bg-mainBg text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-border group-hover:border-primary/30">
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
                        <div className="w-7 h-7 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                            <span className="text-inverse font-bold text-md md:text-lg">
                                {schoolName.charAt(0)}
                            </span>
                        </div>
                        <span className={`font-poppins font-semibold text-foreground text-[12px] md:text-lg truncate transition-all duration-300 overflow-hidden
                            ${isExpanded ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0'}`}>
                            {schoolName}
                        </span>
                    </Link>

                )}
            </div>

            {/* --- MAIN NAVIGATION --- */}
            <nav className="flex-1 overflow-y-auto md:px-3 pl-2 md:pl-4 py-3 md:py-6 space-y-2 no-scrollbar">
                {menuItems.map((item) => {
                    const isParentActive = item.path === '/dashboard'
                        ? location.pathname === '/dashboard'
                        // : location.pathname.startsWith(item.path);
                        // Matches exactly OR matches a sub-route strictly separated by a slash '/'
                        : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

                    const hasSubMenu = item.subMenu && item.subMenu.length > 0;
                    const isSubMenuOpen = openSubMenus[item.name];

                    return (
                        <div key={item.name} className="flex flex-col">
                            <button
                                onClick={() => hasSubMenu ? toggleSubMenu(item.name) : handleNav(item.path)}
                                className={`${isExpanded ? 'w-full' : 'w-fit'} cursor-pointer flex items-center justify-between p-1.5 md:p-3 rounded-xl transition-all duration-200 group
                  ${isParentActive
                                        ? 'bg-primary text-inverse shadow-md shadow-primary/20'
                                        : 'text-muted hover:bg-primary-soft hover:text-primary'}`}
                            >
                                <div className={` flex items-center  overflow-hidden ${isExpanded ? 'gap-3' : ''}`}>
                                    <i className={`${item.icon} text-xl shrink-0 transition-colors w-6 md:w-6 text-left md:text-center ${isParentActive ? 'text-inverse' : 'group-hover:text-primary'}`}></i>

                                    <span className={`font-medium whitespace-nowrap overflow-hidden text-[13px] md:text-[16px] transition-all duration-300
                    ${isExpanded ? 'opacity-100 ' : 'opacity-0 max-w-0'}`}>
                                        {item.name}
                                        {/* {item.name.length > 12 ? `${item.name.slice(0, 12)}...` : item.name} */}
                                    </span>
                                </div>

                                {hasSubMenu && isExpanded && (
                                    <i className={`fas fa-chevron-down text-[14px] transition-transform duration-300 shrink-0 ${isSubMenuOpen ? 'rotate-180' : ''}`}></i>
                                )}
                            </button>

                            {/* Sub-Menu */}
                            {hasSubMenu && isExpanded && (
                                <div className={`grid transition-all duration-300 ease-in-out ${isSubMenuOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'}`}>
                                    <div className="overflow-hidden">
                                        <div className="ml-4 pl-4 pr-3 py-2 space-y-1 border-l border-border flex flex-col">
                                            {item.subMenu?.map((sub) => {
                                                // const isChildActive = location.pathname === sub.path;
                                                const isChildActive = location.pathname === sub.path || location.pathname.startsWith(`${sub.path}/`);
                                                return (
                                                    <button key={sub.path}
                                                        onClick={() => navigate(sub.path)}
                                                        className={`flex cursor-pointer items-center gap-2 w-full text-left py-2 px-2 rounded-lg text-sm font-medium transition-colors
                              ${isChildActive
                                                                ? 'text-primary bg-primary-soft'
                                                                : 'text-muted hover:text-foreground hover:bg-surface'}`}
                                                    >


                                                        <i className={`${sub.icon} text-xl shrink-0 transition-colors w-6 md:w-6 text-left md:text-center ${isParentActive ? 'text-inverse' : 'group-hover:text-primary'}`}></i>


                                                        {/* <Link */}

                                                        {isChildActive ? (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                        ) : (
                                                            // <div className="w-1.5 h-1.5 shrink-0" />
                                                            <></>
                                                        )}
                                                        <span className="truncate">{sub.name}</span>
                                                        {/* </Link> */}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                            }
                        </div>
                    );
                })}
            </nav>

            {/* --- FOOTER --- */}
            <div className={`p-1 md:p-2 border-t border-border shrink-0 flex items-center transition-all duration-300 ${isExpanded ? 'flex-row gap-2 justify-between' : 'flex-col gap-2 md:gap-4'}`}>

                <button
                    onClick={toggleSidebar} // 🛑 Using the new fixed toggle function here
                    className="flex cursor-pointer items-center justify-center p-1.5 md:p-3 rounded-xl text-muted hover:bg-primary-soft hover:text-primary transition-colors shrink-0"
                    title="Toggle Sidebar"
                >
                    <i className={`text-md md:text-xl w-3 md:w-6 text-center transition-transform duration-300 ${isManuallyExpanded ? 'fas fa-angle-double-left' : 'fas fa-angle-double-right'}`}></i>
                </button>

                <button
                    onClick={onLogout}
                    className={`flex cursor-pointer items-center justify-center gap-2 md:gap-1 p-1.5 md:p-3 rounded-xl text-danger hover:bg-danger/10 transition-colors group ${isExpanded ? 'flex-1' : 'w-full'}`}
                    title="Logout"
                >
                    <i className="fas fa-sign-out-alt text-xl shrink-0 w-3 md:w-6 text-center group-hover:text-danger"></i>

                    <span className={`text-sm md:text-lg font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 max-w-[100px] ml-2' : 'opacity-0 max-w-0 ml-0'}`}>
                        Logout
                    </span>
                </button>
            </div>
        </aside >
    );
}