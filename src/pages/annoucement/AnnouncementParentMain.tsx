import React, { useState, useCallback, useMemo } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
import { 
    useGetAllAnnouncementsInfinite, 
    useGetAnnouncementById 
} from '../../api_services/announcement_api/announcementApi'; // Adjust path
import { Button } from '../../shared/ui/Button'; // Adjust path
import { Label } from '../../shared/ui/Input'; // Adjust path
import { SideModal } from '../../shared/ui/SideModal'; // Adjust path
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../shared/ui/TableLayout'; // Adjust path

export default function AnnouncementParentMain() {
    const { schoolId } = useAuthData();

    // --- Modal State ---
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Queries ---
    const {
        data: announcementsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isListLoading
    } = useGetAllAnnouncementsInfinite({
        schoolId: schoolId!
    });

    const allAnnouncements = useMemo(() => {
        return announcementsData?.pages.flatMap(page => page.data || []) || [];
    }, [announcementsData]);

    // --- Handlers ---
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const handleView = (id: string) => {
        setSelectedId(id);
        setIsModalOpen(true);
    };

    // Helper to color-code priorities/types
    const getTypeColor = (type: string) => {
        const t = type?.toLowerCase() || '';
        if (t === 'notice') return 'bg-danger/10 text-danger border-danger/20';
        if (t === 'holiday') return 'bg-success/10 text-success border-success/20';
        if (t === 'event') return 'bg-warning/10 text-warning border-warning/20';
        return 'bg-primary-soft text-primary border-primary/20'; // default announcement
    };

    return (
        <div className="w-full h-full flex flex-col bg-mainBg overflow-hidden">

            {/* FLAT HEADER */}
            <header className="shrink-0 p-3 border-b border-border flex flex-col justify-center bg-mainBg z-10">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <i className="fas fa-bullhorn text-primary"></i>
                    Announcement
                </h1>
                <p className="text-sm text-muted mt-1">Stay updated with the latest school announcements, holidays, and events.</p>
            </header>

            {/* FULL WIDTH TABLE LIST PANE */}
            <main className="flex-1 w-full  py-4 flex flex-col overflow-hidden bg-mainBg">
                <div className="flex-1 bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    {isListLoading ? (
                        <div className="flex flex-1 justify-center items-center">
                            <i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i>
                        </div>
                    ) : allAnnouncements.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center text-muted">
                            <i className="fas fa-envelope-open-text text-5xl opacity-30 mb-4"></i>
                            <h2 className="text-lg font-bold text-foreground">No Announcements</h2>
                            <p className="text-sm mt-1">There are currently no notices available.</p>
                        </div>
                    ) : (
                        <TableContainer onScroll={handleScroll} className="h-full custom-scrollbar overscroll-none">
                            <THead className="sticky top-0 z-10 shadow-sm bg-sub-header">
                                <tr>
                                    <Th>Date</Th>
                                    <Th>Title & Description</Th>
                                    <Th>Type</Th>
                                    <Th>Attachments</Th>
                                    <Th className="text-center pr-6">Action</Th>
                                </tr>
                            </THead>
                            <TBody>
                                <>
                                    {allAnnouncements.map((item: any) => (
                                        <Tr key={item._id} className="hover:bg-sub-header/30 transition-colors">

                                            <Td className="whitespace-nowrap align-top pt-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground">
                                                        {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-muted mt-0.5">
                                                        {new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </Td>

                                            <Td className="align-top pt-5">
                                                <div className="flex flex-col max-w-[300px] sm:max-w-md">
                                                    <span className="text-base font-bold text-foreground truncate">{item.title}</span>
                                                    {item.description && (
                                                        <span className="text-xs font-medium text-muted truncate mt-1">
                                                            {item.description.slice(0, 60)}...
                                                        </span>
                                                    )}
                                                </div>
                                            </Td>

                                            <Td className="align-top pt-5">
                                                <span className={`px-2.5 py-1 text-[10px] rounded uppercase font-bold tracking-wider inline-flex border ${getTypeColor(item.type)}`}>
                                                    {item.type || 'Announcement'}
                                                </span>
                                            </Td>

                                            <Td className="align-top pt-5">
                                                {item.attachments?.length > 0 ? (
                                                    <span className="text-xs font-bold text-muted flex items-center gap-1.5">
                                                        <i className="fas fa-paperclip text-primary"></i> {item.attachments.length} File(s)
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-medium text-muted/50">-</span>
                                                )}
                                            </Td>

                                            <Td className="align-top pt-4">
                                                <div className="flex items-center justify-end pr-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        leftIcon="fas fa-eye"
                                                        onClick={() => handleView(item._id)}
                                                    >
                                                        Review
                                                    </Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))}

                                    {isFetchingNextPage && (
                                        <tr>
                                            <td colSpan={5} className="py-6 text-center">
                                                <i className="fas fa-circle-notch fa-spin text-primary text-xl"></i>
                                                <p className="text-xs text-muted mt-2">Loading older announcements...</p>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            </TBody>
                        </TableContainer>
                    )}
                </div>
            </main>

            {/* SIDE MODAL FOR VIEWING ANNOUNCEMENT */}
            <SideModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Announcement Details"
            >
                {selectedId && <AnnouncementViewContent id={selectedId} getTypeColor={getTypeColor} />}
            </SideModal>
        </div>
    );
}

// ==========================================================
// SEPARATE CONTENT COMPONENT FOR THE MODAL (Handles individual fetching)
// ==========================================================
function AnnouncementViewContent({ id, getTypeColor }: { id: string, getTypeColor: (type: string) => string }) {
    const { data: announcement, isLoading, isError } = useGetAnnouncementById(id);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
                <i className="fas fa-circle-notch fa-spin text-4xl text-primary opacity-50"></i>
                <p className="text-sm font-semibold text-muted">Retrieving details...</p>
            </div>
        );
    }

    if (isError || !announcement) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <i className="fas fa-exclamation-triangle text-4xl text-danger opacity-80 mb-3"></i>
                <p className="text-base font-bold text-foreground">Could not load details</p>
                <p className="text-sm text-muted mt-1">This announcement might have been deleted or is unavailable.</p>
            </div>
        );
    }

    // Separate Images and Documents
    const images = announcement.attachments?.filter((f: any) => f.type === 'image') || [];
    const documents = announcement.attachments?.filter((f: any) => f.type === 'pdf' || f.type !== 'image') || [];

    return (
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar pr-2 pb-6 space-y-6">
            
            {/* 1. Header Info */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 text-[10px] rounded uppercase font-bold tracking-wider inline-flex border ${getTypeColor(announcement.type)}`}>
                        {announcement.type || 'Announcement'}
                    </span>
                    <span className="text-xs font-bold text-muted bg-surface border border-border px-2 py-1 rounded">
                        <i className="far fa-calendar-alt mr-1.5"></i>
                        {new Date(announcement.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                </div>
                <h2 className="text-xl font-bold text-foreground leading-tight">
                    {announcement.title}
                </h2>
            </div>

            {/* 2. Text Description */}
            {announcement.description && (
                <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {announcement.description}
                    </p>
                </div>
            )}

            {/* 3. Image Gallery */}
            {images.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-xs font-bold text-muted uppercase tracking-wider">Image Attachments</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {images.map((file: any) => (
                            <div key={file._id} className="relative group rounded-xl overflow-hidden border border-border aspect-square block bg-surface shadow-sm cursor-pointer">
                                <a href={file.url} target="_blank" rel="noreferrer" className="block w-full h-full">
                                    <img
                                        src={file.url}
                                        alt={file.originalName}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                        <i className="fas fa-expand text-white text-2xl drop-shadow-md"></i>
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. PDF / Document List */}
            {documents.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-xs font-bold text-muted uppercase tracking-wider">Attached Documents</Label>
                    <div className="flex flex-col gap-3">
                        {documents.map((file: any) => (
                            <a 
                                key={file._id} 
                                href={file.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:border-primary/50 transition-colors group shadow-sm"
                            >
                                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-danger/10 text-danger shrink-0 border border-danger/20">
                                        <i className="fas fa-file-pdf text-lg"></i>
                                    </div>
                                    <div className="flex flex-col flex-1 overflow-hidden">
                                        <span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{file.originalName}</span>
                                        <span className="text-[10px] font-semibold text-muted uppercase tracking-wider mt-0.5">Click to view document</span>
                                    </div>
                                </div>
                                <i className="fas fa-external-link-alt text-muted group-hover:text-primary transition-colors ml-3 text-sm"></i>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}