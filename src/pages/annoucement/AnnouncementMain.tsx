import React, { useState, useCallback, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
import {
    useGetAllAnnouncementsInfinite,
    useDeleteAnnouncement
} from '../../api_services/announcement_api/announcementApi'; // Adjust path
import { Label } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../shared/ui/TableLayout';
import { toast } from '../../shared/ui/ToastContext';
import { useRoleCheck } from '../../hooks/useRoleCheck';

// --- Filter Options ---
const TYPE_OPTIONS = [
    { label: 'All Types', value: '' },
    { label: 'General Announcement', value: 'announcement' },
    { label: 'Important Notice', value: 'notice' },
    { label: 'Holiday', value: 'holiday' },
    { label: 'Event', value: 'event' },
];

const AUDIENCE_OPTIONS = [
    { label: 'All Audiences', value: '' },
    { label: 'Everyone (Public)', value: 'all' },
    { label: 'Parents / Students', value: 'parent' },
    { label: 'Teachers / Staff', value: 'teacher' },
    { label: 'Specific Classes', value: 'specific_classes' },
];

export default function AnnouncementMain() {
    const { schoolId } = useAuthData();

    const navigate = useNavigate();

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    
        const {isCorrespondent, isAdmin, isPrincipal} = useRoleCheck()
    
        const canModify = isAdmin || isCorrespondent || isPrincipal

    // --- State: Filters (20% Pane) ---
    const [filters, setFilters] = useState({
        type: '',
        targetAudience: '',
    });

    // --- Queries & Mutations ---
    // 1. Get All Announcements (Infinite Scroll)
    // Note: Backend automatically filters based on userRole.
    const {
        data: announcementsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isListLoading
    } = useGetAllAnnouncementsInfinite({
        schoolId: schoolId!,
        // We can pass additional query filters if your backend supports them later.
        // For now, infinite query handles the pagination and role-based fetching.
    });

    const allAnnouncements = useMemo(() => {
        let list = announcementsData?.pages.flatMap(page => page.data || []) || [];

        // Frontend Filtering (if backend doesn't explicitly filter by type/audience in getall yet)
        if (filters.type) {
            list = list.filter((a: any) => a.type === filters.type);
        }
        if (filters.targetAudience) {
            list = list.filter((a: any) => a.targetAudience?.includes(filters.targetAudience));
        }

        return list;
    }, [announcementsData, filters]);

    // 2. Mutation for Deletion
    const deleteMutation = useDeleteAnnouncement();

    // --- Handlers ---
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this announcement? This action will move it to the archive.")) {
            try {
                await deleteMutation.mutateAsync(id);
                toast.success("Successfully Deleted")
            } catch (error: any) {
                toast.error(error.message || "Failed to Delete.");


            }
        }
    };

    // --- Navigation Helpers ---
    const navigateToCreate = () => navigate('create');
    const navigateToView = (id: string) => navigate(`single/${id}`);

    // Helper to color-code priorities/types
    const getTypeColor = (type: string) => {
        const t = type?.toLowerCase() || '';
        if (t === 'notice') return 'bg-danger/10 text-danger border-danger/20';
        if (t === 'holiday') return 'bg-success/10 text-success border-success/20';
        if (t === 'event') return 'bg-warning/10 text-warning border-warning/20';
        return 'bg-primary-soft text-primary border-primary/20'; // default announcement
    };


    const isChild = location.pathname.includes("single") || location.pathname.includes("create")
    if (isChild) {
        return <Outlet />
    }

    return (
        <div className="w-full h-full flex flex-col gap-3 bg-background overflow-hidden">

            {/* HEADER */}
            <header className="shrink-0 px-4 lg:px-6 py-2 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface z-10 shadow-sm">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-bullhorn text-primary"></i>
                        Announcement
                    </h1>
                    <p className="text-xs lg:text-sm text-muted mt-1">Manage school announcements, notices, and events.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* NEW: Mobile Filter Toggle Button */}
                    <Button
                        variant="outline"
                        className="lg:hidden flex-1 sm:flex-none justify-center"
                        leftIcon="fas fa-filter"
                        onClick={() => setIsMobileFilterOpen(true)}
                    >
                        Filters
                    </Button>

                    {/* Only Admins/Management can create global announcements */}
                    {canModify && (
                        <Button
                            variant="primary"
                            leftIcon="fas fa-plus"
                            onClick={navigateToCreate}
                            className="flex-1 sm:flex-none justify-center whitespace-nowrap"
                        >
                            New Announcement
                        </Button>
                    )}
                </div>
            </header>

            {/* MAIN LAYOUT (20-80 SPLIT) */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                {/* MOBILE OVERLAY: Darkens background when drawer is open */}
                {isMobileFilterOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-[36] lg:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />
                )}

                {/* 20% LEFT: FILTERS PANE (Drawer on Mobile, Static on Desktop) */}
                <aside className={`
                    fixed inset-y-0 left-0 z-[37] w-[280px] bg-surface p-4 flex flex-col gap-6 shadow-2xl transition-transform duration-300 ease-in-out
                    lg:static lg:w-[20%] lg:min-w-[250px] lg:shrink-0 lg:border-r lg:border-border lg:bg-surface/50 lg:p-3 lg:shadow-none lg:translate-x-0
                    ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}
                    overflow-y-auto custom-scrollbar
                `}>
                    <div className="flex items-center justify-between lg:block">
                        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                            <i className="fas fa-filter text-primary"></i> Filter Notices
                        </h2>
                        {/* Close button for mobile drawer */}
                        <button
                            className="lg:hidden text-muted hover:text-danger p-1"
                            onClick={() => setIsMobileFilterOpen(false)}
                        >
                            <i className="fas fa-xmark text-xl"></i>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <Label>Announcement Type</Label>
                            <SearchSelect
                                options={TYPE_OPTIONS}
                                value={filters.type}
                                onChange={(opt: any) => setFilters(prev => ({ ...prev, type: opt?.value || '' }))}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label>Target Audience</Label>
                            <SearchSelect
                                options={AUDIENCE_OPTIONS}
                                value={filters.targetAudience}
                                onChange={(opt: any) => setFilters(prev => ({ ...prev, targetAudience: opt?.value || '' }))}
                            />
                        </div>

                        <Button
                            variant="outline"
                            className="w-full mt-2"
                            onClick={() => setFilters({ type: '', targetAudience: '' })}
                        >
                            Reset Filters
                        </Button>

                        {/* Mobile 'Apply' button to close drawer after filtering */}
                        <Button
                            variant="primary"
                            className="w-full lg:hidden mt-2"
                            onClick={() => setIsMobileFilterOpen(false)}
                        >
                            Apply Filters
                        </Button>
                    </div>
                </aside>

                {/* 80% RIGHT: TABLE LIST PANE */}
                <main className="flex-1 w-full lg:w-[80%] px-2 lg:px-6 py-2 flex flex-col overflow-hidden bg-background">
                    {isListLoading ? (
                        <div className="flex flex-1 justify-center items-center">
                            <i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i>
                        </div>
                    ) : allAnnouncements.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center text-muted">
                            <i className="fas fa-envelope-open-text text-5xl opacity-30 mb-4"></i>
                            <h2 className="text-lg font-bold text-foreground">No Announcements Found</h2>
                            <p className="text-sm mt-1 text-center">There are no notices matching your current view.</p>
                        </div>
                    ) : (
                        <TableContainer onScroll={handleScroll} className="h-full custom-scrollbar overscroll-none">
                            <THead className="sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <Th className='text-center'>Date</Th>
                                    <Th className='text-center'>Title & Description</Th>
                                    <Th className='text-center'>Type</Th>
                                    <Th className='text-center'>Audience</Th>
                                    <Th className='text-center'>Attachments</Th>
                                    <Th className="text-center pr-6">Action</Th>
                                </tr>
                            </THead>
                            <TBody>
                                <>
                                    {allAnnouncements.map((item: any) => (
                                        <Tr key={item._id} className="hover:bg-primary-soft/20 transition-colors">

                                            <Td className="whitespace-nowrap align-top pt-4 text-center">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground">
                                                        {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[10px] text-muted">
                                                        {new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </Td>

                                            <Td className="align-top pt-4 text-center">
                                                <div className="flex flex-col max-w-[300px] sm:max-w-md mx-auto">
                                                    <span className="text-sm font-bold text-foreground truncate">{item.title}</span>
                                                </div>
                                            </Td>

                                            <Td className="align-top pt-4 text-center">
                                                <span className={`px-2 py-1 text-[9px] rounded uppercase font-bold tracking-wider inline-flex border ${getTypeColor(item.type)}`}>
                                                    {item.type || 'N/A'}
                                                </span>
                                            </Td>

                                            <Td className="align-top pt-4 text-center">
                                                <div className="flex flex-wrap justify-center gap-1 max-w-[200px] mx-auto">
                                                    {item.targetAudience?.map((aud: string, i: number) => (
                                                        <span key={i} className="text-[10px] font-bold text-muted bg-surface border border-border px-1.5 py-0.5 rounded capitalize">
                                                            {aud.replace(/_/g, ' ')}
                                                        </span>
                                                    ))}
                                                    {item.targetAudience?.includes("specific_classes") && item.targetClasses && (
                                                        <span className="text-[10px] font-bold text-primary bg-primary-soft border border-primary/10 px-1.5 py-0.5 rounded ml-1">
                                                            {item.targetClasses.length} Class(es)
                                                        </span>
                                                    )}
                                                </div>
                                            </Td>

                                            <Td className="align-top pt-4 text-center">
                                                {item.attachments?.length > 0 ? (
                                                    <span className="text-xs font-bold text-muted gap-1.5 flex justify-center items-center">
                                                        <i className="fas fa-paperclip"></i> {item.attachments.length || 0}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-primary-hover block text-center">____</span>
                                                )}
                                            </Td>

                                            <Td className="align-top pt-3 text-center">
                                                <div className="flex items-center justify-end gap-2 pr-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigateToView(item._id)}
                                                    >
                                                        Review
                                                    </Button>
                                                    {canModify && (
                                                        <button
                                                            className="w-8 h-8 flex items-center justify-center rounded bg-surface border border-border text-danger hover:bg-danger hover:text-inverse hover:border-danger transition-colors shrink-0"
                                                            onClick={() => handleDelete(item._id)}
                                                            title="Delete Announcement"
                                                        >
                                                            <i className="fas fa-trash-alt text-xs"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))}

                                    {isFetchingNextPage && (
                                        <tr>
                                            <td colSpan={6} className="py-6 text-center">
                                                <i className="fas fa-circle-notch fa-spin text-primary text-xl"></i>
                                                <p className="text-xs text-muted mt-2">Loading older announcements...</p>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            </TBody>
                        </TableContainer>
                    )}
                </main>
            </div>
        </div>
    )
}