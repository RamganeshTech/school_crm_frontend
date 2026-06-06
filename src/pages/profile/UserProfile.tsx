import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetSingleUser, useUpdateUser } from '../../api_services/auth_api/authApi';
import { useSelector } from 'react-redux';
import { Input } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
// import { useToast } from '../../shared/ui/ToastContext';
import type { RootState } from '../../features/store/store';
import { toast } from '../../shared/ui/ToastContext';

// --- Types based on your Mongoose Population ---
interface UploadedFile {
    url?: string;
    path?: string;
}

interface PopulatedEntity {
    _id: string;
    name: string;
}

interface School {
    _id: string;
    name: string;
    currentAcademicYear: string;
    address: string;
    phoneNo: string;
    logo?: UploadedFile;
}

interface Assignment {
    _id?: string;
    classId: PopulatedEntity;
    sectionId: PopulatedEntity;
}

interface Student {
    _id: string;
    studentName: string;
    studentImage?: UploadedFile;
    // Depending on your backend, these might be populated objects or just IDs. 
    // Handling them as objects with fallback to strings.
    currentClassId?: PopulatedEntity | string;
    currentSectionId?: PopulatedEntity | string;
}

export interface UserProfileData {
    _id: string;
    userName: string;
    email: string;
    phoneNo: string;
    role: string;
    schoolId?: School;
    assignments?: Assignment[];
    studentId?: Student | Student[]; // Can be one or multiple children
}


export default function UserProfile() {
    const { _id, role } = useSelector((state: RootState) => state.auth);

    const { data: user, isLoading, isError } = useGetSingleUser(_id!);
    const updateUserMutation = useUpdateUser();

    const [showAssignments, setShowAssignments] = useState(true);

    // const { showToast } = useToast();


    // --- Edit Mode State ---
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        phoneNo: ''
    });

    // ✅ THE FIX: Sync directly in the component body
    // This runs whenever 'user' or 'isEditing' changes, 
    // but it doesn't trigger the "cascading render" error.
    // if (user && (formData.email !== user.email || formData.userName !== user.userName)) {
    //     setFormData({
    //         userName: user.userName || '',
    //         email: user.email || '',
    //         phoneNo: user.phoneNo || ''
    //     });
    // }


    // Place this inside your component, below your state definitions:
    useEffect(() => {
        if (user) {
            setFormData({
                userName: user.userName || '',
                email: user.email || '',
                phoneNo: user.phoneNo || ''
            });
        }
    }, [user, isEditing]);

  

    if (isLoading) {
        return  <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
                <i className="fas fa-circle-notch fa-spin text-4xl text-primary opacity-50"></i>
                <p className="text-sm font-semibold text-muted">Loading...</p>
            </div>
    }

    if (isError || !user) {
        return <div className="p-4 text-red-500">Failed to load profile.</div>;
    }

    const isParent = role === 'parent';
    const isTeacher = role === "teacher"
    const hasAssignments = user?.assignments && user?.assignments?.length > 0;

    const students: Student[] = Array.isArray(user?.studentId)
        ? user?.studentId
        : user?.studentId
            ? [user?.studentId]
            : [];

    // --- Handlers ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, id, value } = e.target;
        const targetKey = name || id; // Fallback to id if name isn't found

        if (!targetKey) {
            toast.error("Input element is missing both 'name' and 'id' properties.");
            return;
        }
        setFormData(prev => ({ ...prev, [targetKey]: value }));
    };

    const handleSaveProfile = async () => {
        try {
            await updateUserMutation.mutateAsync({
                id: _id!,
                data: formData
            });
            setIsEditing(false);
            // showToast(`Updated Successfully!`, 'success');
            toast.success("Updated Successfully!");


        } catch (error: any) {
            toast.error(error.message || "Failed to Update");

        }
    };

    return (
        <div className="w-full max-w-full mx-auto !h-full max-h-full overflow-y-auto space-y-6 p-2">



            {/* 🛑 ADDED: Header Section with Avatar and Title */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-2 border-b border-border">
                <UserAvatar
                    userName={user?.userName || 'User'}
                    size="lg"
                    navigateTo="#" // Prevents routing since we are already on the profile
                />
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        User Profile
                    </h1>
                    <p className="text-sm text-muted mt-1">
                        Manage your personal details, view your school, and check assignments.
                    </p>
                </div>
            </div>


            {/* --- Main Profile & School Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Basic User Info Card */}
                <div className="lg:col-span-1 bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col items-center text-center relative">

                    {/* Edit Toggle Button */}
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="absolute cursor-pointer top-4 right-4 w-8 h-8 rounded-full bg-surface hover:bg-primary-soft text-muted hover:text-primary transition-colors flex items-center justify-center border border-border"
                            title="Edit Profile"
                        >
                            <i className="fas fa-pen text-sm"></i>
                        </button>
                    )}

                    <div className="w-24 h-24 rounded-full bg-primary-soft text-primary flex items-center justify-center text-3xl mb-4 shadow-sm">
                        <i className="fas fa-user"></i>
                    </div>

                    {!isEditing ? (
                        // --- VIEW MODE ---
                        <>
                            <h2 className="text-xl font-semibold text-foreground mb-1">{user?.userName}</h2>
                            <span className="px-3 py-1 bg-primary-soft text-primary text-sm font-medium rounded-full uppercase tracking-wide mb-4">
                                {user?.role}
                            </span>

                            <div className="w-full space-y-3 mt-2 text-left border-t border-border pt-4">
                                <div className="flex items-center gap-3 text-muted text-sm">
                                    <i className="fas fa-envelope w-4 text-center"></i>
                                    <span className="text-foreground truncate">{user.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted text-sm">
                                    <i className="fas fa-phone w-4 text-center"></i>
                                    <span className="text-foreground">{user.phoneNo || 'N/A'}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        // --- EDIT MODE ---
                        <div className="w-full flex flex-col gap-4 mt-2">
                            <span className="px-3 py-1 bg-primary-soft text-primary text-sm font-medium rounded-full uppercase tracking-wide mx-auto mb-2">
                                {user?.role}
                            </span>

                            <Input
                                id="userName"
                                label="Full Name"
                                name='userName'
                                leftIcon="fas fa-user"
                                value={formData.userName}
                                onChange={handleInputChange}
                                disabled={updateUserMutation.isPending}
                            />
                            <Input
                                id="email"
                                type="email"
                                name='email'
                                label="Email Address"
                                leftIcon="fas fa-envelope"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={updateUserMutation.isPending}
                            />
                            <Input
                                id="phoneNo"
                                type="tel"
                                name='phoneNo'
                                label="Phone Number"
                                leftIcon="fas fa-phone"
                                value={formData.phoneNo}
                                onChange={handleInputChange}
                                disabled={updateUserMutation.isPending}
                            />

                            <div className="flex items-center gap-3 mt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setIsEditing(false)}
                                    disabled={updateUserMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    className="flex-1"
                                    onClick={handleSaveProfile}
                                    isLoading={updateUserMutation.isPending}
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. School Information Card */}
                {user.schoolId && (
                    <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <i className="fas fa-school text-primary"></i>
                            School Details
                        </h3>

                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {user.schoolId.logo ? (
                                <img
                                    src={user.schoolId.logo.url || user.schoolId.logo.path}
                                    alt="School Logo"
                                    className="w-20 h-20 rounded-lg object-cover border border-border"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-lg bg-primary-soft flex items-center justify-center text-primary text-2xl shrink-0">
                                    <i className="fas fa-building"></i>
                                </div>
                            )}

                            <div className="flex-1 space-y-3 w-full">
                                <div>
                                    <p className="text-sm text-muted mb-1">Institution Name</p>
                                    <p className="font-medium text-foreground">{user.schoolId.name}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted mb-1">Academic Year</p>
                                        <p className="font-medium text-foreground">{user.schoolId.currentAcademicYear || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted mb-1">Contact Number</p>
                                        <p className="font-medium text-foreground">{user.schoolId.phoneNo || 'N/A'}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-muted mb-1">Address</p>
                                    <p className="text-sm text-foreground flex items-start gap-2">
                                        <i className="fas fa-map-marker-alt mt-1 text-muted"></i>
                                        {user.schoolId.address || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Conditional: Parent's Students Section --- */}
            {isParent && students.length > 0 && (
                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <i className="fas fa-child text-primary"></i>
                        Enrolled Students
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {students.map((student) => {
                            const className = typeof student.currentClassId === 'object' ? student.currentClassId?.name : 'N/A';
                            const sectionName = typeof student.currentSectionId === 'object' ? student.currentSectionId?.name : 'N/A';

                            return (
                                <div key={student._id} className="flex items-center gap-4 p-4 border border-border rounded-lg bg-background">
                                    {/* Student Avatar */}
                                    {student.studentImage ? (
                                        <img
                                            src={student.studentImage.url || student.studentImage.path}
                                            alt={student.studentName}
                                            className="w-14 h-14 rounded-full object-cover border border-border"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xl shrink-0">
                                            <i className="fas fa-user-graduate"></i>
                                        </div>
                                    )}

                                    {/* Student Details */}
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-medium text-foreground truncate">{student.studentName}</p>
                                        <div className="flex gap-2 mt-1">
                                            <span className="px-2 py-0.5 bg-surface border border-border text-xs text-muted rounded">
                                                Class: {className}
                                            </span>
                                            <span className="px-2 py-0.5 bg-surface border border-border text-xs text-muted rounded">
                                                Sec: {sectionName}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted mt-2 font-mono">ID: {student._id}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* --- Conditional: Teacher/Staff Assignments --- */}
            {isTeacher && hasAssignments && (
                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <i className="fas fa-chalkboard-teacher text-primary"></i>
                            Class Assignments
                        </h3>
                        <button
                            onClick={() => setShowAssignments(!showAssignments)}
                            className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary-soft rounded-lg transition-colors border border-transparent hover:border-border"
                        >
                            {showAssignments ? 'Hide Assignments' : 'View Assignments'}
                        </button>
                    </div>

                    {showAssignments && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border-t border-border pt-4">
                            {user.assignments!.map((assignment: any, index: number) => (
                                <div key={assignment._id || index} className="flex items-center justify-between p-3 border border-border rounded-lg bg-background">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-primary-soft flex items-center justify-center text-primary text-sm">
                                            <i className="fas fa-book"></i>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{assignment.classId?.name || 'Unknown Class'}</p>
                                            <p className="text-xs text-muted">Section {assignment.sectionId?.name || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}


interface UserAvatarProps {
    userName: string;
    navigateTo?: string;
    imageUrl?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
    userName,
    navigateTo = '/profile', // Default fallback path
    imageUrl,
    size = 'md'
}) => {
    // Map sizes to Tailwind classes for easy scaling
    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg'
    };

    // Safely grab the first letter
    const initial = userName ? userName.charAt(0).toUpperCase() : 'U';

    // Inner content (Image or Initial)
    const content = imageUrl ? (
        <img
            src={imageUrl}
            alt={userName}
            className="w-full h-full object-cover rounded-full"
        />
    ) : (
        <span>{initial}</span>
    );

    return (
        <Link
            to={navigateTo}
            className={`
        ${sizeClasses[size]}
        flex items-center justify-center shrink-0 rounded-full 
        bg-primary-soft text-primary font-semibold
        border border-border shadow-sm
        hover:ring-2 hover:ring-primary/40 transition-all duration-200
      `}
            title={`Go to ${userName}'s Profile`}
        >
            {content}
        </Link>
    );
};