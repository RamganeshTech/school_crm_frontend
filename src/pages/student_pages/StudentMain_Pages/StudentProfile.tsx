import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDeleteStudentDocument, useGetStudentById, useUpdateStudent, useUploadStudentFiles } from '../../../api_services/student_api/studentMainApi'; // Adjust paths as needed
import { Input, Label } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { useAuthData } from '../../../hooks/useAuthData';
import { toast } from '../../../shared/ui/ToastContext';
import { NO_IMAGE } from '../../../constants/constants';
import { useSubmitProfileUpdateRequest } from '../../../api_services/student_api/studentProfileUpdateApi';
import { useRoleCheck } from '../../../hooks/useRoleCheck';
import { ImageGallery } from '../../../shared/components/ImageGallery';
import StudentFeeInfo from './StudentFeeInfo';
import AdmissionFormCompo, { type AdmissionFormData } from '../../school/Admission_Pages/AdmissionFormCompo';
import { useUpdateAdmissionFormDetails } from '../../../api_services/schoolConfig_api/admissionFormApi';
import AttendanceAnalyticsCompo from '../../attendance/components/singlePerson_analytics/AttendanceAnalyticsCompo';

// ==========================================
// 1. EXACT TYPES (Mapped from Backend Schema)
// ==========================================
export interface PopulatedRef {
    _id: string;
    name: string;
}

export interface StudentData {
    _id: string;
    schoolId: string;
    srId?: string;
    newOld?: string;
    studentName: string;
    studentImage?: {
        type: string;
        key?: string;
        url?: string;
        originalName?: string;
        uploadedAt: string;
    };
    currentClassId?: PopulatedRef;
    currentSectionId?: PopulatedRef;
    isActive: boolean;
    clubs: string[];

    mandatory?: {
        gender?: string;
        dob?: string;
        educationNumber?: string;
        motherName?: string;
        fatherName?: string;
        guardianName?: string;
        aadhaarNumber?: string;
        aadhaarName?: string;
        address?: string;
        pincode?: string;
        mobileNumber?: string;
        alternateMobile?: string;
        email?: string;
        motherTongue?: string;
        socialCategory?: string;
        minorityGroup?: string;
        bpl?: string;
        aay?: string;
        ews?: string;
        cwsn?: string;
        impairments?: string;
        indian?: string;
        outOfSchool?: string;
        mainstreamedDate?: string;
        disabilityCert?: string;
        disabilityPercent?: string;
        bloodGroup?: string;
    };

    nonMandatory?: {
        facilitiesProvided?: string;
        facilitiesForCWSN?: string;
        screenedForSLD?: string;
        sldType?: string;
        screenedForASD?: string;
        screenedForADHD?: string;
        isGiftedOrTalented?: string;
        participatedInCompetitions?: string;
        participatedInActivities?: string;
        canHandleDigitalDevices?: string;
        heightInCm?: string;
        weightInKg?: string;
        distanceToSchool?: string;
        parentEducationLevel?: string;

        // Enrollment Details
        admissionNumber?: string;
        admissionDate?: string;
        rollNumber?: string;
        mediumOfInstruction?: string;
        languagesStudied?: string;
        academicStream?: string;
        subjectsStudied?: string;
        statusInPreviousYear?: string;
        gradeStudiedLastYear?: string;
        enrolledUnder?: string;
        previousResult?: string;
        marksObtainedPercentage?: string;
        daysAttendedLastYear?: string;
    };

    documents: {
        type: string;
        key?: string;
        url?: string;
        originalName?: string;
        uploadedAt: string;
    }[]
}

// ==========================================
// 2. HELPER COMPONENT (Moved Outside)
// ==========================================
interface EditableFieldProps {
    label: string;
    category: 'basic' | 'mandatory' | 'nonMandatory';
    field: string;
    type?: string;
    isSensitive?: boolean;
    // Pass these down so the component doesn't need to be inside the parent
    studentData: Record<string, any>;
    editFormData: Record<string, any>;
    isEditing: boolean;
    onChange: (category: 'basic' | 'mandatory' | 'nonMandatory', field: string, value: any) => void;
}


const EditableField: React.FC<EditableFieldProps> = ({
    label, category, field, type = 'text', isSensitive = false,
    studentData, editFormData, isEditing, onChange
}) => {



    const getValidation = () => {
        switch (field) {
            case "mobileNumber":
            case "alternateMobile":
                return {
                    maxLength: 10,
                    pattern: /^\d{10}$/, // Indian mobile
                    inputMode: "numeric" as const,
                };

            case "email":
                return {
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                };

            default:
                return {};
        }
    };


    const validation = getValidation();
    const maskSensitiveID = (idStr?: string) => (idStr && idStr.length >= 4) ? `********${idStr.slice(-4)}` : 'N/A';

    const value = category === 'basic' ? studentData[field] : studentData[category]?.[field];
    const editValue = category === 'basic' ? editFormData[field] : editFormData[category]?.[field];

    if (!isEditing) {

        let displayValue = value;


        if (value && value !== 'null') {
            if (type === 'date') {
                // Safely convert yyyy-mm-dd (or ISO string) to dd-mm-yyyy
                const d = new Date(value);
                if (!isNaN(d.getTime())) {
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    displayValue = `${day}-${month}-${year}`; // Formatted output!
                }
            } else if (isSensitive) {
                displayValue = maskSensitiveID(value);
            }
        }

        return (
            <div className="flex flex-col">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">{label}</span>
                <span className="text-sm font-semibold text-foreground truncate" title={displayValue}>
                    {value && value !== 'null' ? displayValue : <span className="text-muted/40 font-normal italic">N/A</span>}
                </span>
            </div>
        );
    }

    return (
        <Input
            label={label}
            type={type}
            value={editValue || ''}
            // onChange={(e) => onChange(category, field, e.target.value)}
            maxLength={validation.maxLength}
            inputMode={validation.inputMode}
            onChange={(e) => {
                const value = e.target.value;

                // Mobile validation
                if (
                    (field === "mobileNumber" || field === "alternateMobile") &&
                    !/^\d*$/.test(value)
                ) {
                    return; // only numbers
                }

                onChange(category, field, value);
            }}
        />
    );
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function StudentProfile({ studentId }: { studentId: string | undefined }) {
    const navigate = useNavigate();
    const location = useLocation()


    const { schoolId } = useAuthData()


    const { isParent, isAdmin, isCorrespondent, isPrincipal, isAccountant } = useRoleCheck()
    const canEdit = isAdmin || isCorrespondent || isParent || isAccountant
    const canDeleteDocument = isAdmin || isCorrespondent || isAccountant
    const canEditPendingRequest = isParent || isAdmin || isCorrespondent || isPrincipal
    const canShowOtherDetails = isParent


    // --- Queries & Mutations ---
    const { data: rawData, isLoading, isError } = useGetStudentById(studentId);
    const updateStudentMutation = useUpdateStudent();
    const updateStudentProfileRequestMutation = useSubmitProfileUpdateRequest();
    const student = rawData as StudentData | undefined;

    // --- State ---
    const [activeTab, setActiveTab] = useState<'mandatory' | 'nonMandatory' | "documents" | "feeInfo" | "admissionForm" | "attendance">('mandatory');
    const [isEditing, setIsEditing] = useState<boolean>(false);



    // Form State
    const [editForm, setEditForm] = useState<any>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);




    // const updateStatusMutation = useUpdateAdmissionFormStatus();
    const updateDetailsMutation = useUpdateAdmissionFormDetails();

    // Initialize form when entering edit mode
    useEffect(() => {
        if (student && isEditing) {
            setEditForm({
                newOld: student.newOld || "",
                studentName: student.studentName || '',
                mandatory: { ...student.mandatory },
                nonMandatory: { ...student.nonMandatory }
            });
            setImagePreview(student.studentImage?.url || null);
            setSelectedFile(null);
        }
    }, [student, isEditing]);




    // --- Handlers ---
    const handleFieldChange = (category: 'basic' | 'mandatory' | 'nonMandatory', field: string, value: any) => {
        setEditForm((prev: any) => {
            if (category === 'basic') return { ...prev, [field]: value };
            return {
                ...prev,
                [category]: { ...prev[category], [field]: value }
            };
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // const handleSave = async () => {
    //     try {

    //         if (editForm.mandatory?.mobileNumber &&
    //             !/^\d{10}$/.test(editForm.mandatory.mobileNumber)) {
    //             toast.error("Invalid mobile number");
    //             return;
    //         }

    //         if (editForm.mandatory?.alternateMobile &&
    //             !/^\d{10}$/.test(editForm.mandatory.alternateMobile)) {
    //             toast.error("Invalid alternate mobile");
    //             return;
    //         }

    //         if (editForm.mandatory?.email &&
    //             !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.mandatory.email)) {
    //             toast.error("Invalid email address");
    //             return;
    //         }


    //         const formData = new FormData();
    //         formData.append('studentName', editForm.studentName);
    //         formData.append('newOld', editForm.newOld);

    //         Object.keys(editForm.mandatory || {}).forEach(key => {
    //             if (editForm.mandatory[key] !== undefined && editForm.mandatory[key] !== null) {
    //                 formData.append(`mandatory[${key}]`, editForm.mandatory[key]);
    //             }
    //         });

    //         Object.keys(editForm.nonMandatory || {}).forEach(key => {
    //             if (editForm.nonMandatory[key] !== undefined && editForm.nonMandatory[key] !== null) {
    //                 formData.append(`nonMandatory[${key}]`, editForm.nonMandatory[key]);
    //             }
    //         });

    //         if (selectedFile) {
    //             formData.append('file', selectedFile);
    //         }

    //         await updateStudentMutation.mutateAsync({ id: studentId!, formData });
    //         toast.success("Updated Successfully!");

    //         setIsEditing(false);
    //     } catch (error: any) {
    //         toast.error(error.message || "Failed to update");

    //     }
    // };


    const [selectedFiles, setSelectedFiles] = useState<File[]>([])

    const uploadFilesMutation = useUploadStudentFiles();
    const deleteDocumentMutation = useDeleteStudentDocument(); // 🌟 Add this

    // 🌟 2. NEW: Upload Handler
    const handleFileUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId || selectedFiles.length === 0) return;

        const data = new FormData();
        selectedFiles.forEach((file) => {
            data.append('files', file); // Matches backend 'upload.array("files")'
        });

        try {
            await uploadFilesMutation.mutateAsync({
                studentId: studentId,
                formData: data
            });
            toast.success("Documents uploaded successfully!");
            setSelectedFiles([]); // Clear the selection after success
        } catch (error: any) {
            toast.error(error.message || "operation failed");
        }
    };

    // 🌟 1. Create the Delete Handler
    const handleDocumentDelete = async (imageOrId: string | { _id: string;[key: string]: any }) => {
        // Extract the ID safely whether the call passed a string directly (PDFs) or an object (ImageGallery)
        const documentId = typeof imageOrId === 'string' ? imageOrId : imageOrId._id;

        if (!documentId) return;
        if (!window.confirm("Are you sure you want to permanently delete this document?")) return;

        try {
            await deleteDocumentMutation.mutateAsync({
                studentId: studentId!,
                documentId: documentId
            });
            toast.success("Document deleted successfully.");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleSave = async () => {
        try {
            // --- 1. EXISTING VALIDATIONS ---
            if (editForm.mandatory?.mobileNumber && !/^\d{10}$/.test(editForm.mandatory.mobileNumber)) {
                toast.error("Invalid mobile number"); return;
            }
            if (editForm.mandatory?.alternateMobile && !/^\d{10}$/.test(editForm.mandatory.alternateMobile)) {
                toast.error("Invalid alternate mobile"); return;
            }
            if (editForm.mandatory?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.mandatory.email)) {
                toast.error("Invalid email address"); return;
            }

            // --- 2. PARENT LOGIC (Submit for Approval) ---
            if (isParent) {
                const changes: Record<string, string> = {};
                const previousValues: Record<string, string> = {};
                const section: Record<string, 'mandatory' | 'nonMandatory'> = {};

                // Helper function to safely compare old vs new values
                const compareAndTrack = (key: string, newValue: any, oldValue: any, category: 'mandatory' | 'nonMandatory') => {
                    const nVal = newValue === undefined || newValue === null ? '' : String(newValue).trim();
                    const oVal = oldValue === undefined || oldValue === null ? '' : String(oldValue).trim();

                    // If the value actually changed, record it
                    if (nVal !== oVal) {
                        changes[key] = nVal;
                        previousValues[key] = oVal;
                        section[key] = category;
                    }
                };

                // Compare Root Level (Assuming studentName belongs to mandatory)
                // Replace `originalStudent` with whatever your fetched data object is named
                compareAndTrack('studentName', editForm.studentName, student?.studentName, 'mandatory');

                // // Compare Mandatory Fields
                // Object.keys(editForm.mandatory || {}).forEach(key => {
                //     compareAndTrack(key, editForm.mandatory[key], student?.mandatory?.[key], 'mandatory');
                // });

                // // Compare Non-Mandatory Fields
                // Object.keys(editForm.nonMandatory || {}).forEach(key => {
                //     compareAndTrack(key, editForm.nonMandatory[key], student?.nonMandatory?.[key], 'nonMandatory');
                // });

                // --- Compare Mandatory Fields ---
                Object.keys(editForm.mandatory || {}).forEach(rawKey => {
                    // 🌟 THE FIX: Cast the generic string key to a specific key of your mandatory object structure
                    // const key = rawKey as keyof typeof editForm.mandatory;
                    const key = rawKey as Extract<keyof typeof editForm.mandatory, string>;

                    compareAndTrack(
                        key,
                        editForm.mandatory[key],
                        student?.mandatory?.[key as keyof typeof student.mandatory],
                        'mandatory'
                    );
                });

                // --- Compare Non-Mandatory Fields ---
                Object.keys(editForm.nonMandatory || {}).forEach(rawKey => {
                    // 🌟 THE FIX: Cast the generic string key to a specific key of your non-mandatory object structure
                    // const key = rawKey as keyof typeof editForm.nonMandatory;
                    const key = rawKey as Extract<keyof typeof editForm.nonMandatory, string>;

                    compareAndTrack(
                        key,
                        editForm.nonMandatory[key],
                        student?.nonMandatory?.[key as keyof typeof student.nonMandatory],
                        'nonMandatory'
                    );
                });

                // If nothing actually changed, don't hit the API
                if (Object.keys(changes).length === 0) {
                    toast.info("No changes detected.");
                    setIsEditing(false);
                    return;
                }

                // Submit the request
                await updateStudentProfileRequestMutation.mutateAsync({
                    studentId: studentId!,
                    schoolId: student?.schoolId || schoolId!, // Pass the schoolId
                    changes,
                    previousValues,
                    section
                });

                toast.success("Update request submitted for school approval!");
                setIsEditing(false);

            }

            // --- 3. ADMIN/STAFF LOGIC (Direct Update) ---
            else {
                const formData = new FormData();
                formData.append('studentName', editForm.studentName);
                formData.append('newOld', editForm.newOld);

                Object.keys(editForm.mandatory || {}).forEach(key => {
                    if (editForm.mandatory[key] !== undefined && editForm.mandatory[key] !== null) {
                        formData.append(`mandatory[${key}]`, editForm.mandatory[key]);
                    }
                });

                Object.keys(editForm.nonMandatory || {}).forEach(key => {
                    if (editForm.nonMandatory[key] !== undefined && editForm.nonMandatory[key] !== null) {
                        formData.append(`nonMandatory[${key}]`, editForm.nonMandatory[key]);
                    }
                });

                if (selectedFile) {
                    formData.append('file', selectedFile);
                }

                await updateStudentMutation.mutateAsync({ id: studentId!, formData });
                toast.success("Updated Successfully!");
                setIsEditing(false);
            }

        } catch (error: any) {
            toast.error(error.message || "Failed to process update");
        }
    };



    // 2. Create the submit handler
    const handleUpdateAdmissionForm = async (data: AdmissionFormData) => {
        if (!studentId || !schoolId) return;

        try {
            // Notice we are passing `studentId` here instead of `id`!
            await updateDetailsMutation.mutateAsync({
                studentId: studentId,
                schoolId: schoolId,
                formData: data
            });

            toast.success("Admission details updated successfully!");

            // Refresh the student profile to instantly show the saved data
            // if (refetchStudentProfile) {
            //     refetchStudentProfile(); 
            // }
        } catch (error: any) {
            toast.error(error.message || "Failed to update admission details");
            throw error; // Crucial: Throwing tells AdmissionFormCompo NOT to switch to 'view' mode if it fails
        }
    };




    const isChild = location.pathname.includes("pending-update") || location.pathname.includes("fee-transaction")
    if (isChild) {
        return <Outlet />
    }

    // --- Loading / Error States ---
    if (isLoading) return <div className="flex-1 flex items-center justify-center"><i className="fas fa-spinner fa-spin text-3xl text-primary"></i></div>;
    if (isError || !student) return <div className="flex-1 flex items-center justify-center text-danger">Failed to load student.</div>;






    // Helper object to make passing props to EditableField cleaner
    const fieldProps = {
        studentData: student as Record<string, any>,
        editFormData: editForm,
        isEditing: isEditing,
        onChange: handleFieldChange
    };

    return (
        <div className="w-full h-full flex flex-col max-w-[1400px] mx-auto bg-surface rounded-lg shadow-sm border border-border">

            {/* --- 1. COMPACT, UNIFIED TOP BAR --- */}
            <header className="shrink-0 px-4 py-3 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background/50">
                <div className="flex items-center gap-4">

                    <button
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-border/50 text-muted hover:text-primary transition-colors shrink-0"
                    >
                        <i className="fas fa-arrow-left"></i>
                    </button>

                    <div className="relative w-12 h-12 rounded-full border border-border bg-primary/5 flex items-center justify-center shrink-0 overflow-hidden group">
                        {isEditing ? (
                            <>
                                <img src={imagePreview || NO_IMAGE} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <i className="fas fa-camera text-white text-xs"></i>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                            </>
                        ) : student?.studentImage?.url ? (
                            <img src={student.studentImage.url} alt="Student" className="w-full h-full object-cover" />
                        ) : (
                            <i className="fas fa-user text-primary/50 text-xl"></i>
                        )}
                    </div>

                    <div className="flex flex-col justify-center">
                        <div className="flex flex-wrap items-center gap-3">
                            {isEditing ? (
                                <>
                                    {/* Name Input */}
                                    <Input
                                        value={editForm.studentName}
                                        onChange={(e) => handleFieldChange('basic', 'studentName', e.target.value)}
                                        wrapperClassName="w-48 !mb-0"
                                        className="!py-1"
                                    />


                                </>
                            ) : (
                                <h1 className="text-lg font-bold text-foreground leading-tight">{student.studentName}</h1>
                            )}

                            {/* {!isEditing && (
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded ${student.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                    {student.isActive ? 'Active' : 'Inactive'}
                                </span>
                            )} */}

                            {!isEditing && (
                                <div className="flex items-center gap-1.5">
                                    <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded ${student.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                        {student.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    {student?.newOld && (
                                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-primary/10 text-primary border border-primary/20">
                                            {student.newOld}
                                        </span>
                                    )}
                                </div>
                            )}

                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted font-medium mt-0.5">
                            <span><i className="fas fa-id-card text-muted/60 mr-1"></i>{student.srId || 'No ID'}</span>
                            <span><i className="fas fa-chalkboard-teacher text-muted/60 mr-1"></i>{student.currentClassId?.name || 'Class Unassigned'}</span>
                            <span><i className="fas fa-layer-group text-muted/60 mr-1"></i>{student.currentSectionId?.name || 'Section Unassigned'}</span>

                            {/* New/Old Radio Buttons */}
                            {(!isParent && isEditing) && <div className="flex items-center gap-3 bg-background border border-border px-3 py-1 rounded-lg h-[34px]">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground cursor-pointer">
                                    <input
                                        type="radio"
                                        name="newOld"
                                        value="new"
                                        checked={editForm.newOld === 'new'}
                                        onChange={(e) => handleFieldChange('basic', 'newOld', e.target.value)}
                                        className="accent-primary"
                                    />
                                    New
                                </label>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground cursor-pointer">
                                    <input
                                        type="radio"
                                        name="newOld"
                                        value="old"
                                        checked={editForm.newOld === 'old'}
                                        onChange={(e) => handleFieldChange('basic', 'newOld', e.target.value)}
                                        className="accent-primary"
                                    />
                                    Old
                                </label>
                            </div>}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {(isEditing) ? (
                        <>
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button variant="primary" size="sm" onClick={handleSave} isLoading={updateStudentMutation.isPending} leftIcon="fas fa-save">Save</Button>
                        </>
                    ) : (
                        <>
                            {canEdit && <Button variant="primary" size="sm" onClick={() => setIsEditing(true)} leftIcon="fas fa-edit">Edit</Button>}
                        </>
                    )}

                    {canEditPendingRequest && <Button variant="secondary" size="sm" onClick={() => navigate('pending-update')} leftIcon="fas fa-bell">Pending request</Button>}

                </div>
            </header>

            {/* --- 2. TWO TABS ONLY --- */}
            <div className="shrink-0 flex border-b border-border bg-background/20 px-4">
                <button
                    onClick={() => setActiveTab('mandatory')}
                    className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'mandatory' ? 'text-primary border-primary' : 'text-muted border-transparent hover:text-foreground'}`}
                >
                    Mandatory Info
                </button>
                <button
                    onClick={() => setActiveTab('nonMandatory')}
                    className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'nonMandatory' ? 'text-primary border-primary' : 'text-muted border-transparent hover:text-foreground'}`}
                >
                    Non-Mandatory Info
                </button>
                <button
                    onClick={() => setActiveTab('documents')}
                    className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${activeTab === 'documents' ? 'text-primary border-primary' : 'text-muted border-transparent hover:text-foreground'}`}
                >
                    <i className="fas fa-folder-open mr-2"></i> Documents
                </button>

                {canShowOtherDetails && <button
                    onClick={() => setActiveTab('feeInfo')}
                    className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'feeInfo' ? 'text-primary border-primary' : 'text-muted border-transparent hover:text-foreground'
                        }`}
                >
                    <i className="fas fa-wallet mr-2"></i> Fee Info
                </button>}

                <button
                    onClick={() => setActiveTab('admissionForm')}
                    className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'admissionForm' ? 'text-primary border-primary' : 'text-muted border-transparent hover:text-foreground'
                        }`}
                >
                    <i className="fas fa-user-graduate mr-2"></i> Admission Form
                </button>

                <button
                    onClick={() => setActiveTab('attendance')}
                    className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'attendance' ? 'text-primary border-primary' : 'text-muted border-transparent hover:text-foreground'
                        }`}
                >
                    <i className="fas fa-book-open mr-2"></i> Attendance
                </button>
            </div>

            {/* --- 3. FLAT, SCROLLABLE CONTENT AREA --- */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                {activeTab === 'mandatory' && (
                    <div className="space-y-8 animate-in fade-in duration-200">
                        <section>
                            <h3 className="text-sm font-bold text-primary border-b border-border pb-1.5 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <i className="fas fa-user-circle"></i> Demographics & Identification
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-5">

                                {isEditing ? (
                                    <div className="flex flex-col gap-1.5">
                                        <Label>Gender</Label>
                                        <div className="flex gap-3">
                                            {['Male', 'Female'].map(g => (
                                                <label key={g} className="flex items-center gap-1.5 text-sm text-foreground cursor-pointer">
                                                    <input type="radio" name="gender" value={g} checked={editForm.mandatory?.gender === g} onChange={(e) => handleFieldChange('mandatory', 'gender', e.target.value)} className="accent-primary" />
                                                    {g}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <EditableField label="Gender" category="mandatory" field="gender" {...fieldProps} />
                                )}

                                <EditableField label="Date of Birth" category="mandatory" field="dob" type="date" {...fieldProps} />

                                {isEditing ? (
                                    <div className="flex flex-col">
                                        <Label>Blood Group</Label>
                                        <SearchSelect
                                            // options={[{ label: 'A+', value: 'A+' }, { label: 'O+', value: 'O+' }, { label: 'B+', value: 'B+' }, { label: 'AB+', value: 'AB+' }]}
                                            options={[
                                                { label: 'A+', value: 'A+' },
                                                { label: 'A-', value: 'A-' },

                                                { label: 'B+', value: 'B+' },
                                                { label: 'B-', value: 'B-' },

                                                { label: 'AB+', value: 'AB+' },
                                                { label: 'AB-', value: 'AB-' },

                                                { label: 'O+', value: 'O+' },
                                                { label: 'O-', value: 'O-' },
                                            ]}
                                            value={editForm.mandatory?.bloodGroup || ''}
                                            onChange={(opt: any) => handleFieldChange('mandatory', 'bloodGroup', opt?.value)}
                                            placeholder="Select"
                                        />
                                    </div>
                                ) : (
                                    <EditableField label="Blood Group" category="mandatory" field="bloodGroup" {...fieldProps} />
                                )}

                                <EditableField label="Mother Tongue" category="mandatory" field="motherTongue" {...fieldProps} />
                                <EditableField label="Social Category" category="mandatory" field="socialCategory" {...fieldProps} />
                                <EditableField label="Minority Group" category="mandatory" field="minorityGroup" {...fieldProps} />
                                <EditableField label="Nationality" category="mandatory" field="indian" {...fieldProps} />
                                <EditableField label="Education No." category="mandatory" field="educationNumber" {...fieldProps} />
                                <EditableField label="Aadhaar Name" category="mandatory" field="aadhaarName" {...fieldProps} />
                                <EditableField label="Aadhaar No." category="mandatory" field="aadhaarNumber" {...fieldProps} />
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-primary border-b border-border pb-1.5 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <i className="fas fa-users"></i> Contact & Family Details
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-5">
                                <EditableField label="Father's Name" category="mandatory" field="fatherName" {...fieldProps} />
                                <EditableField label="Mother's Name" category="mandatory" field="motherName" {...fieldProps} />
                                <EditableField label="Guardian's Name" category="mandatory" field="guardianName" {...fieldProps} />
                                <EditableField label="Mobile Number" category="mandatory" field="mobileNumber" {...fieldProps} />
                                <EditableField label="Alternate Mobile" category="mandatory" field="alternateMobile" {...fieldProps} />
                                <EditableField label="Email Address" category="mandatory" field="email" type="email" {...fieldProps} />
                                <div className="col-span-2 xl:col-span-3">
                                    <EditableField label="Residential Address" category="mandatory" field="address" {...fieldProps} />
                                </div>
                                <EditableField label="Pincode" category="mandatory" field="pincode" {...fieldProps} />
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-primary border-b border-border pb-1.5 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <i className="fas fa-hand-holding-medical"></i> Social Status & CWSN (Medical)
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-5">
                                <EditableField label="BPL Status" category="mandatory" field="bpl" {...fieldProps} />
                                <EditableField label="AAY Status" category="mandatory" field="aay" {...fieldProps} />
                                <EditableField label="EWS Status" category="mandatory" field="ews" {...fieldProps} />
                                <EditableField label="Out of School" category="mandatory" field="outOfSchool" {...fieldProps} />
                                <EditableField label="Mainstreamed Date" category="mandatory" field="mainstreamedDate" type="date" {...fieldProps} />
                                <EditableField label="CWSN Status" category="mandatory" field="cwsn" {...fieldProps} />
                                <EditableField label="Impairments" category="mandatory" field="impairments" {...fieldProps} />
                                <EditableField label="Disability Cert." category="mandatory" field="disabilityCert" {...fieldProps} />
                                <EditableField label="Disability %" category="mandatory" field="disabilityPercent" {...fieldProps} />
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'nonMandatory' && (
                    <div className="space-y-8 animate-in fade-in duration-200">
                        <section>
                            <h3 className="text-sm font-bold text-primary border-b border-border pb-1.5 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <i className="fas fa-graduation-cap"></i> Enrollment & Academics
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-5">
                                <EditableField label="Admission No." category="nonMandatory" field="admissionNumber" {...fieldProps} />
                                <EditableField label="Admission Date" category="nonMandatory" field="admissionDate" type="date" {...fieldProps} />
                                <EditableField label="Roll Number" category="nonMandatory" field="rollNumber" {...fieldProps} />
                                <EditableField label="Enrolled Under" category="nonMandatory" field="enrolledUnder" {...fieldProps} />
                                <EditableField label="Instruction Medium" category="nonMandatory" field="mediumOfInstruction" {...fieldProps} />
                                <EditableField label="Academic Stream" category="nonMandatory" field="academicStream" {...fieldProps} />
                                <EditableField label="Languages Studied" category="nonMandatory" field="languagesStudied" {...fieldProps} />
                                <EditableField label="Subjects Studied" category="nonMandatory" field="subjectsStudied" {...fieldProps} />
                                <EditableField label="Grade Last Year" category="nonMandatory" field="gradeStudiedLastYear" {...fieldProps} />
                                <EditableField label="Status Last Year" category="nonMandatory" field="statusInPreviousYear" {...fieldProps} />
                                <EditableField label="Previous Result" category="nonMandatory" field="previousResult" {...fieldProps} />
                                <EditableField label="Marks (%)" category="nonMandatory" field="marksObtainedPercentage" {...fieldProps} />
                                <EditableField label="Days Attended" category="nonMandatory" field="daysAttendedLastYear" {...fieldProps} />
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-primary border-b border-border pb-1.5 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <i className="fas fa-clipboard-list"></i> UDISE & Health Screenings
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-5">
                                <EditableField label="Height (cm)" category="nonMandatory" field="heightInCm" type="number" {...fieldProps} />
                                <EditableField label="Weight (kg)" category="nonMandatory" field="weightInKg" type="number" {...fieldProps} />
                                <EditableField label="Distance to School" category="nonMandatory" field="distanceToSchool" {...fieldProps} />
                                <EditableField label="Parent Ed. Level" category="nonMandatory" field="parentEducationLevel" {...fieldProps} />
                                <EditableField label="Gifted/Talented" category="nonMandatory" field="isGiftedOrTalented" {...fieldProps} />
                                <EditableField label="Screened for SLD" category="nonMandatory" field="screenedForSLD" {...fieldProps} />
                                <EditableField label="SLD Type" category="nonMandatory" field="sldType" {...fieldProps} />
                                <EditableField label="Screened for ASD" category="nonMandatory" field="screenedForASD" {...fieldProps} />
                                <EditableField label="Screened for ADHD" category="nonMandatory" field="screenedForADHD" {...fieldProps} />
                                <EditableField label="Competitions" category="nonMandatory" field="participatedInCompetitions" {...fieldProps} />
                                <EditableField label="Activities" category="nonMandatory" field="participatedInActivities" {...fieldProps} />
                                <EditableField label="Digital Devices" category="nonMandatory" field="canHandleDigitalDevices" {...fieldProps} />
                                <div className="col-span-2">
                                    <EditableField label="Facilities Provided" category="nonMandatory" field="facilitiesProvided" {...fieldProps} />
                                </div>
                                <div className="col-span-2">
                                    <EditableField label="Facilities for CWSN" category="nonMandatory" field="facilitiesForCWSN" {...fieldProps} />
                                </div>
                            </div>
                        </section>
                    </div>
                )}


                {activeTab === 'documents' && (
                    <div className="space-y-8 animate-in fade-in duration-200">

                        {/* --- UPLOAD SECTION (Visible only to authorized editors) --- */}
                        {canEdit && (
                            <section>
                                <h3 className="text-sm font-bold text-primary border-b border-border pb-1.5 mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <i className="fas fa-cloud-upload-alt"></i> Upload New Documents
                                </h3>

                                <div className="bg-surface border-2 border-dashed border-border rounded-xl p-6 transition-colors hover:border-primary/50 relative">
                                    <input
                                        type="file"
                                        multiple
                                        id="doc-upload"
                                        className="hidden"
                                        onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                                    />

                                    <label htmlFor="doc-upload" className="flex flex-col items-center justify-center cursor-pointer text-center w-full">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                            <i className="fas fa-file-import text-xl text-primary"></i>
                                        </div>
                                        <span className="text-sm font-semibold text-foreground">Click to browse files</span>
                                        <span className="text-xs text-muted mt-1">Attach admission forms, fee receipts, TCs, or certificates.</span>
                                    </label>

                                    {/* Selected Files Preview & Submit */}
                                    {selectedFiles.length > 0 && (
                                        <div className="mt-6 pt-5 border-t border-border">
                                            <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Selected Files ({selectedFiles.length})</p>
                                            <ul className="flex flex-col gap-2 mb-4">
                                                {selectedFiles.map((f, idx) => (
                                                    <li key={idx} className="flex items-center gap-3 text-sm bg-background border border-border px-3 py-2 rounded-lg">
                                                        <i className={`fas ${f.type.includes('pdf') ? 'fa-file-pdf text-rose-500' : 'fa-image text-blue-500'}`}></i>
                                                        <span className="truncate flex-1 text-foreground font-medium">{f.name}</span>
                                                        <span className="text-xs text-muted">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="flex justify-end gap-3">
                                                <Button variant="outline" size="sm" onClick={() => setSelectedFiles([])}>Clear</Button>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={handleFileUploadSubmit}
                                                    isLoading={uploadFilesMutation.isPending}
                                                    leftIcon="fas fa-upload"
                                                >
                                                    Upload Files
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* --- DOCUMENT GALLERY SECTION --- */}
                        <section>
                            <h3 className="text-sm font-bold text-primary border-b border-border pb-1.5 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <i className="fas fa-archive"></i> Student Records & Files
                            </h3>

                            {(!student?.documents || student.documents.length === 0) ? (
                                <div className="flex flex-col items-center justify-center py-10 bg-background/50 rounded-xl border border-border border-dashed">
                                    <i className="fas fa-folder-open text-4xl text-muted/30 mb-3"></i>
                                    <p className="text-sm font-medium text-muted">No documents uploaded yet.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-8">

                                    {/* --- 1. IMAGE PROOFS GALLERY --- */}
                                    <div>
                                        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Image Records</p>
                                        <ImageGallery
                                            images={student.documents
                                                .filter((doc: any) => doc.type === "image")
                                                .map((proof: any) => ({
                                                    type: 'image',
                                                    key: proof._id,
                                                    url: proof.url,
                                                    originalName: proof.title || 'Student Photo Record',
                                                    uploadedAt: proof.uploadedAt || new Date()
                                                }))

                                            }
                                            // {...(canDeleteDocument ? { handleDelete: handleDocumentDelete } : {})}
                                            {...(canDeleteDocument ? {
                                                handleDelete: (imageObj: any) => handleDocumentDelete(imageObj.key || imageObj._id)
                                            } : {})}
                                            // Add your delete handler here if required: handleDelete={handleGalleryDelete}
                                            heightClass="h-32 sm:h-40"
                                            widthClass="w-full sm:w-48 md:w-52"
                                        />
                                    </div>


                                    {/* --- 2. PDF DOCUMENTS GRID --- */}
                                    {student.documents.filter((doc: any) => doc.type === "pdf").length > 0 && (
                                        <div>
                                            <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">PDF Documents</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {student.documents
                                                    .filter((doc: any) => doc.type === "pdf")
                                                    .map((doc: any, index: number) => (
                                                        <div
                                                            key={doc._id || index}
                                                            className="group flex items-center justify-between bg-surface border border-border rounded-xl p-3 hover:shadow-sm hover:border-rose-400 transition-all"
                                                        >
                                                            {/* Clickable Area to open PDF */}
                                                            <a
                                                                href={doc.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer"
                                                            >
                                                                <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                                                                    <i className="fas fa-file-pdf text-xl"></i>
                                                                </div>
                                                                <div className="flex flex-col min-w-0 pr-2">
                                                                    <span className="text-sm font-semibold text-foreground truncate" title={doc.title || "Uploaded Document"}>
                                                                        {doc?.originalName || `PDF Document ${index + 1}`}
                                                                    </span>
                                                                    <span className="text-[10px] text-muted">
                                                                        {doc?.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Record File'}
                                                                    </span>
                                                                </div>
                                                            </a>

                                                            {/* 🌟 New Action Buttons Area */}
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                {canDeleteDocument && (
                                                                    <button
                                                                        onClick={() => handleDocumentDelete(doc._id)}
                                                                        disabled={deleteDocumentMutation.isPending}
                                                                        className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-muted hover:bg-rose-50 hover:text-rose-500 transition-colors"
                                                                        title="Delete Document"
                                                                    >
                                                                        <i className="fas fa-trash-alt text-xs"></i>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )}

                                </div>
                            )}
                        </section>

                    </div>
                )}

                {activeTab === 'feeInfo' && (
                    <StudentFeeInfo
                        studentId={studentId!}
                    />
                )}


                {activeTab === 'admissionForm' && (
                    <AdmissionFormCompo
                        // ── 1. Display Mode & Context ──
                        mode="view"
                        studentId={studentId}

                        // ── 2. Linking Logic ──
                        // Only enable linking if the backend confirms this student has NO form attached yet
                        enableLinking={true}
                        // onLinkSuccess={() => refetchStudentProfile()}

                        // ── 3. Role-Based Editing ──
                        canEdit={isAdmin || isCorrespondent}

                        // ── 4. Form Actions ──
                        onSubmit={handleUpdateAdmissionForm}
                        isSubmitting={updateDetailsMutation.isPending} // 🌟 Now connected to your update mutation


                    // 🌟 Deliberately NOT passing onUpdateStatus here to hide the Approve/Reject buttons
                    />
                )}

                {/* 🌟 YOUR NEW TAB INJECTION */}
                {activeTab === 'attendance' && (
                    <AttendanceAnalyticsCompo studentId={studentId!} />
                )}


            </div>
        </div>
    );
}