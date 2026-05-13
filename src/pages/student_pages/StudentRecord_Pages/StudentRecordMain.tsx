import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../features/store/store';

import useDebounce from '../../../hooks/useDebounce';
import { useGetClasses } from '../../../api_services/schoolConfig_api/classApi';
import { useGetSections } from '../../../api_services/schoolConfig_api/sectionApi';

import { Button } from '../../../shared/ui/Button';
import { Input, Label } from '../../../shared/ui/Input';
import { SideModal } from '../../../shared/ui/SideModal';
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../../shared/ui/TableLayout';
import { SearchSelect, type SelectOption } from '../../../shared/ui/SearchSelect';
import {
    useGetAllStudentRecords,
    useDeleteStudentRecord,
    useToggleStudentRecordStatus,
    useApplyConcession,
    useUpdateConcessionDetails
} from '../../../api_services/student_api/studentRecordApi';
import { useGetSchoolById } from '../../../api_services/schoolConfig_api/schoolapi';
import { getAcademicYears } from '../../../utils/utils';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';


export default function StudentRecordMain() {
    const { schoolId } = useSelector((state: RootState) => state.auth);



    const { data: schoolData } = useGetSchoolById(schoolId!);

    const location = useLocation()
    const navigate = useNavigate()


    // --- Search & Filters State ---
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 500);

    const [filters, setFilters] = useState({
        academicYear: schoolData?.currentAcademicYear || '2025-2026', // Set default or fetch dynamically
        classId: '',
        sectionId: '',
        newOld: '',
        isActive: '',
        isBusApplicable: '',
        isFullyPaid: '',
        hasConcession: '',
        limit: 15, // Number of items per scroll fetch
    });

    // Reset pagination when debounced search changes
    // useEffect(() => {
    //     // useInfiniteQuery handles its own pages, but changing query keys resets it automatically.
    // }, [debouncedSearch]);

    // --- API Hooks ---
    const { data: classesData } = useGetClasses(schoolId!);
    const { data: sectionsData, isLoading: isSectionsLoading } = useGetSections({
        schoolId: schoolId!,
        classId: filters.classId
    });

    // Strip out empty string filters before sending to API to avoid backend type errors
    const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
    );

    const {
        data,
        isLoading,
        isError,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useGetAllStudentRecords({
        schoolId: schoolId!,
        ...activeFilters,
        limit: 40,
        academicYear: filters?.academicYear,
        search: debouncedSearch,
    });

    const toggleStatusMutation = useToggleStudentRecordStatus();
    const deleteRecordMutation = useDeleteStudentRecord();
    const applyConcessionMutation = useApplyConcession();
    const updateConcessionMutation = useUpdateConcessionDetails();

    const academicYearOptions = getAcademicYears();

    // --- Flatten Infinite Scroll Data ---
    // Extract `data` array from each page's root object
    const records = data?.pages?.flatMap((page: any) => page.data || []) || [];

    // --- Modals State ---
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    // Concession Form State
    const [concessionType, setConcessionType] = useState('');
    const [concessionValue, setConcessionValue] = useState('');
    const [concessionFile, setConcessionFile] = useState<File | null>(null);

    // --- Handlers ---
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }
    };

    const handleFilterChange = (key: string, value: string | boolean) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setSearchInput('');
        setFilters({
            academicYear: '2025-2026',
            classId: '', sectionId: '', newOld: '', isActive: '',
            isBusApplicable: '', isFullyPaid: '', hasConcession: '', limit: 15
        });
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await toggleStatusMutation.mutateAsync({ id, isActive: !currentStatus });

            if (selectedRecord && selectedRecord._id === id) {
                setSelectedRecord({ ...selectedRecord, isActive: !currentStatus });
            }

            refetch();
        } catch (error) { console.error("Toggle failed", error); }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to permanently delete records for ${name}?`)) {
            try {
                await deleteRecordMutation.mutateAsync(id);
                refetch();
            } catch (error) { console.error("Delete failed", error); }
        }
    };

    // const openManageModal = (record: any) => {
    //     setSelectedRecord(record);
    //     // Pre-fill concession details if they exist on the record
    //     setConcessionType(record.concessionType || '');
    //     setConcessionValue(record.concessionValue || '');
    //     setConcessionFile(null);
    //     setIsManageModalOpen(true);
    // };


    // --- Concession Handlers ---
    const handleApplyConcession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecord || !schoolId) return;

        const formData = new FormData();
        formData.append('schoolId', schoolId);
        formData.append('studentId', selectedRecord.studentId || selectedRecord._id);
        formData.append('concessionType', concessionType);
        formData.append('concessionValue', concessionValue);
        if (concessionFile) {
            formData.append('file', concessionFile);
        }

        try {
            await applyConcessionMutation.mutateAsync(formData);
            refetch();
            setIsManageModalOpen(false);
        } catch (error) { console.error("Failed to apply concession", error); }
    };

    const handleUpdateConcession = async () => {
        if (!selectedRecord || !schoolId) return;

        try {
            await updateConcessionMutation.mutateAsync({
                schoolId: schoolId,
                studentRecordId: selectedRecord._id,
                concessionType,
                concessionValue
            });
            refetch();
            setIsManageModalOpen(false);
        } catch (error) { console.error("Failed to update concession", error); }
    };

    // --- Options Mapping ---
    const classOptions: SelectOption[] = classesData?.map((cls: any) => ({ label: cls.name, value: cls._id })) || [];
    const sectionOptions: SelectOption[] = sectionsData?.map((sec: any) => ({ label: sec.name, value: sec._id })) || [];

    // ADD THESE NEW ARRAYS:
    const statusOptions: SelectOption[] = [
        { label: 'All Statuses', value: '' },
        { label: 'Active Only', value: 'true' },
        { label: 'Inactive Only', value: 'false' },
    ];

    // const busOptions: SelectOption[] = [
    //     { label: 'Bus: Any', value: '' },
    //     { label: 'Bus Subscribed', value: 'true' },
    // ];

    // const concessionOptions: SelectOption[] = [
    //     { label: 'Concession: Any', value: '' },
    //     { label: 'Has Concession', value: 'true' },
    // ];


    const isChild = location.pathname.includes("single")
    if (isChild) {
        return <Outlet />
    }

    return (
        <div className="w-full h-full flex flex-col p-2 space-y-4 overflow-hidden">

            {/* --- Header --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-file-invoice text-primary"></i>
                        Student Academic & Financial Records
                    </h1>
                    <p className="text-sm text-muted mt-1">Manage academic years, fees, and active status.</p>
                </div>
            </div>

            {/* --- Main Layout --- */}
            <div className="flex flex-col lg:flex-row gap-4 h-[calc(100%-80px)]">

                {/* LEFT PANEL: Filters */}
                <div className="w-full lg:w-[25%] bg-surface border border-border rounded-xl p-5 flex flex-col gap-5 overflow-y-auto shrink-0 shadow-sm custom-scrollbar">
                    <h3 className="font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                        <i className="fas fa-filter text-muted"></i> Advanced Filters
                    </h3>

                    <div className="space-y-4">

                        <SearchSelect
                            label="Academic Year"
                            options={academicYearOptions}
                            value={filters.academicYear}
                            onChange={(opt) => handleFilterChange('academicYear', String(opt.value))}
                            placeholder="Select Year..."
                        />


                        <Input
                            id="search"
                            label="Search Records"
                            placeholder="Name or Roll No..."
                            leftIcon="fas fa-search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />

                        {/* Dropdown Filters */}
                        <div className="grid grid-cols-2 gap-3">
                            <SearchSelect
                                label="Class" options={classOptions} value={filters.classId}
                                onChange={(opt) => { handleFilterChange('classId', String(opt.value)); handleFilterChange('sectionId', ''); }}
                                placeholder="Class..."
                            />
                            <div className="relative">
                                <SearchSelect
                                    label="Section" options={sectionOptions} value={filters.sectionId}
                                    onChange={(opt) => handleFilterChange('sectionId', String(opt.value))}
                                    placeholder="Section..."
                                />
                                {isSectionsLoading && <i className="fas fa-spinner fa-spin absolute right-3 top-[38px] text-muted text-xs"></i>}
                            </div>
                        </div>

                        {/* Status & Attributes */}
                        <div className="flex flex-col gap-1.5">
                            {/* <Label>Record Status</Label> */}
                            {/* <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                                value={filters.isActive} onChange={(e) => handleFilterChange('isActive', e.target.value)}>
                                <option value="">All Statuses</option>
                                <option value="true">Active Only</option>
                                <option value="false">Inactive Only</option>
                            </select> */}

                            <SearchSelect
                                label="Record Status"
                                options={statusOptions}
                                value={filters.isActive}
                                onChange={(opt) => handleFilterChange('isActive', String(opt.value))}
                                placeholder="Select Status..."
                            />
                        </div>

                        {/* Financial Features (Chip Toggles) */}
                        <div className="flex flex-col gap-2 pt-1">
                            <Label>Financial Features</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {/* Bus Toggle Chip */}
                                <button
                                    type="button"
                                    onClick={() => handleFilterChange('isBusApplicable', filters.isBusApplicable === 'true' ? '' : 'true')}
                                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${filters.isBusApplicable === 'true'
                                        ? 'bg-primary-soft text-primary border-primary/30 shadow-sm'
                                        : 'bg-surface text-muted border-border hover:bg-background'
                                        }`}
                                >
                                    <i className={`fas fa-bus text-xs ${filters.isBusApplicable === 'true' ? 'text-primary' : 'text-muted/70'}`}></i>
                                    Bus User
                                </button>

                                {/* Concession Toggle Chip */}
                                <button
                                    type="button"
                                    onClick={() => handleFilterChange('hasConcession', filters.hasConcession === 'true' ? '' : 'true')}
                                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${filters.hasConcession === 'true'
                                        ? 'bg-primary-soft text-primary border-primary/30 shadow-sm'
                                        : 'bg-surface text-muted border-border hover:bg-background'
                                        }`}
                                >
                                    <i className={`fas fa-tags text-xs ${filters.hasConcession === 'true' ? 'text-primary' : 'text-muted/70'}`}></i>
                                    Concession
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="mt-auto pt-4 border-t border-border">
                        <Button variant="outline" className="w-full" onClick={clearFilters}>Clear Filters</Button>
                    </div>
                </div>

                {/* RIGHT PANEL: Infinite Table */}
                <div className="flex-1 bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <TableContainer className="h-full overflow-y-auto custom-scrollbar" onScroll={handleScroll}>
                        <THead className="sticky top-0 z-10 bg-background after:absolute after:bottom-0 after:left-0 after:right-0">
                            <tr>
                                <Th className="w-12 text-center">No.</Th>
                                <Th>Student Info</Th>
                                <Th>Class/Section</Th>
                                <Th>Financial Features</Th>
                                <Th>Status</Th>
                                <Th className="text-right">Actions</Th>
                            </tr>
                        </THead>
                        <TBody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <i className="fas fa-circle-notch fa-spin text-primary text-3xl mb-4"></i>
                                        <p className="text-muted">Loading records...</p>
                                    </td>
                                </tr>
                            ) : isError ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 mx-auto max-w-md">
                                            <p className="text-danger font-medium">Failed to load records.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : records.length > 0 ? (
                                <>
                                    {records.map((record: any, index: number) => (
                                        <Tr key={record._id} className="group hover:bg-background/50">
                                            <Td className="text-center text-muted">{index + 1}</Td>

                                            {/* Student Info */}
                                            <Td>
                                                <p className="font-semibold text-foreground">{record.studentName}</p>
                                                <p className="text-xs text-muted">Roll: {record.rollNumber || 'N/A'}</p>
                                            </Td>

                                            {/* Class/Section Details */}
                                            <Td>
                                                <p className="text-sm text-foreground">{record.className || 'Not Assigned'}</p>
                                                <p className="text-xs text-muted">{record.sectionName || '-'}</p>
                                            </Td>

                                            {/* Financial Flags */}
                                            <Td>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {record.isBusApplicable && <span className="px-2 py-0.5 rounded text-[10px] bg-warning/10 text-warning border border-warning/20">Bus</span>}
                                                    {record.hasConcession && <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20">Concession</span>}
                                                    {record.isFullyPaid && <span className="px-2 py-0.5 rounded text-[10px] bg-success/10 text-success border border-success/20">Fully Paid</span>}
                                                </div>
                                            </Td>

                                            {/* Status Toggle */}
                                            <Td>
                                                <button
                                                    onClick={() => handleToggleStatus(record._id, record.isActive)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${record.isActive ? 'bg-success/10 text-success border-success/20 hover:bg-danger/10 hover:text-danger' : 'bg-surface text-muted border-border hover:bg-success/10 hover:text-success'}`}
                                                    title="Click to toggle status"
                                                >
                                                    <i className={`fas fa-circle text-[8px] ${record.isActive ? 'text-success' : 'text-muted'}`}></i>
                                                    {record.isActive ? 'Active' : 'Inactive'}
                                                </button>
                                            </Td>

                                            {/* Actions */}
                                            <Td className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="outline"
                                                        size="sm"
                                                        // onClick={() => openManageModal(record)}
                                                        // onClick={() => navigate(`single/${record._id}`)}
                                                        onClick={() => {
                                                            // Check if studentId is populated as an object, or if it's just a string
                                                            const targetStudentId = typeof record.studentId === 'object' ? record.studentId._id : record.studentId;
                                                            navigate(`single/${targetStudentId}`);
                                                        }}

                                                    >
                                                        {/* Manage */}
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="hover:text-danger hover:bg-danger/10 text-danger"
                                                        onClick={() => handleDelete(record._id, record.studentName)}
                                                        title="Delete Record"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))}

                                    {/* Infinite Scroll Loader */}
                                    {isFetchingNextPage && (
                                        <tr>
                                            <td colSpan={6} className="py-6 text-center">
                                                <i className="fas fa-circle-notch fa-spin text-primary text-xl"></i>
                                                <p className="text-xs text-muted mt-2">Loading more records...</p>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mx-auto mb-4 text-muted text-2xl">
                                            <i className="fas fa-folder-open"></i>
                                        </div>
                                        <h3 className="text-lg font-medium">No Records Found</h3>
                                        <p className="text-muted text-sm max-w-md mx-auto">Try adjusting filters.</p>
                                    </td>
                                </tr>
                            )}
                        </TBody>
                    </TableContainer>
                </div>
            </div>

            {/* --- Example SideModal (Assign / Manage Class) --- */}
            <SideModal
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
                title={`Manage Record: ${selectedRecord?.studentName}`}
            >
                <div className="flex flex-col h-full space-y-8">

                    {/* Status Management Section */}
                    <div className="bg-surface border border-border p-5 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Record Status</h3>
                                <p className="text-xs text-muted mt-1">Determine if this record is currently active for operations.</p>
                            </div>

                            {/* Toggle Switch */}
                            <button
                                type="button"
                                onClick={() => selectedRecord && handleToggleStatus(selectedRecord._id, selectedRecord.isActive)}
                                disabled={toggleStatusMutation.isPending}
                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${selectedRecord?.isActive ? 'bg-success' : 'bg-muted'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-surface shadow-sm transition-transform ${selectedRecord?.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Concession Management Section */}
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 mb-4">Concession Management</h3>

                        <form onSubmit={handleApplyConcession} className="space-y-4">
                            <Input
                                id="concessionType"
                                label="Concession Type"
                                placeholder="e.g., Merit, Sibling, Staff"
                                value={concessionType}
                                onChange={(e) => setConcessionType(e.target.value)}
                                required
                            />

                            <Input
                                id="concessionValue"
                                label="Concession Value/Amount"
                                placeholder="Amount or Percentage"
                                value={concessionValue}
                                onChange={(e) => setConcessionValue(e.target.value)}
                                required
                            />

                            <div className="flex flex-col gap-1.5">
                                <Label>Upload Proof (Required for New Applications)</Label>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => setConcessionFile(e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-soft file:text-primary hover:file:bg-primary-soft/80 cursor-pointer"
                                />
                                <p className="text-[10px] text-muted mt-1">Leave empty if only updating values without new proof.</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleUpdateConcession}
                                    isLoading={updateConcessionMutation.isPending}
                                    disabled={applyConcessionMutation.isPending || !concessionType || !concessionValue}
                                >
                                    Update Details Only
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1"
                                    isLoading={applyConcessionMutation.isPending}
                                    disabled={updateConcessionMutation.isPending || !concessionType || !concessionValue}
                                >
                                    Apply with Proof
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </SideModal>
        </div>
    );
}