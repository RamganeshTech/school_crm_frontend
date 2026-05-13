import React, { useState, useCallback, useMemo } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
import { 
    useGetAllDeletedItemsInfinite, 
    useGetDeletedItemById, 
    useDeletePermanently 
} from '../../api_services/deleteArchieve_api/deleteArchieveApi'; // Adjust path
import {  Label } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../shared/ui/TableLayout';
import { SideModal } from '../../shared/ui/SideModal';

// Add the modules your school frequently deletes from here
const CATEGORY_OPTIONS = [
    { label: 'All Categories', value: '' },
    { label: 'Finance Ledger', value: 'FinanceLedger' },
    { label: 'Homework', value: 'Homework' },
    { label: 'Homework Submission', value: 'HomeworkSubmission' },
    { label: 'Student Record', value: 'Student' },
    { label: 'Staff Record', value: 'Staff' },
];

export default function DeleteArchiveMain() {
    const { schoolId, currentRole } = useAuthData();

    // --- State: Filters (20% Pane) ---
    const [filters, setFilters] = useState({
        category: '',
    });

    // --- State: Modal & Selected ID ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArchiveId, setSelectedArchiveId] = useState<string | undefined>(undefined);

    // --- Queries ---
    // 1. Get All Archives (Infinite Scroll)
    const { 
        data: archivesData, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage, 
        isLoading: isListLoading 
    } = useGetAllDeletedItemsInfinite({
        schoolId: schoolId!,
        category: filters.category || undefined,
    });

    const allArchives = useMemo(() => {
        return archivesData?.pages.flatMap(page => page.data || []) || [];
    }, [archivesData]);

    // 2. Get Single Archive Details
    const { 
        data: singleArchiveData, 
        isLoading: isSingleLoading 
    } = useGetDeletedItemById(selectedArchiveId);

    // 3. Mutation for Permanent Deletion
    const deleteMutation = useDeletePermanently();

    // --- Handlers ---
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const handleViewDetails = (id: string) => {
        setSelectedArchiveId(id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedArchiveId(undefined), 300);
    };

    const handlePermanentDelete = async () => {
        if (!selectedArchiveId) return;
        
        if (window.confirm("WARNING: This will permanently erase this record. It cannot be recovered. Continue?")) {
            try {
                await deleteMutation.mutateAsync(selectedArchiveId);
                handleCloseModal();
            } catch (error) {
                console.error("Failed to permanently delete item", error);
            }
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-background overflow-hidden">
            
            {/* HEADER */}
            <header className="shrink-0 px-6 py-5 border-b border-border flex items-center justify-between bg-surface z-10 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-trash-restore text-primary"></i>
                        Deleted Archives
                    </h1>
                    <p className="text-sm text-muted mt-1">Review recently deleted records before permanent removal.</p>
                </div>
            </header>

            {/* 20-80 SPLIT LAYOUT */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                
                {/* 20% LEFT: FILTERS PANE */}
                <aside className="w-full lg:w-[20%] min-w-[250px] shrink-0 border-r border-border bg-surface/50 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <i className="fas fa-filter text-primary"></i> Filter Trash
                    </h2>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <Label>Module Category</Label>
                            <SearchSelect 
                                options={CATEGORY_OPTIONS} 
                                value={filters.category} 
                                onChange={(opt: any) => setFilters({ category: opt?.value || '' })} 
                            />
                        </div>

                        {/* Optional: Add Date Filters here in the future if needed */}

                        <Button 
                            variant="outline" 
                            className="w-full mt-2" 
                            onClick={() => setFilters({ category: '' })}
                        >
                            Reset Filters
                        </Button>
                    </div>
                </aside>

                {/* 80% RIGHT: TABLE LIST PANE */}
                <main className="flex-1 w-full lg:w-[80%] p-6 flex flex-col overflow-hidden bg-background">
                    {isListLoading ? (
                        <div className="flex flex-1 justify-center items-center">
                            <i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i>
                        </div>
                    ) : allArchives.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center text-muted">
                            <i className="fas fa-box-open text-5xl opacity-30 mb-4"></i>
                            <h2 className="text-lg font-bold text-foreground">Trash is Empty</h2>
                            <p className="text-sm mt-1">No deleted records found matching your filters.</p>
                        </div>
                    ) : (
                        <TableContainer onScroll={handleScroll} className="h-full custom-scrollbar overscroll-none">
                            <THead className="sticky top-0 z-10 shadow-sm bg-surface">
                                <tr>
                                    <Th>S.No</Th>
                                    <Th>Deleted On</Th>
                                    <Th>Category</Th>
                                    <Th>Deleted By</Th>
                                    <Th>Original Ref ID</Th>
                                    <Th className="text-right pr-6">Action</Th>
                                </tr>
                            </THead>
                            <TBody>
                                <>
                                    {allArchives.map((item: any, idx: number) => (
                                        <Tr key={item._id} className="hover:bg-primary-soft/20 transition-colors">
                                            <Td className="font-medium whitespace-nowrap text-muted">{idx + 1}</Td>
                                            
                                            <Td className="whitespace-nowrap font-medium text-foreground">
                                                {new Date(item.deletedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </Td>

                                            <Td>
                                                <span className="px-2 py-1 text-[10px] rounded uppercase font-bold tracking-wider inline-flex items-center gap-1.5 bg-warning/10 text-warning border border-warning/20">
                                                    <i className="fas fa-folder text-[8px]"></i>
                                                    {item.category}
                                                </span>
                                            </Td>

                                            <Td>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-foreground">{(item.deletedBy as any)?.userName || 'System'}</span>
                                                    <span className="text-[10px] text-muted capitalize">{(item.deletedBy as any)?.role || ''}</span>
                                                </div>
                                            </Td>
                                            
                                            <Td>
                                                <span className="text-[11px] font-mono bg-surface border border-border px-1.5 py-0.5 rounded text-muted select-all">
                                                    {item.originalId}
                                                </span>
                                            </Td>

                                            <Td>
                                                <div className="flex items-center justify-end pr-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(item._id)}
                                                    >
                                                        Review
                                                    </Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))}
                                    
                                    {isFetchingNextPage && (
                                        <tr>
                                            <td colSpan={6} className="py-6 text-center">
                                                <i className="fas fa-circle-notch fa-spin text-primary text-xl"></i>
                                                <p className="text-xs text-muted mt-2">Loading older records...</p>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            </TBody>
                        </TableContainer>
                    )}
                </main>
            </div>

            {/* SIDE MODAL: SINGLE ARCHIVE DETAILS */}
            <SideModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                title="Archive Details"
            >
                <div className="flex flex-col h-full pr-2">
                    {isSingleLoading || !singleArchiveData ? (
                        <div className="flex flex-1 justify-center items-center">
                            <i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i>
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-6 flex-1 overflow-y-auto custom-scrollbar pb-6">
                            
                            {/* Meta Banner */}
                            <div className="p-4 rounded-xl border bg-danger/5 border-danger/20">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border bg-danger/10 text-danger border-danger/20">
                                        {singleArchiveData.category}
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold text-foreground">Deleted Record</h3>
                                <p className="text-xs text-muted mt-1">This record was removed from the active database and moved to the archive.</p>
                            </div>

                            {/* Core Details Grid */}
                            <div className="bg-surface border border-border rounded-xl p-0 overflow-hidden">
                                <div className="grid grid-cols-2 divide-x divide-y divide-border">
                                    <div className="p-4">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Deleted On</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {new Date(singleArchiveData.deletedAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Deleted By</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {(singleArchiveData.deletedBy as any)?.userName || 'System'}
                                        </p>
                                    </div>
                                    <div className="p-4 col-span-2">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Original Record ID</p>
                                        <p className="text-xs font-mono text-primary bg-primary-soft px-2 py-1 rounded w-fit border border-primary/10 select-all">
                                            {singleArchiveData.originalId}
                                        </p>
                                    </div>
                                    {singleArchiveData.reason && (
                                        <div className="p-4 col-span-2 bg-warning/5">
                                            <p className="text-[10px] font-bold text-warning uppercase tracking-wider mb-1">Deletion Reason</p>
                                            <p className="text-sm font-medium text-foreground">"{singleArchiveData.reason}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* The Data Dump (JSON Viewer) */}
                            <div className="space-y-2 flex-1 flex flex-col min-h-[250px]">
                                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Restored Data Snapshot</h4>
                                <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-y-auto custom-scrollbar relative group">
                                    {/* Copy to Clipboard Button (Optional utility) */}
                                    <button 
                                        className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => navigator.clipboard.writeText(JSON.stringify(singleArchiveData.deletedData, null, 2))}
                                    >
                                        <i className="fas fa-copy"></i> Copy JSON
                                    </button>
                                    
                                    <pre className="text-[11px] font-mono text-green-400 whitespace-pre-wrap break-all leading-relaxed">
                                        {JSON.stringify(singleArchiveData.deletedData, null, 2)}
                                    </pre>
                                </div>
                            </div>

                            {/* Action Footer (Only Correspondent can permanently delete) */}
                            {currentRole === 'correspondent' && (
                                <div className="pt-4 border-t border-border mt-auto flex flex-col gap-2 bg-surface shrink-0">
                                    <div className="bg-danger/10 border border-danger/20 p-3 rounded text-xs text-danger font-medium flex items-start gap-2">
                                        <i className="fas fa-exclamation-triangle mt-0.5"></i>
                                        <p>Warning: Emptying this record from the trash will erase it forever.</p>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-2">
                                        <Button variant="outline" onClick={handleCloseModal}>Keep in Archive</Button>
                                        <Button 
                                            variant="danger" 
                                            leftIcon="fas fa-fire" 
                                            onClick={handlePermanentDelete} 
                                            isLoading={deleteMutation.isPending}
                                        >
                                            Delete Permanently
                                        </Button>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </SideModal>
        </div>
    );
}