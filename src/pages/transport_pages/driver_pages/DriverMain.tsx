import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../features/store/store';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

// UI Components
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../../shared/ui/TableLayout';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { toast } from '../../../shared/ui/ToastContext';

// Hooks & APIs
import useDebounce from '../../../hooks/useDebounce';
import { useRoleCheck } from '../../../hooks/useRoleCheck';
import { useGetAllDrivers, useDeleteDriver } from '../../../api_services/transport_api/driverApi';
import DriverFormModal from './DriverFormModal';

// Placeholder for the external modal component we will build next
// import DriverFormModal from './DriverFormModal';

const DriverMain = () => {
    // --- Global State ---
    const { schoolId } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const location = useLocation()


    // --- Search & Filter State ---
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 500);

    const [filters, setFilters] = useState({
        status: '',
        licenseType: '',
    });

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // --- Modal State (To be passed to the separate component later) ---
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState<any | null>(null);

    // --- Permissions ---
    const { isParent, isPrincipal, isVicePrincipal, isCorrespondent, isAdmin, isTeacher } = useRoleCheck();
    const canCreate = !isParent && !isPrincipal && !isVicePrincipal;
    const canDelete = isCorrespondent || isAdmin || isTeacher;
    // const canEdit = !isPrincipal && !isVicePrincipal;

    // --- API Hooks ---
    const { data: drivers = [], isLoading, isError } = useGetAllDrivers({
        schoolId: schoolId!,
        ...filters,
        search: debouncedSearch,
    } as any); // Adjust type casting based on your exact hook parameter types

    const deleteDriverMutation = useDeleteDriver();

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
            status: '',
            licenseType: '',
        });
    };

    const openCreateForm = () => {
        setEditingDriver(null);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete driver "${name}"?`)) {
            try {
                await deleteDriverMutation.mutateAsync(id);
                toast.success("Driver Deleted Successfully!");
            } catch (error: any) {
                toast.error(error.message || "Failed to delete driver");
            }
        }
    };

    const isChild = location.pathname.includes("single")
    if (isChild) {
        return <Outlet />
    }

    return (
        <div className="w-full h-full flex flex-col p-2 space-y-4 overflow-hidden">
            {/* --- Header Section --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 px-2">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-id-card text-primary"></i>
                        Driver Directory
                    </h1>
                    <p className="text-xs lg:text-sm text-muted mt-1">Manage transport drivers, their licenses, and statuses.</p>
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
                                <span className='hidden md:block'>Create Driver</span>
                                <span className='block md:hidden'>Create</span>
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
                            <i className="fas fa-filter text-muted"></i> Advanced Filters
                        </h3>
                        <button className="lg:hidden text-muted" onClick={() => setIsMobileFilterOpen(false)}>
                            <i className="fas fa-xmark"></i>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <Input
                            id="search"
                            label="Search Drivers"
                            placeholder="Name, Phone, or License..."
                            leftIcon="fas fa-search"
                            value={searchInput}
                            onChange={handleSearchChange}
                        />

                        <div className="grid grid-cols-1 gap-3">
                            <SearchSelect
                                label="Operational Status"
                                options={[
                                    { label: 'Active', value: 'active' },
                                    { label: 'On Leave', value: 'on_leave' },
                                    { label: 'Suspended', value: 'suspended' }
                                ]}
                                value={filters.status}
                                onChange={(opt) => handleFilterChange('status', String(opt.value))}
                                placeholder="Select Status..."
                            />

                            <SearchSelect
                                label="License Type"
                                options={[
                                    { label: 'Heavy Motor Vehicle (HMV)', value: 'HMV' },
                                    { label: 'Light Motor Vehicle (LMV)', value: 'LMV' }
                                ]}
                                value={filters.licenseType}
                                onChange={(opt) => handleFilterChange('licenseType', String(opt.value))}
                                placeholder="Select Type..."
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
                                <Th>Driver Name</Th>
                                <Th>Assigned Bus</Th>
                                {/* <Th>Experience</Th> */}
                                <Th>Phone No</Th>
                                <Th className="text-center">Actions</Th>
                            </tr>
                        </THead>
                        <TBody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <i className="fas fa-circle-notch fa-spin text-primary text-3xl mb-4"></i>
                                            <p className="text-muted text-sm font-medium">Loading drivers...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : isError ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 mx-auto max-w-md">
                                            <p className="text-danger font-medium">Failed to load drivers. Please try again.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : drivers.length > 0 ? (
                                drivers.map((driver: any, index: number) => (
                                    <Tr key={driver._id} className="group hover:bg-background/50 transition-colors">
                                        <Td className="text-center font-medium text-muted">
                                            {index + 1}
                                        </Td>

                                        {/* Name & Contact */}
                                        <Td className="whitespace-normal">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20 overflow-hidden">
                                                    {driver.photo?.url ? (
                                                        <img src={driver.photo?.url} alt="profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        driver.name?.charAt(0).toUpperCase() || 'D'
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-foreground break-words leading-tight">
                                                        {driver.name}
                                                    </p>

                                                </div>
                                            </div>
                                        </Td>

                                        {/* License Details */}
                                        <Td>
                                            <p className="text-sm font-medium text-foreground">
                                                {driver.assignedBusId?.registrationNo || 'Not Assigned'}
                                            </p>
                                            {/* <p className="text-xs text-muted mt-0.5">
                                                Type: {driver.licenseType || 'Unknown'}
                                            </p> */}
                                        </Td>

                                        {/* Experience */}
                                        {/* <Td>
                                            <p className="text-sm text-foreground">
                                                {driver.yearsOfExperience ? `${driver.yearsOfExperience} Years` : 'N/A'}
                                            </p>
                                        </Td> */}

                                        {/* Status */}
                                        {/* <Td>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${
                                                driver.status === 'active' ? 'bg-success/10 border-success/20 text-success' : 
                                                driver.status === 'on_leave' ? 'bg-warning/10 border-warning/20 text-warning' : 
                                                'bg-danger/10 border-danger/20 text-danger'
                                            }`}>
                                                <i className="fas fa-circle text-[8px]"></i>
                                                {driver.status ? driver.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                                            </span>
                                        </Td> */}

                                        <Td>
                                            <p className="text-xs text-muted truncate mt-0.5">
                                                {driver?.phone || 'No Contact'} <br />
                                                {driver?.emergencyContact || 'No Contact'}
                                            </p>
                                        </Td>

                                        {/* Actions */}
                                        <Td className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => navigate(`single/${driver._id}`)} title="View Profile">
                                                    <i className="fas fa-eye"></i>
                                                </Button>

                                                {/* {canEdit && (
                                                    <Button variant="ghost" size="icon" onClick={() => openEditForm(driver)} title="Edit Driver">
                                                        <i className="fas fa-edit"></i>
                                                    </Button>
                                                )} */}

                                                {canDelete && (
                                                    <Button
                                                        variant="danger"
                                                        size={deleteDriverMutation.isPending ? "sm" : "icon"}
                                                        className="hover:text-danger hover:bg-danger/10 text-danger"
                                                        onClick={() => handleDelete(driver._id, driver.name)}
                                                        isLoading={deleteDriverMutation.isPending && deleteDriverMutation.variables === driver._id}
                                                        title="Delete Driver"
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
                                                <i className="fas fa-user-slash"></i>
                                            </div>
                                            <h3 className="text-lg font-medium text-foreground mb-2">No Drivers Found</h3>
                                            <p className="text-muted text-sm max-w-md">
                                                Adjust your filters or register a new driver to see data here.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </TBody>
                    </TableContainer>
                </div>
            </div>

            {/* --- Modals --- */}

            <DriverFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                driverData={editingDriver}
            />

        </div>
    );
}


export default DriverMain;