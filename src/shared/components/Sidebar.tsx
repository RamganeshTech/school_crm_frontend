


// import { useState, useEffect, ElementType } from 'react';
// import { useLocation, Link, useNavigate } from 'react-router-dom';
// // import { MenuItem } from '../../config/navigation';

// //  Strict typing for your navigation props
// export interface SubMenuItem {
//     name: string;
//     path: string;
// }

// export interface MenuItem {
//     name: string;
//     path: string;
//     icon: ElementType | string; // Type for Lucide React icons
//     subMenu?: SubMenuItem[];
// }


// interface SidebarProps {
//     schoolName: string;
//     schoolPath: string;
//     menuItems: MenuItem[];
//     onLogout: () => void;
// }

// export default function Sidebar({ schoolName, schoolPath, menuItems, onLogout }: SidebarProps) {
//     const location = useLocation();
//     const navigate = useNavigate();

//     const [isHovered, setIsHovered] = useState(false);
//     const [isManuallyExpanded, setIsManuallyExpanded] = useState(true);
//     const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

//     const isExpanded = isManuallyExpanded || isHovered;

//     useEffect(() => {
//         if (!isExpanded) {
//             setOpenSubMenus({});
//         }
//     }, [isExpanded]);

//     const toggleSubMenu = (menuName: string) => {
//         setOpenSubMenus(prev => ({
//             ...prev,
//             [menuName]: !prev[menuName]
//         }));
//     };

//     const handleNav = (path: string) => {
//         navigate(path);
//     };

//     return (
//         <aside
//             onMouseEnter={() => setIsHovered(true)}
//             onMouseLeave={() => setIsHovered(false)}
//             className={`fixed left-0 top-0 h-screen bg-surface border-r border-border transition-all duration-300 ease-in-out z-50 flex flex-col shadow-sm
//         ${isExpanded ? 'w-64' : 'w-20'}`}
//         >
//             {/* --- HEADER --- */}
//             <div className="h-20 flex items-center px-5 border-b border-border border-opacity-50 shrink-0">
//                 <Link to={schoolPath} className="flex items-center gap-4 overflow-hidden w-full">
//                     <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
//                         <span className="text-inverse font-bold text-lg">
//                             {schoolName.charAt(0)}
//                         </span>
//                     </div>
//                     <span className={`font-poppins font-semibold text-foreground truncate transition-opacity duration-300
//             ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
//                         {schoolName}
//                     </span>
//                 </Link>
//             </div>

//             {/* --- MAIN NAVIGATION --- */}
//             <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2 no-scrollbar">
//                 {menuItems.map((item) => {
//                     const isParentActive = location.pathname.startsWith(item.path);
//                     const hasSubMenu = item.subMenu && item.subMenu.length > 0;
//                     const isSubMenuOpen = openSubMenus[item.name];

//                     return (
//                         <div key={item.name} className="flex flex-col">
//                             <button
//                                 onClick={() => hasSubMenu ? toggleSubMenu(item.name) : handleNav(item.path)}
//                                 className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group
//                   ${isParentActive
//                                         ? 'bg-primary text-inverse shadow-md shadow-primary/20'
//                                         : 'text-muted hover:bg-primary-soft hover:text-primary'}`}
//                             >
//                                 <div className="flex items-center gap-4 overflow-hidden">
//                                     {/* Map Icon String to Font Awesome <i> tag */}
//                                     <i className={`${item.icon} text-xl shrink-0 transition-colors w-6 text-center ${isParentActive ? 'text-inverse' : 'group-hover:text-primary'}`}></i>

//                                     <span className={`font-medium whitespace-nowrap transition-opacity duration-300
//                     ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
//                                         {item.name}
//                                     </span>
//                                 </div>

//                                 {/* Font Awesome Chevron */}
//                                 {hasSubMenu && isExpanded && (
//                                     <i
//                                         className={`fas fa-chevron-down text-[14px] transition-transform duration-300 shrink-0 ${isSubMenuOpen ? 'rotate-180' : ''}`}
//                                     ></i>
//                                 )}
//                             </button>

//                             {/* Sub-Menu Grid Animation */}
//                             {hasSubMenu && isExpanded && (
//                                 <div className={`grid transition-all duration-300 ease-in-out ${isSubMenuOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'}`}>
//                                     <div className="overflow-hidden">
//                                         <div className="pl-12 pr-3 py-2 space-y-1 relative">
//                                             <div className="absolute left-7 top-0 bottom-4 w-px bg-border rounded-full" />

//                                             {item.subMenu?.map((sub) => {
//                                                 const isChildActive = location.pathname === sub.path;
//                                                 return (
//                                                     <Link
//                                                         key={sub.path}
//                                                         to={sub.path}
//                                                         className={`block w-full text-left py-2 px-3 rounded-lg text-sm font-medium transition-colors relative
//                               ${isChildActive
//                                                                 ? 'text-primary bg-primary-soft'
//                                                                 : 'text-muted hover:text-foreground hover:bg-surface'}`}
//                                                     >
//                                                         {isChildActive && (
//                                                             <div className="absolute left-[-23px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
//                                                         )}
//                                                         {sub.name}
//                                                     </Link>
//                                                 );
//                                             })}
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     );
//                 })}
//             </nav>

//             {/* --- FOOTER --- */}
//             <div className="p-4 border-t border-border shrink-0 space-y-2">
//                 <button
//                     onClick={() => setIsManuallyExpanded(!isManuallyExpanded)}
//                     className="w-full flex items-center gap-4 p-3 rounded-xl text-muted hover:bg-primary-soft hover:text-primary transition-colors"
//                 >
//                     {/* Font Awesome Collapse/Expand Icons */}
//                     <i className={`text-xl shrink-0 w-6 text-center ${isManuallyExpanded ? 'fas fa-angle-double-left' : 'fas fa-angle-double-right'}`}></i>

//                     <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
//                         Collapse Menu
//                     </span>
//                 </button>

//                 <button
//                     onClick={onLogout}
//                     className="w-full flex items-center gap-4 p-3 rounded-xl text-danger hover:bg-danger/10 transition-colors group"
//                 >
//                     {/* Font Awesome Logout Icon */}
//                     <i className="fas fa-sign-out-alt text-xl shrink-0 w-6 text-center group-hover:text-danger"></i>

//                     <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
//                         Logout
//                     </span>
//                 </button>
//             </div>
//         </aside>
//     );
// }



// import { useState, useEffect, ElementType } from 'react';
// import { useLocation, Link, useNavigate } from 'react-router-dom';

// export interface SubMenuItem {
//     name: string;
//     path: string;
// }

// export interface MenuItem {
//     name: string;
//     path: string;
//     icon: ElementType | string;
//     subMenu?: SubMenuItem[];
// }

// interface SidebarProps {
//     schoolName: string;
//     schoolPath: string;
//     menuItems: MenuItem[];
//     onLogout: () => void;
// }

// export default function Sidebar({ schoolName, schoolPath, menuItems, onLogout }: SidebarProps) {
//     const location = useLocation();
//     const navigate = useNavigate();

//     const [isHovered, setIsHovered] = useState(false);
//     const [isManuallyExpanded, setIsManuallyExpanded] = useState(true);
//     const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

//     const isExpanded = isManuallyExpanded || isHovered;

//     useEffect(() => {
//         if (!isExpanded) {
//             setOpenSubMenus({});
//         }
//     }, [isExpanded]);

//     const toggleSubMenu = (menuName: string) => {
//         setOpenSubMenus(prev => ({
//             ...prev,
//             [menuName]: !prev[menuName]
//         }));
//     };

//     const handleNav = (path: string) => {
//         navigate(path);
//     };

//     return (
//         <aside
//             onMouseEnter={() => setIsHovered(true)}
//             onMouseLeave={() => setIsHovered(false)}
//             // 🛑 REMOVED: fixed, left-0, top-0, relative, absolute
//             // ✅ ADDED: h-full (to fill parent), shrink-0 (to prevent squishing in a flex parent)
//             className={`h-full bg-surface border-r border-border transition-all duration-300 ease-in-out z-50 flex flex-col shadow-sm shrink-0
//         ${isExpanded ? 'w-64' : 'w-20'}`}
//         >
//             {/* --- HEADER --- */}
//             <div className="h-20 flex items-center px-5 border-b border-border border-opacity-50 shrink-0">
//                 <Link to={schoolPath} className="flex items-center gap-4 overflow-hidden w-full">
//                     <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
//                         <span className="text-inverse font-bold text-lg">
//                             {schoolName.charAt(0)}
//                         </span>
//                     </div>
//                     <span className={`font-poppins font-semibold text-foreground truncate transition-all duration-300 overflow-hidden
//             ${isExpanded ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0'}`}>
//                         {schoolName}
//                     </span>
//                 </Link>
//             </div>

//             {/* --- MAIN NAVIGATION --- */}
//             <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2 no-scrollbar">
//                 {menuItems.map((item) => {
//                     const isParentActive = item.path === '/dashboard'
//                         ? location.pathname === '/dashboard'
//                         : location.pathname.startsWith(item.path);

//                     const hasSubMenu = item.subMenu && item.subMenu.length > 0;
//                     const isSubMenuOpen = openSubMenus[item.name];

//                     return (
//                         <div key={item.name} className="flex flex-col">
//                             <button
//                                 onClick={() => hasSubMenu ? toggleSubMenu(item.name) : handleNav(item.path)}
//                                 className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group
//                   ${isParentActive
//                                         ? 'bg-primary text-inverse shadow-md shadow-primary/20'
//                                         : 'text-muted hover:bg-primary-soft hover:text-primary'}`}
//                             >
//                                 <div className="flex items-center gap-4 overflow-hidden">
//                                     <i className={`${item.icon} text-xl shrink-0 transition-colors w-6 text-center ${isParentActive ? 'text-inverse' : 'group-hover:text-primary'}`}></i>

//                                     <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300
//                     ${isExpanded ? 'opacity-100 max-w-[120px]' : 'opacity-0 max-w-0'}`}>
//                                         {item.name}
//                                     </span>
//                                 </div>

//                                 {hasSubMenu && isExpanded && (
//                                     <i className={`fas fa-chevron-down text-[14px] transition-transform duration-300 shrink-0 ${isSubMenuOpen ? 'rotate-180' : ''}`}></i>
//                                 )}
//                             </button>

//                             {/* Sub-Menu */}
//                             {hasSubMenu && isExpanded && (
//                                 <div className={`grid transition-all duration-300 ease-in-out ${isSubMenuOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'}`}>
//                                     <div className="overflow-hidden">
//                                         {/* 🛑 REMOVED Absolute lines and relative wrappers */}
//                                         {/* ✅ ADDED: Pure Flexbox and standard border-l */}
//                                         <div className="ml-8 pl-4 pr-3 py-2 space-y-1 border-l border-border flex flex-col">
//                                             {item.subMenu?.map((sub) => {
//                                                 const isChildActive = location.pathname === sub.path;
//                                                 return (
//                                                     <Link
//                                                         key={sub.path}
//                                                         to={sub.path}
//                                                         className={`flex items-center gap-2 w-full text-left py-2 px-3 rounded-lg text-sm font-medium transition-colors
//                               ${isChildActive
//                                                             ? 'text-primary bg-primary-soft'
//                                                             : 'text-muted hover:text-foreground hover:bg-surface'}`}
//                                                     >
//                                                         {/* Pure Flexbox inline dot (No absolute positioning) */}
//                                                         {isChildActive ? (
//                                                             <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
//                                                         ) : (
//                                                             <div className="w-1.5 h-1.5 shrink-0" /> /* invisible spacer to keep text aligned */
//                                                         )}
//                                                         <span className="truncate">{sub.name}</span>
//                                                     </Link>
//                                                 );
//                                             })}
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     );
//                 })}
//             </nav>

//             {/* --- FOOTER --- */}
//             <div className={`p-4 border-t border-border shrink-0 flex items-center transition-all duration-300 ${isExpanded ? 'flex-row gap-2 justify-between' : 'flex-col gap-4'}`}>

//                 <button
//                     onClick={() => setIsManuallyExpanded(!isManuallyExpanded)}
//                     className="flex items-center justify-center p-3 rounded-xl text-muted hover:bg-primary-soft hover:text-primary transition-colors shrink-0"
//                     title="Toggle Sidebar"
//                 >
//                     <i className={`text-xl w-6 text-center transition-transform duration-300 ${isManuallyExpanded ? 'fas fa-angle-double-left' : 'fas fa-angle-double-right'}`}></i>
//                 </button>

//                 <button
//                     onClick={onLogout}
//                     className={`flex items-center justify-center p-3 rounded-xl text-danger hover:bg-danger/10 transition-colors group ${isExpanded ? 'flex-1' : 'w-full'}`}
//                     title="Logout"
//                 >
//                     <i className="fas fa-sign-out-alt text-xl shrink-0 w-6 text-center group-hover:text-danger"></i>

//                     <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 max-w-[100px] ml-2' : 'opacity-0 max-w-0 ml-0'}`}>
//                         Logout
//                     </span>
//                 </button>
//             </div>
//         </aside>
//     );
// }



//  THIRD VERSION

import { useState, type ElementType } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

export interface SubMenuItem {
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

    const [isHovered, setIsHovered] = useState(false);
    const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

    const isExpanded = isManuallyExpanded || isHovered;

    // useEffect(() => {
    //     if (!isExpanded) {
    //         setOpenSubMenus({});
    //     }
    // }, [isExpanded]);

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
            {/* --- HEADER --- */}
            <div className="h-14 flex items-center px-5 border-b border-border border-opacity-50 shrink-0">
                <Link to={schoolPath} className="flex outline-none items-center gap-4 overflow-hidden w-full">
                    <div className="w-7 h-7 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                        <span className="text-inverse  font-bold text-md md:text-lg">
                            {schoolName.charAt(0)}
                        </span>
                    </div>
                    <span className={`font-poppins font-semibold text-foreground text-[12px] md:text-lg truncate transition-all duration-300 overflow-hidden
            ${isExpanded ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0'}`}>
                        {schoolName}
                    </span>
                </Link>
            </div>

            {/* --- MAIN NAVIGATION --- */}
            <nav className="flex-1 overflow-y-auto md:px-3 pl-2 md:pl-4 py-3 md:py-6 space-y-2 no-scrollbar">
                {menuItems.map((item) => {
                    const isParentActive = item.path === '/dashboard'
                        ? location.pathname === '/dashboard'
                        : location.pathname.startsWith(item.path);

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
                                        <div className="ml-8 pl-4 pr-3 py-2 space-y-1 border-l border-border flex flex-col">
                                            {item.subMenu?.map((sub) => {
                                                const isChildActive = location.pathname === sub.path;
                                                return (
                                                    <Link
                                                        key={sub.path}
                                                        to={sub.path}
                                                        className={`flex items-center gap-2 w-full text-left py-2 px-3 rounded-lg text-sm font-medium transition-colors
                              ${isChildActive
                                                                ? 'text-primary bg-primary-soft'
                                                                : 'text-muted hover:text-foreground hover:bg-surface'}`}
                                                    >
                                                        {isChildActive ? (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                        ) : (
                                                            <div className="w-1.5 h-1.5 shrink-0" />
                                                        )}
                                                        <span className="truncate">{sub.name}</span>
                                                    </Link>
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

            {/* --- FOOTER --- */}
            <div className={`p-1 md:p-2 border-t border-border shrink-0 flex items-center transition-all duration-300 ${isExpanded ? 'flex-row gap-2 justify-between' : 'flex-col gap-2 md:gap-4'}`}>

                <button
                    onClick={toggleSidebar} // 🛑 Using the new fixed toggle function here
                    className="flex items-center justify-center p-1.5 md:p-3 rounded-xl text-muted hover:bg-primary-soft hover:text-primary transition-colors shrink-0"
                    title="Toggle Sidebar"
                >
                    <i className={`text-md md:text-xl w-3 md:w-6 text-center transition-transform duration-300 ${isManuallyExpanded ? 'fas fa-angle-double-left' : 'fas fa-angle-double-right'}`}></i>
                </button>

                <button
                    onClick={onLogout}
                    className={`flex items-center justify-center gap-2 md:gap-1 p-1.5 md:p-3 rounded-xl text-danger hover:bg-danger/10 transition-colors group ${isExpanded ? 'flex-1' : 'w-full'}`}
                    title="Logout"
                >
                    <i className="fas fa-sign-out-alt text-xl shrink-0 w-3 md:w-6 text-center group-hover:text-danger"></i>

                    <span className={`text-sm md:text-lg font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 max-w-[100px] ml-2' : 'opacity-0 max-w-0 ml-0'}`}>
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    );
}