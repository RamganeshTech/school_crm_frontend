import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../features/store/store';
import { Outlet, useLocation } from 'react-router-dom';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

// UI Components
import { Button } from '../../../shared/ui/Button';
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../../shared/ui/TableLayout';
import { SearchSelect, type SelectOption } from '../../../shared/ui/SearchSelect';
import { toast } from '../../../shared/ui/ToastContext';

// Hooks & APIs
import { useRoleCheck } from '../../../hooks/useRoleCheck';
import { useGetBusDropDown } from '../../../api_services/transport_api/busApi';
import {
    useGetAllFuelLogsInfinite,
    useDeleteFuelLog
} from '../../../api_services/transport_api/fuelLogApi';
import FuelLogModal from './FuelLogModal';
import useDebounce from '../../../hooks/useDebounce';

export default function FuelLogMain() {
    // --- Global State ---
    const { schoolId } = useSelector((state: RootState) => state.auth);
    // const navigate = useNavigate();
    const location = useLocation();

    // --- Local Filter State ---
    const [filters, setFilters] = useState({
        // busId: '',
        busId: '',
        search: '',
        fromDate: '',
        toDate: '',
        minAmount: 0,
        maxAmount: 50000,
    });


    const debouncedSearch = useDebounce(filters.search);
    const debouncedMinAmount = useDebounce(filters.minAmount);
    const debouncedMaxAmount = useDebounce(filters.maxAmount);


    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<any>(null);

    // --- Permissions ---
    const { isCorrespondent, isAdmin } = useRoleCheck();
    const canCreate = isCorrespondent || isAdmin
    const canDelete = isCorrespondent || isAdmin
    // const canEdit = isCorrespondent || isAdmin

    // --- API Hooks ---
    // 1. Fetch Buses for the Filter Dropdown
    const { data: busesData, isLoading: isBusesLoading } = useGetBusDropDown({ schoolId: schoolId! });
    const busOptions: SelectOption[] = React.useMemo(() => {
        const busesList = Array.isArray(busesData) ? busesData : (busesData?.data || []);
        return busesList.map((bus: any) => ({
            label: `${bus.registrationNo} ${bus.busNumber ? `(${bus.busNumber})` : ''}`,
            value: bus._id
        }));
    }, [busesData]);

    // 2. Fetch Infinite Fuel Logs
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useGetAllFuelLogsInfinite({
        schoolId: schoolId!,
        busId: filters.busId,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        search: debouncedSearch,
        minAmount: debouncedMinAmount,
        maxAmount: debouncedMaxAmount,
        limit: 30,
    });

    const deleteLogMutation = useDeleteFuelLog();

    // --- Data Processing ---
    // Flatten the infinite pages array into a single list of logs
    const fuelLogs = data?.pages?.flatMap((page: any) => page?.data || []) || [];

    // --- Handlers ---
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            busId: '',
            search: '',
            fromDate: '',
            toDate: '',
            minAmount: 0,
            maxAmount: 50000,
        });
    };

    // Handlers
    const openCreateForm = () => {
        setSelectedLog(null); // Triggers Create Mode
        setIsFormOpen(true);
    };

    const openViewForm = (log: any) => {
        setSelectedLog(log);  // Triggers View Mode (Fetching by ID)
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string, date: string) => {
        if (window.confirm(`Are you sure you want to delete the fuel log for ${new Date(date).toLocaleDateString()}?`)) {
            try {
                await deleteLogMutation.mutateAsync(id);
                toast.success("Fuel Log Deleted Successfully!");
            } catch (error: any) {
                toast.error(error.message || "Failed to delete fuel log");
            }
        }
    };

    const isChild = location.pathname.includes("single") || location.pathname.includes("profile");
    if (isChild) {
        return <Outlet />;
    }

    return (
        <div className="w-full h-full flex flex-col p-2 space-y-4 overflow-hidden">

            {/* --- Header Section --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 px-2">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-gas-pump text-primary"></i>
                        Fuel Consumption Logs
                    </h1>
                    <p className="text-xs lg:text-sm text-muted mt-1">Track fuel expenses, quantities, and billing details for the fleet.</p>
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
                                <span className='hidden md:block'>Log Fuel</span>
                                <span className='block md:hidden'>Log</span>
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
                            <i className="fas fa-filter text-muted"></i> Log Filters
                        </h3>
                        <button className="lg:hidden text-muted" onClick={() => setIsMobileFilterOpen(false)}>
                            <i className="fas fa-xmark"></i>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* existing Bus filter */}
                        <div className="relative">
                            <SearchSelect
                                label="Filter by Bus"
                                options={busOptions}
                                value={filters.busId}
                                onChange={(opt) => handleFilterChange('busId', String(opt.value))}
                                placeholder={isBusesLoading ? "Loading buses..." : "Select Bus..."}
                            />
                            {isBusesLoading && <i className="fas fa-spinner fa-spin absolute right-3 top-[38px] text-muted text-sm"></i>}
                        </div>

                        {/* Search: station / bill no / notes / log no / odometer */}
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Search</label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Station, bill no, notes..."
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            />
                        </div>

                        {/* Date range */}
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Date Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={filters.fromDate}
                                    onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                                    className="w-1/2 px-2 py-2 rounded-lg border border-border bg-background text-sm"
                                />
                                <input
                                    type="date"
                                    value={filters.toDate}
                                    onChange={(e) => handleFilterChange('toDate', e.target.value)}
                                    className="w-1/2 px-2 py-2 rounded-lg border border-border bg-background text-sm"
                                />
                            </div>
                        </div>

                        {/* Amount range slider */}
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                                Amount: ₹{filters.minAmount} - ₹{filters.maxAmount}
                            </label>
                            <Slider
                                range
                                min={0}
                                max={50000}
                                step={100}
                                value={[filters.minAmount, filters.maxAmount]}
                                onChange={(value) => {
                                    const [min, max] = value as number[];
                                    setFilters((prev) => ({ ...prev, minAmount: min, maxAmount: max }));
                                }}
                                styles={{
                                    track: { backgroundColor: 'var(--brand-blue, #1d4ed8)' },
                                    handle: { borderColor: 'var(--brand-blue, #1d4ed8)', opacity: 1 },
                                }}
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
                    <TableContainer className="h-full overflow-y-auto" onScroll={handleScroll}>
                        <THead className="sticky top-0 z-10 bg-background after:absolute after:bottom-0 after:left-0 after:right-0">
                            <tr>
                                <Th className="w-16 text-center">S.No</Th>
                                <Th>Date</Th>
                                <Th>Bus Details</Th>
                                <Th>Fuel Details</Th>
                                <Th>Total Amount</Th>
                                <Th>Billing Info</Th>
                                <Th className="text-center">Actions</Th>
                            </tr>
                        </THead>
                        <TBody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <i className="fas fa-circle-notch fa-spin text-primary text-3xl mb-4"></i>
                                            <p className="text-muted text-sm font-medium">Loading fuel logs...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : isError ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 mx-auto max-w-md">
                                            <p className="text-danger font-medium">Failed to load fuel logs. Please try again.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : fuelLogs.length > 0 ? (
                                <>
                                    {fuelLogs.map((log: any, index: number) => {
                                        return (
                                            <Tr key={log._id} className="group hover:bg-background/50 transition-colors">
                                                <Td className="text-center font-medium text-muted">
                                                    {index + 1}
                                                </Td>

                                                {/* Date */}
                                                <Td>
                                                    <p className="font-semibold text-foreground">
                                                        {new Date(log.date).toLocaleDateString('en-IN', {
                                                            day: '2-digit', month: 'short', year: 'numeric'
                                                        })}
                                                    </p>
                                                </Td>

                                                {/* Bus Details */}
                                                <Td>
                                                    <p className="font-semibold text-foreground">
                                                        {log.busId?.registrationNo || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-muted">
                                                        {log.busId?.busNumber ? `ID: ${log.busId.busNumber}` : 'No ID'}
                                                    </p>
                                                </Td>

                                                {/* Fuel Details (Quantity & Price) */}
                                                <Td>
                                                    <p className="font-semibold text-foreground">
                                                        {log.fuelQuantity} L
                                                    </p>
                                                    <p className="text-xs text-muted">
                                                        @ ₹{log.pricePerLiter}/L
                                                    </p>
                                                </Td>

                                                {/* Total Amount */}
                                                <Td>
                                                    <span className="font-bold text-danger text-sm bg-danger/10 border border-danger/20 px-2 py-1 rounded">
                                                        ₹{log.totalAmount}
                                                    </span>
                                                </Td>

                                                {/* Billing Info */}
                                                <Td>
                                                    <p className="text-sm font-medium text-foreground truncate max-w-[150px]" title={log.fuelStation || 'Unknown Station'}>
                                                        {log.fuelStation || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-muted capitalize mt-0.5">
                                                        {log.paymentMode?.replace('_', ' ') || 'Unknown'} {log.fuelBillNo ? `• Bill: ${log.fuelBillNo}` : ''}
                                                    </p>
                                                </Td>

                                                {/* Actions */}
                                                <Td className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => openViewForm(log)} title="View / Edit Fuel Log">
                                                            <i className="fas fa-eye text-primary"></i>
                                                        </Button>
                                                        {canDelete && (
                                                            <Button
                                                                variant="danger"
                                                                size={deleteLogMutation.isPending ? "sm" : "icon"}
                                                                className="hover:text-danger hover:bg-danger/10 text-danger"
                                                                onClick={() => handleDelete(log._id, log.date)}
                                                                isLoading={deleteLogMutation.isPending && deleteLogMutation.variables === log._id}
                                                                title="Delete Fuel Log"
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
                                            <td colSpan={7} className="py-6 text-center">
                                                <i className="fas fa-circle-notch fa-spin text-primary text-xl"></i>
                                                <p className="text-xs text-muted mt-2">Loading older logs...</p>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4 text-muted text-2xl shadow-sm">
                                                <i className="fas fa-gas-pump"></i>
                                            </div>
                                            <h3 className="text-lg font-medium text-foreground mb-2">No Fuel Logs Found</h3>
                                            <p className="text-muted text-sm max-w-md">
                                                Adjust your filters or log a new fuel entry to see data here.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </TBody>
                    </TableContainer>
                </div>
            </div>

            <FuelLogModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                logData={selectedLog}
                logId={selectedLog?._id}
            />
        </div>
    );
}