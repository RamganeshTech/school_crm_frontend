import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { SearchSelect } from '../../shared/ui/SearchSelect';
// import { SideModal } from '../../shared/ui/SideModal';
import { toast } from '../../shared/ui/ToastContext';

// Import your Auth/User hooks (Adjust names if they differ in your authApi)
import { useAssignRole, useGetSingleUser, useUpdateUser } from '../../api_services/auth_api/authApi';
import { AUTH_CHECK_ROLES, type ValidUserRole } from '../../constants/constants';
import { useAddEmployeeDocuments, useCreateEmployeeProfile, useDeleteEmployeeDocument, useGetEmployeeProfileByUserId, useUpdateEmployeeProfile } from '../../api_services/auth_api/employeeProfileApi';
import { ImageGallery } from '../../shared/components/ImageGallery';


type TabType = 'profile' | 'details' | 'documents';

const INITIAL_PROFILE_STATE = {
    employeeNo: '', designation: '', department: '', employmentType: '',
    dateOfJoining: '', nationalId: '', pfNumber: '', yearsOfExperience: 0,
    currentAddress: '', permanentAddress: '',

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
    const { data: userDetails, isLoading: isUsersLoading } = useGetSingleUser(userId);

    console.log("userDetails", userDetails)
    // const userDetails = users?.find((u: any) => u._id === userId);

    const { data: rawEmployeeProfile, isLoading: isProfileLoading, refetch } = useGetEmployeeProfileByUserId(userId);

    // 🌟 FIX 1: Safely extract the profile. Handles cases where the API returns { ok: true, data: null }
    const validProfile = rawEmployeeProfile?.data !== undefined ? rawEmployeeProfile.data : rawEmployeeProfile;
    const hasProfile = !!validProfile && Object.keys(validProfile)?.length > 0;

    const { mutateAsync: updateUser, isPending: isUserUpdating } = useUpdateUser();
    const { mutateAsync: assignRole, } = useAssignRole(); // Add this line
    const { mutateAsync: createProfile, isPending: isCreatingProfile } = useCreateEmployeeProfile();
    const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateEmployeeProfile();
    const { mutateAsync: addDocuments, isPending: isUploadingDocs } = useAddEmployeeDocuments();
    const { mutateAsync: deleteDocument, isPending: isDeletingDoc } = useDeleteEmployeeDocument();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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
                // await createProfile({ ...profileFormData, userId: userId!, schoolId: schoolId! });

                const formData = new FormData();
                const payload = { ...profileFormData, userId: userId!, schoolId: schoolId! };

                Object.entries(payload).forEach(([key, value]) => {
                    if (value === undefined || value === null) return;
                    if (typeof value === "object") {
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, value as string);
                    }
                });

                selectedFiles.forEach((file) => formData.append("files", file));

                await createProfile(formData);
                toast.success("Employment record created!");
                setIsEditingProfile(false)
                refetch()
                // toast.success("Employment record created!");
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

    const handleDocumentUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error("Please select at least one file.");
            return;
        }
        try {
            await addDocuments({ userId: userId!, files: selectedFiles });
            toast.success("Documents uploaded successfully!");
            setSelectedFiles([]);
            refetch()
        } catch (error: any) {
            toast.error(error.message || "Failed to upload documents");
        }
    };


    const allDocs = validProfile?.documents || [];
    const imageDocs = allDocs?.filter((doc: any) => doc?.type === 'image');
    const pdfDocs = allDocs?.filter((doc: any) => doc.type === 'pdf');

    const galleryImages: any[] = imageDocs.map((doc: any) => ({
        type: 'image',
        key: doc.key,
        url: doc.url,
        originalName: doc.originalName || 'Document photo',
        uploadedAt: doc.uploadedAt || new Date(),
        _id: doc._id
    }));


    const handleDocumentDelete = async (documentId: string) => {
        try {
            await deleteDocument({ userId: userId!, documentId });
            toast.success("Document deleted.");
            refetch()

        } catch (error: any) {
            toast.error(error.message || "Failed to delete document");
        }
    };

      const handleGalleryDelete = (image: any) => {
        handleDocumentDelete(image._id);
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
                <button onClick={() => setActiveTab('profile')} className={` cursor-pointer pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}`}>
                    <i className="far fa-id-card mr-2"></i> Account Profile
                </button>
                <button onClick={() => setActiveTab('details')} className={` cursor-pointer pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}`}>
                    <i className="fas fa-briefcase mr-2"></i> HR & Employment Details
                </button>
                <button onClick={() => setActiveTab('documents')} className={` cursor-pointer pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}`}>
                    <i className="fas fa-folder-open mr-2"></i> Documents
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

                                    <Input label="Current Address" value={profileFormData.currentAddress} onChange={(e) => setProfileFormData({ ...profileFormData, currentAddress: e.target.value })} />
                                    <Input label="Permanent Address" value={profileFormData.permanentAddress} onChange={(e) => setProfileFormData({ ...profileFormData, permanentAddress: e.target.value })} />
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
                                    {hasProfile ? "Update Record" : "Save"}
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

                                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Current Address</p><p className="font-medium text-foreground">{validProfile?.currentAddress || '-'}</p></div>
                                    <div><p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Permanent Address</p><p className="font-medium text-foreground">{validProfile?.permanentAddress || '-'}</p></div>
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

            

            {activeTab === 'documents' && (
                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm max-w-7xl">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Uploaded Documents</h2>
                            <p className="text-xs text-muted mt-1">Resumes, certificates, ID proofs, and other employee records.</p>
                        </div>
                    </div>

                    {!hasProfile ? (
                        <div className="py-12 text-center text-muted text-sm">
                            <i className="fas fa-circle-info mr-2"></i>
                            Fill the employment details first before uploading documents.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Upload Zone */}
                            <label
                                htmlFor="document-upload-input"
                                className="group flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl px-6 py-10 cursor-pointer transition-colors hover:border-primary hover:bg-primary-soft/30"
                            >
                                <div className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center text-primary text-lg group-hover:scale-105 transition-transform">
                                    <i className="fas fa-cloud-arrow-up"></i>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-foreground">
                                        Click to upload
                                        {/* <span className="font-normal text-muted">or drag and drop</span> */}
                                    </p>
                                    <p className="text-xs text-muted mt-1">PDF or image files, multiple files supported</p>
                                </div>
                                <input
                                    id="document-upload-input"
                                    type="file"
                                    multiple
                                    accept=".pdf,image/*"
                                    onChange={(e) => setSelectedFiles(e.target.files ? Array.from(e.target.files) : [])}
                                    className="hidden"
                                />
                            </label>

                            {/* Selected files preview, shown only when files are staged but not yet uploaded */}
                            {selectedFiles.length > 0 && (
                                <div className="border border-border rounded-lg p-4 space-y-3 bg-mainBg/50">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-muted uppercase tracking-wider">
                                            {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                                        </p>
                                        <button
                                            onClick={() => setSelectedFiles([])}
                                            className="text-xs text-muted hover:text-red-500 transition-colors"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {selectedFiles.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between gap-2 bg-surface border border-border rounded-lg px-3 py-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <i className={`fas ${file.type.startsWith('image/') ? 'fa-image' : 'fa-file-pdf'} text-primary text-sm`}></i>
                                                    <span className="text-sm text-foreground truncate">{file.name}</span>
                                                    <span className="text-xs text-muted shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                                                    className="text-muted hover:text-red-500 text-xs shrink-0"
                                                >
                                                    <i className="fas fa-xmark"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end pt-1">
                                        <Button variant="primary" size="sm" isLoading={isUploadingDocs} onClick={handleDocumentUpload}>
                                            Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Existing documents list */}
                            <div>
                                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
                                    Saved Documents {validProfile?.documents?.length ? `(${validProfile.documents.length})` : ''}
                                </p>

                                {(!validProfile?.documents || validProfile.documents.length === 0) ? (
                                    <div className="flex flex-col items-center justify-center gap-2 py-12 border border-dashed border-border rounded-xl text-center">
                                        <div className="w-10 h-10 rounded-full bg-mainBg flex items-center justify-center text-muted">
                                            <i className="far fa-folder-open"></i>
                                        </div>
                                        <p className="text-sm font-medium text-foreground">No documents uploaded yet</p>
                                        <p className="text-xs text-muted">Files you upload above will appear here.</p>
                                    </div>
                                ) : (
                                    // <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    //     {validProfile.documents.map((doc: any) => (
                                    //         <div key={doc._id} className="group border border-border rounded-lg p-3 flex items-center justify-between gap-2 hover:border-primary/40 transition-colors">
                                    //             <a
                                    //                 href={doc.url}
                                    //                 target="_blank"
                                    //                 rel="noreferrer"
                                    //                 className="flex items-center gap-2 min-w-0 text-sm text-foreground hover:text-primary transition-colors"
                                    //             >
                                    //                 <span className="w-8 h-8 shrink-0 rounded-md bg-primary-soft flex items-center justify-center text-primary text-xs">
                                    //                     <i className={`fas ${doc.type === 'image' ? 'fa-image' : 'fa-file-pdf'}`}></i>
                                    //                 </span>
                                    //                 <span className="truncate font-medium">{doc.originalName}</span>
                                    //             </a>
                                    //             <button
                                    //                 disabled={isDeletingDoc}
                                    //                 onClick={() => handleDocumentDelete(doc._id)}
                                    //                 className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 text-xs transition-opacity shrink-0"
                                    //             >
                                    //                 <i className="fas fa-trash"></i>
                                    //             </button>
                                    //         </div>
                                    //     ))}
                                    // </div>

                                    <div className="space-y-5">
                                        {galleryImages.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-muted mb-2">Images</p>
                                                <ImageGallery
                                                    images={galleryImages}
                                                    {...(!isDeletingDoc ? { handleDelete: handleGalleryDelete } : {})}
                                                    heightClass="h-32 sm:h-40"
                                                    widthClass="w-full sm:w-48 md:w-52"
                                                />
                                            </div>
                                        )}

                                        {pdfDocs.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-muted mb-2">PDFs</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                    {pdfDocs.map((doc: any) => (
                                                        <div key={doc._id} className="group border border-border rounded-lg p-3 flex items-center justify-between gap-2 hover:border-primary/40 transition-colors">
                                                            <a
                                                                href={doc.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="flex items-center gap-2 min-w-0 text-sm text-foreground hover:text-primary transition-colors"
                                                            >
                                                                <span className="w-8 h-8 shrink-0 rounded-md bg-primary-soft flex items-center justify-center text-primary text-xs">
                                                                    <i className="fas fa-file-pdf"></i>
                                                                </span>
                                                                <span className="truncate font-medium">{doc.originalName}</span>
                                                            </a>
                                                            <button
                                                                disabled={isDeletingDoc}
                                                                onClick={() => handleDocumentDelete(doc._id)}
                                                                className=" text-muted hover:text-red-500 text-xs transition-opacity shrink-0"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}