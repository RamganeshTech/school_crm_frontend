import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../features/store/store';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

// UI Components
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../../shared/ui/TableLayout';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { toast } from '../../../shared/ui/ToastContext';

// Hooks & APIs
import useDebounce from '../../../hooks/useDebounce';
import { useRoleCheck } from '../../../hooks/useRoleCheck';
// Adjust the import path to where your busApi is actually located
import { useGetAllBuses, useDeleteBus } from '../../../api_services/transport_api/busApi';
import BusCreateModel from './BusCreateModel';

export default function BusMain() {
    // --- Global State ---
    const { schoolId } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();

    // --- Search & Filter State ---
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 500);

    const [filters, setFilters] = useState({
        operationalStatus: '',
    });

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Add this right below your existing `isMobileFilterOpen` state
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Update your openCreateForm function to this:
    const openCreateForm = () => {
        setIsFormOpen(true);
    };

    // --- Permissions ---
    const { isParent, isPrincipal, isVicePrincipal, isCorrespondent, isAdmin, isTeacher } = useRoleCheck();
    const canCreate = !isParent && !isPrincipal && !isVicePrincipal;
    const canDelete = isCorrespondent || isAdmin || isTeacher;

    // --- API Hooks ---
    // Note: If you add search to your backend, you can pass debouncedSearch here.
    const { data: buses = [], isLoading, isError, refetch } = useGetAllBuses({
        schoolId: schoolId!,
        ...filters,
    });

    const deleteBusMutation = useDeleteBus();

    // --- Handlers ---
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setSearchInput('');
        setFilters({
            operationalStatus: '',
        });
    };

    const handleDelete = async (id: string, registrationNo: string) => {
        if (window.confirm(`Are you sure you want to delete the bus with Reg No: "${registrationNo}"?`)) {
            try {
                await deleteBusMutation.mutateAsync(id);
                toast.success("Bus Deleted Successfully!");
                refetch();
            } catch (error: any) {
                toast.error(error.message || "Failed to delete bus");
            }
        }
    };

    // If we are navigating to a nested route (like viewing a single bus), render the Outlet instead
    const isChild = location.pathname.includes("single");
    if (isChild) {
        return <Outlet />;
    }

    // Client-side search filtering (if backend doesn't support text search yet)
    const filteredBuses = buses.filter((bus: any) => {
        if (!debouncedSearch) return true;
        const searchLower = debouncedSearch.toLowerCase();
        return (
            (bus.registrationNo?.toLowerCase() || '').includes(searchLower) ||
            (bus.busNumber?.toLowerCase() || '').includes(searchLower) ||
            (bus.makeModel?.toLowerCase() || '').includes(searchLower)
        );
    });

    return (
        <div className="w-full h-full flex flex-col p-2 space-y-4 overflow-hidden">
            {/* --- Header Section --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 px-2">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-bus text-primary"></i>
                        Fleet Directory
                    </h1>
                    <p className="text-xs lg:text-sm text-muted mt-1">Manage school buses, technical details, and current statuses.</p>
                </div>

                {/* Mobile Filter Toggle & Create Action */}
                <div className='flex gap-2 justify-between items-center'>
                    <div className="w-full sm:w-auto lg:hidden">
                        <Button variant="outline" className="w-full justify-center" leftIcon="fas fa-filter" onClick={() => setIsMobileFilterOpen(true)}>
                            Filters
                        </Button>
                    </div>

                    {canCreate && (
                        <div className="block">
                            <Button onClick={openCreateForm} leftIcon="fas fa-plus" variant="primary">
                                <span className='hidden md:block'>Register Bus</span>
                                <span className='block md:hidden'>Register</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Main Content Layout (Responsive 30% Filters / 70% Table) --- */}
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
                            <i className="fas fa-filter text-muted"></i> Fleet Filters
                        </h3>
                        <button className="lg:hidden text-muted" onClick={() => setIsMobileFilterOpen(false)}>
                            <i className="fas fa-xmark"></i>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <Input
                            id="search"
                            label="Search Fleet"
                            placeholder="Reg No, Bus No, or Model..."
                            leftIcon="fas fa-search"
                            value={searchInput}
                            onChange={handleSearchChange}
                        />

                        <div className="grid grid-cols-1 gap-3">
                            <SearchSelect
                                label="Operational Status"
                                options={[
                                    { label: 'Active', value: 'active' },
                                    { label: 'In Service / Maintenance', value: 'in_service' },
                                    { label: 'On Trip', value: 'on_trip' },
                                    { label: 'Inactive', value: 'inactive' }
                                ]}
                                value={filters.operationalStatus}
                                onChange={(opt) => handleFilterChange('operationalStatus', String(opt.value))}
                                placeholder="Select Status..."
                            />
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-border">
                        <Button variant="outline" className="w-full" onClick={clearFilters}>Clear Filters</Button>
                        <Button variant="primary" className="w-full lg:hidden mt-2" onClick={() => setIsMobileFilterOpen(false)}>Apply</Button>
                    </div>
                </div>

                {/* RIGHT PANEL: Data Table (70%) */}
                <div className="flex-1 bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <TableContainer className="h-full overflow-y-auto">
                        <THead className="sticky top-0 z-10 bg-background after:absolute after:bottom-0 after:left-0 after:right-0">
                            <tr>
                                <Th className="w-16 text-center">S.No</Th>
                                <Th>Identification</Th>
                                <Th>Vehicle Details</Th>
                                <Th>Specs</Th>
                                <Th>Status</Th>
                                <Th className="text-center">Actions</Th>
                            </tr>
                        </THead>
                        <TBody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <i className="fas fa-circle-notch fa-spin text-primary text-3xl mb-4"></i>
                                            <p className="text-muted text-sm font-medium">Loading fleet data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : isError ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 mx-auto max-w-md">
                                            <p className="text-danger font-medium">Failed to load buses. Please try again.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBuses.length > 0 ? (
                                filteredBuses.map((bus: any, index: number) => (
                                    <Tr key={bus._id} className="group hover:bg-background/50 transition-colors">
                                        <Td className="text-center font-medium text-muted">
                                            {index + 1}
                                        </Td>

                                        {/* Identification */}
                                        <Td className="whitespace-normal">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-foreground break-words leading-tight">
                                                    {bus.registrationNo || 'No Reg No'}
                                                </p>
                                                <p className="text-xs text-muted truncate mt-0.5 font-mono">
                                                    ID: {bus.busNumber || 'N/A'}
                                                </p>
                                            </div>
                                        </Td>

                                        {/* Vehicle Details */}
                                        <Td>
                                            <p className="text-sm font-medium text-foreground">
                                                {bus.makeModel || 'N/A'}
                                            </p>
                                            <p className="text-xs text-muted mt-0.5">
                                                Year: {bus.year || 'Unknown'}
                                            </p>
                                        </Td>

                                        {/* Specs (Capacity & Fuel) */}
                                        <Td>
                                            <p className="text-sm text-foreground">
                                                {bus.seatingCapacity ? `${bus.seatingCapacity} Seats` : 'N/A'}
                                            </p>
                                            <p className="text-xs text-muted mt-0.5 capitalize">
                                                {bus.fuelType || 'Unknown'}
                                            </p>
                                        </Td>

                                        {/* Status */}
                                        <Td>
                                            {(() => {
                                                const statusMap: Record<string, { label: string, classes: string }> = {
                                                    'active': { label: 'Active', classes: 'bg-success/10 border-success/20 text-success' },
                                                    'in_service': { label: 'In Service', classes: 'bg-warning/10 border-warning/20 text-warning' },
                                                    'on_trip': { label: 'On Trip', classes: 'bg-primary/10 border-primary/20 text-primary' },
                                                    'inactive': { label: 'Inactive', classes: 'bg-danger/10 border-danger/20 text-danger' },
                                                };
                                                const config = statusMap[bus.operationalStatus] || { label: 'Unknown', classes: 'bg-surface text-muted border-border' };

                                                return (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${config.classes}`}>
                                                        <i className="fas fa-circle text-[8px]"></i>
                                                        {config.label}
                                                    </span>
                                                );
                                            })()}
                                        </Td>

                                        {/* Actions (View and Delete ONLY) */}
                                        <Td className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => navigate(`single/${bus._id}`)} title="View Bus Profile">
                                                    <i className="fas fa-eye"></i>
                                                </Button>

                                                {canDelete && (
                                                    <Button
                                                        variant="danger"
                                                        size={deleteBusMutation.isPending ? "sm" : "icon"}
                                                        className="hover:text-danger hover:bg-danger/10 text-danger"
                                                        onClick={() => handleDelete(bus._id, bus.registrationNo || 'Unknown')}
                                                        isLoading={deleteBusMutation.isPending && deleteBusMutation.variables === bus._id}
                                                        title="Delete Bus"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </Button>
                                                )}
                                            </div>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4 text-muted text-2xl shadow-sm">
                                                <i className="fas fa-bus-slash"></i>
                                            </div>
                                            <h3 className="text-lg font-medium text-foreground mb-2">No Buses Found</h3>
                                            <p className="text-muted text-sm max-w-md">
                                                Adjust your filters or register a new bus to see data here.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </TBody>
                    </TableContainer>
                </div>
            </div>

            <BusCreateModel
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
            />
        </div>
    );
}