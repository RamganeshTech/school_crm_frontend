import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../features/store/store';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

// UI Components
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../../shared/ui/TableLayout';
import { toast } from '../../../shared/ui/ToastContext';

// Hooks & APIs
import { useRoleCheck } from '../../../hooks/useRoleCheck';
import {
    useGetAllBusRoutesInfinite,
    useDeleteBusRoute
} from '../../../api_services/transport_api/busRouteApi';
import BusRouteCreateModal from './BusRouteCreateModal';

export default function BusRouteMain() {
    // --- Global State ---
    const { schoolId } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();

    // --- Local State ---
    const [filters, setFilters] = useState({
        search: '',
        minFee: '',
        maxFee: '',
    });
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Create Modal State (To be connected to BusRouteCreateModal)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // --- Permissions ---
    const { isCorrespondent, isAdmin } = useRoleCheck();
    const canCreate = isAdmin || isCorrespondent;
    const canDelete = isCorrespondent || isAdmin;
    const canView = isCorrespondent || isAdmin; // Applied to view/edit navigation

    // --- API Hooks ---
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useGetAllBusRoutesInfinite({
        schoolId: schoolId!,
        search: debouncedSearch,
        minFee: filters.minFee ? Number(filters.minFee) : undefined,
        maxFee: filters.maxFee ? Number(filters.maxFee) : undefined,
        limit: 30,
    });

    const deleteRouteMutation = useDeleteBusRoute();

    // --- Data Processing ---
    const busRoutes = data?.pages?.flatMap((page: any) => page?.data || []) || [];

    // --- Handlers ---
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }
    };

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Debounce search input specifically to avoid spamming the backend
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        handleFilterChange('search', val);
        // Simple debounce inline for immediate UI update but delayed API call
        const timeoutId = setTimeout(() => setDebouncedSearch(val), 500);
        return () => clearTimeout(timeoutId);
    };

    const clearFilters = () => {
        setFilters({ search: '', minFee: '', maxFee: '' });
        setDebouncedSearch('');
    };

    const openCreateForm = () => {
        setIsCreateModalOpen(true);
    };

    const openViewForm = (routeId: string) => {
        // Navigate to the child route for viewing/editing
        navigate(`single/${routeId}`);
    };

    const handleDelete = async (id: string, routeName: string) => {
        if (window.confirm(`Are you sure you want to delete the route "${routeName}"? This will remove all associated assignments.`)) {
            try {
                await deleteRouteMutation.mutateAsync(id);
                toast.success("Bus Route Deleted Successfully!");
            } catch (error: any) {
                toast.error(error.message || "Failed to delete bus route");
            }
        }
    };

    // --- Render Child Outlet ---
    // If the path has extra segments (like a route ID), render the child view instead of the list
    const isChild = location.pathname.includes('/single');
    if (isChild) {
        return <Outlet />;
    }

    return (
        <div className="w-full h-full flex flex-col p-2 space-y-4 overflow-hidden">

            {/* --- Header Section --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 px-2">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-map-marked-alt text-primary"></i>
                        Bus Routes & Stops
                    </h1>
                    <p className="text-xs lg:text-sm text-muted mt-1">Manage transport routes, boarding stops, and route fee structures.</p>
                </div>

                <div className='flex gap-2 justify-between items-center'>
                    <div className="w-full sm:w-auto lg:hidden">
                        <Button variant="outline" className="w-full justify-center" leftIcon="fas fa-filter" onClick={() => setIsMobileFilterOpen(true)}>
                            Filters
                        </Button>
                    </div>

                    {canCreate && (
                        <div className="block">
                            <Button onClick={openCreateForm} leftIcon="fas fa-plus" variant="primary">
                                <span className='hidden md:block'>Create Route</span>
                                <span className='block md:hidden'>Route</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Main Content Layout --- */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 h-[calc(100%-80px)] relative">

                {/* MOBILE OVERLAY */}
                {isMobileFilterOpen && (
                    <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsMobileFilterOpen(false)} />
                )}

                {/* LEFT PANEL: Filters (30%) */}
                <div className={`
                    fixed inset-y-0 left-0 z-50 w-[280px] bg-surface border border-border rounded-xl p-5 flex flex-col gap-5 shadow-2xl transition-transform duration-300 ease-in-out
                    lg:static lg:w-[30%] lg:min-w-[280px] lg:max-w-[350px] lg:shrink-0 lg:rounded-xl lg:shadow-sm lg:translate-x-0 lg:border lg:z-auto
                    ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}
                    overflow-y-auto custom-scrollbar
                `}>
                    <div className="flex items-center justify-between lg:block border-b border-border pb-2">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <i className="fas fa-filter text-muted"></i> Route Filters
                        </h3>
                        <button className="lg:hidden text-muted" onClick={() => setIsMobileFilterOpen(false)}>
                            <i className="fas fa-xmark"></i>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Search Filter */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-muted uppercase">Search Routes</label>
                            <div className="relative">
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm"></i>
                                <input
                                    type="text"
                                    placeholder="Route No or Name..."
                                    value={filters.search}
                                    onChange={handleSearch}
                                    className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                        </div>

                        {/* Fee Filters */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-muted uppercase">Min Fee (₹)</label>
                                <Input
                                    id="minFee"
                                    type="number"
                                    placeholder="0"
                                    value={filters.minFee}
                                    onChange={(e) => handleFilterChange('minFee', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-muted uppercase">Max Fee (₹)</label>
                                <Input
                                    id="maxFee"
                                    type="number"
                                    placeholder="Any"
                                    value={filters.maxFee}
                                    onChange={(e) => handleFilterChange('maxFee', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-border">
                        <Button variant="outline" className="w-full" onClick={clearFilters}>Clear Filters</Button>
                        <Button variant="primary" className="w-full lg:hidden mt-2" onClick={() => setIsMobileFilterOpen(false)}>Apply</Button>
                    </div>
                </div>

                {/* RIGHT PANEL: Data Table (70%) */}
                <div className="flex-1 bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <TableContainer className="h-full overflow-y-auto" onScroll={handleScroll}>
                        <THead className="sticky top-0 z-10 bg-background after:absolute after:bottom-0 after:left-0 after:right-0">
                            <tr>
                                <Th className="w-16 text-center">S.No</Th>
                                <Th>Route Info</Th>
                                <Th>Stops Mapping</Th>
                                <Th>Route Fee</Th>
                                <Th className="text-center">Actions</Th>
                            </tr>
                        </THead>
                        <TBody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <i className="fas fa-circle-notch fa-spin text-primary text-3xl mb-4"></i>
                                            <p className="text-muted text-sm font-medium">Loading bus routes...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : isError ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 mx-auto max-w-md">
                                            <p className="text-danger font-medium">Failed to load bus routes. Please try again.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : busRoutes.length > 0 ? (
                                <>
                                    {busRoutes.map((route: any, index: number) => {
                                        // Safely extract stop details based on the new IStops interface
                                        const stopsArray = route.stops || [];
                                        const stopCount = stopsArray.length;
                                        const startStop = stopCount > 0 ? stopsArray[0].stopName : 'N/A';
                                        const endStop = stopCount > 1 ? stopsArray[stopCount - 1].stopName : '';

                                        return (
                                            <Tr key={route._id} className="group hover:bg-background/50 transition-colors">
                                                <Td className="text-center font-medium text-muted">
                                                    {index + 1}
                                                </Td>

                                                {/* Route Info */}
                                                <Td>
                                                    <p className="font-bold text-foreground">
                                                        {route.routeName}
                                                    </p>
                                                    {route.routeNo && (
                                                        <p className="text-xs text-muted font-mono mt-0.5">
                                                            ID: {route.routeNo}
                                                        </p>
                                                    )}
                                                </Td>

                                                {/* Stops Details */}
                                                <Td>
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded text-xs">
                                                            {stopCount} Stops
                                                        </span>
                                                        <p className="text-xs text-muted max-w-[150px] truncate" title={`${startStop} ${endStop ? '➔ ' + endStop : ''}`}>
                                                            {startStop} {endStop && `➔ ${endStop}`}
                                                        </p>
                                                    </div>
                                                </Td>

                                                {/* Fee Amount */}
                                                <Td>
                                                    {route.feeAmount ? (
                                                        <span className="font-semibold text-foreground">
                                                            ₹{route.feeAmount.toLocaleString('en-IN')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted italic">Not Configured</span>
                                                    )}
                                                </Td>

                                                {/* Actions */}
                                                <Td className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {canView && (
                                                            <Button variant="ghost"  size="icon" onClick={() => openViewForm(route._id)} title="View / Edit Route">
                                                                <i className="fas fa-eye text-primary"></i>
                                                            </Button>
                                                        )}
                                                        
                                                        {canDelete && (
                                                            <Button
                                                                variant="danger"
                                                                size={deleteRouteMutation.isPending ? "sm" : "icon"}
                                                                className="hover:text-danger hover:bg-danger/10 text-danger"
                                                                onClick={() => handleDelete(route._id, route.routeName)}
                                                                isLoading={deleteRouteMutation.isPending && deleteRouteMutation.variables === route._id}
                                                                title="Delete Route"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </Td>
                                            </Tr>
                                        );
                                    })}

                                    {/* Infinite Scroll Loading Indicator */}
                                    {isFetchingNextPage && (
                                        <tr>
                                            <td colSpan={5} className="py-6 text-center">
                                                <i className="fas fa-circle-notch fa-spin text-primary text-xl"></i>
                                                <p className="text-xs text-muted mt-2">Loading more routes...</p>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4 text-muted text-2xl shadow-sm">
                                                <i className="fas fa-route"></i>
                                            </div>
                                            <h3 className="text-lg font-medium text-foreground mb-2">No Routes Found</h3>
                                            <p className="text-muted text-sm max-w-md">
                                                Adjust your filters or create a new bus route.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </TBody>
                    </TableContainer>
                </div>
            </div>

            {/* Placeholders for upcoming Modals */}

            {/* {isCreateModalOpen && ( */}
                <BusRouteCreateModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            {/* )} */}

        </div>
    );  
}