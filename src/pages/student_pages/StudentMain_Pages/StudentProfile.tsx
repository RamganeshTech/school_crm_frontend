// import  { useEffect, useRef, useState } from 'react';
// import { useGetStudentById, useUpdateStudent } from '../../../api_services/student_api/studentMainApi';
// import { Input, Label } from '../../../shared/ui/Input';
// import { Button } from '../../../shared/ui/Button';
// import { SearchSelect } from '../../../shared/ui/SearchSelect';
// // import { useGetStudentById } from '../../api_services/studentApi'; // Adjust path

// // --- Types (Mapped from your Backend Schema) ---
// // ==========================================
// // 1. EXACT TYPES (Mapped from Backend Schema)
// // ==========================================
// export interface PopulatedRef {
//     _id: string;
//     name: string;
// }

// export interface StudentData {
//     _id: string;
//     schoolId: string;
//     srId?: string;
//     newOld?: string;
//     studentName: string;
//     studentImage?: {
//         type: string;
//         key?: string;
//         url?: string;
//         originalName?: string;
//         uploadedAt: string;
//     };
//     currentClassId?: PopulatedRef;
//     currentSectionId?: PopulatedRef;
//     isActive: boolean;
//     clubs: string[]; // Assuming array of IDs

//     mandatory?: {
//         gender?: string;
//         dob?: string;
//         educationNumber?: string;
//         motherName?: string;
//         fatherName?: string;
//         guardianName?: string;
//         aadhaarNumber?: string;
//         aadhaarName?: string;
//         address?: string;
//         pincode?: string;
//         mobileNumber?: string;
//         alternateMobile?: string;
//         email?: string;
//         motherTongue?: string;
//         socialCategory?: string;
//         minorityGroup?: string;
//         bpl?: string;
//         aay?: string;
//         ews?: string;
//         cwsn?: string;
//         impairments?: string;
//         indian?: string;
//         outOfSchool?: string;
//         mainstreamedDate?: string;
//         disabilityCert?: string;
//         disabilityPercent?: string;
//         bloodGroup?: string;
//     };

//     nonMandatory?: {
//         facilitiesProvided?: string;
//         facilitiesForCWSN?: string;
//         screenedForSLD?: string;
//         sldType?: string;
//         screenedForASD?: string;
//         screenedForADHD?: string;
//         isGiftedOrTalented?: string;
//         participatedInCompetitions?: string;
//         participatedInActivities?: string;
//         canHandleDigitalDevices?: string;
//         heightInCm?: string;
//         weightInKg?: string;
//         distanceToSchool?: string;
//         parentEducationLevel?: string;

//         // Enrollment Details
//         admissionNumber?: string;
//         admissionDate?: string;
//         rollNumber?: string;
//         mediumOfInstruction?: string;
//         languagesStudied?: string;
//         academicStream?: string;
//         subjectsStudied?: string;
//         statusInPreviousYear?: string;
//         gradeStudiedLastYear?: string;
//         enrolledUnder?: string;
//         previousResult?: string;
//         marksObtainedPercentage?: string;
//         daysAttendedLastYear?: string;
//     };
// }

// interface EditableFieldProps {
//         label: string;
//         category: 'basic' | 'mandatory' | 'nonMandatory';
//         field: string;
//         type?: string;
//         isSensitive?: boolean;
//         icon?: string;
//     }

// export default function StudentProfile({ studentId }: { studentId: string | undefined }) {
//     // --- Queries & Mutations ---
//     const { data: rawData, isLoading, isError } = useGetStudentById(studentId);
//     const updateStudentMutation = useUpdateStudent();
//     const student = rawData as StudentData | undefined;

//     // --- State ---
//     const [activeTab, setActiveTab] = useState<'mandatory' | 'academic' | 'health'>('mandatory');
//     const [isEditing, setIsEditing] = useState(false);

//     // Form State
//     const [editForm, setEditForm] = useState<any>({});
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [imagePreview, setImagePreview] = useState<string | null>(null);
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     // Initialize form when entering edit mode
//     useEffect(() => {
//         if (student && isEditing) {
//             setEditForm({
//                 studentName: student.studentName || '',
//                 mandatory: { ...student.mandatory },
//                 nonMandatory: { ...student.nonMandatory }
//             });
//             setImagePreview(student.studentImage?.url || null);
//             setSelectedFile(null);
//         }
//     }, [student, isEditing]);

//     // --- Handlers ---
//     const handleFieldChange = (category: 'basic' | 'mandatory' | 'nonMandatory', field: string, value: any) => {
//         setEditForm((prev: any) => {
//             if (category === 'basic') return { ...prev, [field]: value };
//             return {
//                 ...prev,
//                 [category]: { ...prev[category], [field]: value }
//             };
//         });
//     };

//     const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             setSelectedFile(file);
//             setImagePreview(URL.createObjectURL(file));
//         }
//     };

//     const handleSave = async () => {
//         try {
//             const formData = new FormData();
//             formData.append('studentName', editForm.studentName);

//             // Append Mandatory Fields (Backend depends on format, using nested object notation standard)
//             Object.keys(editForm.mandatory || {}).forEach(key => {
//                 if (editForm.mandatory[key] !== undefined && editForm.mandatory[key] !== null) {
//                     formData.append(`mandatory[${key}]`, editForm.mandatory[key]);
//                 }
//             });

//             // Append Non-Mandatory Fields
//             Object.keys(editForm.nonMandatory || {}).forEach(key => {
//                 if (editForm.nonMandatory[key] !== undefined && editForm.nonMandatory[key] !== null) {
//                     formData.append(`nonMandatory[${key}]`, editForm.nonMandatory[key]);
//                 }
//             });

//             // Append File if new image selected
//             if (selectedFile) {
//                 formData.append('file', selectedFile);
//             }

//             await updateStudentMutation.mutateAsync({ id: studentId!, formData });
//             setIsEditing(false);
//         } catch (error) {
//             console.error("Failed to save:", error);
//             // Add toast error here if you have one
//         }
//     };

//     // --- Loading / Error States ---
//     if (isLoading) return <div className="flex-1 flex items-center justify-center"><i className="fas fa-spinner fa-spin text-3xl text-primary"></i></div>;
//     if (isError || !student) return <div className="flex-1 flex items-center justify-center text-danger">Failed to load student.</div>;

//     // --- Render Helpers ---
//     const maskSensitiveID = (idStr?: string) => (idStr && idStr.length >= 4) ? `********${idStr.slice(-4)}` : 'N/A';

//     // A helper to seamlessly switch between View text and Edit Input
//     const EditableField = ({ label, category, field, type = 'text', isSensitive = false, icon = '' }: EditableFieldProps) => {

//         // 3. Safely cast to a Record so TypeScript allows dynamic string indexing
//         const safeStudent = student as Record<string, any>;
//         const safeEditForm = editForm as Record<string, any>;

//         const value = category === 'basic' ? safeStudent[field] : safeStudent[category]?.[field];
//         const editValue = category === 'basic' ? safeEditForm[field] : safeEditForm[category]?.[field];

//         if (!isEditing) {
//             return (
//                 <div className="flex flex-col border-b border-border/40 pb-2">
//                     <span className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
//                         {icon && <i className={`${icon} opacity-70`}></i>} {label}
//                     </span>
//                     <span className="text-sm font-medium text-foreground">
//                         {value && value !== 'null' ? (isSensitive ? maskSensitiveID(value) : value) : <span className="text-muted/50 italic">N/A</span>}
//                     </span>
//                 </div>
//             );
//         }

//         return (
//             <Input 
//                 label={label} 
//                 type={type} 
//                 value={editValue || ''} 
//                 onChange={(e) => handleFieldChange(category, field, e.target.value)} 
//             />
//         );
//     };

//     return (
//         // Flex-col with h-full ensures the container manages its own height
//         <div className="w-full h-full flex flex-col max-w-7xl mx-auto bg-surface border border-border rounded-xl overflow-hidden shadow-sm">

//             {/* --- COMPACT TOP BANNER --- */}
//             <div className="shrink-0 p-4 border-b border-border flex flex-col md:flex-row items-center justify-between gap-4 bg-background/50">
//                 <div className="flex items-center gap-4">
//                     {/* Avatar with Edit Overlay */}
//                     <div className="relative w-16 h-16 rounded-full border-2 border-surface shadow-sm bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden group">
//                         {isEditing ? (
//                             <>
//                                 <img src={imagePreview || 'https://via.placeholder.com/150'} alt="Preview" className="w-full h-full object-cover" />
//                                 <div 
//                                     className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
//                                     onClick={() => fileInputRef.current?.click()}
//                                 >
//                                     <i className="fas fa-camera text-white text-xl"></i>
//                                 </div>
//                                 <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
//                             </>
//                         ) : student.studentImage?.url ? (
//                             <img src={student.studentImage.url} alt="Student" className="w-full h-full object-cover" />
//                         ) : (
//                             <i className="fas fa-user-graduate text-2xl text-primary/50"></i>
//                         )}
//                     </div>

//                     {/* Core Info */}
//                     <div>
//                         <div className="flex items-center gap-2">
//                             {isEditing ? (
//                                 <Input value={editForm.studentName} onChange={(e) => handleFieldChange('basic', 'studentName', e.target.value)} wrapperClassName="w-48" />
//                             ) : (
//                                 <h1 className="text-xl font-bold text-foreground">{student.studentName}</h1>
//                             )}
//                             {!isEditing && (
//                                 <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${student.isActive ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
//                                     {student.isActive ? 'Active' : 'Inactive'}
//                                 </span>
//                             )}
//                         </div>
//                         <div className="flex flex-wrap gap-3 text-xs text-muted mt-1.5 font-medium">
//                             <span><i className="fas fa-id-card mr-1"></i>SR ID: {student.srId || 'N/A'}</span>
//                             <span><i className="fas fa-chalkboard-teacher mr-1"></i>Class: {student.currentClassId?.name || 'N/A'}</span>
//                             <span><i className="fas fa-layer-group mr-1"></i>Sec: {student.currentSectionId?.name || 'N/A'}</span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Edit / Save Actions */}
//                 <div className="flex gap-2">
//                     {isEditing ? (
//                         <>
//                             <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
//                             <Button variant="primary" size="sm" onClick={handleSave} isLoading={updateStudentMutation.isPending} leftIcon="fas fa-save">Save Changes</Button>
//                         </>
//                     ) : (
//                         <Button variant="primary" size="sm" onClick={() => setIsEditing(true)} leftIcon="fas fa-edit">Edit Profile</Button>
//                     )}
//                 </div>
//             </div>

//             {/* --- TAB NAVIGATION --- */}
//             <div className="shrink-0 flex border-b border-border px-2 pt-2 overflow-x-auto custom-scrollbar bg-surface">
//                 <button onClick={() => setActiveTab('mandatory')} className={`px-4 pb-2 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'mandatory' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-foreground'}`}>
//                     Personal & Parent
//                 </button>
//                 <button onClick={() => setActiveTab('academic')} className={`px-4 pb-2 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'academic' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-foreground'}`}>
//                     Enrollment
//                 </button>
//                 <button onClick={() => setActiveTab('health')} className={`px-4 pb-2 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'health' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-foreground'}`}>
//                     Health & UDISE
//                 </button>
//             </div>

//             {/* --- SCROLLABLE CONTENT AREA --- */}
//             <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-surface">

//                 {/* --- TAB 1: MANDATORY --- */}
//                 {activeTab === 'mandatory' && (
//                     <div className="space-y-8 animate-in fade-in duration-200">
//                         <div>
//                             <h3 className="text-sm font-bold text-foreground mb-4 pb-1 border-b border-border/50">Demographics</h3>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">

//                                 {/* Custom Gender Radio Buttons in Edit Mode */}
//                                 {isEditing ? (
//                                     <div className="flex flex-col gap-1.5">
//                                         <Label>Gender</Label>
//                                         <div className="flex gap-4 mt-1">
//                                             {['Male', 'Female', 'Other'].map(g => (
//                                                 <label key={g} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
//                                                     <input type="radio" name="gender" value={g} checked={editForm.mandatory?.gender === g} onChange={(e) => handleFieldChange('mandatory', 'gender', e.target.value)} className="accent-primary" />
//                                                     {g}
//                                                 </label>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     <EditableField label="Gender" category="mandatory" field="gender" />
//                                 )}

//                                 <EditableField label="Date of Birth" category="mandatory" field="dob" type="date" />

//                                 {/* Custom Blood Group Select in Edit Mode */}
//                                 {isEditing ? (
//                                     <div className="flex flex-col gap-1.5">
//                                         <Label>Blood Group</Label>
//                                         <SearchSelect 
//                                             options={[ {label: 'A+', value: 'A+'}, {label: 'O+', value: 'O+'}, {label: 'B+', value: 'B+'}, {label: 'AB+', value: 'AB+'} ]} 
//                                             value={editForm.mandatory?.bloodGroup || ''} 
//                                             onChange={(opt: any) => handleFieldChange('mandatory', 'bloodGroup', opt?.value)} 
//                                             placeholder="Select Blood Group" 
//                                         />
//                                     </div>
//                                 ) : (
//                                     <EditableField label="Blood Group" category="mandatory" field="bloodGroup" />
//                                 )}

//                                 <EditableField label="Mother Tongue" category="mandatory" field="motherTongue" />
//                                 <EditableField label="Social Category" category="mandatory" field="socialCategory" />
//                                 <EditableField label="Minority Group" category="mandatory" field="minorityGroup" />
//                                 <EditableField label="Education No." category="mandatory" field="educationNumber" />
//                                 <EditableField label="Aadhaar No." category="mandatory" field="aadhaarNumber" isSensitive={true} icon="fas fa-lock" /> 
//                             </div>
//                         </div>

//                         <div>
//                             <h3 className="text-sm font-bold text-foreground mb-4 pb-1 border-b border-border/50">Contact & Family</h3>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
//                                 <EditableField label="Father's Name" category="mandatory" field="fatherName" />
//                                 <EditableField label="Mother's Name" category="mandatory" field="motherName" />
//                                 <EditableField label="Guardian's Name" category="mandatory" field="guardianName" />
//                                 <EditableField label="Mobile Number" category="mandatory" field="mobileNumber" icon="fas fa-phone" />
//                                 <EditableField label="Email Address" category="mandatory" field="email" type="email" icon="fas fa-envelope" />
//                             </div>
//                             <div className="mt-4">
//                                 <EditableField label="Residential Address" category="mandatory" field="address" icon="fas fa-map-marker-alt" />
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* --- TAB 2: ACADEMIC --- */}
//                 {activeTab === 'academic' && (
//                     <div className="space-y-8 animate-in fade-in duration-200">
//                         <div>
//                             <h3 className="text-sm font-bold text-foreground mb-4 pb-1 border-b border-border/50">Admission Details</h3>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
//                                 <EditableField label="Admission No." category="nonMandatory" field="admissionNumber" />
//                                 <EditableField label="Admission Date" category="nonMandatory" field="admissionDate" type="date" />
//                                 <EditableField label="Roll Number" category="nonMandatory" field="rollNumber" />
//                                 <EditableField label="Enrolled Under" category="nonMandatory" field="enrolledUnder" />
//                                 <EditableField label="Medium of Instruction" category="nonMandatory" field="mediumOfInstruction" />
//                                 <EditableField label="Academic Stream" category="nonMandatory" field="academicStream" />
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* --- TAB 3: HEALTH & UDISE --- */}
//                 {activeTab === 'health' && (
//                     <div className="space-y-8 animate-in fade-in duration-200">
//                         <div>
//                             <h3 className="text-sm font-bold text-foreground mb-4 pb-1 border-b border-border/50">Health Info</h3>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
//                                 <EditableField label="Height (cm)" category="nonMandatory" field="heightInCm" type="number" />
//                                 <EditableField label="Weight (kg)" category="nonMandatory" field="weightInKg" type="number" />
//                                 <EditableField label="CWSN Status" category="mandatory" field="cwsn" />
//                                 <EditableField label="Impairments" category="mandatory" field="impairments" />
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }


import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetStudentById, useUpdateStudent } from '../../../api_services/student_api/studentMainApi'; // Adjust paths as needed
import { Input, Label } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { useAuthData } from '../../../hooks/useAuthData';

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

    const maskSensitiveID = (idStr?: string) => (idStr && idStr.length >= 4) ? `********${idStr.slice(-4)}` : 'N/A';

    const value = category === 'basic' ? studentData[field] : studentData[category]?.[field];
    const editValue = category === 'basic' ? editFormData[field] : editFormData[category]?.[field];

    if (!isEditing) {
        return (
            <div className="flex flex-col">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">{label}</span>
                <span className="text-sm font-semibold text-foreground truncate" title={value}>
                    {value && value !== 'null' ? (isSensitive ? maskSensitiveID(value) : value) : <span className="text-muted/40 font-normal italic">N/A</span>}
                </span>
            </div>
        );
    }

    return (
        <Input
            label={label}
            type={type}
            value={editValue || ''}
            onChange={(e) => onChange(category, field, e.target.value)}
        />
    );
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function StudentProfile({ studentId }: { studentId: string | undefined }) {
    const navigate = useNavigate();
    const { currentRole } = useAuthData()

    const isParent = currentRole === 'parent'

    // --- Queries & Mutations ---
    const { data: rawData, isLoading, isError } = useGetStudentById(studentId);
    const updateStudentMutation = useUpdateStudent();
    const student = rawData as StudentData | undefined;

    // --- State ---
    const [activeTab, setActiveTab] = useState<'mandatory' | 'nonMandatory'>('mandatory');
    const [isEditing, setIsEditing] = useState<boolean>(false);

    // Form State
    const [editForm, setEditForm] = useState<any>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleSave = async () => {
        try {
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
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save:", error);
        }
    };

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
                                <img src={imagePreview || 'https://via.placeholder.com/150'} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <i className="fas fa-camera text-white text-xs"></i>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                            </>
                        ) : student.studentImage?.url ? (
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
                            <span><i className="fas fa-chalkboard-teacher text-muted/60 mr-1"></i>{student.currentClassId?.name || 'Unassigned'}</span>
                            <span><i className="fas fa-layer-group text-muted/60 mr-1"></i>{student.currentSectionId?.name || 'N/A'}</span>

                            {/* New/Old Radio Buttons */}
                            {!isParent && <div className="flex items-center gap-3 bg-background border border-border px-3 py-1 rounded-lg h-[34px]">
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
                    {isEditing ? (
                        <>
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button variant="primary" size="sm" onClick={handleSave} isLoading={updateStudentMutation.isPending} leftIcon="fas fa-save">Save</Button>
                        </>
                    ) : (
                        <Button variant="primary" size="sm" onClick={() => setIsEditing(true)} leftIcon="fas fa-edit">Edit</Button>
                    )}
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
                                    <div className="flex flex-col gap-1.5">
                                        <Label>Blood Group</Label>
                                        <SearchSelect
                                            options={[{ label: 'A+', value: 'A+' }, { label: 'O+', value: 'O+' }, { label: 'B+', value: 'B+' }, { label: 'AB+', value: 'AB+' }]}
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
                                <EditableField label="Aadhaar No." category="mandatory" field="aadhaarNumber" isSensitive={true} {...fieldProps} />
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
            </div>
        </div>
    );
}