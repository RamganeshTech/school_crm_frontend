import React, { useState, useRef } from 'react';
import { Button } from '../../shared/ui/Button';
import { Input, Label } from '../../shared/ui/Input';
import { SideModal } from '../../shared/ui/SideModal';
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../shared/ui/TableLayout';
import { Card, CardContent } from '../../shared/ui/Card'; // Assuming you saved Card here
import {
    useGetAllSchools,
    useCreateSchool,
    useDeleteSchool
} from '../../api_services/schoolConfig_api/schoolapi';
import { toast } from '../../shared/ui/ToastContext';
// import { getAcademicYears } from '../../../utils/utils';


import { useAssignRole, useCreateUser, useDeleteUser, useGetAllUsers } from '../../api_services/auth_api/authApi'; // Adjust path
import { Dropdown } from '../../shared/ui/Dropdown'; // Adjust path
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { AUTH_CHECK_ROLES, type ValidUserRole } from '../../constants/constants';
import { useAuthData } from '../../hooks/useAuthData';
import SubscriptionModule from '../subscripiton/SubscriptionModule';
import { getAcademicYears } from '../../utils/utils';

const INITIAL_USER_FORM_STATE = {
    userName: '',
    email: '',
    phoneNo: '',
    password: '',
    role: '' as ValidUserRole
};


type ViewMode = 'list' | 'grid';

export default function SchoolListMain() {
    // --- API Hooks ---
    const { isPlatformAdmin } = useAuthData();
    const { data: schools, isLoading, isError, refetch } = useGetAllSchools();
    const createSchoolMutation = useCreateSchool();
    const deleteSchoolMutation = useDeleteSchool();

    // --- Local State ---
    const academicYearOptions = getAcademicYears();

    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNo: '',
        address: '',
        currentAcademicYear: '2024-2025',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    // --- New States for User Creation ---
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [targetSchoolId, setTargetSchoolId] = useState<string | null>(null);
    const [userFormData, setUserFormData] = useState(INITIAL_USER_FORM_STATE);
    const [showPassword, setShowPassword] = useState(false);

    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    // 2. Add these to your state declarations inside SchoolListMain
    const [isStaffListModalOpen, setIsStaffListModalOpen] = useState(false);
    const [selectedUserForRole, setSelectedUserForRole] = useState<any>(null); // For the role assignment modal

    // --- Derived Data ---
    const filteredSchools = schools?.filter(school =>
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    // --- Handlers ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };


    const { mutateAsync: createUser, isPending: isCreatingUser } = useCreateUser();

    const createRoleOptions = AUTH_CHECK_ROLES.map(role => ({
        label: role ? role.charAt(0).toUpperCase() + role.slice(1) : "N/A",
        value: role
    }));



    // 3. Add the hooks
    // We pass targetSchoolId to fetch ONLY users for the school we clicked on
    const { data: schoolStaffs, isLoading: isStaffLoading, refetch: refetchStaffs } = useGetAllUsers({
        role: 'all',
        schoolId: targetSchoolId!
    });
    const { mutateAsync: assignRole, isPending: isUpdatingRole } = useAssignRole();
    const { mutateAsync: deleteUser, isPending: isDeleting } = useDeleteUser();


    // --- Dropdown Menu Generator ---
    const getDropdownItems = (school: any) => [
        {
            label: 'Add Staff',
            icon: 'fas fa-user-plus',
            onClick: () => {
                setTargetSchoolId(school._id);
                setUserFormData(INITIAL_USER_FORM_STATE);
                setIsUserModalOpen(true);
            }
        },
        {
            label: 'View Staffs',
            icon: 'fas fa-users',
            onClick: () => {
                setTargetSchoolId(school._id);
                setIsStaffListModalOpen(true);
            }
        },
        {
            label: 'Manage Subscription',
            icon: 'fas fa-crown text-amber-500', // Adding a little color to the icon
            onClick: () => {
                setTargetSchoolId(school._id);
                setIsSubscriptionModalOpen(true);
            }
        },
        {
            label: 'Delete School',
            icon: 'fas fa-trash-alt',
            isDanger: true,
            onClick: () => handleDelete(school._id, school.name)
        }
    ];

    // --- User Creation Submit Handler ---
    const handleCreateUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!userFormData.userName || !userFormData.password || !userFormData.role) {
                toast.error("Name, Password, and Role are required.");
                return;
            }

            if (userFormData.phoneNo) {
                const phoneRegex = /^\d{10}$/;
                if (!phoneRegex.test(userFormData.phoneNo)) {
                    toast.error("Phone number must be exactly 10 digits.");
                    return;
                }
            }

            await createUser({
                ...userFormData,
                schoolId: targetSchoolId! // Pass the specific school ID here
            });

            setIsUserModalOpen(false);
            setUserFormData(INITIAL_USER_FORM_STATE);
            toast.success("Staff created successfully for this school!");
        } catch (error: any) {
            toast.error(error.message || "Failed to create staff");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm("Are you sure you want to delete this staff member? This action cannot be undone.")) {
            try {
                await deleteUser(userId);
                toast.success("Staff deleted successfully");
                refetchStaffs(); // Refresh the list inside the modal
            } catch (error: any) {
                toast.error(error.message || "Failed to delete staff");
            }
        }
    };

    const handleRoleChange = async () => {
        if (!selectedUserForRole) return;
        try {
            await assignRole({
                userId: selectedUserForRole._id,
                newRole: selectedUserForRole.role
            });
            toast.success("Role updated successfully");
            setSelectedUserForRole(null); // Close the role modal
            refetchStaffs(); // Refresh the list
        } catch (error: any) {
            toast.error(error.message || "Failed to update role");
        }
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setFormData({ name: '', email: '', phoneNo: '', address: '', currentAcademicYear: '2024-2025' });
        setLogoFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('email', formData.email);
            submitData.append('phoneNo', formData.phoneNo);
            submitData.append('address', formData.address);
            submitData.append('currentAcademicYear', formData.currentAcademicYear);
            if (logoFile) {
                submitData.append('file', logoFile);
            }

            await createSchoolMutation.mutateAsync(submitData);
            refetch();
            closeForm();
            toast.success("Created Successfully!");

        } catch (error: any) {
            console.error("Failed to create school", error);
            // toast.error("Created Successfully!");
            toast.error(error.message || "Failed to Update");


        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            try {
                await deleteSchoolMutation.mutateAsync(id);

                refetch();
                toast.success("Deleted Successfully!");
            } catch (error: any) {
                console.error("Failed to delete school", error);
                toast.error(error.message || "Failed to delete school");

            }
        }
    };

    // --- Render Guards ---
    if (isLoading) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center">
                <i className="fas fa-circle-notch fa-spin text-primary text-3xl mb-4"></i>
                <p className="text-muted text-sm font-medium">Loading schools...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="w-full p-6 text-center bg-danger/10 border border-danger/20 rounded-xl">
                <p className="text-danger font-medium">Failed to load schools. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full h-full overflow-y-auto mx-auto p-4 space-y-6">

            {/* --- Header Section --- */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-building text-primary"></i>
                        School Management
                    </h1>
                    <p className="text-sm text-muted mt-1">View and manage all registered institutions on the platform.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                    <Input
                        id="searchSchools"
                        placeholder="Search schools..."
                        leftIcon="fas fa-search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        wrapperClassName="w-full sm:w-64 shrink-0"
                    />

                    {/* View Toggle */}
                    <div className="flex items-center bg-surface border border-divider rounded-lg p-1 shrink-0">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary-soft text-primary shadow-sm' : 'text-content-muted hover:text-content'}`}
                            title="List View"
                        >
                            <i className="fas fa-list w-5 text-center"></i>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary-soft text-primary shadow-sm' : 'text-content-muted hover:text-content'}`}
                            title="Grid View"
                        >
                            <i className="fas fa-th-large w-5 text-center"></i>
                        </button>
                    </div>

                    <Button onClick={() => setIsFormOpen(true)} leftIcon="fas fa-plus" variant="primary" className="w-full sm:w-auto whitespace-nowrap shrink-0">
                        Add School
                    </Button>
                </div>
            </div>

            {/* --- Data View Section --- */}
            {schools && schools.length > 0 ? (
                filteredSchools.length > 0 ? (
                    viewMode === 'list' ? (
                        // --- LIST VIEW ---
                        <TableContainer className="max-h-[calc(100vh-220px)] overflow-y-auto">
                            <THead className="sticky top-0 z-10 bg-background after:absolute after:bottom-0 after:left-0 after:right-0">
                                <tr>
                                    <Th className="w-16 text-center">S.No</Th>
                                    <Th>Institution</Th>
                                    <Th>Contact</Th>
                                    <Th>Current Academic Year</Th>
                                    <Th className="text-center">Actions</Th>
                                </tr>
                            </THead>
                            <TBody>
                                {filteredSchools.map((school, index) => (
                                    <Tr key={school._id} className="group !overflow-visible">
                                        <Td className="text-center font-medium text-muted">{index + 1}</Td>
                                        <Td>
                                            <div className="flex items-center gap-3">
                                                {school.logo ? (
                                                    <img src={(school.logo as any).url || school.logo} alt="logo" className="w-10 h-10 rounded-lg object-cover border border-divider" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center font-bold">
                                                        {school.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-foreground">{school.name}</p>
                                                    <p className="text-xs text-muted truncate max-w-[200px]">{school.address}</p>
                                                </div>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div className="text-sm text-foreground">{school.phoneNo}</div>
                                            <div className="text-xs text-muted">{school.email}</div>
                                        </Td>
                                        <Td>
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-surface border border-divider text-foreground">
                                                {school.currentAcademicYear}
                                            </span>
                                        </Td>
                                        {/* <Td className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="hover:text-danger hover:bg-danger/10 text-danger"
                                                onClick={() => handleDelete(school._id, school.name)}
                                                isLoading={deleteSchoolMutation.isPending}
                                                title="Delete School"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </Button>
                                        </Td> */}

                                        <Td className="text-center">
                                            <Dropdown
                                                align="right"
                                                trigger={
                                                    <Button variant="ghost" size="icon" className="hover:bg-background border border-transparent">
                                                        <i className="fas fa-ellipsis-v text-muted"></i>
                                                    </Button>
                                                }
                                                items={getDropdownItems(school)}
                                            />
                                        </Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </TableContainer>
                    ) : (
                        // --- GRID VIEW ---
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredSchools.map(school => (
                                <Card key={school._id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            {school.logo ? (
                                                <img src={(school.logo as any).url || school.logo} alt="logo" className="w-14 h-14 rounded-xl object-cover border border-divider shadow-sm" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-xl bg-primary-soft text-primary flex items-center justify-center text-xl font-bold shadow-sm">
                                                    {school.name.charAt(0)}
                                                </div>
                                            )}
                                            {/* <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-danger hover:bg-danger/10 -mt-2 -mr-2"
                                                onClick={() => handleDelete(school._id, school.name)}
                                                isLoading={deleteSchoolMutation.isPending}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </Button> */}

                                            <Dropdown
                                                align="right"
                                                trigger={
                                                    <Button variant="ghost" size="icon" className="-mt-2 -mr-2 hover:bg-background border border-transparent">
                                                        <i className="fas fa-ellipsis-v text-muted"></i>
                                                    </Button>
                                                }
                                                items={getDropdownItems(school)}
                                            />
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground mb-1 truncate">{school.name}</h3>
                                        <p className="text-sm text-muted mb-4 line-clamp-2 h-10">{school.address}</p>

                                        <div className="space-y-2 pt-4 border-t border-divider text-sm">
                                            <div className="flex items-center gap-3 text-content">
                                                <i className="fas fa-envelope text-muted w-4"></i>
                                                <span className="truncate">{school.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-content">
                                                <i className="fas fa-phone text-muted w-4"></i>
                                                <span>{school.phoneNo}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface border border-divider rounded-xl shadow-sm">
                        <i className="fas fa-search text-muted text-4xl mb-4"></i>
                        <h3 className="text-lg font-medium text-foreground mb-2">No matching schools</h3>
                        <p className="text-muted text-sm">No schools found matching "{searchQuery}".</p>
                    </div>
                )
            ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface border border-divider rounded-xl shadow-sm">
                    <i className="fas fa-building text-muted text-4xl mb-4"></i>
                    <h3 className="text-lg font-medium text-foreground mb-2">No Schools Registered</h3>
                    <p className="text-muted text-sm max-w-md mb-6">Register your first institution to start configuring classes and sections.</p>
                    <Button onClick={() => setIsFormOpen(true)} variant="primary" leftIcon="fas fa-plus">Register School</Button>
                </div>
            )}

            {/* --- Create Modal --- */}
            <SideModal isOpen={isFormOpen} onClose={closeForm} title="Register New School">
                <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">
                    <div className="space-y-5">
                        <Input id="name" label="School Name" required value={formData.name} onChange={handleInputChange} disabled={createSchoolMutation.isPending} />
                        <Input id="email" type="email" label="Official Email" required value={formData.email} onChange={handleInputChange} disabled={createSchoolMutation.isPending} />
                        <Input id="phoneNo" type="tel" label="Contact Number" required value={formData.phoneNo} onChange={handleInputChange} disabled={createSchoolMutation.isPending} />
                        <Input id="address" label="Full Address" required value={formData.address} onChange={handleInputChange} disabled={createSchoolMutation.isPending} />
                        {/* <Input id="currentAcademicYear" label="Academic Year (e.g., 2024-2025)" required value={formData.currentAcademicYear} onChange={handleInputChange} disabled={createSchoolMutation.isPending} /> */}
                        <SearchSelect
                            label="Academic Year"
                            options={academicYearOptions}
                            value={formData.currentAcademicYear}
                            onChange={(opt) => setFormData(p=> ({...p, currentAcademicYear:String(opt.value)}))}
                            placeholder="Select Year..."
                        />

                        <div className="flex flex-col gap-1.5">
                            <Label>School Logo (Optional)</Label>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="block w-full text-sm text-content file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-soft file:text-primary hover:file:bg-primary/20 transition-all border border-divider rounded-lg p-1 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-divider">
                        <Button type="button" variant="outline" onClick={closeForm} disabled={createSchoolMutation.isPending}>Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={createSchoolMutation.isPending}>Register School</Button>
                    </div>
                </form>
            </SideModal>







            {/* ========================================= */}
            {/* STAFF LIST MODAL                          */}
            {/* ========================================= */}
            <SideModal
                isOpen={isStaffListModalOpen}
                onClose={() => setIsStaffListModalOpen(false)}
                title="School Staff List"
                width="w-full sm:w-[500px] md:w-[600px]"
                actions={
                    <Button
                        variant="primary"
                        size="sm"
                        leftIcon="fas fa-plus"
                        className="text-xs h-8 px-3 whitespace-nowrap shadow-sm"
                        onClick={() => {
                            // Open registration modal for this specific school slot
                            setUserFormData(INITIAL_USER_FORM_STATE);
                            setIsUserModalOpen(true);
                        }}
                    >
                        Add Staff
                    </Button>
                }
            >
                <div className="flex flex-col h-full">
                    {isStaffLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-muted">
                            <i className="fas fa-circle-notch fa-spin text-3xl mb-3 text-primary"></i>
                            <p className="text-sm font-medium">Loading staff...</p>
                        </div>
                    ) : !schoolStaffs || schoolStaffs.length === 0 ? (
                        <div className="text-center py-10 text-muted border border-dashed border-border rounded-lg bg-background/50">
                            <i className="fas fa-users-slash text-3xl mb-2 opacity-50"></i>
                            <p className="text-sm font-medium">No staff members found for this school.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                            {schoolStaffs.map((user: any) => (
                                <div key={user._id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg shadow-sm hover:border-primary/30 transition-colors">

                                    {/* Staff Info */}
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-bold text-foreground truncate">{user.userName}</p>
                                        <div className="text-xs text-muted truncate mt-0.5">{user.email || 'No email'}</div>
                                        <div className="mt-2">
                                            <span className="px-2 py-1 bg-primary-soft text-primary rounded-md text-[10px] font-bold uppercase tracking-wider">
                                                {user.role || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0 ml-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedUserForRole(user)}
                                            className="text-xs h-8 px-3"
                                        >
                                            Assign Role
                                        </Button>

                                        <Button
                                            variant="danger"
                                            size="sm"
                                            isLoading={isDeleting}
                                            onClick={() => handleDeleteUser(user._id)}
                                            title="Delete User"
                                            className="!p-0 w-8 h-8 flex items-center justify-center rounded-md"
                                        >
                                            {!isDeleting && <i className="fas fa-trash-alt text-xs" />}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </SideModal>


            {/* --- Create Staff Modal --- */}
            <SideModal
                isOpen={isUserModalOpen}
                onClose={() => {
                    setIsUserModalOpen(false);
                    setUserFormData(INITIAL_USER_FORM_STATE);
                }}
                title="Register New Users for School"
                width="w-full sm:w-[400px]"
            >
                <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                    <Input
                        label="Full Name"
                        placeholder="e.g. Rahul"
                        value={userFormData.userName}
                        onChange={(e) => setUserFormData({ ...userFormData, userName: e.target.value })}
                        required
                    />

                    <Input
                        label="Email Address"
                        placeholder="name@school.com"
                        type="email"
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    />

                    <Input
                        label="Phone Number"
                        placeholder="10-digit mobile number"
                        type="tel"
                        maxLength={10}
                        value={userFormData.phoneNo}
                        onChange={(e) => {
                            const numericOnly = e.target.value.replace(/\D/g, '');
                            setUserFormData({ ...userFormData, phoneNo: numericOnly });
                        }}
                    />

                    <SearchSelect
                        label="Assign Role *"
                        options={createRoleOptions}
                        value={userFormData.role}
                        onChange={(opt) => setUserFormData({ ...userFormData, role: opt.value as ValidUserRole })}
                    />

                    <Input
                        label="Password"
                        placeholder="Enter password"
                        type={showPassword ? "text" : "password"}
                        value={userFormData.password}
                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                        required
                        rightIcon={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}
                        onRightIconClick={() => setShowPassword(!showPassword)}
                    />

                    <div className="pt-6 border-t border-divider flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsUserModalOpen(false);
                                setUserFormData(INITIAL_USER_FORM_STATE);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isCreatingUser}
                        >
                            Create
                        </Button>
                    </div>
                </form>
            </SideModal>

            {/* ========================================= */}
            {/* ASSIGN ROLE MODAL (Nested/Secondary)      */}
            {/* ========================================= */}
            <SideModal
                isOpen={!!selectedUserForRole}
                onClose={() => setSelectedUserForRole(null)}
                title="Assign New Role"
                width="w-full sm:w-[400px]"
            >
                {selectedUserForRole && (
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Target User</p>
                            <p className="font-bold text-foreground text-lg">{selectedUserForRole.userName}</p>
                        </div>

                        <SearchSelect
                            label="Select New Role"
                            options={createRoleOptions}
                            value={selectedUserForRole.role}
                            onChange={(opt: any) => setSelectedUserForRole({ ...selectedUserForRole, role: opt.value })}
                        />

                        <div className="pt-4 border-t border-divider flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setSelectedUserForRole(null)}>Cancel</Button>
                            <Button
                                variant="primary"
                                isLoading={isUpdatingRole}
                                onClick={handleRoleChange}
                            >
                                Update Role
                            </Button>
                        </div>
                    </div>
                )}
            </SideModal>



            {/* ========================================= */}
            {/* SUBSCRIPTION MODAL                        */}
            {/* ========================================= */}
            {isPlatformAdmin && <SideModal
                isOpen={isSubscriptionModalOpen}
                onClose={() => setIsSubscriptionModalOpen(false)}
                title="Manage School Subscription"
                width="w-full sm:w-[600px] md:w-[776px] lg:w-[1024px]"
            >
                {/* Only render the module if a school is selected */}
                {targetSchoolId && (
                    <SubscriptionModule
                        schoolId={targetSchoolId}
                        isPlatformAdmin={isPlatformAdmin}
                    />
                )}
            </SideModal>}

        </div>
    );
}