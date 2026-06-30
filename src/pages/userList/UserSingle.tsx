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
import {
    // useAddEmployeeDocuments, useCreateEmployeeProfile, useDeleteEmployeeDocument,
    useGetEmployeeProfileByUserId,
    //  useUpdateEmployeeProfile 
} from '../../api_services/auth_api/employeeProfileApi';
// import { ImageGallery } from '../../shared/components/ImageGallery';
// import { HrDetailsTab } from './user_components/HrDetailsTab';
// import { DocumentsTab } from './user_components/DocumentsTab';
import { EMPLOYEE_PROFILE_TABS, UserProfileComponents } from './user_components/UserProfileComponentsGroup';


// type TabType = 'profile' | 'details' | 'documents';
export type EmployeeProfileTabType = 'profile' | 'professional' | 'contact' | 'bank' | 'education' | 'salary' | 'documents';


// const INITIAL_PROFILE_STATE = {
//     employeeNo: '', designation: '', department: '', employmentType: '',
//     dateOfJoining: '', nationalId: '', pfNumber: '', yearsOfExperience: 0,
//     currentAddress: '', permanentAddress: '',

//     emergencyContact: { name: '', relation: '', phone: '' },
//     bankDetails: { accountName: '', accountNumber: '', bankName: '', ifscCode: '' }
// };

export default function UserSingle() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { schoolId } = useAuthData();

    const [activeTab, setActiveTab] = useState<EmployeeProfileTabType>('professional');
    const [isEditingUser, setIsEditingUser] = useState(false);
    // const [isEditingProfile, setIsEditingProfile] = useState(false);

    const [userFormData, setUserFormData] = useState<any>({});
    // const [profileFormData, setProfileFormData] = useState<any>(INITIAL_PROFILE_STATE);

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
    // const { mutateAsync: createProfile, isPending: isCreatingProfile } = useCreateEmployeeProfile();
    // const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateEmployeeProfile();
    // const { mutateAsync: addDocuments, isPending: isUploadingDocs } = useAddEmployeeDocuments();
    // const { mutateAsync: deleteDocument, isPending: isDeletingDoc } = useDeleteEmployeeDocument();
    // const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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
    // useEffect(() => {
    //     if (hasProfile) {
    //         setProfileFormData({
    //             ...validProfile,
    //             dateOfJoining: validProfile.dateOfJoining ? new Date(validProfile.dateOfJoining).toISOString().split('T')[0] : '',
    //             emergencyContact: validProfile.emergencyContact || INITIAL_PROFILE_STATE.emergencyContact,
    //             bankDetails: validProfile.bankDetails || INITIAL_PROFILE_STATE.bankDetails,
    //                         educationDetails: validProfile.educationDetails?.length ? validProfile.educationDetails : []

    //         });
    //         setIsEditingProfile(false);
    //     } else {
    //         setProfileFormData(INITIAL_PROFILE_STATE);
    //         setIsEditingProfile(true);
    //     }
    // }, [validProfile, hasProfile]);


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

    // const handleProfileSubmit = async () => {
    //     try {
    //         if (hasProfile) {
    //             await updateProfile({ userId: userId!, updateData: profileFormData });
    //             toast.success("Employment record updated!");
    //             setIsEditingProfile(false);
    //         } else {
    //             // await createProfile({ ...profileFormData, userId: userId!, schoolId: schoolId! });

    //             const formData = new FormData();
    //             const payload = { ...profileFormData, userId: userId!, schoolId: schoolId! };

    //             Object.entries(payload).forEach(([key, value]) => {
    //                 if (value === undefined || value === null) return;
    //                 if (typeof value === "object") {
    //                     formData.append(key, JSON.stringify(value));
    //                 } else {
    //                     formData.append(key, value as string);
    //                 }
    //             });

    //             selectedFiles.forEach((file) => formData.append("files", file));

    //             await createProfile(formData);
    //             toast.success("Employment record created!");
    //             setIsEditingProfile(false)
    //             refetch()
    //             // toast.success("Employment record created!");
    //         }
    //     } catch (error: any) {
    //         toast.error(error.message || "Failed to save employment record");
    //     }
    // };

    // const handleCancelProfileEdit = () => {
    //     setProfileFormData({
    //         ...validProfile,
    //         dateOfJoining: validProfile?.dateOfJoining ? new Date(validProfile.dateOfJoining).toISOString().split('T')[0] : '',
    //         emergencyContact: validProfile?.emergencyContact || INITIAL_PROFILE_STATE.emergencyContact
    //     });
    //     setIsEditingProfile(false);
    // };

    // const handleDocumentUpload = async () => {
    //     if (selectedFiles.length === 0) {
    //         toast.error("Please select at least one file.");
    //         return;
    //     }
    //     try {
    //         await addDocuments({ userId: userId!, files: selectedFiles });
    //         toast.success("Documents uploaded successfully!");
    //         setSelectedFiles([]);
    //         refetch()
    //     } catch (error: any) {
    //         toast.error(error.message || "Failed to upload documents");
    //     }
    // };


    // const allDocs = validProfile?.documents || [];
    // const imageDocs = allDocs?.filter((doc: any) => doc?.type === 'image');
    // const pdfDocs = allDocs?.filter((doc: any) => doc.type === 'pdf');

    // const galleryImages: any[] = imageDocs.map((doc: any) => ({
    //     type: 'image',
    //     key: doc.key,
    //     url: doc.url,
    //     originalName: doc.originalName || 'Document photo',
    //     uploadedAt: doc.uploadedAt || new Date(),
    //     _id: doc._id
    // }));


    // const handleDocumentDelete = async (documentId: string) => {
    //     try {
    //         await deleteDocument({ userId: userId!, documentId });
    //         toast.success("Document deleted.");
    //         refetch()

    //     } catch (error: any) {
    //         toast.error(error.message || "Failed to delete document");
    //     }
    // };

    // const handleGalleryDelete = (image: any) => {
    //     handleDocumentDelete(image._id);
    // };

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
                <button onClick={() => setActiveTab('profile')} className={`cursor-pointer pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}`}>
                    <i className="far fa-id-card mr-2"></i> Account Profile
                </button>

                {EMPLOYEE_PROFILE_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`cursor-pointer pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}`}
                    >
                        <i className={`${tab.icon} mr-1.5`}></i>{tab.label}
                    </button>
                ))}

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



            {/* {activeTab === 'details' && (
                <HrDetailsTab
                    userId={userId!}
                    schoolId={schoolId!}
                    validProfile={validProfile}
                    hasProfile={hasProfile}
                    isLoading={isProfileLoading}
                    refetch={refetch}
                />
            )}

            {activeTab === 'documents' && (
                <DocumentsTab
                    userId={userId!}
                    hasProfile={hasProfile}
                    documents={validProfile?.documents || []}
                    refetch={refetch}
                />
            )} */}


            <UserProfileComponents
                activeTab={activeTab}
                userId={userId!}
                schoolId={schoolId!}
                validProfile={validProfile}
                hasProfile={hasProfile}
                isLoading={isProfileLoading}
                refetch={refetch}
            />
        </div>
    );
}