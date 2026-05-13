import React, { useState, useCallback, useMemo } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
import { 
    useGetAllAuditLogsInfinite, 
    useGetAuditLogById 
} from '../../api_services/audit_api/auditApi'; // Adjust path
import { Input, Label } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../shared/ui/TableLayout';
import { SideModal } from '../../shared/ui/SideModal';

// --- Filter Options ---
const MODULE_OPTIONS = [
    { label: 'All Modules', value: '' },
    { label: 'Authentication', value: 'auth' },
    { label: 'Students', value: 'student' },
    { label: 'Staff', value: 'staff' },
    { label: 'Finance Ledger', value: 'finance_ledger' },
    { label: 'Homework', value: 'homework' },
    { label: 'Delete Archive', value: 'delete_archive' },
    { label: 'School Config', value: 'school_config' },
];

const ACTION_OPTIONS = [
    { label: 'All Actions', value: '' },
    { label: 'Create', value: 'create' },
    { label: 'Update', value: 'update' },
    { label: 'Delete', value: 'delete' },
    { label: 'Login/Logout', value: 'login' },
];

const ROLE_OPTIONS = [
    { label: 'All Roles', value: '' },
    { label: 'Correspondent', value: 'correspondent' },
    { label: 'Principal', value: 'principal' },
    { label: 'Accountant', value: 'accountant' },
    { label: 'Teacher', value: 'teacher' },
    { label: 'System', value: 'system' }, // For automated tasks
];

export default function AuditMain() {
    const { schoolId } = useAuthData();

    // --- State: Filters (20% Pane) ---
    const [filters, setFilters] = useState({
        module: '',
        action: '',
        role: '',
        fromDate: '',
        toDate: '',
    });

    // --- State: Modal & Selected ID ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLogId, setSelectedLogId] = useState<string | undefined>(undefined);

    // --- Queries ---
    // 1. Get All Logs (Infinite Scroll)
    const { 
        data: logsData, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage, 
        isLoading: isListLoading 
    } = useGetAllAuditLogsInfinite({
        schoolId: schoolId!,
        module: filters.module || undefined,
        action: filters.action || undefined,
        role: filters.role || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
    });

    const allLogs = useMemo(() => {
        return logsData?.pages.flatMap(page => page.data || []) || [];
    }, [logsData]);

    // 2. Get Single Log Details
    const { 
        data: singleLogData, 
        isLoading: isSingleLoading 
    } = useGetAuditLogById(selectedLogId);

    // --- Handlers ---
    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const handleViewDetails = (id: string) => {
        setSelectedLogId(id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedLogId(undefined), 300);
    };

    // Helper to color-code actions
    const getActionColor = (action: string) => {
        const act = action?.toLowerCase() || '';
        if (act.includes('create') || act.includes('add')) return 'bg-success/10 text-success border-success/20';
        if (act.includes('update') || act.includes('edit')) return 'bg-warning/10 text-warning border-warning/20';
        if (act.includes('delete') || act.includes('remove')) return 'bg-danger/10 text-danger border-danger/20';
        return 'bg-primary-soft text-primary border-primary/20';
    };

    return (
        <div className="w-full h-full flex flex-col bg-background overflow-hidden">
            
            {/* HEADER */}
            <header className="shrink-0 px-6 py-5 border-b border-border flex items-center justify-between bg-surface z-10 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-shield-alt text-primary"></i>
                        System Audit Logs
                    </h1>
                    <p className="text-sm text-muted mt-1">Monitor and trace all user actions and system events.</p>
                </div>
            </header>

            {/* 20-80 SPLIT LAYOUT */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                
                {/* 20% LEFT: FILTERS PANE */}
                <aside className="w-full lg:w-[20%] min-w-[250px] shrink-0 border-r border-border bg-surface/50 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <i className="fas fa-filter text-primary"></i> Filter Logs
                    </h2>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <Label>Module</Label>
                            <SearchSelect 
                                options={MODULE_OPTIONS} 
                                value={filters.module} 
                                onChange={(opt: any) => handleFilterChange('module', opt?.value || '')} 
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label>Action Type</Label>
                            <SearchSelect 
                                options={ACTION_OPTIONS} 
                                value={filters.action} 
                                onChange={(opt: any) => handleFilterChange('action', opt?.value || '')} 
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label>User Role</Label>
                            <SearchSelect 
                                options={ROLE_OPTIONS} 
                                value={filters.role} 
                                onChange={(opt: any) => handleFilterChange('role', opt?.value || '')} 
                            />
                        </div>

                        <div className="pt-2 border-t border-border space-y-4">
                            <Label className="uppercase text-[10px] tracking-wider text-muted">Date Range</Label>
                            <Input 
                                id="fromDate" 
                                type="date" 
                                label="From Date" 
                                value={filters.fromDate} 
                                onChange={(e) => handleFilterChange('fromDate', e.target.value)} 
                            />
                            <Input 
                                id="toDate" 
                                type="date" 
                                label="To Date" 
                                value={filters.toDate} 
                                onChange={(e) => handleFilterChange('toDate', e.target.value)} 
                            />
                        </div>

                        <Button 
                            variant="outline" 
                            className="w-full mt-2" 
                            onClick={() => setFilters({ module: '', action: '', role: '', fromDate: '', toDate: '' })}
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
                    ) : allLogs.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center text-muted">
                            <i className="fas fa-search-location text-5xl opacity-30 mb-4"></i>
                            <h2 className="text-lg font-bold text-foreground">No Logs Found</h2>
                            <p className="text-sm mt-1">Adjust your filters to see more tracking events.</p>
                        </div>
                    ) : (
                        <TableContainer onScroll={handleScroll} className="h-full custom-scrollbar overscroll-none">
                            <THead className="sticky top-0 z-10 shadow-sm bg-surface">
                                <tr>
                                    <Th>S.No</Th>
                                    <Th>Timestamp</Th>
                                    <Th>User</Th>
                                    <Th>Module</Th>
                                    <Th>Action</Th>
                                    <Th className="text-right pr-6">Details</Th>
                                </tr>
                            </THead>
                            <TBody>
                                <>
                                    {allLogs.map((log: any, idx: number) => (
                                        <Tr key={log._id} className="hover:bg-primary-soft/20 transition-colors">
                                            <Td className="font-medium whitespace-nowrap text-muted">{idx + 1}</Td>
                                            
                                            <Td className="whitespace-nowrap font-medium text-foreground">
                                                {new Date(log.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </Td>

                                            <Td>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-foreground">{log.userName || 'System'}</span>
                                                    <span className="text-[10px] text-muted capitalize">{log.role || 'Auto'}</span>
                                                </div>
                                            </Td>

                                            <Td>
                                                <span className="text-xs font-medium text-muted capitalize">
                                                    {log.module?.replace(/_/g, ' ')}
                                                </span>
                                            </Td>

                                            <Td>
                                                <span className={`px-2 py-1 text-[9px] rounded uppercase font-bold tracking-wider inline-flex border ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </Td>

                                            <Td>
                                                <div className="flex items-center justify-end pr-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(log._id)}
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
                                                <p className="text-xs text-muted mt-2">Loading older logs...</p>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            </TBody>
                        </TableContainer>
                    )}
                </main>
            </div>

            {/* SIDE MODAL: SINGLE LOG DETAILS */}
            <SideModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                title="Audit Log Details"
            >
                <div className="flex flex-col h-full pr-2">
                    {isSingleLoading || !singleLogData ? (
                        <div className="flex flex-1 justify-center items-center">
                            <i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i>
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-6 flex-1 overflow-y-auto custom-scrollbar pb-6">
                            
                            {/* Meta Banner */}
                            <div className={`p-4 rounded-xl border flex items-center justify-between ${
                                singleLogData.status === 'success' 
                                    ? 'bg-success/5 border-success/20' 
                                    : 'bg-danger/5 border-danger/20'
                            }`}>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground capitalize">{singleLogData.module?.replace(/_/g, ' ')} Module</h3>
                                    <p className="text-xs text-muted mt-1 uppercase tracking-wider">{singleLogData.action} Action</p>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                                    singleLogData.status === 'success' 
                                        ? 'bg-success/10 text-success border-success/20' 
                                        : 'bg-danger/10 text-danger border-danger/20'
                                }`}>
                                    {singleLogData.status}
                                </span>
                            </div>

                            {/* Core Details Grid */}
                            <div className="bg-surface border border-border rounded-xl p-0 overflow-hidden">
                                <div className="grid grid-cols-2 divide-x divide-y divide-border">
                                    <div className="p-4 col-span-2 sm:col-span-1">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Timestamp</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {singleLogData.createdAt ? new Date(singleLogData.createdAt).toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="p-4 col-span-2 sm:col-span-1">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">IP Address</p>
                                        <p className="text-sm font-mono text-foreground">
                                            {singleLogData.ipAddress || 'Unknown'}
                                        </p>
                                    </div>
                                    <div className="p-4 col-span-2">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">System Record ID (Log)</p>
                                        <p className="text-xs font-mono text-primary bg-primary-soft px-2 py-1 rounded w-fit border border-primary/10 select-all">
                                            {singleLogData._id}
                                        </p>
                                    </div>
                                    {singleLogData.targetId && (
                                        <div className="p-4 col-span-2 bg-primary-soft/30">
                                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Target Document ID</p>
                                            <p className="text-xs font-mono text-foreground select-all">
                                                {singleLogData.targetId}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">User Identity</h4>
                                <div className="bg-surface border border-border rounded-lg p-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">User Name</span>
                                        <span className="text-sm font-bold text-foreground">{singleLogData.userName || 'System Auto'}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Role</span>
                                        <span className="text-sm font-bold text-foreground capitalize">{singleLogData.role || 'N/A'}</span>
                                    </div>
                                    {(singleLogData.userId as any)?._id && (
                                        <div className="col-span-2 pt-3 border-t border-border">
                                            <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">User ID</span>
                                            <span className="text-xs font-mono text-muted select-all">{(singleLogData.userId as any)._id}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Description */}
                            <div className="space-y-2 flex-1">
                                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Action Description</h4>
                                <div className="bg-background border border-border rounded-lg p-4 min-h-[100px]">
                                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                        {singleLogData.description || 'No specific description provided for this action.'}
                                    </p>
                                </div>
                            </div>

                            {/* User Agent */}
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-muted uppercase tracking-wider">User Agent Header</h4>
                                <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
                                    <p className="text-[10px] font-mono text-slate-400 break-all">
                                        {singleLogData.userAgent || 'No User Agent Logged'}
                                    </p>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </SideModal>
        </div>
    );
}