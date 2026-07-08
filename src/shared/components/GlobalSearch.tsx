import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuthData } from '../../hooks/useAuthData';
// Make sure to import your menus from wherever you defined them
// import { principalMenu, getParentMenu } from '../../utils/menuConfig';
// import { useSelector } from 'react-redux';
// import type { RootState } from '../../features/store/store';
// import { getParentMenu, principalMenu } from '../../constants/constants';
import { useAuthorizedMenu } from '../../hooks/useAuthorizedMenu';
import { useAuthData } from '../../hooks/useAuthData';
import { useGlobalSearch } from '../../api_services/globalSearch_api/globalSearchApi';

export const GlobalSearch = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const { schoolId } = useAuthData(); // adjust to however you store it

    // 🌟 NEW: entity search (students, receipts, bills, etc.)
    const { entityResults, isSearching } = useGlobalSearch(schoolId!, query);




    const navigate = useNavigate();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get current role and active student ID (if parent) from your auth hook
    // const { currentRole } = useAuthData();

    // const { studentId } = useSelector((state: RootState) => state.auth)


    // If studentId is an array (as defined in your login slice), grab the first one, or use the active one if you have a selector for it.
    // const activeStudentId = Array.isArray(studentId) && studentId.length > 0 ? studentId[0] : null;

    // 1. Determine which menu to search based on Role
    // const availableModules = useMemo(() => {
    //     if (currentRole === 'parent') {
    //         return getParentMenu(activeStudentId);
    //     }
    //     return principalMenu;
    // }, [currentRole, activeStudentId]);

    // 1. Get the authoritative menu list for this specific user
    const availableModules = useAuthorizedMenu();

    // 🌟 NEW: Flatten the menu so parent items with submenus are hidden, and only their sub-items (or standalone items) are searchable
    const searchableModules = useMemo(() => {
        const flattened: any[] = [];

        availableModules.forEach((module: any) => {
            if (module.subMenu && module?.subMenu.length > 0) {
                // If it has a submenu, add all the sub-items but completely ignore the parent
                flattened.push(...module.subMenu);
            } else {
                // If it's a standalone menu, add it directly
                flattened.push(module);
            }
        });

        return flattened;
    }, [availableModules]);

    // 2. Filter modules based on search query (Now using the 'searchableModules' list!)
    const filteredModules = useMemo(() => {
        if (!query.trim()) return searchableModules;

        return searchableModules.filter((module: any) =>
            module.name.toLowerCase().includes(query.toLowerCase())
        );
    }, [query, searchableModules]);


    // 🌟 NEW: combined list drives keyboard nav — modules first, then live entity results
    const combinedList = useMemo(
        () => [...filteredModules, ...entityResults],
        [filteredModules, entityResults]
    );



    // 3. Handle Keyboard Navigation (Up, Down, Enter, Escape)
    const handleKeyDown = (e: React.KeyboardEvent) => {
        // if (!isOpen) {
        //     if (e.key === 'Enter' || e.key === 'ArrowDown') setIsOpen(true);
        //     return;
        // }

        // if (e.key === 'ArrowDown') {
        //     e.preventDefault();
        //     setSelectedIndex(prev => (prev < filteredModules.length - 1 ? prev + 1 : prev));
        // } else if (e.key === 'ArrowUp') {
        //     e.preventDefault();
        //     setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        // } else if (e.key === 'Enter') {
        //     e.preventDefault();
        //     if (filteredModules[selectedIndex]) {
        //         handleSelect(filteredModules[selectedIndex].path);
        //     }
        // } else if (e.key === 'Escape') {
        //     setIsOpen(false);
        //     setQuery('');
        // }

        if (!isOpen) {
            if (e.key === 'Enter' || e.key === 'ArrowDown') setIsOpen(true);
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < combinedList?.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (combinedList[selectedIndex]) {
                handleSelect(combinedList[selectedIndex].path);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setQuery('');
        }
    };

    const handleSelect = (path: string) => {
        navigate(path);
        setIsOpen(false);
        setQuery('');
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);

            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Keyboard shortcut (Ctrl+K or Cmd+K) to open search
    useEffect(() => {
        const handleShortcut = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 50);
            }
        };
        document.addEventListener('keydown', handleShortcut);
        return () => document.removeEventListener('keydown', handleShortcut);
    }, []);

    // 3. Global Escape Listener
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setQuery('');
            }
        };
        if (isOpen) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    return (
        <>
            {/* 🛑 DARK OVERLAY: Renders behind the search bar but over the rest of the app */}
            {isOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[50] transition-opacity duration-200" />
            )}

            {/* SEARCH CONTAINER */}
            <div className="relative z-[99] w-full max-w-lg" ref={wrapperRef}>

                {/* Input Field */}
                <div
                    className={`flex items-center bg-surface border transition-all duration-200 rounded-lg px-4 py-2
            ${isOpen ? ' border-border-default shadow-lg' : 'border-border shadow-sm hover:border-primary/50'}`}
                >
                    <i className={`fa-solid fa-magnifying-glass mr-3 ${isOpen ? 'text-primary' : 'text-muted'}`}></i>
                    <input
                        ref={inputRef} // Add this
                        type="text"
                        className="w-full bg-transparent outline-none text-sm text-foreground placeholder-muted font-medium"
                        placeholder="Search modules (e.g., Profile, Attendance)..."
                        // autoFocus={true}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                            setSelectedIndex(0);
                        }}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                    />

                    {/* Shortcut Hint / Clear Button */}
                    <div className="shrink-0 flex items-center justify-center">
                        {!isOpen ? (
                            <div className="hidden sm:flex items-center justify-center px-2 py-0.5 rounded border border-border bg-mainBg text-[10px] text-muted font-bold tracking-wide">
                                Ctrl +  K
                            </div>
                        ) : (
                            <button
                                onClick={() => { setQuery(''); setIsOpen(false); }}
                                className="text-muted hover:text-danger "
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* DROPDOWN RESULTS */}
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* {filteredModules.length > 0 ? ( */}
                        {filteredModules.length > 0 || entityResults.length > 0 || isSearching ? (

                            <div className="max-h-80 overflow-y-auto p-2">
                                <div className="px-3 py-2 text-xs font-bold text-muted uppercase tracking-wider">
                                    Suggested Modules
                                </div>

                                {filteredModules.map((module: any, index: number) => (
                                    <div
                                        key={module.path}
                                        onClick={() => handleSelect(module.path)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors duration-150
                      ${index === selectedIndex ? 'bg-primary-soft text-primary' : 'text-foreground hover:bg-mainBg'}
                    `}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center 
                      ${index === selectedIndex ? 'bg-primary text-white shadow-md' : 'bg-mainBg text-muted border border-border'}
                    `}>
                                            <i className={module.icon}></i>
                                        </div>
                                        <span className="text-sm font-semibold">{module.name}</span>

                                        {index === selectedIndex && (
                                            <i className="fa-solid fa-arrow-right ml-auto text-primary opacity-50 text-xs"></i>
                                        )}
                                    </div>
                                ))}


                                {isSearching && (
                                    <div className="px-3 py-2 text-xs text-muted flex items-center gap-2">
                                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                                        Searching records…
                                    </div>
                                )}
                                {entityResults?.length > 0 && (
                                    <>
                                        <div className="px-3 py-2 text-xs font-bold text-muted uppercase tracking-wider">
                                            Results
                                        </div>
                                        {entityResults?.map((item, i) => {
                                            const index = filteredModules.length + i;
                                            return (
                                                <div
                                                    key={item._id}
                                                    onClick={() => handleSelect(item.path)}
                                                    onMouseEnter={() => setSelectedIndex(index)}
                                                    className={`flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors duration-150
                                                        ${index === selectedIndex ? 'bg-primary-soft text-primary' : 'text-foreground hover:bg-mainBg'}
                                                    `}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center 
                                                        ${index === selectedIndex ? 'bg-primary text-white shadow-md' : 'bg-mainBg text-muted border border-border'}
                                                    `}>
                                                        <i className={item.icon}></i>
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-semibold truncate">{item.title}</span>
                                                        {item.subtitle && (
                                                            <span className="text-xs text-muted truncate">{item.subtitle}</span>
                                                        )}
                                                    </div>

                                                    {index === selectedIndex && (
                                                        <i className="fa-solid fa-arrow-right ml-auto text-primary opacity-50 text-xs shrink-0"></i>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="p-8 text-center flex flex-col items-center justify-center">
                                <div className="w-12 h-12 bg-mainBg rounded-full flex items-center justify-center mb-3 text-muted">
                                    <i className="fa-solid fa-magnifying-glass-minus text-xl"></i>
                                </div>
                                <p className="text-sm font-semibold text-foreground">No modules found</p>
                                <p className="text-xs text-muted mt-1">Try searching for a different keyword.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};