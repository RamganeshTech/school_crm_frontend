// import React, { useState } from 'react';
// import { SideModal } from '../../shared/ui/SideModal';
// import { Button } from '../../shared/ui/Button';
// import { Input } from '../../shared/ui/Input';
// import { toast } from '../../shared/ui/ToastContext';
// import { useAssignStudentToParent, useRemoveStudentFromParent } from '../../api_services/student_api/studentMainApi';
// import { useGetParentStudents } from '../../api_services/auth_api/authApi';

// interface ParentStudentManagerProps {
//     parentUser: any | null;
//     onClose: () => void;
// }

// export const ParentStudentManagerModal: React.FC<ParentStudentManagerProps> = ({ parentUser, onClose }) => {
//     const [studentIdInput, setStudentIdInput] = useState('');


//     const { data: fetchedStudents, isLoading, refetch } = useGetParentStudents({userId:parentUser?._id!});
//     const students = fetchedStudents || [];
//     // Initialize Mutations
//     const assignMutation = useAssignStudentToParent();
//     const removeMutation = useRemoveStudentFromParent();

//     const handleAssign = async () => {
//         if (!studentIdInput.trim()) {
//             toast.warning("Please enter a valid Student ID");
//             return;
//         }
//         try {
//             await assignMutation.mutateAsync({ 
//                 parentId: parentUser._id, 
//                 studentId: studentIdInput 
//             });
//             toast.success("Student assigned successfully");
//             setStudentIdInput(''); // Clear input on success
//             refetch(); // Add this to refresh the list instantly
//         } catch (error: any) {
//             toast.error(error.message);
//         }
//     };

//     const handleRemove = async (studentId: string) => {
//         if (!window.confirm("Are you sure you want to remove this student from this parent?")) return;
//         try {
//             await removeMutation.mutateAsync({ 
//                 parentId: parentUser._id, 
//                 studentId 
//             });
//             toast.success("Student removed successfully");
//             refetch(); // Add this to refresh the list instantly
//         } catch (error: any) {
//             toast.error(error.message);
//         }
//     };

//     // Safely extract students array from the parent user object
//     // const students = parentUser?.students || [];

//     return (
//         <SideModal
//             isOpen={!!parentUser}
//             onClose={onClose}
//             title={`Manage Students for ${parentUser?.userName || 'Parent'}`}
//             width="w-full sm:w-[500px] md:w-[600px]" // Made slightly wider to fit grid cards
//         >
//             {parentUser && (
//                 <div className="flex flex-col h-full space-y-6">

//                     {/* ADD NEW STUDENT SECTION */}
//                     <div className="bg-background border border-border p-4 rounded-xl flex items-end gap-3 shadow-sm">
//                         <div className="flex-1">
//                             <Input 
//                                 label="Assign New Student" 
//                                 placeholder="Enter Student ID (e.g. STU-1002)" 
//                                 value={studentIdInput}
//                                 onChange={(e) => setStudentIdInput(e.target.value)}
//                             />
//                         </div>
//                         <Button 
//                             variant="primary" 
//                             isLoading={assignMutation.isPending}
//                             onClick={handleAssign}
//                         >
//                             Link Student
//                         </Button>
//                     </div>

//                     {/* ENROLLED STUDENTS LIST (Your UI) */}
//                     <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 shadow-sm flex-1 overflow-y-auto">
//                         <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
//                             <i className="fas fa-child text-primary"></i>
//                             Enrolled Students ({students.length})
//                         </h3>

//                         {students.length === 0 ? (
//                             <div className="text-center py-10 text-muted border border-dashed border-border rounded-lg bg-background/50">
//                                 <i className="fas fa-user-slash text-3xl mb-2 opacity-50"></i>
//                                 <p className="text-sm font-medium">No students linked to this parent yet.</p>
//                             </div>
//                         ) : (
//                             <div className="grid grid-cols-1 gap-4">
//                                 {students.map((student: any) => {
//                                     const classNameStr = typeof student.currentClassId === 'object' ? student.currentClassId?.name : 'N/A';
//                                     const sectionNameStr = typeof student.currentSectionId === 'object' ? student.currentSectionId?.name : 'N/A';

//                                     return (
//                                         <div key={student._id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-background hover:border-primary/30 transition-colors">

//                                             <div className="flex items-center gap-4 overflow-hidden">
//                                                 {/* Student Avatar */}
//                                                 {student.studentImage?.url || student.studentImage?.path ? (
//                                                     <img
//                                                         src={student.studentImage.url || student.studentImage.path}
//                                                         alt={student.studentName}
//                                                         className="w-12 h-12 rounded-full object-cover border border-border shrink-0"
//                                                     />
//                                                 ) : (
//                                                     <div className="w-12 h-12 rounded-full bg-primary-soft text-primary flex items-center justify-center text-lg shrink-0">
//                                                         <i className="fas fa-user-graduate"></i>
//                                                     </div>
//                                                 )}

//                                                 {/* Student Details */}
//                                                 <div className="flex-1 overflow-hidden">
//                                                     <p className="font-bold text-foreground truncate">{student.studentName}</p>
//                                                     <div className="flex flex-wrap gap-2 mt-1">
//                                                         <span className="px-2 py-0.5 bg-surface border border-border text-[10px] font-bold text-muted uppercase rounded">
//                                                             Class: {classNameStr}
//                                                         </span>
//                                                         <span className="px-2 py-0.5 bg-surface border border-border text-[10px] font-bold text-muted uppercase rounded">
//                                                             Sec: {sectionNameStr}
//                                                         </span>
//                                                     </div>
//                                                     <p className="text-[10px] text-muted mt-1.5 font-mono">ID: {student._id}</p>
//                                                 </div>
//                                             </div>

//                                             {/* Remove Button */}
//                                             <Button
//                                                 variant="danger"
//                                                 size="sm"
//                                                 className="!p-0 w-8 h-8 flex items-center justify-center rounded-md shrink-0 ml-2"
//                                                 isLoading={removeMutation.isPending}
//                                                 onClick={() => handleRemove(student._id)}
//                                                 title="Unlink Student"
//                                             >
//                                                 {!removeMutation.isPending && <i className="fas fa-unlink text-xs"></i>}
//                                             </Button>

//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </SideModal>
//     );
// };




// SECOND VERSION

import React, { useState, useMemo } from 'react';
import { SideModal } from '../../shared/ui/SideModal';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { toast } from '../../shared/ui/ToastContext';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetClasses } from '../../api_services/schoolConfig_api/classApi'; // Adjust path
import { useGetAllStudentsV1, useAssignStudentToParent, useRemoveStudentFromParent } from '../../api_services/student_api/studentMainApi'; // Adjust path
import { useGetParentStudents } from '../../api_services/auth_api/authApi';
import { useGetSections } from '../../api_services/schoolConfig_api/sectionApi';

interface ParentStudentManagerProps {
    parentUser: any | null;
    onClose: () => void;
}

export const ParentStudentManagerModal: React.FC<ParentStudentManagerProps> = ({ parentUser, onClose }) => {
    const { schoolId } = useAuthData();

    // --- State for Finder ---
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [assigningId, setAssigningId] = useState<string | null>(null); // To show loading state on specific button

    // --- Initialize Mutations & Queries ---
    const assignMutation = useAssignStudentToParent();
    const removeMutation = useRemoveStudentFromParent();

    // 1. Fetch Enrolled Students for this parent
    const { data: fetchedStudents, isLoading: isEnrolledLoading, refetch: refetchEnrolled } = useGetParentStudents({ userId: parentUser?._id });
    const enrolledStudents = fetchedStudents || [];

    // 2. Fetch Classes for the dropdown
    const { data: classesData } = useGetClasses(schoolId!);
    // const selectedClass = classesData?.find((c: any) => c._id === selectedClassId);

    // 3. Fetch Students based on Class/Section selection
    const { data: studentsList, isLoading: isStudentsLoading } = useGetAllStudentsV1({
        schoolId: schoolId!,
        classId: selectedClassId || undefined,
        sectionId: selectedSectionId || undefined,
    });

    // 2. Fetch Sections dynamically based on selected class
    const { data: sectionsData, isLoading: isSectionsLoading } = useGetSections({
        schoolId: schoolId!,
        classId: selectedClassId
    });

    // --- Derived Data: Filter available students ---
    const filteredAvailableStudents = useMemo(() => {
        if (!studentsList) return [];
        return studentsList.filter((s: any) =>
            s.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s._id?.toLowerCase().includes(searchQuery.toLowerCase()) // sr-id search
        );
    }, [studentsList, searchQuery]);

    // --- Handlers ---
    const handleAssign = async (studentId: string) => {
        setAssigningId(studentId);
        try {
            await assignMutation.mutateAsync({
                parentId: parentUser._id,
                studentId: studentId
            });
            toast.success("Student assigned successfully");
            refetchEnrolled(); // Refresh the enrolled list below instantly
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setAssigningId(null);
        }
    };

    const handleRemove = async (studentId: string) => {
        if (!window.confirm("Are you sure you want to remove this student from this parent?")) return;
        try {
            await removeMutation.mutateAsync({
                parentId: parentUser._id,
                studentId
            });
            toast.success("Student removed successfully");
            refetchEnrolled(); // Refresh the enrolled list below instantly
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <SideModal
            isOpen={!!parentUser}
            onClose={() => {
                onClose();
                // Reset states on close
                setSelectedClassId('');
                setSelectedSectionId('');
                setSearchQuery('');
            }}
            title={`Manage Students for ${parentUser?.userName || 'Parent'}`}
            width="w-full sm:w-[500px] md:w-[650px]"
        >
            {parentUser && (
                <div className="flex flex-col h-full space-y-6">

                    {/* --- 1. FIND & ASSIGN NEW STUDENT SECTION --- */}
                    <div className="bg-surface border border-border p-4 rounded-xl shadow-sm shrink-0">
                        <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                            <i className="fas fa-search text-primary"></i> Find Student to Link
                        </h3>

                        {/* Filters Row */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                            {/* Class Dropdown */}
                            <div className="w-full sm:w-[150px]">
                                <SearchSelect
                                    label=""
                                    options={classesData?.map((c: any) => ({ label: c.name, value: c._id })) || []}
                                    value={selectedClassId}
                                    onChange={(opt: any) => {
                                        setSelectedClassId(String(opt.value));
                                        setSelectedSectionId(''); // Always reset section on class change
                                    }}
                                    placeholder="Select Class..."
                                />
                            </div>

                            {/* Section Dropdown - Only show if sections exist for this class */}
                            {selectedClassId && (
                                <div className="w-full sm:w-[150px] animate-in fade-in relative">
                                    <SearchSelect
                                        label=""
                                        placeholder={isSectionsLoading ? "Loading..." : "Section..."}
                                        options={sectionsData?.map((s: any) => ({ label: s.name, value: s._id })) || []}
                                        value={selectedSectionId}
                                        onChange={(opt: any) => setSelectedSectionId(opt?.value)}
                                    />
                                    {isSectionsLoading && (
                                        <i className="fas fa-spinner fa-spin absolute right-3 top-3 text-muted text-xs"></i>
                                    )}
                                </div>
                            )}

                            {/* Search Box */}
                            <div className="flex-1">
                                <Input
                                    label=""
                                    placeholder="Search by Name or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Available Students Results */}
                        {selectedClassId && (
                            <div className="bg-background border border-border rounded-lg overflow-hidden flex flex-col max-h-[250px]">
                                {isStudentsLoading ? (
                                    <div className="p-6 text-center text-muted">
                                        <i className="fas fa-circle-notch fa-spin mr-2"></i> Loading students...
                                    </div>
                                ) : filteredAvailableStudents.length === 0 ? (
                                    <div className="p-6 text-center text-muted text-sm">
                                        No students found matching your search.
                                    </div>
                                ) : (
                                    <div className="overflow-y-auto custom-scrollbar p-2 space-y-2">
                                        {filteredAvailableStudents.map((student: any) => (
                                            <div key={student._id} className="flex items-center justify-between p-2 sm:p-3 bg-surface border border-border rounded-md hover:border-primary/30 transition-colors">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    {student.studentImage?.url ? (
                                                        <img src={student.studentImage.url} alt="img" className="w-8 h-8 rounded-full object-cover shrink-0" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
                                                            <i className="fas fa-user text-xs"></i>
                                                        </div>
                                                    )}
                                                    <div className="truncate">
                                                        <p className="text-xs sm:text-sm font-bold text-foreground truncate">{student.studentName}</p>
                                                        <p className="text-[10px] text-muted font-mono truncate">{student._id}</p>
                                                    </div>
                                                </div>

                                                {/* Prevent re-assigning if they are already in the enrolled list */}
                                                {enrolledStudents.some((es: any) => es._id === student._id) ? (
                                                    <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-1 rounded border border-success/20 shrink-0">
                                                        <i className="fas fa-check mr-1"></i> Linked
                                                    </span>
                                                ) : (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        className="shrink-0 h-7 text-[10px] px-3"
                                                        isLoading={assigningId === student._id}
                                                        onClick={() => handleAssign(student._id)}
                                                    >
                                                        Link
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* --- 2. ENROLLED STUDENTS LIST --- */}
                    <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 shadow-sm flex-1 overflow-hidden flex flex-col">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2 shrink-0">
                            <i className="fas fa-child text-primary"></i>
                            Enrolled Students ({enrolledStudents.length})
                        </h3>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                            {isEnrolledLoading ? (
                                <div className="text-center py-10 text-muted">
                                    <i className="fas fa-circle-notch fa-spin text-3xl mb-3 text-primary"></i>
                                    <p className="text-sm font-medium">Loading linked students...</p>
                                </div>
                            ) : enrolledStudents.length === 0 ? (
                                <div className="text-center py-10 text-muted border border-dashed border-border rounded-lg bg-background/50">
                                    <i className="fas fa-user-slash text-3xl mb-2 opacity-50"></i>
                                    <p className="text-sm font-medium">No students linked to this parent yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {enrolledStudents.map((student: any) => {
                                        const classNameStr = typeof student.currentClassId === 'object' ? student.currentClassId?.name : 'N/A';
                                        const sectionNameStr = typeof student.currentSectionId === 'object' ? student.currentSectionId?.name : 'N/A';

                                        // const classNameStr = typeof student.currentClassName
                                        // const sectionNameStr = typeof student.currentSectionName



                                        return (
                                            <div key={student._id} className="flex items-center justify-between p-3 sm:p-4 border border-border rounded-lg bg-background hover:border-primary/30 transition-colors">

                                                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                                    {student.studentImage?.url || student.studentImage?.path ? (
                                                        <img
                                                            src={student.studentImage.url || student.studentImage.path}
                                                            alt={student.studentName}
                                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-border shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-soft text-primary flex items-center justify-center text-lg shrink-0">
                                                            <i className="fas fa-user-graduate"></i>
                                                        </div>
                                                    )}

                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="font-bold text-sm sm:text-base text-foreground truncate">{student.studentName}</p>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            <span className="px-2 py-0.5 bg-surface border border-border text-[9px] sm:text-[10px] font-bold text-muted uppercase rounded shrink-0">
                                                                Class: {classNameStr}
                                                            </span>
                                                            <span className="px-2 py-0.5 bg-surface border border-border text-[9px] sm:text-[10px] font-bold text-muted uppercase rounded shrink-0">
                                                                Sec: {sectionNameStr}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-muted mt-1.5 font-mono truncate">ID: {student._id}</p>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="!p-0 w-8 h-8 flex items-center justify-center rounded-md shrink-0 ml-2"
                                                    isLoading={removeMutation.isPending}
                                                    onClick={() => handleRemove(student._id)}
                                                    title="Unlink Student"
                                                >
                                                    {!removeMutation.isPending && <i className="fas fa-unlink text-xs"></i>}
                                                </Button>

                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </SideModal>
    );
};