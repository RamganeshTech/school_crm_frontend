
import { useState, useMemo } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetAllUsers, useAssignRole, useCreateUser, useDeleteUser } from '../../api_services/auth_api/authApi';
import { Button } from '../../shared/ui/Button';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { SideModal } from '../../shared/ui/SideModal';
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../shared/ui/TableLayout';
import { toast } from '../../shared/ui/ToastContext';
import type { UserRole } from '../../features/slices/authSlice';
import { AUTH_CHECK_ROLES, type ValidUserRole } from '../../constants/constants';
import { Input } from '../../shared/ui/Input';
import { ParentStudentManagerModal } from './ParentStudentManagerModal';

// Initial state for the creation form
const INITIAL_FORM_STATE = {
    userName: '',
    email: '',
    phoneNo: '',
    password: '',
    schoolId: null,
    role: '' as ValidUserRole
};

export default function UserListMain() {
    const { schoolId } = useAuthData();
    const [roleFilter, setRoleFilter] = useState<Exclude<UserRole, null> | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal States
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [manageStudentsParent, setManageStudentsParent] = useState<any>(null);

    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // 1. Queries & Mutations
    const { data: users, isLoading, refetch } = useGetAllUsers({ role: roleFilter, schoolId: schoolId! });
    const { mutateAsync: assignRole, isPending: isUpdating } = useAssignRole();
    const { mutateAsync: createUser, isPending: isCreating } = useCreateUser();
    const { mutateAsync: deleteUser, isPending: isDeleting } = useDeleteUser();

    // 2. Filter Logic
    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter((u: any) =>
            u?.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.phoneNo || '').includes(searchQuery)
        );
    }, [users, searchQuery]);

    const formatRole = (role: string) => role ? role?.charAt(0)?.toUpperCase() + role?.slice(1) : "N/A";

    const roleOptions = useMemo(() => [
        { label: 'All Roles', value: 'all' },
        ...AUTH_CHECK_ROLES.map(role => ({ label: formatRole((role || '')), value: role }))
    ], []);

    const createRoleOptions = useMemo(() => {
        return AUTH_CHECK_ROLES.map(role => ({ label: formatRole((role || '')), value: role }));
    }, []);

    // 3. Handlers
    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        try {

            await assignRole(
                { userId, newRole },
                // {
                //     onSuccess: () => {
                //         toast.success("Role updated successfully");
                //         setSelectedUser(null);
                //         refetch();
                //     },
                //     onError: (err: any) => {
                //         toast.error(err?.message || "Failed to update role");
                //     }
                // }
            );
            setSelectedUser(null);
            // refetch();


            toast.success("Role updated successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to create staff");
        }


    };

    const handleCreateSubmit = async () => {
        try {
            if (!formData.userName || !formData.password || !formData.role) {
                toast.error("Name, Password, and Role are required.");
                return;
            }

            // --- NEW: Email Validation ---
            if (formData.email) {
                // Standard email regex format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email)) {
                    toast.error("Please enter a valid email address.");
                    return;
                }
            }

            // --- NEW: Phone Validation ---
            if (formData.phoneNo) {
                // Strictly 10 digits regex
                const phoneRegex = /^\d{10}$/;
                if (!phoneRegex.test(formData.phoneNo)) {
                    toast.error("Phone number must be exactly 10 digits.");
                    return;
                }
            }


            // console.log("formData")
            await createUser({
                ...formData,
                schoolId: schoolId!
            });

            setIsCreateModalOpen(false);
            setFormData(INITIAL_FORM_STATE);
            refetch();
            toast.success("User created successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to create user");
        }
    };


    const handleDeleteUser = async (userId: string) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            try {
                await deleteUser(userId);
                refetch();
                toast.success("Staff delete successfully");
            } catch (error: any) {
                toast.error(error.message || "Failed to delete staff");
            }
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-mainBg">

            {/* HEADER SECTION */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b-border">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fa-solid fa-users-gear text-primary"></i>
                        Staff Management
                    </h1>
                    <p className="text-sm text-muted mt-1">Manage system access and roles for all staffs.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-end gap-3 w-full lg:w-auto">
                    <div className="flex-1">
                        <Input
                            label="Search Users"
                            placeholder="Search by name, email, or phone..."
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-64">
                        <SearchSelect
                            label="Filter by Role"
                            options={roleOptions}
                            value={roleFilter}
                            onChange={(opt) => setRoleFilter(opt.value as ValidUserRole | 'all')}
                        />
                    </div>
                    {/* ADD STAFF BUTTON */}
                    <div className="">
                        <Button
                            variant="primary"
                            leftIcon="fas fa-plus"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            Add Staff
                        </Button>
                    </div>
                </div>
            </header>

            {/* TABLE SECTION */}
            <TableContainer>
                <THead className="sticky top-0 z-10 bg-background after:absolute after:bottom-0 after:left-0 after:right-0">
                    <Tr>
                        <Th className="w-16">S.NO</Th>
                        <Th>User Name</Th>
                        <Th>Email / Phone</Th>
                        <Th>Current Role</Th>
                        <Th className="text-center">Actions</Th>
                    </Tr>
                </THead>
                <TBody>
                    {isLoading ? (
                        <Tr>
                            <Td className="text-center text-muted py-8">
                                <i className="fas fa-circle-notch fa-spin mr-2"></i> Loading users...
                            </Td>
                        </Tr>
                    ) : !users || users.length === 0 ? (
                        <Tr>
                            <Td className="text-center text-muted py-8">No users found for this selection.</Td>
                        </Tr>
                    ) : (
                        filteredUsers?.map((user: any, index: number) => (
                            <Tr key={user._id}>
                                <Td>{index + 1}</Td>
                                <Td className="font-semibold">{user.userName}</Td>
                                <Td>
                                    <div>{user.email || 'No email'}</div>
                                    <div className="text-xs text-muted">{user.phoneNo || 'No phone'}</div>
                                </Td>
                                <Td>
                                    <span className="px-2 py-1 bg-primary-soft text-primary rounded-md  text-[10px] font-bold uppercase tracking-wider">
                                        {formatRole(user.role)}
                                    </span>
                                </Td>
                                {/* <div className='mx-auto border'> */}
                                {/* Combined Actions into a Single Column Cell */}
                                <Td>
                                    <div className="flex items-center justify-center gap-2 sm:gap-3">

                                        {/* ADD THIS BUTTON BLOCK */}
                                        {user.role === 'parent' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setManageStudentsParent(user)}
                                                title="Manage Linked Students"
                                                className="text-primary hover:bg-primary-soft hover:border-primary"
                                            >
                                                <i className="fas fa-child mr-1.5"></i> Students
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            Assign Role
                                        </Button>

                                        <Button
                                            variant="danger"
                                            size="sm"
                                            isLoading={isDeleting}
                                            onClick={() => handleDeleteUser(user._id)}
                                            title="Delete User"
                                        >
                                            <i className="fas fa-trash-alt" />
                                        </Button>
                                    </div>
                                </Td>
                            </Tr>
                        ))
                    )}
                </TBody>
            </TableContainer>

            {/* ========================================= */}
            {/* 1. ASSIGN ROLE MODAL (Existing)           */}
            {/* ========================================= */}
            <SideModal
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                title="Assign New Role"
                width="w-full sm:w-[400px]"
            >
                {selectedUser && (
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Target User</p>
                            <p className="font-bold text-foreground text-lg">{selectedUser.userName}</p>
                            <p className="text-sm text-muted">Current Role: <span className="font-bold text-primary">{formatRole(selectedUser.role)}</span></p>
                        </div>

                        <SearchSelect
                            label="Select New Role"
                            options={createRoleOptions}
                            value={selectedUser.role}
                            onChange={(opt) => {
                                // Just update local state for the modal, don't fire API immediately
                                setSelectedUser({ ...selectedUser, role: opt.value });
                            }}
                        />

                        <div className="pt-4 border-t border-border flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setSelectedUser(null)}>Cancel</Button>
                            <Button
                                variant="primary"
                                isLoading={isUpdating}
                                onClick={() => handleRoleChange(selectedUser._id, selectedUser.role)}
                            >
                                Update Role
                            </Button>
                        </div>
                    </div>
                )}
            </SideModal>

            {/* ========================================= */}
            {/* 2. CREATE STAFF MODAL (New)               */}
            {/* ========================================= */}
            <SideModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setFormData(INITIAL_FORM_STATE);
                }}
                title="Register New User"
                width="w-full sm:w-[400px]"
            >
                <div className="space-y-4">
                    <Input
                        label="Full Name"
                        placeholder="e.g. Rahul"
                        value={formData.userName}
                        onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                        required
                    />

                    {/* UPDATED: Email Input */}
                    <Input
                        label="Email Address"
                        placeholder="name@school.com"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />

                    {/* UPDATED: Phone Input with UI restrictions */}
                    <Input
                        label="Phone Number"
                        placeholder="10-digit mobile number"
                        type="tel"
                        maxLength={10} // HTML level restriction
                        value={formData.phoneNo}
                        onChange={(e) => {
                            // Strip all non-digit characters immediately (Blocks A-Z, symbols)
                            const numericOnly = e.target.value.replace(/\D/g, '');
                            setFormData({ ...formData, phoneNo: numericOnly });
                        }}
                    />

                    <SearchSelect
                        label="Assign Role *"
                        options={createRoleOptions}
                        value={formData.role}
                        onChange={(opt) => setFormData({ ...formData, role: opt.value as ValidUserRole })}
                    />
                    <Input
                        label="Password"
                        placeholder="Enter password"
                        // Dynamically change type based on state
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        // Add the toggle icons
                        rightIcon={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}
                        // Toggle the state when the icon is clicked
                        onRightIconClick={() => setShowPassword(!showPassword)}
                    />

                    <div className="pt-6 border-t border-border flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                setFormData(INITIAL_FORM_STATE);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            isLoading={isCreating} // Assuming this variable comes from your mutation hook
                            onClick={handleCreateSubmit}
                        >
                            Create
                        </Button>
                    </div>
                </div>
            </SideModal>


            <ParentStudentManagerModal
                parentUser={manageStudentsParent}
                onClose={() => setManageStudentsParent(null)}
            />




        </div>
    );
}