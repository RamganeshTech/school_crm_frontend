import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../features/store/store';


// UI Components
import { Button } from '../../../shared/ui/Button';
import { Input, Label } from '../../../shared/ui/Input';
import { SideModal } from '../../../shared/ui/SideModal';
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../../shared/ui/TableLayout';
import { SearchSelect, type SelectOption } from '../../../shared/ui/SearchSelect';
// import useDebounce from '../../hooks/useDebounce'; // Adjust path
import {
    useGetAllStudents,
    useDeleteStudent,
    useCreateStudent,
    useUpdateStudent
} from '../../../api_services/student_api/studentMainApi';
import { useGetClasses } from '../../../api_services/schoolConfig_api/classApi';
import { useGetSections } from '../../../api_services/schoolConfig_api/sectionApi'; // Adjust path as needed
import useDebounce from '../../../hooks/useDebounce';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from '../../../shared/ui/ToastContext';
import { useRoleCheck } from '../../../hooks/useRoleCheck';


export default function StudentMain() {
    // --- Global State ---
    const { schoolId } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate()
    const location = useLocation()



    // --- Search & Filter State ---
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 500); // 500ms delay

    // --- Local Filter State (Left Panel) ---
    const [filters, setFilters] = useState({
        search: '',
        classId: '',
        sectionId: '',
        page: 1,
        limit: 10,

        isActive: 'true', // Defaults to active students
        newOld: '',
        gender: '',
        bloodGroup: '',
        admissionNumber: '',
        admissionDate: '',
        rollNumber: '',
        mobileNumber: ''
    });

    // // Reset to page 1 whenever the debounced search changes
    // useEffect(() => {
    //     setFilters(prev => ({ ...prev, page: 1 }));
    // }, [debouncedSearch]);

    // --- Modal & Form State ---
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        studentName: '',
        gender: 'Male',
        dob: '',
        mobileNumber: '',
        newOld: 'new',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // --- API Hooks ---
    const { data: classesData } = useGetClasses(schoolId!);
    // 2. Fetch Sections based on selected classId
    const { data: sectionsData, isLoading: isSectionsLoading } = useGetSections({
        schoolId: schoolId!,
        classId: filters.classId
    });

    const { isTeacher, isParent, isPrincipal, isVicePrincipal, isCorrespondent } = useRoleCheck()
    const canCreate = !isTeacher && !isParent && !isPrincipal && !isVicePrincipal
    const canDelete = isCorrespondent
    const canEdit = !isTeacher && !isPrincipal && !isVicePrincipal

    // const { data, isLoading, isError, refetch } = useGetAllStudents({
    //     schoolId: schoolId!,
    //     ...filters,
    //     search: debouncedSearch, // Pass the debounced value here
    // });

    const {
        data,
        isLoading,
        isError,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useGetAllStudents({
        schoolId: schoolId!,
        ...filters,
        limit: 30,
        search: debouncedSearch,
    });

    const createStudentMutation = useCreateStudent();
    const updateStudentMutation = useUpdateStudent();
    const deleteStudentMutation = useDeleteStudent();

    // --- Data Processing ---
    // const students = Array.isArray(data) ? data : data?.data || [];
    // const students = data?.pages?.flatMap((page: any) => page?.docs || page?.data || page) || [];
    const students = data?.pages?.flat() || [];

    // Map classes for SearchSelect
    const classOptions: SelectOption[] = classesData?.map((cls: any) => ({
        label: cls.name,
        value: cls._id
    })) || [];

    // Map dynamically fetched sections based on the backend model
    const sectionOptions: SelectOption[] = sectionsData?.map((sec: any) => ({
        label: sec.name, // Will display "A", "B", etc. based on your model
        value: sec._id
    })) || [];

    const genderOptions: SelectOption[] = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
    ];

    // Handle Infinite Scroll
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // If user scrolls within 50px of the bottom, fetch next page
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }
    };

    // --- Handlers ---
    // const handleFilterTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const { id, value } = e.target;
    //     setFilters(prev => ({ ...prev, [id]: value, page: 1 }));
    // };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const handleClassFilterChange = (option: SelectOption) => {
        setFilters(prev => ({ ...prev, classId: String(option.value), page: 1 }));
    };

    const handleSectionFilterChange = (option: SelectOption) => {
        setFilters(prev => ({ ...prev, sectionId: String(option.value), page: 1 }));
    };

    const clearFilters = () => {
        // setFilters({ search: '', classId: '', sectionId: '', page: 1, limit: 10 });
        setSearchInput('');
        setFilters({
            search: '',
            classId: '',
            sectionId: '',
            page: 1,
            limit: 30,
            isActive: 'true',
            newOld: '',
            gender: '',
            bloodGroup: '',

            admissionNumber: '',
            admissionDate: '',
            rollNumber: '',
            mobileNumber: ''
        });
    };

    const openCreateForm = () => {
        setFormData({ studentName: '', gender: 'Male', dob: '', mobileNumber: '', newOld: 'new' });
        setSelectedFile(null);
        setEditingId(null);
        setIsFormOpen(true);
    };

    const openEditForm = (student: any) => {
        setFormData({
            studentName: student.studentName,
            gender: student.gender,
            dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
            mobileNumber: student.mobileNumber,
            newOld: student.newOld || 'new',
        });
        setSelectedFile(null);
        setEditingId(student._id);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Specifically target the newOld property in formData
        setFormData(prev => ({
            ...prev,
            newOld: e.target.value
        }));
    };

    const handleGenderChange = (option: SelectOption) => {
        setFormData(prev => ({ ...prev, gender: String(option.value) }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset pagination to page 1 whenever a filter is altered
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();

            if (formData.mobileNumber) {
                // Strictly 10 digits regex
                const phoneRegex = /^\d{10}$/;
                if (!phoneRegex.test(formData.mobileNumber)) {
                    toast.error("Whatsapp number must be exactly 10 digits.");
                    return;
                }
            }


            if (!formData.studentName?.trim()) {
                toast.error("Student Name is Mandatory.");
                return;
            }

            const payload = new FormData();
            payload.append('schoolId', schoolId!);
            payload.append('studentName', formData.studentName);
            payload.append('gender', formData.gender);
            payload.append('dob', formData.dob);
            payload.append('mobileNumber', formData.mobileNumber);
            payload.append('newOld', formData.newOld);
            if (selectedFile) {
                payload.append('file', selectedFile);
            }

            if (editingId) {
                await updateStudentMutation.mutateAsync({ id: editingId, formData: payload });
                toast.success("Updated Successfully!");

            } else {




                await createStudentMutation.mutateAsync(payload);
                toast.success("Created Successfully!");

            }
            refetch();
            closeForm();
        } catch (error: any) {
            toast.error(error.message || "Operation Failed");

        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete student "${name}"?`)) {
            try {
                await deleteStudentMutation.mutateAsync(id);

                refetch();
                toast.success("Deleted Successfully!");

            } catch (error: any) {
                toast.error(error.message || "Failed to delete student");

            }
        }
    };

    // --- Render Guards ---
    // if (isLoading) {
    //     return (
    //         <div className="w-full h-full flex flex-col items-center justify-center bg-background rounded-xl">
    //             <i className="fas fa-circle-notch fa-spin text-primary text-3xl mb-4"></i>
    //             <p className="text-muted text-sm font-medium">Loading student directory...</p>
    //         </div>
    //     );
    // }

    // if (isError) {
    //     return (
    //         <div className="w-full p-6 text-center bg-danger/10 border border-danger/20 rounded-xl">
    //             <p className="text-danger font-medium">Failed to load students. Please try again later.</p>
    //         </div>
    //     );
    // }



    const isChild = location.pathname.includes("profile")
    if (isChild) {
        return <Outlet />
    }


    return (
        <div className="w-full h-full flex flex-col p-2 space-y-4 overflow-hidden">

            {/* --- Header Section --- */}
            {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
            
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-user-graduate text-primary"></i>
                        Student Directory
                    </h1>
                    <p className="text-sm text-muted mt-1">Manage and filter all registered students across the school.</p>
                </div>
                <Button onClick={openCreateForm} leftIcon="fas fa-plus" variant="primary">
                    Register Student
                </Button>
            </div> */}


            {/* --- Header Section --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 px-2">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-user-graduate text-primary"></i>
                        Student Directory
                    </h1>
                    <p className="text-xs lg:text-sm text-muted mt-1">Manage and filter all registered students across the school.</p>
                </div>

                {/* Mobile Filter Toggle */}
                <div className='flex gap-2 justify-between items-center'>

                    <div className="w-full sm:w-auto lg:hidden">
                        <Button variant="outline" className="w-full justify-center" leftIcon="fas fa-filter" onClick={() => setIsMobileFilterOpen(true)}>
                            Filters
                        </Button>
                    </div>

                    {canCreate && <div className="block">
                        <Button onClick={openCreateForm} leftIcon="fas fa-plus" variant="primary">
                            <span className='hidden md:block'>Create Student</span>
                            <span className='block md:hidden'> Create</span>
                        </Button>
                    </div>}
                </div>
            </div>

            {/* --- Main Content Layout (Responsive 30% Filters / 70% Table) --- */}
            {/* <div className="flex flex-col lg:flex-row gap-4 h-[calc(100%-80px)]"> */}
            <div className="flex-1 flex flex-col lg:flex-row gap-2 h-[calc(100%-80px)] relative">


                {/* LEFT PANEL: Filters (Full width on mobile, 30% on Desktop) */}
                {/* <div className="w-full lg:w-[20%] bg-surface border border-border rounded-xl p-5 flex flex-col gap-5 overflow-y-auto shrink-0 shadow-sm">
                    <h3 className="font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                        <i className="fas fa-filter text-muted"></i>
                        Filters
                    </h3>

                    <div className="space-y-4">
                        <Input
                            id="search"
                            label="Search Name / Roll No"
                            placeholder="Search students..."
                            leftIcon="fas fa-search"
                            value={searchInput}
                            onChange={handleSearchChange}
                        />

                        <SearchSelect
                            label="Class"
                            options={classOptions}
                            value={filters.classId}
                            onChange={handleClassFilterChange}
                            placeholder="Select Class..."
                        />


                        <div className="relative">
                            <SearchSelect
                                label="Section"
                                options={sectionOptions}
                                value={filters.sectionId}
                                onChange={handleSectionFilterChange}
                                placeholder={isSectionsLoading ? "Loading sections..." : "Select Section..."}
                            />
                            {isSectionsLoading && <i className="fas fa-spinner fa-spin absolute right-3 top-[38px] text-muted text-sm"></i>}
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-border">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div> */}


                {/* MOBILE OVERLAY */}
                {isMobileFilterOpen && (
                    <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsMobileFilterOpen(false)} />
                )}


                {/* LEFT PANEL: Filters (Drawer on Mobile, Static on Desktop) */}
                {/* <div className={`
            fixed inset-y-0 left-0 z-50 w-[280px] bg-surface border border-border rounded-xl p-5 flex flex-col gap-5 shadow-2xl transition-transform duration-300 ease-in-out
            lg:static lg:w-[25%] lg:min-w-[250px] lg:shrink-0 lg:rounded-xl lg:shadow-sm lg:translate-x-0 lg:border
            ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}
            overflow-y-auto custom-scrollbar
        `}>
                    <div className="flex items-center justify-between lg:block border-b border-border pb-2">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <i className="fas fa-filter text-muted"></i> Advanced Filters
                        </h3>
                        <button className="lg:hidden text-muted" onClick={() => setIsMobileFilterOpen(false)}><i className="fas fa-xmark"></i></button>
                    </div>

                    <div className="space-y-4">
                        <Input id="search" label="Search Records" placeholder="Name or Roll No..." leftIcon="fas fa-search" value={searchInput} onChange={handleSearchChange} />

                        <div className="grid grid-cols-2 gap-3">
                            <SearchSelect
                                label="Class"
                                options={classOptions}
                                value={filters.classId}
                                onChange={handleClassFilterChange}
                                placeholder="Select Class..."
                            />
                            <div className="relative">
                                <SearchSelect
                                    label="Section"
                                    options={sectionOptions}
                                    value={filters.sectionId}
                                    onChange={handleSectionFilterChange}
                                    placeholder={isSectionsLoading ? "Loading sections..." : "Select Section..."}
                                />
                                {isSectionsLoading && <i className="fas fa-spinner fa-spin absolute right-3 top-[38px] text-muted text-sm"></i>}

                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-border">
                        <Button variant="outline" className="w-full" onClick={clearFilters}>Clear Filters</Button>
                        <Button variant="primary" className="w-full lg:hidden mt-2" onClick={() => setIsMobileFilterOpen(false)}>Apply</Button>
                    </div>
                </div> */}


                <div className={`
    fixed inset-y-0 left-0 z-50 w-[280px] bg-surface border border-border rounded-xl p-5 flex flex-col gap-5 shadow-2xl transition-transform duration-300 ease-in-out
    lg:static lg:w-[25%] lg:min-w-[250px] lg:shrink-0 lg:rounded-xl lg:shadow-sm lg:translate-x-0 lg:border
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
                        {/* Core Search & Core Academic Structure */}
                        <Input id="search" label="Search Records" placeholder="Name or SR ID..." leftIcon="fas fa-search" value={searchInput} onChange={handleSearchChange} />

                        <div className="grid grid-cols-2 gap-3">
                            <SearchSelect label="Class" options={classOptions} value={filters.classId} onChange={handleClassFilterChange} placeholder="Select Class..." />
                            <div className="relative">
                                <SearchSelect label="Section" options={sectionOptions} value={filters.sectionId} onChange={handleSectionFilterChange} placeholder={isSectionsLoading ? "Loading..." : "Select Section..."} />
                                {isSectionsLoading && <i className="fas fa-spinner fa-spin absolute right-3 top-[38px] text-muted text-sm"></i>}
                            </div>
                        </div>

                        <hr className="border-border border-opacity-50" />

                        {/* 🌟 NEW FILTERS SECTION --- */}
                        <div className="grid grid-cols-2 gap-3">
                            <Input id="rollNumber" label="Roll No" placeholder="e.g. 12" value={filters.rollNumber} onChange={(e) => handleFilterChange('rollNumber', e.target.value)} />
                            <Input id="admissionNumber" label="Admission No" placeholder="e.g. 4520" value={filters.admissionNumber} onChange={(e) => handleFilterChange('admissionNumber', e.target.value)} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Input id="mobileNumber" label="Mobile Number" placeholder="Search phone..." value={filters.mobileNumber} onChange={(e) => handleFilterChange('mobileNumber', e.target.value)} />
                            <Input id="admissionDate" type="date" label="Admission Date" value={filters.admissionDate} onChange={(e) => handleFilterChange('admissionDate', e.target.value)} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <SearchSelect
                                label="Status"
                                options={[{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }]}
                                value={filters.isActive}
                                onChange={(opt) => handleFilterChange('isActive', String(opt.value))}
                                placeholder="Status"
                            />
                            <SearchSelect
                                label="Type"
                                options={[{ label: 'New', value: 'new' }, { label: 'Old', value: 'old' }]}
                                value={filters.newOld}
                                onChange={(opt) => handleFilterChange('newOld', String(opt.value))}
                                placeholder="New/Old"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <SearchSelect
                                label="Gender"
                                options={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }, { label: 'Other', value: 'Other' }]}
                                value={filters.gender}
                                onChange={(opt) => handleFilterChange('gender', String(opt.value))}
                                placeholder="Gender"
                            />
                            <SearchSelect
                                label="Blood Group"
                                options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => ({ label: bg, value: bg }))}
                                value={filters.bloodGroup}
                                onChange={(opt) => handleFilterChange('bloodGroup', String(opt.value))}
                                placeholder="Blood"
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
                                <Th>Student Profile</Th>
                                <Th>Father's Name</Th>
                                <Th>DOB</Th>
                                <Th>Class/Section</Th>
                                <Th>Status</Th>
                                <Th className="text-center">Actions</Th>
                            </tr>
                        </THead>
                        <TBody>
                            {/* --- INLINE LOADING STATE --- */}
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <i className="fas fa-circle-notch fa-spin text-primary text-3xl mb-4"></i>
                                            <p className="text-muted text-sm font-medium">Loading student directory...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : isError ? (
                                /* --- INLINE ERROR STATE --- */
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 mx-auto max-w-md">
                                            <p className="text-danger font-medium">Failed to load students. Please try again later.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : students.length > 0 ? (
                                <>
                                    {/* 1. Map through all the students first */}
                                    {students.map((student: any, index: number) => {
                                        // const sectionName = sectionOptions.find(sec => sec.value === student.currentSectionId)?.label || 'Not Assigned';

                                        return (
                                            <Tr key={student._id} className="group hover:bg-background/50 transition-colors">
                                                <Td className="text-center font-medium text-muted">
                                                    {index + 1}
                                                </Td>

                                                {/* 1. SR-ID & Student Name & Image */}
                                                <Td className="whitespace-normal">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20 overflow-hidden">
                                                            {student.studentImage?.url ? (
                                                                <img src={student.studentImage.url} alt="profile" className="w-full h-full object-cover" />
                                                            ) : (
                                                                student.studentName?.charAt(0).toUpperCase() || 'S'
                                                            )}
                                                        </div>
                                                        <div className="max-w-[100px] min-w-0">
                                                            {/* 🌟 2. Added break-words and truncate logic */}
                                                            <p className="font-semibold text-foreground break-words leading-tight">
                                                                {student.studentName}
                                                            </p>
                                                            <p className="text-xs text-muted truncate">
                                                                {student.srId || 'No SR-ID'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Td>

                                                {/* 2. Father's Name */}
                                                <Td>
                                                    <p className="text-sm text-foreground">
                                                        {student.mandatory?.fatherName || 'N/A'}
                                                    </p>
                                                </Td>

                                                {/* 3. DOB */}
                                                <Td>
                                                    <p className="text-sm text-foreground">
                                                        {student.mandatory?.dob ? new Date(student.mandatory.dob).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </Td>

                                                {/* 4. Current Section */}
                                                <Td>
                                                    {/* <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-surface text-muted border border-border">
                                                        {student?.currentClassId?.name} / {student?.currentSectionId?.name}
                                                    </span> */}

                                                    {(student?.currentClassId?.name || student?.currentSectionId?.name) ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-surface text-muted border border-border">
                                                            {/* Logic: Join with ' / ' only if both exist, otherwise just show what's available */}
                                                            {[student?.currentClassId?.name, student?.currentSectionId?.name]
                                                                .filter(Boolean) // This removes any null/undefined/empty values
                                                                .join(' / ')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted italic">Not Assigned</span>
                                                    )}
                                                </Td>

                                                {/* 5. Status (Active/Inactive) */}
                                                <Td>
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${student.isActive ? 'bg-success/10 text-success border-success/20' : 'bg-surface text-muted border-border'}`}>
                                                        <i className={`fas fa-circle text-[8px] ${student.isActive ? 'text-success' : 'text-muted'}`}></i>
                                                        {student.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </Td>

                                                {/* Actions */}
                                                <Td className="text-right">
                                                    <div className="flex items-center justify-end gap-2">

                                                        <Button variant="ghost" size="icon" onClick={() => navigate(`profile/${student._id}`)} title="View Student">
                                                            <i className="fas fa-eye"></i>
                                                        </Button>
                                                        {canEdit && <Button variant="ghost" size="icon" onClick={() => openEditForm(student)} title="Edit Student">
                                                            <i className="fas fa-edit"></i>
                                                        </Button>}
                                                        {canDelete && <Button
                                                            variant="danger"
                                                            size={deleteStudentMutation.isPending ? "sm" : "icon"}
                                                            className="hover:text-danger hover:bg-danger/10 text-danger"
                                                            onClick={() => handleDelete(student._id, student.studentName)}
                                                            isLoading={deleteStudentMutation.isPending && deleteStudentMutation.variables === student._id}
                                                            title="Delete Student"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </Button>}
                                                    </div>
                                                </Td>
                                            </Tr>
                                        );
                                    })}

                                    {/* 2. The Loading Indicator goes OUTSIDE the .map() loop, at the very bottom! */}
                                    {isFetchingNextPage && (
                                        <tr>
                                            <td colSpan={7} className="py-6 text-center">
                                                <i className="fas fa-circle-notch fa-spin text-primary text-xl"></i>
                                                <p className="text-xs text-muted mt-2">Loading more students...</p>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ) : (
                                /* --- EMPTY STATE --- */
                                /* --- EMPTY STATE --- */
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4 text-muted text-2xl shadow-sm">
                                                <i className="fas fa-users-slash"></i>
                                            </div>
                                            <h3 className="text-lg font-medium text-foreground mb-2">No Students Found</h3>
                                            <p className="text-muted text-sm max-w-md">
                                                Adjust your filters or register a new student to see data here.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}

                        </TBody>
                    </TableContainer>


                </div>
            </div>

            {/* --- SideModal for Create/Edit Form --- */}
            <SideModal
                isOpen={isFormOpen}
                onClose={closeForm}
                title={editingId ? 'Edit Student Profile' : 'Register New Student'}
            >
                <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <Label>Profile Picture</Label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-soft file:text-primary hover:file:bg-primary-soft/80 cursor-pointer"
                            />
                        </div>

                        <Input
                            id="studentName"
                            autoFocus={true}
                            label="Full Name"
                            placeholder="Enter student's name"
                            value={formData.studentName}
                            onChange={handleFormChange}
                            required
                        />

                        {!editingId && <div className="grid grid-cols-2 gap-4">
                            <SearchSelect
                                label="Gender"
                                options={genderOptions}
                                value={formData.gender}
                                onChange={handleGenderChange}
                                placeholder="Select Gender"
                            />

                            <Input
                                id="dob"
                                type="date"
                                label="Date of Birth"
                                value={formData.dob}
                                onChange={handleFormChange}

                            />
                        </div>}

                        {!editingId && <Input
                            id="mobileNumber"
                            type="tel"
                            maxLength={10}
                            minLength={10}
                            label="Mobile Number"
                            placeholder="+91 9876543210"
                            value={formData.mobileNumber}
                            onChange={handleFormChange}

                        />}

                        <div className="flex flex-col gap-1.5 pt-2">
                            <Label>Admission Type</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                                    <input
                                        type="radio"
                                        name="newOld"
                                        value="new"
                                        checked={formData.newOld === 'new'}
                                        onChange={handleRadioChange}
                                        className="accent-primary"
                                    />
                                    New Admission
                                </label>
                                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                                    <input
                                        type="radio"
                                        name="newOld"
                                        value="old"
                                        checked={formData.newOld === 'old'}
                                        onChange={handleRadioChange}
                                        className="accent-primary"
                                    />
                                    Old/Continuing
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-border">
                        <Button type="button" variant="outline" onClick={closeForm}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={createStudentMutation.isPending || updateStudentMutation.isPending}
                        >
                            {editingId ? 'Update Student' : 'Register Student'}
                        </Button>
                    </div>
                </form>
            </SideModal>
        </div>
    );
}