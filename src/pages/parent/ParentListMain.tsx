import { useState, useMemo } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetAllUsers, useCreateUser, useDeleteUser } from '../../api_services/auth_api/authApi';
import { Button } from '../../shared/ui/Button';
import { SideModal } from '../../shared/ui/SideModal';
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../shared/ui/TableLayout';
import { toast } from '../../shared/ui/ToastContext';
import { Input } from '../../shared/ui/Input';
// import { ParentStudentManagerModal } from './ParentStudentManagerModal';
// import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ParentStudentManagerModal } from '../userList/ParentStudentManagerModal';

// Initial state hardcodes the role to 'parent'
const INITIAL_FORM_STATE = {
    userName: '',
    email: '',
    phoneNo: '',
    password: '',
    schoolId: null,
    role: 'parent' // 🌟 Forced Parent Role
};

export default function ParentListMain() {
    const { schoolId } = useAuthData();
    const [searchQuery, setSearchQuery] = useState('');
    // const navigate = useNavigate();
    // const location = useLocation();

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [manageStudentsParent, setManageStudentsParent] = useState<any>(null);

    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // 1. Queries & Mutations (Strictly fetching 'parent' role)
    const { data: users, isLoading, refetch } = useGetAllUsers({ role: 'parent', schoolId: schoolId! });
    const { mutateAsync: createUser, isPending: isCreating } = useCreateUser();
    const { mutateAsync: deleteUser, isPending: isDeleting } = useDeleteUser();

    // 2. Filter Logic (Search only, no role filtering needed)
    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter((u: any) =>
            (u?.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.phoneNo || '').includes(searchQuery)
        );
    }, [users, searchQuery]);

    // 3. Handlers
    const handleCreateSubmit = async () => {
        try {
            if (!formData.userName || !formData.password) {
                toast.error("Name and Password are required.");
                return;
            }

            if (formData.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email)) {
                    toast.error("Please enter a valid email address.");
                    return;
                }
            }

            if (formData.phoneNo) {
                const phoneRegex = /^\d{10}$/;
                if (!phoneRegex.test(formData.phoneNo)) {
                    toast.error("Phone number must be exactly 10 digits.");
                    return;
                }
            }

            await createUser({
                ...formData,
                schoolId: schoolId!,
                role: 'parent' // Guarantee it's a parent
            });

            setIsCreateModalOpen(false);
            setFormData(INITIAL_FORM_STATE);
            refetch();
            toast.success("Parent account created successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to create parent account");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm("Are you sure you want to delete this parent account? This action cannot be undone.")) {
            try {
                await deleteUser(userId);
                refetch();
                toast.success("Parent deleted successfully");
            } catch (error: any) {
                toast.error(error.message || "Failed to delete parent");
            }
        }
    };

    // const isChild = location.pathname.includes('/single');
    // if (isChild) {
    //     return <Outlet />;
    // }

    return (
        <div className="w-full h-full flex flex-col bg-mainBg">

            {/* HEADER SECTION */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b-border">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fa-solid fa-users-line text-primary"></i>
                        Parent Management
                    </h1>
                    <p className="text-sm text-muted mt-1">Manage parent accounts and link them to students.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-end gap-3 w-full lg:w-auto">
                    <div className="flex-1">
                        <Input
                            label="Search Parents"
                            placeholder="Search by name, email, or phone..."
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div>
                        <Button
                            variant="primary"
                            leftIcon="fas fa-plus"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            Add Parent
                        </Button>
                    </div>
                </div>
            </header>

            {/* TABLE SECTION */}
            <TableContainer>
                <THead className="sticky top-0 z-10 bg-background after:absolute after:bottom-0 after:left-0 after:right-0">
                    <Tr>
                        <Th className="w-16">S.NO</Th>
                        <Th>Parent Name</Th>
                        <Th>Email / Phone</Th>
                        <Th className="text-center">Actions</Th>
                    </Tr>
                </THead>
                <TBody>
                    {isLoading ? (
                        // <div>
                            <Td  className="mx-auto text-center text-muted py-8">
                                <i className="fas fa-circle-notch fa-spin mr-2"></i> Loading parents...
                            </Td>
                        // </div>
                    ) : !filteredUsers || filteredUsers.length === 0 ? (
                        <Tr>
                            <Td className="mx-auto text-center text-muted py-8">No parent accounts found.</Td>
                        </Tr>
                    ) : (
                        filteredUsers.map((user: any, index: number) => (
                            <Tr key={user._id}>
                                <Td>{index + 1}</Td>
                                <Td className="font-semibold">{user.userName}</Td>
                                <Td>
                                    <div>{user.email || 'No email'}</div>
                                    <div className="text-xs text-muted">{user.phoneNo || 'No phone'}</div>
                                </Td>
                                <Td>
                                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                                        {/* <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => navigate(`single/${user?._id}`)}
                                            title="View Details"
                                        >
                                            View
                                        </Button>
                                         */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setManageStudentsParent(user)}
                                            title="Manage Linked Students"
                                            className="text-primary hover:bg-primary-soft hover:border-primary"
                                        >
                                            <i className="fas fa-child mr-1.5"></i> Students
                                        </Button>

                                        <Button
                                            variant="danger"
                                            size="sm"
                                            isLoading={isDeleting}
                                            onClick={() => handleDeleteUser(user._id)}
                                            title="Delete Parent"
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
            {/* CREATE PARENT MODAL                       */}
            {/* ========================================= */}
            <SideModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setFormData(INITIAL_FORM_STATE);
                }}
                title="Register New Parent"
                width="w-full sm:w-[400px]"
            >
                <div className="space-y-4">
                    <Input
                        label="Full Name"
                        placeholder="e.g. Rahul Sharma"
                        value={formData.userName}
                        onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                        required
                    />

                    <Input
                        label="Email Address"
                        placeholder="name@example.com"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />

                    <Input
                        label="Phone Number"
                        placeholder="10-digit mobile number"
                        type="tel"
                        maxLength={10}
                        value={formData.phoneNo}
                        onChange={(e) => {
                            const numericOnly = e.target.value.replace(/\D/g, '');
                            setFormData({ ...formData, phoneNo: numericOnly });
                        }}
                    />

                    <Input
                        label="Password"
                        placeholder="Enter password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        rightIcon={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}
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
                            isLoading={isCreating}
                            onClick={handleCreateSubmit}
                        >
                            Create Parent
                        </Button>
                    </div>
                </div>
            </SideModal>

            {/* ========================================= */}
            {/* LINK STUDENTS MODAL                       */}
            {/* ========================================= */}
            <ParentStudentManagerModal
                parentUser={manageStudentsParent}
                onClose={() => setManageStudentsParent(null)}
            />

        </div>
    );
}