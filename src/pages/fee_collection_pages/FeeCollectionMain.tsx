import React, { useState, } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// UI Components
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../shared/ui/TableLayout';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { SearchSelect } from '../../shared/ui/SearchSelect';

// Hooks & APIs (Adjust imports to match your project)
import { useAuthData } from '../../hooks/useAuthData';
import useDebounce  from '../../hooks/useDebounce';
import { useGetClasses } from '../../api_services/schoolConfig_api/classApi';
import { useGetSections } from '../../api_services/schoolConfig_api/sectionApi';
import { getAcademicYears } from '../../utils/utils';
import { useGetAllStudentRecordsV1 } from '../../api_services/student_api/studentRecordApi';

interface SelectOption {
    label: string;
    value: string | number;
}

export default function FeeCollectionMain() {
    const navigate = useNavigate();
    const { schoolId } = useAuthData();
    
    // 🌟 Get school data from Redux to set the default Academic Year
    const schoolData = useSelector((state: any) => state.auth?.schoolData);
    const location = useLocation()


    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // --- State: Filters ---
    const [filters, setFilters] = useState({
        academicYear: schoolData?.currentAcademicYear || '2026-2027',
        classId: '',
        sectionId: '',
    });

    const [searchInput, setSearchInput] = useState('');
    const [phoneInput, setPhoneInput] = useState('');

    // Debounce text inputs to prevent API spam
    const debouncedSearch = useDebounce(searchInput, 500);
    const debouncedPhone = useDebounce(phoneInput, 500);

    // --- API Hooks ---
    const { data: classesData } = useGetClasses(schoolId!);
    const { data: sectionsData, isLoading: isSectionsLoading } = useGetSections({
        schoolId: schoolId!,
        classId: filters.classId
    });

    // Fetch Student Records (Cashier View)
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useGetAllStudentRecordsV1({
        schoolId: schoolId!,
        academicYear: filters.academicYear,
        classId: filters.classId,
        sectionId: filters.sectionId,
        search: debouncedSearch,
        phone: debouncedPhone, // Make sure your backend accepts this query parameter
        // isActive: 'true',      // Cashier should only see active students by default
        limit: 40,
    });

    // --- Handlers ---
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            academicYear: schoolData?.currentAcademicYear || '2026-2027',
            classId: '',
            sectionId: '',
        });
        setSearchInput('');
        setPhoneInput('');
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }
    };

    // --- Options Mapping ---
    const academicYearOptions = getAcademicYears();
    const classOptions: SelectOption[] = classesData?.map((cls: any) => ({ label: cls.name, value: cls._id })) || [];
    const sectionOptions: SelectOption[] = sectionsData?.map((sec: any) => ({ label: sec.name, value: sec._id })) || [];

    const records = data?.pages?.flatMap((page: any) => page.data || []) || [];

     const isChild = location.pathname.includes("single")
    if (isChild) {
        return <Outlet />
    }

    return (
        <div className="w-full h-full flex flex-col p-2 space-y-4 overflow-hidden animate-in fade-in duration-300">

            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 px-2">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-cash-register text-primary"></i>
                        Fee Collection
                    </h1>
                    <p className="text-xs lg:text-sm text-muted mt-1">Search students and process fee payments.</p>
                </div>

                {/* Mobile Filter Toggle Button */}
                <div className="w-full sm:w-auto lg:hidden">
                    <Button
                        variant="outline"
                        className="w-full justify-center"
                        leftIcon="fas fa-filter"
                        onClick={() => setIsMobileFilterOpen(true)}
                    >
                        Search & Filters
                    </Button>
                </div>
            </div>

            {/* --- MAIN LAYOUT --- */}
            <div className="flex flex-col lg:flex-row gap-2 h-[calc(100%-80px)] relative">

                {/* MOBILE OVERLAY */}
                {isMobileFilterOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-[30] lg:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />
                )}

                {/* LEFT PANEL: Filters */}
                <div className={`
                    fixed inset-y-0 left-0 z-[30] w-[280px] bg-surface border border-border rounded-xl p-5 flex flex-col gap-5 shadow-2xl transition-transform duration-300 ease-in-out
                    lg:static lg:w-[25%] lg:shrink-0 lg:shadow-sm lg:translate-x-0 lg:border
                    ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}
                    overflow-y-auto custom-scrollbar
                `}>
                    <div className="flex items-center justify-between lg:block border-b border-border pb-2">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <i className="fas fa-search text-muted"></i> Search Student
                        </h3>
                        <button
                            className="lg:hidden text-muted hover:text-danger p-1"
                            onClick={() => setIsMobileFilterOpen(false)}
                        >
                            <i className="fas fa-xmark text-xl"></i>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <SearchSelect 
                            label="Academic Year" 
                            options={academicYearOptions} 
                            value={filters.academicYear} 
                            onChange={(opt: any) => handleFilterChange('academicYear', String(opt?.value || ''))} 
                            placeholder="Select Year..." 
                        />
                        
                        <Input 
                            id="searchName" 
                            label="Student Name or Roll" 
                            placeholder="e.g., John Doe" 
                            leftIcon="fas fa-user" 
                            value={searchInput} 
                            onChange={(e) => setSearchInput(e.target.value)} 
                        />

                        {/* 🌟 NEW: Phone Number Filter */}
                        <Input 
                            id="searchPhone" 
                            label="Parent Phone Number" 
                            placeholder="e.g., 9876543210" 
                            leftIcon="fas fa-phone" 
                            value={phoneInput} 
                            onChange={(e) => setPhoneInput(e.target.value)} 
                        />

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <SearchSelect 
                                label="Class" 
                                options={classOptions} 
                                value={filters.classId} 
                                onChange={(opt: any) => { 
                                    handleFilterChange('classId', String(opt?.value || '')); 
                                    handleFilterChange('sectionId', ''); 
                                }} 
                                placeholder="Class..." 
                            />
                            <div className="relative">
                                <SearchSelect 
                                    label="Section" 
                                    options={sectionOptions} 
                                    value={filters.sectionId} 
                                    onChange={(opt: any) => handleFilterChange('sectionId', String(opt?.value || ''))} 
                                    placeholder="Section..." 
                                />
                                {isSectionsLoading && <i className="fas fa-spinner fa-spin absolute right-3 top-[38px] text-muted text-xs"></i>}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-border">
                        <Button variant="outline" className="w-full" onClick={clearFilters}>Clear Search</Button>
                        <Button variant="primary" className="w-full lg:hidden mt-2" onClick={() => setIsMobileFilterOpen(false)}>Apply & Close</Button>
                    </div>
                </div>

                {/* RIGHT PANEL: Infinite Table */}
                <div className="flex-1 bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <TableContainer className="h-full overflow-y-auto custom-scrollbar" onScroll={handleScroll}>
                        {/* <table className="w-full text-left text-sm whitespace-nowrap border-collapse"> */}
                            <THead className="sticky top-0 z-10 bg-background shadow-sm border-b border-border">
                                <tr>
                                    <Th className="w-12 text-center">No.</Th>
                                    <Th>Student Name</Th>
                                    <Th>Parent Details</Th>
                                    <Th>Class/Sec</Th>
                                    <Th>Fee Status</Th>
                                    <Th className="text-right">Action</Th>
                                </tr>
                            </THead>
                            <TBody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="py-20">
                                            <div className="flex flex-col items-center justify-center w-full">
                                                <i className="fas fa-circle-notch fa-spin text-primary text-2xl mb-3"></i>
                                                <p className="text-sm text-muted font-medium">Searching students...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : isError ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 bg-danger/5">
                                            <div className="flex flex-col items-center justify-center w-full text-danger">
                                                <i className="fas fa-exclamation-circle text-2xl mb-3 opacity-80"></i>
                                                <p className="font-medium">Failed to load records. Please try again.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-24">
                                            <div className="flex flex-col items-center justify-center text-center text-muted w-full mx-auto">
                                                <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4 shadow-sm">
                                                    <i className="fas fa-search text-2xl text-muted/50"></i>
                                                </div>
                                                <p className="font-medium text-foreground">No students found</p>
                                                <p className="text-xs mt-1">Try adjusting the name or phone number filter.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {records.map((record: any, index: number) => (
                                            <Tr key={record._id} className="hover:bg-background/80 transition-colors group">
                                                <Td className="text-center text-muted text-xs">{index + 1}</Td>

                                                {/* Student Info */}
                                                <Td>
                                                    <p className="font-semibold text-foreground">{record.studentName}</p>
                                                    <p className="text-[10px] text-muted font-medium">Roll: {record.rollNumber || 'N/A'}</p>
                                                </Td>

                                                {/* Parent Details (Assuming populated from studentId) */}
                                                <Td>
                                                    <p className="text-sm text-foreground">{record.studentId?.fatherName || record.studentId?.motherName || 'N/A'}</p>
                                                    <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                                                        <i className="fas fa-phone-alt text-[10px]"></i> 
                                                        {record.studentId?.mobileNumber || record.studentId?.fatherPhone || 'No Phone'}
                                                    </p>
                                                </Td>

                                                {/* Class/Section Details */}
                                                <Td>
                                                    <p className="text-sm font-medium text-foreground">{record.className || '-'}</p>
                                                    <p className="text-xs text-muted">{record.sectionName || '-'}</p>
                                                </Td>

                                                {/* Fee Status (Simple Badge) */}
                                                <Td>
                                                    {record.isFullyPaid ? (
                                                        <span className="px-2 py-1 bg-success/10 text-success border border-success/20 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                                            Fully Paid
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-warning/10 text-warning-800 border border-warning/30 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                                            Dues Pending
                                                        </span>
                                                    )}
                                                </Td>

                                                {/* Action - Collection Routing */}
                                                <Td className="text-right">
                                                    <Button 
                                                        variant="primary"
                                                        size="sm"
                                                        // Route to the payment collection screen
                                                        onClick={() => navigate(`single/${record?._id}`)}
                                                    >
                                                        Collect Fee <i className="fas fa-arrow-right ml-1.5 text-xs"></i>
                                                    </Button>
                                                </Td>
                                            </Tr>
                                        ))}

                                        {/* Infinite Scroll Loader */}
                                        {isFetchingNextPage && (
                                            <tr>
                                                <td colSpan={6} className="py-6 text-center">
                                                    <i className="fas fa-circle-notch fa-spin text-primary text-xl"></i>
                                                    <p className="text-xs text-muted mt-2">Loading more students...</p>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )}
                            </TBody>
                        {/* </table> */}
                    </TableContainer>
                </div>
            </div>
        </div>
    );
}