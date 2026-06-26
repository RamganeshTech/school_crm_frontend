import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { SearchSelect } from '../../shared/ui/SearchSelect';
// import { SideModal } from '../../shared/ui/SideModal';
import { toast } from '../../shared/ui/ToastContext';

// Import your Auth/User hooks (Adjust names if they differ in your authApi)
import { useAssignRole, useGetAllUsers, useGetSingleUser, useUpdateUser } from '../../api_services/auth_api/authApi';
import { AUTH_CHECK_ROLES, type ValidUserRole } from '../../constants/constants';
import { useCreateEmployeeProfile, useGetEmployeeProfileByUserId, useUpdateEmployeeProfile } from '../../api_services/auth_api/employeeProfileApi';





// type TabType = 'profile' | 'details';

// export default function UserSingle() {
//     const { userId } = useParams<{ userId: string }>();
//     const navigate = useNavigate();
//     const { schoolId } = useAuthData();

//     // 1. State
//     const [activeTab, setActiveTab] = useState<TabType>('profile');

//     // Modal States
//     const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);
//     const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

//     // Form States
//     const [userFormData, setUserFormData] = useState<any>({});
//     const [profileFormData, setProfileFormData] = useState<any>({
//         employeeNo: '', designation: '', department: '', employmentType: '',
//         dateOfJoining: '', nationalId: '', pfNumber: '', yearsOfExperience: 0,
//         emergencyContact: { name: '', relation: '', phone: '' },
//         bankDetails: { accountName: '', accountNumber: '', bankName: '', ifscCode: '' }
//     });

//     // 2. Data Fetching
//     // (Assuming you get the specific user from the cache/list. Alternatively, use a useGetUserById hook if you have one)
//     const { data: users } = useGetAllUsers({ role: 'all', schoolId: schoolId! });
//     const userDetails = users?.find((u: any) => u._id === userId);

//     const { data: employeeProfile, isLoading: isProfileLoading } = useGetEmployeeProfileByUserId(userId);

//     const { mutateAsync: updateUser, isPending: isUserUpdating } = useUpdateUser(); // Ensure this exists in your authApi
//     const { mutateAsync: createProfile, isPending: isCreatingProfile } = useCreateEmployeeProfile();
//     const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateEmployeeProfile();

//     // 3. Handlers
//     const formatRole = (role: string) => role ? role.charAt(0).toUpperCase() + role.slice(1) : "N/A";

//     const roleOptions = useMemo(() => {
//         return AUTH_CHECK_ROLES.map(role => ({ label: formatRole((role || '')), value: role }));
//     }, []);

//     // --- User Edit Submit ---
//     const handleUserEditSubmit = async () => {
//         try {
//             await updateUser({ userId: userId!, data: userFormData });
//             setIsUserEditModalOpen(false);
//             toast.success("User profile updated successfully");
//         } catch (error: any) {
//             toast.error(error.message || "Failed to update user");
//         }
//     };

//     // --- Employee Profile Submit (Create or Update) ---
//     const handleProfileSubmit = async () => {
//         try {
//             if (employeeProfile) {
//                 await updateProfile({ userId: userId!, updateData: profileFormData });
//                 toast.success("Employee details updated!");
//             } else {
//                 await createProfile({ ...profileFormData, userId, schoolId });
//                 toast.success("Employee profile created!");
//             }
//             setIsProfileModalOpen(false);
//         } catch (error: any) {
//             toast.error(error.message || "Failed to save employee profile");
//         }
//     };

//     // Populate forms when opening modals
//     const openUserEditModal = () => {
//         setUserFormData({
//             userName: userDetails?.userName || '',
//             email: userDetails?.email || '',
//             phoneNo: userDetails?.phoneNo || '',
//             role: userDetails?.role || ''
//         });
//         setIsUserEditModalOpen(true);
//     };

//     const openProfileModal = () => {
//         if (employeeProfile) {
//             setProfileFormData({
//                 ...employeeProfile,
//                 dateOfJoining: employeeProfile.dateOfJoining ? new Date(employeeProfile.dateOfJoining).toISOString().split('T')[0] : '',
//                 emergencyContact: employeeProfile.emergencyContact || { name: '', relation: '', phone: '' },
//                 bankDetails: employeeProfile.bankDetails || { accountName: '', accountNumber: '', bankName: '', ifscCode: '' }
//             });
//         }
//         setIsProfileModalOpen(true);
//     };

//     if (!userDetails) return <div className="p-6 text-center text-muted">Loading user...</div>;

//     return (
//         <div className="w-full h-full flex flex-col bg-mainBg p-4 sm:p-6 animate-fade-in">
//             {/* --- HEADER --- */}
//             <header className="flex items-center gap-4 mb-6 border-b border-border pb-4">
//                 <button
//                     onClick={() => navigate(-1)}
//                     className="w-8 h-8 flex items-center justify-center rounded-full bg-surface border border-border text-muted hover:text-primary transition-colors"
//                 >
//                     <i className="fas fa-arrow-left"></i>
//                 </button>
//                 <div>
//                     <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
//                         {userDetails.userName}
//                         <span className="px-2 py-1 bg-primary-soft text-primary rounded-md text-[10px] font-bold uppercase tracking-wider">
//                             {formatRole(userDetails.role)}
//                         </span>
//                     </h1>
//                     <p className="text-sm text-muted mt-1">{userDetails.email || "No email"} | {userDetails.phoneNo || "No phone"}</p>
//                 </div>
//             </header>

//             {/* --- TABS --- */}
//             <div className="flex items-center gap-6 border-b border-border mb-6">
//                 <button
//                     onClick={() => setActiveTab('profile')}
//                     className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}`}
//                 >
//                     <i className="far fa-id-card mr-2"></i> Account Profile
//                 </button>
//                 <button
//                     onClick={() => setActiveTab('details')}
//                     className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}`}
//                 >
//                     <i className="fas fa-briefcase mr-2"></i> HR & Employment Details
//                 </button>
//             </div>

//             {/* --- TAB CONTENT: PROFILE --- */}
//             {activeTab === 'profile' && (
//                 <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
//                     <div className="flex justify-between items-start mb-6">
//                         <h2 className="text-lg font-bold text-foreground">Basic Information</h2>
//                         <Button variant="outline" size="sm" onClick={openUserEditModal} leftIcon="fas fa-pen">
//                             Edit Profile
//                         </Button>
//                     </div>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                         <div>
//                             <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Full Name</p>
//                             <p className="font-medium text-foreground">{userDetails.userName}</p>
//                         </div>
//                         <div>
//                             <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Role Configuration</p>
//                             <p className="font-medium text-foreground">{formatRole(userDetails.role)}</p>
//                         </div>
//                         <div>
//                             <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Email Address</p>
//                             <p className="font-medium text-foreground">{userDetails.email || '-'}</p>
//                         </div>
//                         <div>
//                             <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Phone Number</p>
//                             <p className="font-medium text-foreground">{userDetails.phoneNo || '-'}</p>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* --- TAB CONTENT: HR DETAILS --- */}
//             {activeTab === 'details' && (
//                 <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
//                     <div className="flex justify-between items-start mb-6">
//                         <h2 className="text-lg font-bold text-foreground">Employment Record</h2>
//                         <Button
//                             variant={employeeProfile ? "outline" : "primary"}
//                             size="sm"
//                             onClick={openProfileModal}
//                             leftIcon={employeeProfile ? "fas fa-pen" : "fas fa-plus"}
//                         >
//                             {employeeProfile ? "Edit Details" : "Create Profile"}
//                         </Button>
//                     </div>

//                     {isProfileLoading ? (
//                         <div className="py-12 text-center text-muted"><i className="fas fa-spinner fa-spin mr-2"></i> Loading record...</div>
//                     ) : !employeeProfile ? (
//                         <div className="py-12 text-center flex flex-col items-center">
//                             <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center border border-border mb-4 text-muted text-2xl">
//                                 <i className="fas fa-folder-open"></i>
//                             </div>
//                             <h3 className="text-foreground font-semibold">No Employment Record Found</h3>
//                             <p className="text-sm text-muted mb-4">This user does not have an active HR profile mapped to them.</p>
//                         </div>
//                     ) : (
//                         <div className="space-y-8">
//                             {/* Professional Details */}
//                             <div>
//                                 <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Professional Identity</h3>
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//                                     <div>
//                                         <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Employee No</p>
//                                         <p className="font-medium text-foreground">{employeeProfile.employeeNo || '-'}</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Designation</p>
//                                         <p className="font-medium text-foreground">{employeeProfile.designation || '-'}</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Department</p>
//                                         <p className="font-medium text-foreground">{employeeProfile.department || '-'}</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Employment Type</p>
//                                         <p className="font-medium text-foreground capitalize">{employeeProfile.employmentType?.replace('_', ' ') || '-'}</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Date of Joining</p>
//                                         <p className="font-medium text-foreground">
//                                             {employeeProfile.dateOfJoining ? new Date(employeeProfile.dateOfJoining).toLocaleDateString() : '-'}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Compliance & Background */}
//                             <div>
//                                 <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Compliance & Background</h3>
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//                                     <div>
//                                         <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">National ID</p>
//                                         <p className="font-medium text-foreground">{employeeProfile.nationalId || '-'}</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">PF Number</p>
//                                         <p className="font-medium text-foreground">{employeeProfile.pfNumber || '-'}</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Years of Experience</p>
//                                         <p className="font-medium text-foreground">{employeeProfile.yearsOfExperience || 0} Years</p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Emergency Contact */}
//                             <div>
//                                 <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Emergency Contact</h3>
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//                                     <div>
//                                         <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Contact Name</p>
//                                         <p className="font-medium text-foreground">{employeeProfile.emergencyContact?.name || '-'}</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Relation</p>
//                                         <p className="font-medium text-foreground">{employeeProfile.emergencyContact?.relation || '-'}</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Phone Number</p>
//                                         <p className="font-medium text-foreground">{employeeProfile.emergencyContact?.phone || '-'}</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* ========================================= */}
//             {/* MODALS */}
//             {/* ========================================= */}

//             {/* 1. USER EDIT MODAL */}
//             <SideModal
//                 isOpen={isUserEditModalOpen}
//                 onClose={() => setIsUserEditModalOpen(false)}
//                 title="Edit Account Profile"
//             >
//                 <div className="space-y-4">
//                     <Input label="Full Name" value={userFormData.userName} onChange={(e) => setUserFormData({ ...userFormData, userName: e.target.value })} />
//                     <Input label="Email Address" type="email" value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} />
//                     <Input
//                         label="Phone Number" type="tel" maxLength={10} value={userFormData.phoneNo}
//                         onChange={(e) => setUserFormData({ ...userFormData, phoneNo: e.target.value.replace(/\D/g, '') })}
//                     />
//                     <SearchSelect
//                         label="System Role"
//                         options={roleOptions}
//                         value={userFormData.role}
//                         onChange={(opt) => setUserFormData({ ...userFormData, role: opt.value as ValidUserRole })}
//                         isClearable={false}
//                     />
//                     <div className="pt-6 border-t border-border flex justify-end gap-3">
//                         <Button variant="outline" onClick={() => setIsUserEditModalOpen(false)}>Cancel</Button>
//                         <Button variant="primary" isLoading={isUserUpdating} onClick={handleUserEditSubmit}>Save Changes</Button>
//                     </div>
//                 </div>
//             </SideModal>

//             {/* 2. EMPLOYEE PROFILE MODAL */}
//             <SideModal
//                 isOpen={isProfileModalOpen}
//                 onClose={() => setIsProfileModalOpen(false)}
//                 title={employeeProfile ? "Update Employment Record" : "Create Employment Record"}
//                 width="w-full sm:w-[500px] md:w-[600px]"
//             >
//                 <div className="space-y-6">
//                     {/* Work Info */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <Input label="Employee Number" value={profileFormData.employeeNo} onChange={(e) => setProfileFormData({ ...profileFormData, employeeNo: e.target.value })} />
//                         <Input label="Date of Joining" type="date" value={profileFormData.dateOfJoining} onChange={(e) => setProfileFormData({ ...profileFormData, dateOfJoining: e.target.value })} />
//                         <Input label="Designation" value={profileFormData.designation} onChange={(e) => setProfileFormData({ ...profileFormData, designation: e.target.value })} />
//                         <Input label="Department" value={profileFormData.department} onChange={(e) => setProfileFormData({ ...profileFormData, department: e.target.value })} />

//                         <div className="sm:col-span-2">
//                             <SearchSelect
//                                 label="Employment Type"
//                                 options={[
//                                     { label: "Full Time", value: "full_time" },
//                                     { label: "Part Time", value: "part_time" },
//                                     { label: "Contract", value: "contract" },
//                                     { label: "Temporary", value: "temporary" }
//                                 ]}
//                                 value={profileFormData.employmentType}
//                                 onChange={(opt: any) => setProfileFormData({ ...profileFormData, employmentType: opt.value })}
//                                 isClearable={false}
//                             />
//                         </div>
//                     </div>

//                     <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <Input label="National ID (Aadhaar/PAN)" value={profileFormData.nationalId} onChange={(e) => setProfileFormData({ ...profileFormData, nationalId: e.target.value })} />
//                         <Input label="PF Number" value={profileFormData.pfNumber} onChange={(e) => setProfileFormData({ ...profileFormData, pfNumber: e.target.value })} />
//                         <Input label="Years of Experience" type="number" min="0" value={profileFormData.yearsOfExperience} onChange={(e) => setProfileFormData({ ...profileFormData, yearsOfExperience: Number(e.target.value) })} />
//                     </div>

//                     <div className="border-t border-border pt-4">
//                         <h4 className="text-xs font-bold text-muted uppercase mb-3">Emergency Contact</h4>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                             <Input label="Contact Name" value={profileFormData.emergencyContact.name} onChange={(e) => setProfileFormData({ ...profileFormData, emergencyContact: { ...profileFormData.emergencyContact, name: e.target.value } })} />
//                             <Input label="Relation" value={profileFormData.emergencyContact.relation} onChange={(e) => setProfileFormData({ ...profileFormData, emergencyContact: { ...profileFormData.emergencyContact, relation: e.target.value } })} />
//                             <Input label="Phone Number" maxLength={10} value={profileFormData.emergencyContact.phone} onChange={(e) => setProfileFormData({ ...profileFormData, emergencyContact: { ...profileFormData.emergencyContact, phone: e.target.value.replace(/\D/g, '') } })} />
//                         </div>
//                     </div>

//                     <div className="pt-6 border-t border-border flex justify-end gap-3">
//                         <Button variant="outline" onClick={() => setIsProfileModalOpen(false)}>Cancel</Button>
//                         <Button variant="primary" isLoading={isCreatingProfile || isUpdatingProfile} onClick={handleProfileSubmit}>Save Record</Button>
//                     </div>
//                 </div>
//             </SideModal>

//         </div>
//     );
// }



type TabType = 'profile' | 'details';

const INITIAL_PROFILE_STATE = {
    employeeNo: '', designation: '', department: '', employmentType: '',
    dateOfJoining: '', nationalId: '', pfNumber: '', yearsOfExperience: 0,
    emergencyContact: { name: '', relation: '', phone: '' },
    bankDetails: { accountName: '', accountNumber: '', bankName: '', ifscCode: '' }
};

export default function UserSingle() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { schoolId } = useAuthData();

    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const [userFormData, setUserFormData] = useState<any>({});
    const [profileFormData, setProfileFormData] = useState<any>(INITIAL_PROFILE_STATE);

    // const { data: users, isLoading: isUsersLoading, refetch } = useGetAllUsers({ role: 'all', schoolId: schoolId! });
    const { data: userDetails, isLoading: isUsersLoading, refetch } = useGetSingleUser(userId);

    console.log("userDetails", userDetails)
    // const userDetails = users?.find((u: any) => u._id === userId);

    const { data: rawEmployeeProfile, isLoading: isProfileLoading } = useGetEmployeeProfileByUserId(userId);

    // 🌟 FIX 1: Safely extract the profile. Handles cases where the API returns { ok: true, data: null }
    const validProfile = rawEmployeeProfile?.data !== undefined ? rawEmployeeProfile.data : rawEmployeeProfile;
    const hasProfile = !!validProfile && Object.keys(validProfile).length > 0;

    const { mutateAsync: updateUser, isPending: isUserUpdating } = useUpdateUser();
    const { mutateAsync: assignRole, } = useAssignRole(); // Add this line
    const { mutateAsync: createProfile, isPending: isCreatingProfile } = useCreateEmployeeProfile();
    const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateEmployeeProfile();

    // Sync User Account Data
    useEffect(() => {
        if (userDetails) {
            setUserFormData({
                userName: userDetails.userName || '', email: userDetails.email || '',
                phoneNo: userDetails.phoneNo || '', role: userDetails.role || ''
            });
        }
    }, [userDetails]);

    // Sync HR Profile Data
    useEffect(() => {
        if (hasProfile) {
            setProfileFormData({
                ...validProfile,
                dateOfJoining: validProfile.dateOfJoining ? new Date(validProfile.dateOfJoining).toISOString().split('T')[0] : '',
                emergencyContact: validProfile.emergencyContact || INITIAL_PROFILE_STATE.emergencyContact,
                bankDetails: validProfile.bankDetails || INITIAL_PROFILE_STATE.bankDetails
            });
            setIsEditingProfile(false);
        } else {
            setProfileFormData(INITIAL_PROFILE_STATE);
            setIsEditingProfile(true);
        }
    }, [validProfile, hasProfile]);


    // Handlers
    const formatRole = (role: string) => role ? role.charAt(0).toUpperCase() + role.slice(1) : "N/A";
    const roleOptions = useMemo(() => AUTH_CHECK_ROLES.map(role => ({ label: formatRole((role || '')), value: role })), []);

    // const handleUserEditSubmit = async () => {
    //     try {
    //         await updateUser({ userId: userId!, data: userFormData });
    //         setIsEditingUser(false);
    //         toast.success("Account profile updated successfully");
    //     } catch (error: any) {
    //         toast.error(error.message || "Failed to update account");
    //     }
    // };

    const handleUserEditSubmit = async () => {
        // 🌟 1. Phone Number Validation
        if (userFormData.phoneNo && !/^\d{10}$/.test(userFormData.phoneNo)) {
            toast.error("Phone number must be exactly 10 digits.");
            return; // Stop execution
        }

        try {
            // let roleUpdated = false;

            // 🌟 2. Check if the Role was changed
            if (userFormData.role !== userDetails.role) {
                await assignRole({
                    userId: userId!,
                    newRole: userFormData.role
                });
                // roleUpdated = true;
            }

            // 🌟 3. Update the Basic Info (Exclude role from this payload)
            const basicInfoPayload = {
                userName: userFormData.userName,
                email: userFormData.email,
                phoneNo: userFormData.phoneNo
            };

            await updateUser({
                userId: userId!,
                data: basicInfoPayload // Send only the basic info to the update endpoint
            });

            refetch()

            // 4. Wrap up and notify
            setIsEditingUser(false);

            // if (roleUpdated) {
            //     toast.success("Account details and system role updated successfully.");
            // } else {
            toast.success("Account profile updated successfully.");
            // }

        } catch (error: any) {
            toast.error(error.message || "Failed to update account.");
        }
    };

    const handleCancelUserEdit = () => {
        setUserFormData({
            userName: userDetails?.userName || '', email: userDetails?.email || '',
            phoneNo: userDetails?.phoneNo || '', role: userDetails?.role || ''
        });
        setIsEditingUser(false);
    };

    const handleProfileSubmit = async () => {
        try {
            if (hasProfile) {
                await updateProfile({ userId: userId!, updateData: profileFormData });
                toast.success("Employment record updated!");
                setIsEditingProfile(false);
            } else {
                await createProfile({ ...profileFormData, userId: userId!, schoolId: schoolId! });
                toast.success("Employment record created!");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to save employment record");
        }
    };

    const handleCancelProfileEdit = () => {
        setProfileFormData({
            ...validProfile,
            dateOfJoining: validProfile?.dateOfJoining ? new Date(validProfile.dateOfJoining).toISOString().split('T')[0] : '',
            emergencyContact: validProfile?.emergencyContact || INITIAL_PROFILE_STATE.emergencyContact
        });
        setIsEditingProfile(false);
    };

    if (isUsersLoading) return <div className="p-6 text-center text-muted"><i className="fas fa-spinner fa-spin mr-2"></i> Loading user...</div>;
    if (!userDetails) return <div className="p-6 text-center text-muted">User not found.</div>;

    return (
        <div className="w-full h-full flex flex-col bg-mainBg p-4 sm:p-6 animate-fade-in">
            {/* HEADER */}
            <header className="flex items-center gap-4 mb-6 border-b border-border pb-4">
                <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface border border-border text-muted hover:text-primary transition-colors">
                    <i className="fas fa-arrow-left"></i>
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        {userDetails.userName}
                        <span className="px-2 py-1 bg-primary-soft text-primary rounded-md text-[10px] font-bold uppercase tracking-wider">
                            {formatRole(userDetails.role)}
                        </span>
                    </h1>
                    <p className="text-sm text-muted mt-1">{userDetails.email || "No email"} | {userDetails.phoneNo || "No phone"}</p>
                </div>
            </header>

            {/* TABS */}
            <div className="flex items-center gap-6 border-b border-border mb-6">
                <button onClick={() => setActiveTab('profile')} className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}`}>
                    <i className="far fa-id-card mr-2"></i> Account Profile
                </button>
                <button onClick={() => setActiveTab('details')} className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}`}>
                    <i className="fas fa-briefcase mr-2"></i> HR & Employment Details
                </button>
            </div>

            {/* TAB 1: ACCOUNT PROFILE */}
            {activeTab === 'profile' && (
                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm max-w-7xl">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-lg font-bold text-foreground">Basic Information</h2>
                        {!isEditingUser && (
                            <Button variant="outline" size="sm" onClick={() => setIsEditingUser(true)} leftIcon="fas fa-pen">Edit Account</Button>
                        )}
                    </div>

                    {isEditingUser ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="Full Name" value={userFormData.userName} onChange={(e) => setUserFormData({ ...userFormData, userName: e.target.value })} />
                                <SearchSelect label="System Role" options={roleOptions} value={userFormData.role} onChange={(opt) => setUserFormData({ ...userFormData, role: opt.value as ValidUserRole })} isClearable={false} />
                                <Input label="Email Address" type="email" value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} />
                                <Input label="Phone Number" type="tel" maxLength={10} value={userFormData.phoneNo} onChange={(e) => setUserFormData({ ...userFormData, phoneNo: e.target.value.replace(/\D/g, '') })} />
                            </div>
                            <div className="pt-4 border-t border-border flex justify-end gap-3">
                                <Button variant="outline" onClick={handleCancelUserEdit}>Cancel</Button>
                                <Button variant="primary" isLoading={isUserUpdating} onClick={handleUserEditSubmit}>Save Changes</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Full Name</p><p className="font-medium text-foreground">{userDetails.userName}</p></div>
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Role Configuration</p><p className="font-medium text-foreground">{formatRole(userDetails.role)}</p></div>
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Email Address</p><p className="font-medium text-foreground">{userDetails.email || '-'}</p></div>
                            <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Phone Number</p><p className="font-medium text-foreground">{userDetails.phoneNo || '-'}</p></div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: HR DETAILS */}
            {activeTab === 'details' && (
                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm max-w-7xl">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-lg font-bold text-foreground">
                            {hasProfile ? "Employment Record" : "Registration Form"}
                        </h2>

                        {hasProfile && !isEditingProfile && (
                            <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)} leftIcon="fas fa-pen">Edit Record</Button>
                        )}
                    </div>

                    {isProfileLoading ? (
                        <div className="py-12 text-center text-muted"><i className="fas fa-spinner fa-spin mr-2"></i> Loading HR data...</div>

                        // 🌟 FIX 2: Explicitly force Form view if !hasProfile. This stops the lifecycle crash.
                    ) : (!hasProfile || isEditingProfile) ? (

                        // EDIT / CREATE FORM VIEW
                        <div className="space-y-8 animate-fade-in">
                            {!hasProfile && (
                                <div className="bg-primary-soft/50 border border-primary/20 p-4 rounded-lg flex items-start gap-3 mb-6">
                                    <i className="fas fa-info-circle text-primary mt-0.5"></i>
                                    <p className="text-sm text-foreground">No employment record found for this user. Fill out the form below to register them in the HR system.</p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Professional Identity</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <Input label="Employee Number" value={profileFormData.employeeNo} onChange={(e) => setProfileFormData({ ...profileFormData, employeeNo: e.target.value })} />
                                    <Input label="Designation" value={profileFormData.designation} onChange={(e) => setProfileFormData({ ...profileFormData, designation: e.target.value })} />
                                    <Input label="Department" value={profileFormData.department} onChange={(e) => setProfileFormData({ ...profileFormData, department: e.target.value })} />
                                    <SearchSelect
                                        label="Employment Type"
                                        options={[
                                            { label: "Full Time", value: "full_time" }, { label: "Part Time", value: "part_time" },
                                            { label: "Contract", value: "contract" }, { label: "Temporary", value: "temporary" }
                                        ]}
                                        value={profileFormData.employmentType}
                                        onChange={(opt: any) => setProfileFormData({ ...profileFormData, employmentType: opt.value })}
                                        isClearable={false}
                                    />
                                    <Input label="Date of Joining" type="date" value={profileFormData.dateOfJoining} onChange={(e) => setProfileFormData({ ...profileFormData, dateOfJoining: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Compliance & Background</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <Input label="National ID (Aadhaar/PAN)" value={profileFormData.nationalId} onChange={(e) => setProfileFormData({ ...profileFormData, nationalId: e.target.value })} />
                                    <Input label="PF Number" value={profileFormData.pfNumber} onChange={(e) => setProfileFormData({ ...profileFormData, pfNumber: e.target.value })} />
                                    <Input label="Years of Experience" type="number" min="0" value={profileFormData.yearsOfExperience || ""} onChange={(e) => setProfileFormData({ ...profileFormData, yearsOfExperience: Math.max(0, Number(e.target.value)) })} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Bank Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <Input label="Accountant Name" value={profileFormData.bankDetails?.accountName || ''} onChange={(e) => setProfileFormData({ ...profileFormData, bankDetails: { ...profileFormData.bankDetails, accountName: e.target.value } })} />
                                    <Input label="Account Number" value={profileFormData.bankDetails?.accountNumber || ''} onChange={(e) => setProfileFormData({ ...profileFormData, bankDetails: { ...profileFormData.bankDetails, accountNumber: e.target.value.replace(/\D/g, '') } })} />
                                    <Input label="Bank Name" value={profileFormData.bankDetails?.bankName || ''} onChange={(e) => setProfileFormData({ ...profileFormData, bankDetails: { ...profileFormData.bankDetails, bankName: e.target.value } })} />
                                    <Input label="IFSC Code" value={profileFormData.bankDetails?.ifscCode || ''} onChange={(e) => setProfileFormData({ ...profileFormData, bankDetails: { ...profileFormData.bankDetails, ifscCode: e.target.value.toUpperCase() } })} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Emergency Contact</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <Input label="Contact Name" value={profileFormData.emergencyContact.name} onChange={(e) => setProfileFormData({ ...profileFormData, emergencyContact: { ...profileFormData.emergencyContact, name: e.target.value } })} />
                                    <Input label="Relation" value={profileFormData.emergencyContact.relation} onChange={(e) => setProfileFormData({ ...profileFormData, emergencyContact: { ...profileFormData.emergencyContact, relation: e.target.value } })} />
                                    <Input label="Phone Number" maxLength={10} value={profileFormData.emergencyContact.phone} onChange={(e) => setProfileFormData({ ...profileFormData, emergencyContact: { ...profileFormData.emergencyContact, phone: e.target.value.replace(/\D/g, '') } })} />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border flex justify-end gap-3">
                                {hasProfile && (
                                    <Button variant="outline" onClick={handleCancelProfileEdit}>Cancel</Button>
                                )}
                                <Button variant="primary" isLoading={isCreatingProfile || isUpdatingProfile} onClick={handleProfileSubmit}>
                                    {hasProfile ? "Update Record" : "Register Employee"}
                                </Button>
                            </div>
                        </div>

                    ) : (

                        // READ-ONLY VIEW
                        // 🌟 FIX 3: Replaced `validProfile.dateOfJoining` with `validProfile?.dateOfJoining` just to be unbreakable.
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Professional Identity</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Employee No</p><p className="font-medium text-foreground">{validProfile?.employeeNo || '-'}</p></div>
                                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Designation</p><p className="font-medium text-foreground">{validProfile?.designation || '-'}</p></div>
                                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Department</p><p className="font-medium text-foreground">{validProfile?.department || '-'}</p></div>
                                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Employment Type</p><p className="font-medium text-foreground capitalize">{validProfile?.employmentType?.replace('_', ' ') || '-'}</p></div>
                                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Date of Joining</p><p className="font-medium text-foreground">{validProfile?.dateOfJoining ? new Date(validProfile.dateOfJoining).toLocaleDateString() : '-'}</p></div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Compliance & Background</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">National ID</p><p className="font-medium text-foreground">{validProfile?.nationalId || '-'}</p></div>
                                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">PF Number</p><p className="font-medium text-foreground">{validProfile?.pfNumber || '-'}</p></div>
                                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Experience</p><p className="font-medium text-foreground">{validProfile?.yearsOfExperience || 0} Years</p></div>
                                </div>
                            </div>

                            {/* 🌟 NEW: BANK DETAILS READ-ONLY */}
                            <div>
                                <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Bank Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Accountant Name</p><p className="font-medium text-foreground">{validProfile?.bankDetails?.accountName || '-'}</p></div>
                                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Account Number</p><p className="font-medium text-foreground">{validProfile?.bankDetails?.accountNumber || '-'}</p></div>
                                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Bank Name</p><p className="font-medium text-foreground">{validProfile?.bankDetails?.bankName || '-'}</p></div>
                                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">IFSC Code</p><p className="font-medium text-foreground">{validProfile?.bankDetails?.ifscCode || '-'}</p></div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-border">Emergency Contact</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Contact Name</p><p className="font-medium text-foreground">{validProfile?.emergencyContact?.name || '-'}</p></div>
                                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Relation</p><p className="font-medium text-foreground">{validProfile?.emergencyContact?.relation || '-'}</p></div>
                                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Phone Number</p><p className="font-medium text-foreground">{validProfile?.emergencyContact?.phone || '-'}</p></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}